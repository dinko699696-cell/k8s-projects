# Kubernetes Manifests

All manifests for the fullstack app. Apply in this order:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f mongo-secret.yaml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

Or all at once:

```bash
kubectl apply -f .
```

## Files

| File | Description |
|------|-------------|
| `namespace.yaml` | Creates the `fullstack` namespace |
| `mongo-secret.yaml` | Base64-encoded MongoDB credentials (K8s Secret) |
| `mongo-deployment.yaml` | MongoDB 6 Deployment + ClusterIP Service |
| `backend-deployment.yaml` | Node.js API Deployment (2 replicas) + ClusterIP Service |
| `frontend-deployment.yaml` | Nginx frontend Deployment + NodePort Service (30080) |

## Key Patterns Used

- **Secrets** — MongoDB credentials injected via `secretKeyRef`, never hardcoded
- **Downward API** — pod name and namespace injected into backend via `fieldRef`
- **Resource limits** — every container has `requests` and `limits` defined
- **Health probes** — liveness and readiness probes on backend and frontend
- **Prometheus annotations** — backend pods annotated for auto-scraping:
```yaml
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3000"
    prometheus.io/path: "/metrics"
```

## Services

| Service | Type | Port | Description |
|---------|------|------|-------------|
| `mongo-service` | ClusterIP | 27017 | Internal MongoDB access |
| `backend-service` | ClusterIP | 3000 | Internal API access |
| `frontend-service` | NodePort | 80 → 30080 | External frontend access |
