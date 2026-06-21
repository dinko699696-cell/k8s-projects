# Fullstack Helm Chart

Packages the three-tier app (Nginx frontend, Node.js backend, MongoDB) into a single Helm release.

## Install

```bash
helm install fullstack ./project1-fullstack/helm/fullstack \
  --namespace fullstack --create-namespace
```

## Upgrade

```bash
helm upgrade fullstack ./project1-fullstack/helm/fullstack \
  --namespace fullstack --set backend.image.tag=<sha>
```

## Uninstall

```bash
helm uninstall fullstack --namespace fullstack
```

## Configurable values

See `values.yaml`. Key settings: image repositories and tags, replica counts,
resource requests/limits, MongoDB storage size, and the frontend NodePort.
