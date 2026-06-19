# nginx-demo

A simple nginx deployment on Kubernetes — the starting point for validating the full K8s workflow.

## What it does
Deploys a single nginx pod in its own namespace, exposed via a ClusterIP service.

## Structure
\`\`\`
nginx-demo/
└── manifests/
    ├── namespace.yaml
    ├── deployment.yaml
    └── service.yaml
\`\`\`

## Run it
\`\`\`bash
k3d cluster create dev --port "8080:80@loadbalancer"
kubectl apply -f manifests/
kubectl get all -n myapp
\`\`\`
