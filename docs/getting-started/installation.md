# Installation

## Via DPanel

1. Open DPanel at `https://panel.yourdomain.com`
2. Find **DClaw Space** in the app grid
3. Click **Install**
4. The DClaw Operator will provision:
   - Namespace: `dclaw-space`
   - Frontend deployment (Next.js)
   - Backend deployment (FastAPI)
   - PostgreSQL database (CloudNativePG)
   - Ingress with TLS

## Via kubectl

```bash
# Apply the DClawApp CRD
kubectl apply -f - <<EOF
apiVersion: platform.dclaw.io/v1
kind: DClawApp
metadata:
  name: space
spec:
  appId: space
  appName: DClaw Space
  version: 0.1.0
  category: real estate
  enabled: true
  frontend:
    image: ghcr.io/dclawstack/dclaw-space:latest
    replicas: 2
  backend:
    image: ghcr.io/dclawstack/dclaw-space-backend:latest
    replicas: 2
  database:
    enabled: true
    storage: 10Gi
  ingress:
    enabled: true
    host: space.yourdomain.com
    tls: true
EOF
```

## Verify

```bash
kubectl get pods -n dclaw-space
kubectl get ingress -n dclaw-space
```
