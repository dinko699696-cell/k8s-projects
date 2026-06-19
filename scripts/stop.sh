#!/bin/bash

# stop.sh — Tears down the full k8s-projects environment
# Usage: ./scripts/stop.sh
# Run from repo root: /workspaces/k8s-projects
#
# Note: MongoDB data is preserved at $HOME/.k8s-app-data/mongodb
# and will be available on next start.sh run.

echo "================================================="
echo " K8s App Teardown"
echo "================================================="

echo ""
echo "[1/2] Deleting namespace and all resources..."
kubectl delete namespace app-v2 --ignore-not-found

echo ""
echo "[2/2] Deleting k3d cluster..."
k3d cluster delete dev

echo ""
echo "================================================="
echo " Teardown complete"
echo " MongoDB data preserved at: $HOME/.k8s-app-data/mongodb"
echo " Run ./scripts/start.sh to bring everything back up"
echo "================================================="
