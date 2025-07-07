#!/bin/bash

echo "🔍 Testing ArgoCD Access"
echo "======================="

echo "📋 Checking ArgoCD pods..."
kubectl get pods -n argocd

echo ""
echo "📋 Checking ArgoCD services..."
kubectl get svc -n argocd

echo ""
echo "📋 Testing HTTP access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP access working (Code: $HTTP_CODE)"
else
    echo "❌ HTTP access failed (Code: $HTTP_CODE)"
fi

echo ""
echo "📋 Testing HTTPS access..."
HTTPS_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8443)
if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "307" ]; then
    echo "✅ HTTPS access working (Code: $HTTPS_CODE)"
else
    echo "❌ HTTPS access failed (Code: $HTTPS_CODE)"
fi

echo ""
echo "🔐 Admin Credentials:"
echo "Username: admin"
echo "Password: $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)"

echo ""
echo "🌐 Access URLs:"
echo "• HTTP:  http://localhost:8080"
echo "• HTTPS: https://localhost:8443"

echo ""
echo "💡 If access fails, run: ./setup-argocd.sh"
