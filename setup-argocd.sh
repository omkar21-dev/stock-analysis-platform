#!/bin/bash

echo "🚀 ArgoCD Setup Script for Stock Analysis Platform"
echo "=================================================="

# Step 1: Check Kubernetes
echo "📋 Step 1: Checking Kubernetes cluster..."
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo "❌ Kubernetes cluster not accessible. Please start your cluster first."
    exit 1
fi
echo "✅ Kubernetes cluster is running"

# Step 2: Create namespace if not exists
echo "📋 Step 2: Creating ArgoCD namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
echo "✅ ArgoCD namespace ready"

# Step 3: Install ArgoCD
echo "📋 Step 3: Installing ArgoCD..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Step 4: Wait for pods to be ready
echo "📋 Step 4: Waiting for ArgoCD pods to be ready (this may take a few minutes)..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=600s

# Step 5: Change service to NodePort
echo "📋 Step 5: Configuring ArgoCD service..."
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

# Step 6: Get service details
echo "📋 Step 6: Getting service information..."
NODEPORT_HTTP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.spec.ports[?(@.port==80)].nodePort}')
NODEPORT_HTTPS=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.spec.ports[?(@.port==443)].nodePort}')

# Step 7: Get admin password
echo "📋 Step 7: Getting admin password..."
ADMIN_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# Step 8: Start port forwarding
echo "📋 Step 8: Starting port forwarding..."
pkill -f "port-forward.*argocd-server" 2>/dev/null
kubectl port-forward svc/argocd-server -n argocd 8080:80 > /dev/null 2>&1 &
kubectl port-forward svc/argocd-server -n argocd 8443:443 > /dev/null 2>&1 &

sleep 5

echo ""
echo "🎉 ArgoCD Installation Complete!"
echo "================================="
echo ""
echo "🌐 Access ArgoCD at:"
echo "   • HTTP:  http://localhost:8080"
echo "   • HTTPS: https://localhost:8443"
echo "   • NodePort HTTP:  http://localhost:$NODEPORT_HTTP"
echo "   • NodePort HTTPS: https://localhost:$NODEPORT_HTTPS"
echo ""
echo "🔐 Login Credentials:"
echo "   • Username: admin"
echo "   • Password: $ADMIN_PASSWORD"
echo ""
echo "📋 Useful Commands:"
echo "   • Check pods: kubectl get pods -n argocd"
echo "   • Check services: kubectl get svc -n argocd"
echo "   • View logs: kubectl logs -n argocd deployment/argocd-server"
echo "   • Stop port-forward: pkill -f 'port-forward.*argocd-server'"
echo ""
echo "⚠️  Note: Accept the SSL certificate in your browser for HTTPS access"
echo ""
echo "🚀 Ready to deploy your Stock Analysis Platform with GitOps!"
