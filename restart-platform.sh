#!/bin/bash

echo "🚀 Stock Analysis Platform - Recovery Script"
echo "============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check and start minikube
echo -e "${YELLOW}Step 1: Checking Minikube...${NC}"
if minikube status | grep -q "Running"; then
    echo -e "${GREEN}✅ Minikube is running${NC}"
else
    echo -e "${YELLOW}🔄 Starting Minikube...${NC}"
    minikube start
    echo -e "${GREEN}✅ Minikube started${NC}"
fi

# Step 2: Enable ingress
echo -e "${YELLOW}Step 2: Enabling Ingress...${NC}"
minikube addons enable ingress
echo -e "${GREEN}✅ Ingress enabled${NC}"

# Step 3: Wait for system pods
echo -e "${YELLOW}Step 3: Waiting for system to be ready...${NC}"
kubectl wait --for=condition=ready pod --all -n kube-system --timeout=300s
echo -e "${GREEN}✅ System pods ready${NC}"

# Step 4: Check your application
echo -e "${YELLOW}Step 4: Checking your application...${NC}"
kubectl get pods -n stock-analysis

# Step 5: Wait for your application
echo -e "${YELLOW}Step 5: Waiting for your application...${NC}"
kubectl wait --for=condition=ready pod --all -n stock-analysis --timeout=300s
echo -e "${GREEN}✅ Application pods ready${NC}"

# Step 6: Setup hosts file
echo -e "${YELLOW}Step 6: Setting up hosts file...${NC}"
MINIKUBE_IP=$(minikube ip)
if ! grep -q "stock-analysis.local" /etc/hosts; then
    echo "$MINIKUBE_IP stock-analysis.local" | sudo tee -a /etc/hosts
    echo -e "${GREEN}✅ Hosts file updated${NC}"
else
    echo -e "${GREEN}✅ Hosts file already configured${NC}"
fi

# Step 7: Test access
echo -e "${YELLOW}Step 7: Testing access...${NC}"
sleep 10
if curl -s -o /dev/null -w "%{http_code}" http://stock-analysis.local | grep -q "200"; then
    echo -e "${GREEN}✅ Website is accessible${NC}"
else
    echo -e "${RED}⚠️ Website not responding, trying port-forward...${NC}"
    kubectl port-forward svc/frontend-service -n stock-analysis 3000:80 > /dev/null 2>&1 &
    echo -e "${YELLOW}🔄 Port-forward started on http://localhost:3000${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Recovery Complete!${NC}"
echo "================================="
echo ""
echo -e "${GREEN}🌐 Your Stock Analysis Platform is available at:${NC}"
echo "• Primary: http://stock-analysis.local"
echo "• Backup: http://localhost:3000 (if port-forward is running)"
echo ""
echo -e "${GREEN}🔧 Management Tools:${NC}"
echo "• ArgoCD: kubectl port-forward svc/argocd-server -n argocd 8080:80"
echo "• Then visit: http://localhost:8080 (admin/VoCMCv90-VRbpL8P)"
echo ""
echo -e "${GREEN}📊 Status Commands:${NC}"
echo "• Check pods: kubectl get pods -n stock-analysis"
echo "• Check services: kubectl get svc -n stock-analysis"
echo "• Check ingress: kubectl get ingress -n stock-analysis"
echo ""
echo -e "${GREEN}✅ Your platform is ready for stock analysis!${NC}"
