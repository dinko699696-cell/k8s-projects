# Fullstack Backend

Node.js + Express REST API with MongoDB and Prometheus metrics.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Service info |
| GET | /health | Health check — DB status, pod name, uptime, item count |
| GET | /metrics | Prometheus metrics (prom-client) |
| GET | /items | List all items sorted by date |
| POST | /items | Create item `{ name, description, priority }` |
| DELETE | /items/:id | Delete item by MongoDB ObjectId |

## Prometheus Metrics Exposed

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total requests by method, route, status |
| `http_request_duration_seconds` | Histogram | Latency per route |
| `mongodb_connection_status` | Gauge | 1 = connected, 0 = disconnected |
| `app_items_total` | Gauge | Current item count in DB |
| `process_cpu_*` | Counter | Node.js CPU usage |
| `process_resident_memory_bytes` | Gauge | Memory usage |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_HOST` | localhost | MongoDB service hostname |
| `MONGO_PORT` | 27017 | MongoDB port |
| `MONGO_USER` | admin | MongoDB username (injected from K8s Secret) |
| `MONGO_PASSWORD` | password123 | MongoDB password (injected from K8s Secret) |
| `APP_PORT` | 3000 | Port to listen on |
| `MY_POD_NAME` | unknown | Injected via Kubernetes Downward API |
| `MY_NAMESPACE` | unknown | Injected via Kubernetes Downward API |

## Docker

```bash
docker build -t dancyber/fullstack-backend:v1 .
docker run -p 3000:3000 dancyber/fullstack-backend:v1
```

## Image

[dancyber/fullstack-backend on Docker Hub](https://hub.docker.com/r/dancyber/fullstack-backend)
