# k8s-projects

A collection of Kubernetes projects built in GitHub Codespaces — zero local setup, everything runs in the cloud.

## About

These projects were built to learn and demonstrate Kubernetes concepts hands-on, using a fully cloud-based workflow:
- **GitHub Codespaces** — browser-based dev environment, nothing installed locally
- **k3d** — lightweight Kubernetes clusters running inside Docker
- **kubectl + Helm** — standard K8s tooling
- **GitHub** — all code versioned and reproducible

## Projects

### 1. nginx-demo
A simple nginx deployment to validate the full Kubernetes workflow.
- Namespace, Deployment, Service
- Exported as reusable YAML manifests

### 2. multi-container-app (v1)
A full stack app with 4 services communicating inside a Kubernetes cluster.
- **Frontend** — nginx serving static HTML
- **Backend** — Node.js + Express REST API
- **MongoDB** — persistent message storage
- **Redis** — response caching with 30s TTL
- Demonstrates inter-pod networking, namespaces, and ClusterIP services

### 3. multi-container-app-v2
An upgraded version of the full stack app with production-grade features.

**Frontend (v3)**
- React + Vite with a dark dashboard UI
- Live service status indicators
- Backend info panel showing Node version, DB name, namespace, replica count
- Redis cache hit/miss indicator
- TanStack Query with auto-refetch

**Security layer**
- Kubernetes Secrets for credential management (no hardcoded values)
- Non-root containers using `nginx-unprivileged`
- Resource requests and limits on every pod
- Network Policies restricting pod-to-pod traffic

## Workflow

\`\`\`bash
# 1. Open GitHub Codespaces on this repo
# 2. Create a cluster
k3d cluster create dev --port "8080:80@loadbalancer"

# 3. Deploy a project
kubectl apply -f projects/multi-container-app-v2/manifests/

# 4. Access the app
kubectl port-forward -n app-v2 service/frontend 9000:80
\`\`\`

## Tech Stack

| Layer | Technology |
|---|---|
| Container orchestration | Kubernetes (k3d) |
| Frontend | React, Vite, TanStack Query |
| Backend | Node.js, Express |
| Database | MongoDB |
| Cache | Redis |
| Container runtime | Docker |
| Dev environment | GitHub Codespaces |
| Version control | GitHub |

## Roadmap

- [ ] Prometheus + Grafana monitoring
- [ ] GitHub Actions CI/CD pipeline
- [ ] Helm chart packaging
- [ ] Interactive sidebar navigation
- [ ] RBAC policies
