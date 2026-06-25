#!/bin/bash
# bootstrap-project1.sh — Recreates the k3d cluster with Calico CNI and deploys project1-fullstack
# Usage: ./scripts/bootstrap-project1.sh
# Run from repo root: /workspaces/k8s-projects

set -e

echo "================================================="
echo " Project1 Fullstack — Cluster Bootstrap"
echo "================================================="
echo ""

echo "[1/6] Deleting existing cluster (if any)..."
k3d cluster delete dev 2>/dev/null && echo "      Deleted existing 'dev' cluster." || echo "      No existing cluster found, skipping."
echo ""

echo "[2/6] Creating k3d cluster with flannel disabled..."
k3d cluster create dev \
  --k3s-arg "--flannel-backend=none@server:*" \
  --k3s-arg "--disable-network-policy@server:*" \
  --port "30080:30080@loadbalancer" \
  --port "30090:30090@loadbalancer" \
  --port "30412:30412@loadbalancer"
echo ""

echo "[3/6] Installing Calico CNI..."
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.3/manifests/calico.yaml
echo "      Waiting for calico-node to be ready (up to 90s)..."
kubectl rollout status daemonset/calico-node -n kube-system --timeout=90s
kubectl wait --for=condition=ready pod -l k8s-app=calico-kube-controllers -n kube-system --timeout=90s
echo ""

echo "[4/6] Installing ingress-nginx..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>/dev/null || true
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30090
echo ""

echo "[5/6] Deploying fullstack Helm release..."
helm install fullstack ./project1-fullstack/helm/fullstack \
  --namespace fullstack --create-namespace
echo "      Waiting for backend pods to be ready (up to 120s)..."
kubectl wait --for=condition=ready pod -l app=backend -n fullstack --timeout=120s
echo ""

echo "[6/6] Running Helm test..."
helm test fullstack -n fullstack
echo ""

echo "================================================="
echo " Bootstrap complete"
echo "================================================="
echo ""
echo " Add to /etc/hosts if not already present:"
echo "   echo '127.0.0.1 fullstack.local' | sudo tee -a /etc/hosts"
echo ""
echo " Access via ingress (port-forward):"
echo "   kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8081:80"
echo "   then open http://fullstack.local:8081"
echo ""
echo " Watch HPA:"
echo "   kubectl get hpa -n fullstack -w"
echo "================================================="
