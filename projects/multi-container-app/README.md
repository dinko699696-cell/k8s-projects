# multi-container-app (v1)

A full stack application running across 4 pods in a Kubernetes cluster.

## Architecture

\`\`\`
[Frontend] → [Backend] → [MongoDB]
                 ↓
             [Redis]
\`\`\`

## Services

| Service | Image | Port | Role |
|---|---|---|---|
| frontend | nginx:alpine | 80 | Serves HTML, proxies /api to backend |
| backend | node:20-alpine | 3000 | REST API, reads/writes MongoDB, caches in Redis |
| mongo | mongo:6 | 27017 | Persistent message storage |
| redis | redis:7-alpine | 6379 | Response cache with 30s TTL |

## Structure
\`\`\`
multi-container-app/
├── frontend/
│   ├── index.html
│   ├── nginx.conf
│   └── Dockerfile
├── backend/
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
└── manifests/
    ├── namespace.yaml
    ├── frontend.yaml
    ├── backend.yaml
    ├── mongo.yaml
    └── redis.yaml
\`\`\`

## Run it
\`\`\`bash
k3d cluster create dev --port "8080:80@loadbalancer"
docker build -t backend:local backend/
docker build -t frontend:local frontend/
k3d image import backend:local frontend:local -c dev
kubectl apply -f manifests/
kubectl port-forward -n myapp service/frontend 8888:80
\`\`\`
