# Troubleshooting

Common issues and solutions for DClaw Space.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-space

# Check logs
kubectl logs -n dclaw-space deployment/dclaw-space-backend

# Check database
kubectl get clusters -n dclaw-space
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
