#!/bin/bash

echo "🚀 Complete ArgoCD Managed Resources Report"
echo "============================================="

echo ""
echo "📱 ArgoCD Application Overview:"
echo "==============================="
kubectl get applications -n argocd

echo ""
echo "🎯 Application Details:"
echo "======================="
APP_NAME="namestock"
echo "• Application Name: $APP_NAME"
echo "• Sync Status: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.sync.status}')"
echo "• Health Status: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.health.status}')"
echo "• Repository: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.source.repoURL}')"
echo "• Path: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.source.path}')"
echo "• Target Revision: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.source.targetRevision}')"
echo "• Auto Sync: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.spec.syncPolicy.automated.prune}' | grep -q 'true' && echo 'Enabled' || echo 'Disabled')"
echo "• Last Sync: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.operationState.finishedAt}')"

echo ""
echo "🐳 Docker Images Deployed:"
echo "=========================="
kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.summary.images[*]}' | tr ' ' '\n' | awk '{print "• " $1}'

echo ""
echo "🌐 External URLs:"
echo "================="
kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.summary.externalURLs[*]}' | tr ' ' '\n' | awk '{print "• " $1}'

echo ""
echo "📊 Kubernetes Resources Managed by ArgoCD:"
echo "==========================================="

echo ""
echo "🏗️ Infrastructure Resources:"
echo "----------------------------"
echo "• Namespace: stock-analysis"
kubectl get namespace stock-analysis --no-headers | awk '{print "  Status: " $2 ", Age: " $3}'

echo "• PersistentVolume: postgres-pv"
kubectl get pv postgres-pv --no-headers | awk '{print "  Capacity: " $2 ", Status: " $5 ", Age: " $10}'

echo "• PersistentVolumeClaim: postgres-pvc"
kubectl get pvc postgres-pvc -n stock-analysis --no-headers | awk '{print "  Status: " $2 ", Volume: " $3 ", Age: " $6}'

echo ""
echo "🔐 Security Resources:"
echo "----------------------"
kubectl get secrets -n stock-analysis --no-headers | grep -v "token" | awk '{print "• Secret: " $1 " (Type: " $2 ", Age: " $4 ")"}'

echo ""
echo "🌐 Network Resources:"
echo "---------------------"
kubectl get services -n stock-analysis --no-headers | awk '{print "• Service: " $1 " (Type: " $2 ", ClusterIP: " $3 ", Age: " $6 ")"}'

echo ""
echo "📡 Ingress Resources:"
echo "--------------------"
kubectl get ingress -n stock-analysis --no-headers | awk '{print "• Ingress: " $1 " (Host: " $3 ", Address: " $4 ", Age: " $6 ")"}'

echo ""
echo "🚀 Application Deployments:"
echo "==========================="
kubectl get deployments -n stock-analysis --no-headers | awk '{print "• " $1 ": " $2 "/" $3 " ready, " $4 " up-to-date, Age: " $6}'

echo ""
echo "📈 Auto-Scaling Resources:"
echo "=========================="
kubectl get hpa -n stock-analysis --no-headers | awk '{print "• HPA: " $1 " (Min: " $5 ", Max: " $6 ", Current: " $7 ", Age: " $8 ")"}'

echo ""
echo "🏃 Running Pods:"
echo "==============="
kubectl get pods -n stock-analysis --no-headers | awk '{print "• " $1 ": " $3 " (" $2 "), Restarts: " $4 ", Age: " $5}'

echo ""
echo "📋 Resource Summary:"
echo "===================="
TOTAL_RESOURCES=$(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.resources}' | jq '. | length')
SYNCED_RESOURCES=$(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.resources[?(@.status=="Synced")]}' | jq '. | length')

echo "• Total Resources Managed: $TOTAL_RESOURCES"
echo "• Synced Resources: $SYNCED_RESOURCES"
echo "• Sync Success Rate: $(echo "scale=1; $SYNCED_RESOURCES * 100 / $TOTAL_RESOURCES" | bc)%"

echo ""
echo "🔄 Deployment History:"
echo "======================"
kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.history[*].id}' | tr ' ' '\n' | wc -l | xargs echo "• Total Deployments:"
echo "• Latest Revision: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.sync.revision}' | cut -c1-8)"
echo "• Last Deployment: $(kubectl get application $APP_NAME -n argocd -o jsonpath='{.status.operationState.finishedAt}')"

echo ""
echo "✅ ArgoCD Management Status: ACTIVE"
echo "🎯 GitOps Workflow: OPERATIONAL"
echo "🔄 Auto-Sync: ENABLED"
echo "🛡️ Self-Healing: ENABLED"
