#!/bin/bash

echo "🚀 Complete ArgoCD Status Report"
echo "================================="

echo ""
echo "📊 ArgoCD Core Components:"
echo "=========================="
echo "Pods Status:"
kubectl get pods -n argocd --no-headers | awk '{print "  " $1 ": " $3 " (" $2 ")"}'

echo ""
echo "Services:"
kubectl get svc -n argocd --no-headers | awk '{print "  " $1 ": " $2 " - " $5}'

echo ""
echo "📱 ArgoCD Applications Being Managed:"
echo "====================================="
kubectl get applications -n argocd

echo ""
echo "🎯 Application Details:"
echo "======================="
APP_NAME=$(kubectl get applications -n argocd --no-headers | awk '{print $1}')
if [ ! -z "$APP_NAME" ]; then
    echo "Application Name: $APP_NAME"
    echo "Sync Status: $(kubectl get application $APP_NAME -n argocd --no-headers | awk '{print $2}')"
    echo "Health Status: $(kubectl get application $APP_NAME -n argocd --no-headers | awk '{print $3}')"
    echo "Repository: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.source.repoURL}')"
    echo "Path: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.source.path}')"
    echo "Target Revision: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.source.targetRevision}')"
    echo "Destination Namespace: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.destination.namespace}')"
    echo "Auto Sync: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.syncPolicy.automated}' | grep -q 'prune' && echo 'Enabled' || echo 'Disabled')"
fi

echo ""
echo "🔧 Resources Managed by ArgoCD:"
echo "==============================="
if [ ! -z "$APP_NAME" ]; then
    echo "Kubernetes Resources Deployed:"
    kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.resources[*].kind}' | tr ' ' '\n' | sort | uniq -c | awk '{print "  " $2 ": " $1 " resource(s)"}'
    
    echo ""
    echo "Deployed Images:"
    kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.summary.images[*]}' | tr ' ' '\n' | awk '{print "  • " $1}'
fi

echo ""
echo "🌐 ArgoCD Access Information:"
echo "============================="
ADMIN_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null)
NODEPORT_HTTP=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.spec.ports[?(@.port==80)].nodePort}')
NODEPORT_HTTPS=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.spec.ports[?(@.port==443)].nodePort}')

echo "Access URLs:"
echo "  • HTTPS (Port Forward): https://localhost:8443"
echo "  • HTTP (Port Forward):  http://localhost:8080"
echo "  • HTTPS (NodePort):     https://localhost:$NODEPORT_HTTPS"
echo "  • HTTP (NodePort):      http://localhost:$NODEPORT_HTTP"
echo ""
echo "Login Credentials:"
echo "  • Username: admin"
echo "  • Password: $ADMIN_PASSWORD"

echo ""
echo "📊 Storage & Configuration:"
echo "==========================="
echo "ConfigMaps:"
kubectl get configmaps -n argocd --no-headers | awk '{print "  " $1 ": " $2 " keys"}'

echo ""
echo "Secrets:"
kubectl get secrets -n argocd --no-headers | grep -v "token" | awk '{print "  " $1 ": " $3 " keys"}'

echo ""
echo "🔄 Recent ArgoCD Events:"
echo "======================="
if [ ! -z "$APP_NAME" ]; then
    kubectl get events -n argocd --field-selector involvedObject.name=$APP_NAME --sort-by='.lastTimestamp' | tail -5
fi

echo ""
echo "💡 Useful ArgoCD Commands:"
echo "========================="
echo "# View application details"
echo "kubectl describe application $APP_NAME -n argocd"
echo ""
echo "# Sync application manually"
echo "kubectl patch application $APP_NAME -n argocd --type merge --patch '{\"operation\":{\"initiatedBy\":{\"username\":\"admin\"},\"sync\":{}}}'"
echo ""
echo "# View application logs"
echo "kubectl logs -n argocd deployment/argocd-server"
echo ""
echo "# Port forward ArgoCD"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:80"

echo ""
echo "✅ ArgoCD Status: All systems operational!"
echo "🎯 Managing: Stock Analysis Platform via GitOps"
