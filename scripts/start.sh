#!/bin/bash

# start.sh — Starts the full k8s-projects environment from scratch
# Usage: ./scripts/start.sh
# Run from repo root: /workspaces/k8s-projects

echo "================================================="
echo " K8s App Startup"
echo "================================================="

echo ""
echo "[1/5] Creating k3d cluster..."
echo "      Mounting MongoDB data from: $HOME/.k8s-app-data/mongodb"
mkdir -p $HOME/.k8s-app-data/mongodb
k3d cluster create dev \
  --port "8080:80@loadbalancer" \
  --volume "$HOME/.k8s-app-data/mongodb:/data/db@server:0"

echo ""
echo "[2/5] Building Docker images..."
docker build -t frontend-v2:local projects/multi-container-app-v2/frontend/
docker build -t backend-v2:local projects/multi-container-app-v2/backend/

echo ""
echo "[3/5] Importing images into k3d cluster..."
k3d image import frontend-v2:local backend-v2:local -c dev

echo ""
echo "[4/5] Deploying Kubernetes manifests..."
echo "      First pass — creates namespace and base resources"
kubectl apply -f projects/multi-container-app-v2/manifests/ || true
echo "      Waiting 5s for namespace to be ready..."
sleep 5
echo "      Second pass — deploys remaining resources"
kubectl apply -f projects/multi-container-app-v2/manifests/

echo ""
echo "[5/5] Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n app-v2 --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend -n app-v2 --timeout=120s
kubectl wait --for=condition=ready pod -l app=mongo -n app-v2 --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n app-v2 --timeout=120s

echo ""
echo "================================================="
echo " All pods ready"
echo "================================================="
kubectl get pods -n app-v2
echo ""
echo " Access the app:"
echo " kubectl port-forward -n app-v2 service/frontend 9000:80"
echo " Then open port 9000 from the Ports tab in Codespaces"
echo "================================================="
