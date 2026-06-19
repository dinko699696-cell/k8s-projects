# multi-container-app-v2

Production-grade full stack app running on Kubernetes with a React dashboard, security hardening, and persistent storage.

## Architecture

\`\`\`
[React Frontend] → [Node.js Backend] → [MongoDB]
                          ↓
                       [Redis]
\`\`\`

## What's new vs v1

### Frontend (v3)
- React + Vite replacing static HTML
- Dark dashboard UI with sidebar navigation
- Live service status indicators (Backend, MongoDB, Redis)
- Backend info panel — Node version, DB name, namespace, replicas
- Redis cache hit/miss indicator
- TanStack Query with auto-refetch every 10s

### Security
- Kubernetes Secrets for MongoDB and Redis URLs (no hardcoded values)
- Non-root containers — nginx-unprivileged (runAsUser 101), backend (runAsUser 1000)
- Resource requests and limits on every pod
- Network Policies — strict pod-to-pod traffic:
  - Frontend → Backend only (port 3000)
  - Backend → MongoDB (port 27017) + Redis (port 6379) only
  - MongoDB + Redis accept ingress from Backend only

### Persistence
- MongoDB data stored at \`$HOME/.k8s-app-data/mongodb\` on the Codespace host
- Mounted into the k3d cluster node at \`/data/db\`
- Survives full cluster delete and recreate
- Data is lost only if the Codespace itself is deleted

## Quick Start

\`\`\`bash
# From repo root
./scripts/start.sh

# Access the app
kubectl port-forward -n app-v2 service/frontend 9000:80
\`\`\`

## Manual Deploy

\`\`\`bash
# Create cluster
k3d cluster create dev \\
  --port "8080:80@loadbalancer" \\
  --volume "$HOME/.k8s-app-data/mongodb:/data/db@server:0"

# Build images
docker build -t frontend-v2:local frontend/
docker build -t backend-v2:local backend/

# Import into cluster
k3d image import frontend-v2:local backend-v2:local -c dev

# Deploy
kubectl apply -f manifests/
sleep 5
kubectl apply -f manifests/

# Watch pods come up
kubectl get pods -n app-v2 -w
\`\`\`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Service health check |
| GET | /info | Node version, DB name, namespace, replicas |
| GET | /messages | Fetch messages (Redis cache → MongoDB fallback) |
| POST | /messages | Post a new message, invalidates Redis cache |

## Structure

\`\`\`
multi-container-app-v2/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # top navigation bar
│   │   │   ├── Sidebar.jsx      # left navigation panel
│   │   │   └── Dashboard.jsx    # metrics, service status, messages
│   │   ├── App.jsx
│   │   └── App.css
│   ├── nginx.conf               # proxies /api/ to backend:3000
│   └── Dockerfile               # multi-stage: node builder + nginx-unprivileged
├── backend/
│   ├── app.js                   # Express API with health, info, messages routes
│   ├── package.json
│   └── Dockerfile
└── manifests/
    ├── namespace.yaml           # app-v2 namespace
    ├── secrets.yaml             # MongoDB + Redis URLs as K8s Secret
    ├── mongo-pvc.yaml           # PersistentVolumeClaim for MongoDB
    ├── mongo.yaml               # MongoDB deployment + service + hostPath volume
    ├── redis.yaml               # Redis deployment + service
    ├── backend.yaml             # Backend deployment + service + secret refs
    ├── frontend.yaml            # Frontend deployment + service + ingress
    └── networkpolicy.yaml       # Pod-to-pod traffic rules
\`\`\`

## Resource Limits

| Pod | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---|---|---|---|---|
| frontend | 50m | 100m | 64Mi | 128Mi |
| backend | 100m | 250m | 128Mi | 256Mi |
| mongo | 100m | 500m | 256Mi | 512Mi |
| redis | 50m | 100m | 64Mi | 128Mi |
