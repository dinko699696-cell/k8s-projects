#!/bin/bash

echo "=== K8s App Teardown ==="

echo "[1/2] Deleting namespace and all resources..."
kubectl delete namespace app-v2 --ignore-not-found

echo "[2/2] Deleting k3d cluster..."
k3d cluster delete dev

echo ""
echo "=== Teardown complete ==="
