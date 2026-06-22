# Monitoring

Prometheus + Grafana monitoring for the fullstack app, deployed via the
`kube-prometheus-stack` Helm chart into a dedicated `monitoring` namespace.

## What's here

| File | Purpose |
|------|---------|
| `values.yaml` | Helm values for `kube-prometheus-stack` — resource limits tuned for k3d, annotation-based pod scraping, trimmed components not needed on a single-node cluster. |
| `dashboards/fullstack-app-dashboard.json` | Grafana dashboard for the app's custom metrics — request rate, latency percentiles, status codes, DB status, item count, per-pod memory. |

## Install

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  -f project1-fullstack/monitoring/values.yaml
```

## How scraping works

The backend pods carry `prometheus.io/scrape`, `prometheus.io/port`, and
`prometheus.io/path` annotations. An `additionalScrapeConfigs` job named
`annotated-pods` in `values.yaml` discovers any pod with these annotations and
scrapes its `/metrics` endpoint — no ServiceMonitor needed.

## Access

```bash
# Prometheus
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090

# Grafana (admin / admin by default — change for anything non-dev)
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

## Import the dashboard

Grafana → Dashboards → New → Import → upload
`dashboards/fullstack-app-dashboard.json` → select the Prometheus datasource.

## Custom app metrics

| Metric | Type | Meaning |
|--------|------|---------|
| `http_requests_total` | counter | requests by method, route, status |
| `http_request_duration_seconds` | histogram | request latency |
| `mongodb_connection_status` | gauge | 1 = connected, 0 = down |
| `app_items_total` | gauge | items stored in MongoDB |
