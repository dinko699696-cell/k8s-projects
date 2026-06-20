# K8s Full Stack App

A production-pattern three-tier application deployed on Kubernetes, built to demonstrate real-world DevOps practices.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nginx serving a vanilla JS dashboard |
| Backend | Node.js + Express REST API |
| Database | MongoDB 6 |
| Orchestration | Kubernetes (k3d on GitHub Codespaces) |
| Images | Docker Hub (`dancyber/fullstack-backend`, `dancyber/fullstack-frontend`) |
| Observability | Prometheus metrics (`/metrics`), health endpoint (`/health`) |

## Features

- Full CRUD API — create, list, delete items with priority levels
- Live health status in UI — DB connection, pod name, uptime
- Pod name displayed in UI — proves Kubernetes load balancing across 2 backend replicas
- Prometheus-ready metrics — request count, latency histograms, DB connection gauge, item count gauge
- Kubernetes Secrets for MongoDB credentials (never hardcoded)
- Resource requests and limits on every container
- Liveness and readiness probes on frontend and backend
- Structured JSON logging via morgan

## Architecture
Browser → Nginx (frontend) → backend-service (ClusterIP)

↓

2x backend pods (Node.js)

↓

mongo-service (ClusterIP)

↓

MongoDB 6 pod

## Running Locally (GitHub Codespaces)

```bash
# Start cluster
k3d cluster create dev --port "8080:80@loadbalancer"

# Deploy
kubectl apply -f manifests/

# Port forward
kubectl port-forward -n fullstack service/frontend-service 7777:80 &
kubectl port-forward -n fullstack service/backend-service 3001:3000 &
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check — DB status, pod name, uptime |
| GET | /metrics | Prometheus metrics |
| GET | /items | List all items |
| POST | /items | Create item `{name, description, priority}` |
| DELETE | /items/:id | Delete item by ID |

## Docker Images

- `dancyber/fullstack-backend:v1`
- `dancyber/fullstack-frontend:v1`
