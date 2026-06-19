# nginx-demo

A simple nginx deployment on Kubernetes using k3d in GitHub Codespaces.

## Structure
- `manifests/namespace.yaml` - namespace definition
- `manifests/deployment.yaml` - nginx deployment
- `manifests/service.yaml` - ClusterIP service

## Run it yourself
```bash
k3d cluster create dev --port "8080:80@loadbalancer"
kubectl apply -f manifests/namespace.yaml
kubectl apply -f manifests/deployment.yaml
kubectl apply -f manifests/service.yaml
kubectl get all -n myapp
```
