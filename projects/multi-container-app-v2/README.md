# multi-container-app-v2

Production-grade upgrade of the full stack app with a React dashboard, security hardening, and real backend telemetry.

## Architecture

\`\`\`
[React Frontend] → [Node.js Backend] → [MongoDB]
                          ↓
                       [Redis]
\`\`\`

## What's new vs v1

### Frontend
- React + Vite replacing static HTML
- Dark dashboard UI with sidebar navigation
- Live service status indicators (Backend, MongoDB, Redis)
- Backend info panel — Node version, DB name, namespace, replicas
- Redis cache hit/miss indicator
- TanStack Query with auto-refetch every 10s

### Security
- Kubernetes Secrets for MongoDB and Redis URLs
- Non-root containers (nginx-unprivileged, runAsUser 1000)
- Resource requests and limits on every pod
- Network Policies — strict pod-to-pod traffic rules:
  - Frontend → Backend only
  - Backend → MongoDB + Redis only
  - MongoDB + Redis accept traffic from Backend only

## Structure
\`\`\`
multi-container-app-v2/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── nginx.conf
│   └── Dockerfile
├── backend/
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
└── manifests/
    ├── namespace.yaml
    ├── secrets.yaml
    ├── frontend.yaml
    ├── backend.yaml
    ├── mongo.yaml
    ├── redis.yaml
    └── networkpolicy.yaml
\`\`\`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Service health check |
| GET | /info | Node version, DB name, namespace, replica info |
| GET | /messages | Fetch messages (Redis cache → MongoDB fallback) |
| POST | /messages | Post a new message, invalidates cache |

## Run it
\`\`\`bash
k3d cluster create dev --port "8080:80@loadbalancer"
docker build -t frontend-v2:local frontend/
docker build -t backend-v2:local backend/
k3d image import frontend-v2:local backend-v2:local -c dev
kubectl apply -f manifests/
kubectl port-forward -n app-v2 service/frontend 9000:80
\`\`\`
