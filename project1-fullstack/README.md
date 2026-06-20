# K8s Full Stack App

A production-pattern three-tier application deployed on Kubernetes, demonstrating real-world DevOps practices including custom Docker images, Kubernetes Secrets, health probes, Prometheus metrics, and live observability.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nginx + Vanilla JS dashboard |
| Backend | Node.js + Express REST API |
| Database | MongoDB 6 |
| Orchestration | Kubernetes via k3d (GitHub Codespaces) |
| Images | Docker Hub — `dancyber/fullstack-backend:v1`, `dancyber/fullstack-frontend:v1` |
| Observability | Prometheus `/metrics`, `/health` endpoint, k9s cluster monitoring |

## Architecture
Browser

│

▼

frontend-service (NodePort :30080)

│

▼

Nginx pod — proxies /api/* to backend-service

│

▼

backend-service (ClusterIP :3000)

│

▼

2x Node.js backend pods (load balanced)

│

├── GET /health   → liveness + readiness probes

├── GET /metrics  → Prometheus scrape target

└── CRUD /items   → MongoDB

│

▼

mongo-service (ClusterIP :27017)

│

▼

MongoDB 6 pod

## Features

- **Real CRUD app** — create, list, delete tasks with priority levels
- **Live health bar in UI** — DB connection status, pod name, uptime updated every 10s
- **Load balancing visible** — pod name in UI changes as requests hit different replicas
- **Prometheus-ready** — 4 custom metrics: request counter, latency histogram, DB connection gauge, item count gauge
- **Kubernetes Secrets** — MongoDB credentials injected via secretKeyRef, never hardcoded
- **Downward API** — pod name and namespace injected into backend at runtime
- **Resource limits** — every container has CPU and memory requests and limits defined
- **Health probes** — liveness and readiness probes on backend and frontend
- **Custom Docker images** — both frontend and backend built and pushed to Docker Hub

## Quick Start (GitHub Codespaces)

```bash
# 1. Start cluster
k3d cluster create dev --port "8080:80@loadbalancer"

# 2. Deploy all resources
kubectl apply -f project1-fullstack/manifests/

# 3. Wait for pods
kubectl get pods -n fullstack -w

# 4. Port forward
kubectl port-forward -n fullstack service/frontend-service 7777:80 &
kubectl port-forward -n fullstack service/backend-service 3001:3000 &

# 5. Open UI → localhost:7777
# 6. Check health → localhost:3001/health
# 7. Check metrics → localhost:3001/metrics
```

## Monitoring (k9s)

```bash
k9s -n fullstack
```

Keybindings: `l` logs · `d` describe · `s` shell · `0` all namespaces · `ctrl-c` exit

## Project Structure
project1-fullstack/

├── backend/

│   ├── index.js          # Express API — CRUD, /health, /metrics

│   ├── package.json

│   ├── Dockerfile

│   └── README.md

├── frontend/

│   ├── index.html        # SPA dashboard

│   ├── nginx.conf        # Reverse proxy config

│   ├── Dockerfile

│   └── README.md

└── manifests/

├── namespace.yaml

├── mongo-secret.yaml

├── mongo-deployment.yaml

├── backend-deployment.yaml

├── frontend-deployment.yaml

└── README.md

## Docker Images

- dancyber/fullstack-backend:v1
- dancyber/fullstack-frontend:v1

## What's Next

Project 2 adds the full Prometheus + Grafana monitoring stack, scraping this app's /metrics endpoint to produce live dashboards for request rate, latency, error rate, and DB connection status.
