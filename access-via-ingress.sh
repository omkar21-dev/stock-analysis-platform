#!/bin/bash

echo "🌐 Stock Analysis Platform - Ingress Access Setup"
echo "=================================================="

MINIKUBE_IP=$(minikube ip)
INGRESS_HOST="stock-analysis.local"

echo ""
echo "📋 Ingress Configuration:"
echo "========================="
echo "• Minikube IP: $MINIKUBE_IP"
echo "• Ingress Host: $INGRESS_HOST"
echo "• Frontend Path: /"
echo "• Backend API Path: /api"

echo ""
echo "🔧 Setup Instructions:"
echo "======================"
echo "1. Add the following line to your /etc/hosts file:"
echo "   $MINIKUBE_IP $INGRESS_HOST"
echo ""
echo "2. Run this command to add it automatically:"
echo "   echo '$MINIKUBE_IP $INGRESS_HOST' | sudo tee -a /etc/hosts"
echo ""

echo "🌐 Access URLs (after hosts file update):"
echo "=========================================="
echo "• Frontend: http://$INGRESS_HOST"
echo "• Backend API: http://$INGRESS_HOST/api"
echo ""

echo "📋 Alternative Access Methods:"
echo "=============================="
echo "• Port Forward Frontend: kubectl port-forward svc/frontend-service -n stock-analysis 3000:80"
echo "• Port Forward Backend:  kubectl port-forward svc/backend-service -n stock-analysis 3001:3001"
echo "• NodePort Frontend:     http://localhost:32187"
echo ""

echo "🔍 Ingress Status Check:"
echo "========================"
kubectl get ingress -n stock-analysis

echo ""
echo "🎯 Quick Test Commands:"
echo "======================="
echo "# Test ingress (after hosts file update)"
echo "curl -H 'Host: $INGRESS_HOST' http://$MINIKUBE_IP"
echo ""
echo "# Test API endpoint"
echo "curl -H 'Host: $INGRESS_HOST' http://$MINIKUBE_IP/api"

echo ""
echo "✅ Ingress Controller Status:"
kubectl get pods -n ingress-nginx --no-headers | awk '{print "• " $1 ": " $3}'
