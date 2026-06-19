# k8s-projects

A collection of Kubernetes projects built entirely in GitHub Codespaces — zero local setup, everything runs in the cloud.

## Environment

All projects run in **GitHub Codespaces** using a pre-configured dev container. No Docker Desktop, no local kubectl, no footprint on your machine.

### What's pre-installed (auto on Codespace open)
- Docker 29.x
- k3d v5.9.0 — lightweight Kubernetes inside Docker
- kubectl v1.36.x
- Helm v3.21.x
- Node.js 20.x
- git

### First time setup (one-off)
These tools are installed automatically via `.devcontainer/devcontainer.json`. No manual steps needed after opening the Codespace.

---

## Quick Start

### Start everything
\`\`\`bash
./scripts/start.sh
\`\`\`
This will:
1. Create a k3d cluster with a persistent volume mount
2. Build Docker images for frontend and backend
3. Import images into the cluster
4. Deploy all Kubernetes manifests
5. Wait for all pods to be ready
6. Print the port-forward command to access the app

### Access the app
\`\`\`bash
kubectl port-forward -n app-v2 service/frontend 9000:80
\`\`\`
Then open port 9000 from the Ports tab in Codespaces.

### Stop everything
\`\`\`bash
./scripts/stop.sh
\`\`\`
This will delete the namespace and the k3d cluster cleanly.

### Data persistence
MongoDB data is stored at `$HOME/.k8s-app-data/mongodb` on the Codespace host, mounted into the k3d cluster node. Data survives full cluster deletes and restarts as long as the Codespace itself is not deleted.

---

## Projects

### 1. nginx-demo
A simple nginx deployment to validate the full Kubernetes workflow.
- Namespace, Deployment, Service
- Manifests only, no custom images

### 2. multi-container-app (v1)
A full stack app with 4 services communicating inside a Kubernetes cluster.
- Frontend — nginx serving static HTML
- Backend — Node.js + Express REST API
- MongoDB — persistent message storage
- Redis — response caching with 30s TTL

### 3. multi-container-app-v2
Production-grade upgrade with a React dashboard and security hardening.

**Frontend**
- React + Vite dark dashboard
- Live service status indicators
- Backend info panel (Node version, DB, namespace, replicas)
- Redis cache hit/miss indicator
- TanStack Query with auto-refetch

**Security**
- Kubernetes Secrets for credentials
- Non-root containers (nginx-unprivileged)
- Resource requests and limits on every pod
- Network Policies — strict pod-to-pod traffic rules

**Persistence**
- MongoDB data mounted to host path
- Survives full cluster delete and recreate

---

## Project Structure

\`\`\`
k8s-projects/
├── .devcontainer/
│   └── devcontainer.json        # auto-installs all tools on Codespace open
├── scripts/
│   ├── start.sh                 # one-command cluster + app startup
│   └── stop.sh                  # one-command teardown
└── projects/
    ├── nginx-demo/
    ├── multi-container-app/
    └── multi-container-app-v2/
\`\`\`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Container orchestration | Kubernetes (k3d) |
| Frontend | React, Vite, TanStack Query |
| Backend | Node.js, Express |
| Database | MongoDB 6 |
| Cache | Redis 7 |
| Container runtime | Docker |
| Dev environment | GitHub Codespaces |
| Version control | GitHub |

---

## Roadmap

- [ ] Prometheus + Grafana monitoring
- [ ] GitHub Actions CI/CD pipeline
- [ ] Helm chart packaging
- [ ] Interactive sidebar navigation
- [ ] RBAC policies
