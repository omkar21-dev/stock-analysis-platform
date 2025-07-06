# Kubernetes Deployment for Stock Analysis Platform

This directory contains Kubernetes manifests for deploying the Stock Analysis Platform in a production-ready Kubernetes cluster.

## 🏗️ Architecture

- **Frontend**: React.js app with 2 replicas + auto-scaling
- **Backend**: Node.js API with 3 replicas + auto-scaling  
- **Database**: PostgreSQL with persistent storage
- **Cache**: Redis for session management
- **Ingress**: NGINX ingress controller for routing
- **Auto-scaling**: HPA based on CPU/Memory usage

## 🚀 Quick Deployment

### Prerequisites
```bash
# Ensure you have kubectl and a running cluster
kubectl cluster-info

# For local testing with Minikube
minikube start
minikube addons enable ingress
```

### Deploy Application
```bash
# Deploy all components
./deploy.sh

# Check deployment status
kubectl get pods -n stock-analysis
kubectl get services -n stock-analysis
```

## 📊 Components

### Core Services
- `namespace.yaml` - Isolated namespace for the application
- `secrets.yaml` - Database and JWT secrets
- `persistent-volume.yaml` - Storage for PostgreSQL

### Application Deployments
- `postgres-deployment.yaml` - PostgreSQL database
- `redis-deployment.yaml` - Redis cache
- `backend-deployment.yaml` - Node.js API (3 replicas)
- `frontend-deployment.yaml` - React.js app (2 replicas)

### Traffic & Scaling
- `ingress.yaml` - External access routing
- `hpa.yaml` - Horizontal Pod Autoscaler

## 🔧 Configuration

### Environment Variables
Backend pods are configured with:
- Database connection details
- Redis connection
- JWT secrets
- Production environment settings

### Resource Limits
Each component has defined:
- CPU requests/limits
- Memory requests/limits
- Health checks (liveness/readiness probes)

### Auto-scaling
- **Backend**: 2-10 replicas based on 70% CPU usage
- **Frontend**: 2-5 replicas based on 70% CPU usage

## 🌐 Access

### Local Development (Minikube)
```bash
# Get service URLs
minikube service frontend-service -n stock-analysis --url
minikube service backend-service -n stock-analysis --url
```

### Production (with Ingress)
```bash
# Add to /etc/hosts
echo "$(kubectl get ingress stock-analysis-ingress -n stock-analysis -o jsonpath='{.status.loadBalancer.ingress[0].ip}') stock-analysis.local" >> /etc/hosts

# Access application
curl http://stock-analysis.local
```

## 📈 Monitoring

### Check Application Status
```bash
# Pod status
kubectl get pods -n stock-analysis

# Service endpoints
kubectl get endpoints -n stock-analysis

# Auto-scaling status
kubectl get hpa -n stock-analysis

# Resource usage
kubectl top pods -n stock-analysis
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n stock-analysis

# Frontend logs
kubectl logs -f deployment/frontend -n stock-analysis

# Database logs
kubectl logs -f deployment/postgres -n stock-analysis
```

## 🔄 Updates & Rollbacks

### Rolling Updates
```bash
# Update backend image
kubectl set image deployment/backend backend=stock-analysis/backend:v2 -n stock-analysis

# Check rollout status
kubectl rollout status deployment/backend -n stock-analysis
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n stock-analysis

# Check rollout history
kubectl rollout history deployment/backend -n stock-analysis
```

## 🧹 Cleanup

```bash
# Delete all resources
kubectl delete namespace stock-analysis

# Or delete individual components
kubectl delete -f .
```

## 🎯 Production Considerations

### Security
- Secrets are base64 encoded (use external secret management in production)
- Network policies for pod-to-pod communication
- RBAC for service accounts

### Storage
- Use cloud-native storage classes (AWS EBS, GCP PD, Azure Disk)
- Database backups and disaster recovery
- Persistent volume snapshots

### Monitoring
- Integrate with Prometheus/Grafana
- Set up alerting for critical metrics
- Log aggregation with ELK stack

### High Availability
- Multi-zone deployment
- Database replication
- Load balancer health checks
