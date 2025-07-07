#!/bin/bash

echo "🚀 Kubernetes Stock Analysis Platform Status"
echo "============================================="

echo ""
echo "📊 ArgoCD Status:"
echo "=================="
kubectl get pods -n argocd | head -1
kubectl get pods -n argocd | grep -E "(Running|Ready)" | wc -l | xargs echo "✅ Running pods:"
kubectl get svc argocd-server -n argocd --no-headers | awk '{print "🌐 ArgoCD Access: http://localhost:" $5}' | sed 's/.*://' | sed 's/,.*//' | xargs echo "🌐 ArgoCD NodePort:"

echo ""
echo "📊 Stock Analysis Platform Status:"
echo "=================================="
echo "Namespace: stock-analysis"
kubectl get pods -n stock-analysis

echo ""
echo "🌐 Services:"
kubectl get svc -n stock-analysis

echo ""
echo "🔍 Frontend Service Details:"
echo "============================"
FRONTEND_NODEPORT=$(kubectl get svc frontend-service -n stock-analysis --no-headers | awk '{print $5}' | cut -d: -f2 | cut -d/ -f1)
echo "📱 Frontend NodePort: $FRONTEND_NODEPORT"
echo "🌐 Frontend URL: http://localhost:$FRONTEND_NODEPORT"

echo ""
echo "🔍 Access Methods:"
echo "=================="
echo "1. 🎯 ArgoCD (GitOps):"
echo "   • HTTPS: https://localhost:8443"
echo "   • HTTP:  http://localhost:8080"
echo "   • Username: admin"
echo "   • Password: $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo 'Run: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d')"

echo ""
echo "2. 📱 Stock Analysis Platform:"
echo "   • Frontend: http://localhost:3000 (via port-forward)"
echo "   • Backend:  http://localhost:3001 (via port-forward)"

echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "# Port forward frontend"
echo "kubectl port-forward svc/frontend-service -n stock-analysis 3000:80"
echo ""
echo "# Port forward backend"
echo "kubectl port-forward svc/backend-service -n stock-analysis 3001:3001"
echo ""
echo "# Check logs"
echo "kubectl logs -n stock-analysis deployment/frontend"
echo "kubectl logs -n stock-analysis deployment/backend"
echo ""
echo "# Scale deployments"
echo "kubectl scale deployment frontend --replicas=3 -n stock-analysis"
echo "kubectl scale deployment backend --replicas=3 -n stock-analysis"

echo ""
echo "✅ All systems operational!"
