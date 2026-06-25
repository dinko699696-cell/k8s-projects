# K8s Full Stack App

A production-pattern three-tier application deployed on Kubernetes, demonstrating real-world DevOps practices: custom Docker images, CI/CD pipeline, Helm packaging, Prometheus observability, Ingress routing, autoscaling, and enforced NetworkPolicies.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nginx + Vanilla JS dashboard |
| Backend | Node.js + Express REST API (2–5 replicas, autoscaled) |
| Database | MongoDB 6 with PersistentVolume |
| Orchestration | Kubernetes via k3d (GitHub Codespaces) |
| CNI | Calico — required for NetworkPolicy enforcement |
| Packaging | Helm chart v0.6.0 |
| Ingress | ingress-nginx (NodePort :30090) |
| Autoscaling | HPA v2 — 2–5 backend replicas at 60% CPU |
| Observability | Prometheus + Grafana, custom 8-panel dashboard |
| CI/CD | GitHub Actions — build, push, SHA tag, manifest update |
| Images | Docker Hub — `dancyber/fullstack-backend`, `dancyber/fullstack-frontend` |

## Architecture

```
Browser
   │
   ▼
ingress-nginx controller (NodePort :30090)
   │
   ▼
Ingress resource (host: fullstack.local)
   │
   ▼
frontend-service (ClusterIP :80)
   │
   ▼
Nginx pod — proxies /api/* → backend-service
   │
   ▼
backend-service (ClusterIP :3000)
   │
   ▼
2–5x Node.js backend pods (load balanced, HPA managed)
   │
   ├── GET /        → service info + pod name
   ├── GET /health  → liveness + readiness probes
   ├── GET /metrics → Prometheus scrape target
   └── CRUD /items  → MongoDB
          │
          ▼
   mongo-service (ClusterIP :27017)
          │
          ▼
      MongoDB 6 pod
          │
          ▼
   PersistentVolumeClaim (local-path, 1Gi)
```

## Quick Start

The bootstrap script handles everything — cluster creation, Calico install, ingress-nginx, and the Helm release:

```bash
./scripts/bootstrap-project1.sh
```

Then access the app:

```bash
echo "127.0.0.1 fullstack.local" | sudo tee -a /etc/hosts
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8081:80
# Open http://fullstack.local:8081
```

## Manual Setup

If you prefer step by step:

```bash
# 1. Create cluster with Calico CNI (flannel disabled)
k3d cluster create dev \
  --k3s-arg "--flannel-backend=none@server:*" \
  --k3s-arg "--disable-network-policy@server:*" \
  --port "30080:30080@loadbalancer" \
  --port "30090:30090@loadbalancer" \
  --port "30412:30412@loadbalancer"

# 2. Install Calico
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.3/manifests/calico.yaml
kubectl rollout status daemonset/calico-node -n kube-system --timeout=90s

# 3. Install ingress-nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30090

# 4. Deploy the app
helm install fullstack ./helm/fullstack \
  --namespace fullstack --create-namespace

# 5. Validate
helm test fullstack -n fullstack
```

## Helm Operations

```bash
# Upgrade (e.g. pin a new image SHA)
helm upgrade fullstack ./helm/fullstack \
  --namespace fullstack --set backend.image.tag=<sha>

# Uninstall
helm uninstall fullstack --namespace fullstack

# Run smoke test
helm test fullstack -n fullstack

# Watch autoscaler
kubectl get hpa -n fullstack -w
```

## NetworkPolicy Enforcement

Four policies are active under Calico:

| Policy | Selects | Allows ingress from |
|--------|---------|---------------------|
| `default-deny-ingress` | all pods | nothing (deny-all baseline) |
| `frontend-netpol` | `app: frontend` | `ingress-nginx` namespace |
| `backend-netpol` | `app: backend` | `app: frontend`, `app: helm-test` |
| `mongo-netpol` | `app: mongo` | `app: backend` |

Verified enforcement matrix:

| Source | Destination | Result |
|--------|-------------|--------|
| unlabeled pod | `backend-service:3000` | ❌ Blocked |
| `app=frontend` pod | `backend-service:3000` | ✅ Allowed |
| unlabeled pod | `mongo-service:27017` | ❌ Blocked |

> **Note:** NetworkPolicies require Calico CNI. They are silently ignored under the default flannel CNI. Always use `bootstrap-project1.sh` to create the cluster correctly.

## Features

- **Real CRUD app** — create, list, delete tasks with priority levels
- **Live health bar** — DB status, pod name, uptime polled every 10s
- **Load balancing visible** — pod name in UI changes across replicas
- **Autoscaling** — HPA scales backend 2→5 replicas at 60% CPU (verified with live load test: spiked to 192%)
- **Prometheus metrics** — request counter, latency histogram, DB gauge, item count gauge
- **Kubernetes Secrets** — MongoDB credentials injected via `secretKeyRef`, never hardcoded
- **Downward API** — pod name and namespace injected at runtime
- **Immutable image tags** — every build tagged with Git SHA, enabling rollbacks
- **CI/CD pipeline** — GitHub Actions builds, pushes, and updates SHA tags in ~51s
- **Helm chart** — one-command install, upgrade, and rollback
- **Enforced NetworkPolicies** — per-tier traffic isolation under Calico

## Project Structure

```
project1-fullstack/
├── backend/
│   ├── index.js          # Express API — CRUD, /health, /metrics
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html        # SPA dashboard
│   ├── nginx.conf        # Reverse proxy config
│   └── Dockerfile
├── helm/
│   └── fullstack/        # Helm chart v0.6.0
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── backend.yaml
│           ├── frontend.yaml
│           ├── mongo.yaml
│           ├── secret.yaml
│           ├── mongo-pvc.yaml
│           ├── ingress.yaml
│           ├── hpa.yaml
│           ├── networkpolicies.yaml
│           └── tests/
│               └── test-health.yaml
├── manifests/            # Legacy — superseded by Helm chart
└── monitoring/           # Prometheus + Grafana stack
```

## Security Notes

| Area | Status | Notes |
|------|--------|-------|
| MongoDB credentials | ✅ | K8s Secret, injected at runtime, never in image |
| Docker Hub token | ✅ | GitHub Secrets, never committed |
| Non-root container | ✅ | Backend runs as `node` user |
| NetworkPolicies | ✅ | Enforced under Calico — per-tier isolation verified |
| TLS on MongoDB | ⚠️ Dev only | Acceptable for local k3d, not production |
| Secret values | ⚠️ Dev only | Fake credentials — production would use Sealed Secrets or Vault |
