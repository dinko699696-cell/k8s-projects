#!/usr/bin/env bash
# Runs on every Codespace start. Starts the cluster and fixes kubeconfig
# context. The app is exposed automatically via k3d's loadbalancer on :8080.
set -uo pipefail

CLUSTER="dev"
NS="fullstack"

echo "[startup] starting k3d cluster '$CLUSTER'..."
k3d cluster start "$CLUSTER" 2>/dev/null || true

echo "[startup] fixing kubeconfig context..."
k3d kubeconfig merge "$CLUSTER" --kubeconfig-merge-default 2>/dev/null || true
kubectl config use-context "k3d-$CLUSTER" 2>/dev/null || true

echo "[startup] waiting for pods in '$NS'..."
for i in $(seq 1 30); do
  ready=$(kubectl get pods -n "$NS" --no-headers 2>/dev/null | grep -c "Running")
  if [ "$ready" -ge 4 ]; then break; fi
  sleep 2
done

echo "[startup] done. App reachable on forwarded port 8080 (via k3d loadbalancer)."
kubectl get pods -n "$NS" 2>/dev/null || true
