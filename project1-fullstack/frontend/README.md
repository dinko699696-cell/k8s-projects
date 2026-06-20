# Fullstack Frontend

Vanilla JS single-page dashboard served by Nginx, proxying API calls to the backend service.

## Features

- Live health bar — DB connection status, serving pod name, uptime (polls every 10s)
- Stats panel — total items, count by priority (high / medium / low)
- Add items — name, description, priority selector
- Delete items — per-item delete button
- Pod name tag on items list — shows which backend replica is serving, demonstrating Kubernetes load balancing

## Nginx Proxy

All `/api/*` requests are proxied to `backend-service:3000` via the nginx config:

```nginx
location /api/ {
    proxy_pass http://backend-service:3000/;
}
```

This means the frontend never exposes the backend URL directly — traffic stays inside the Kubernetes cluster.

## Docker

```bash
docker build -t dancyber/fullstack-frontend:v1 .
docker run -p 80:80 dancyber/fullstack-frontend:v1
```

## Image

[dancyber/fullstack-frontend on Docker Hub](https://hub.docker.com/r/dancyber/fullstack-frontend)
