#!/bin/bash
set -e

echo "=== K8s App Startup ==="

echo "[1/5] Creating k3d cluster..."
k3d cluster create dev --port "8080:80@loadbalancer"

echo "[2/5] Building images..."
docker build -t frontend-v2:local projects/multi-container-app-v2/frontend/
docker build -t backend-v2:local projects/multi-container-app-v2/backend/

echo "[3/5] Importing images into cluster..."
k3d image import frontend-v2:local backend-v2:local -c dev

echo "[4/5] Deploying manifests..."
kubectl apply -f projects/multi-container-app-v2/manifests/
sleep 3
kubectl apply -f projects/multi-container-app-v2/manifests/

echo "[5/5] Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n app-v2 --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend -n app-v2 --timeout=120s
kubectl wait --for=condition=ready pod -l app=mongo -n app-v2 --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n app-v2 --timeout=120s

echo ""
echo "=== All pods ready ==="
kubectl get pods -n app-v2
echo ""
echo "Run this to access the app:"
echo "kubectl port-forward -n app-v2 service/frontend 9000:80"
