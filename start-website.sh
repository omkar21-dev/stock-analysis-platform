#!/bin/bash

echo "🚀 Starting Stock Analysis Platform Website Access"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Checking platform status...${NC}"

# Check if minikube is running
if ! minikube status | grep -q "Running"; then
    echo -e "${YELLOW}Starting minikube...${NC}"
    minikube start
fi

# Check if pods are running
echo -e "${YELLOW}Checking pods...${NC}"
kubectl get pods -n stock-analysis --no-headers | grep -v Running | grep -v Completed && echo -e "${YELLOW}Some pods are not ready, waiting...${NC}" || echo -e "${GREEN}All pods are running!${NC}"

echo ""
echo -e "${BLUE}🌐 Website Access Options:${NC}"
echo "=========================="

MINIKUBE_IP=$(minikube ip)
echo -e "${GREEN}1. Port Forward (Recommended):${NC}"
echo "   Command: kubectl port-forward svc/frontend-service -n stock-analysis 8080:80"
echo -e "   ${BLUE}URL: http://localhost:8080${NC}"

echo ""
echo -e "${GREEN}2. Direct IP Access:${NC}"
echo -e "   ${BLUE}URL: http://$MINIKUBE_IP${NC}"
echo "   (Add 'Host: stock-analysis.local' header in browser dev tools)"

echo ""
echo -e "${GREEN}3. Domain Access (if hosts file is configured):${NC}"
echo -e "   ${BLUE}URL: http://stock-analysis.local${NC}"

echo ""
echo -e "${GREEN}4. NodePort Access:${NC}"
echo -e "   ${BLUE}URL: http://$MINIKUBE_IP:32187${NC}"

echo ""
echo -e "${YELLOW}Starting port forward for easy access...${NC}"

# Kill any existing port forwards
pkill -f "kubectl port-forward.*frontend-service" 2>/dev/null

# Start port forward
kubectl port-forward svc/frontend-service -n stock-analysis 8080:80 > /dev/null 2>&1 &
PF_PID=$!

sleep 3

# Test if port forward is working
if curl -s http://localhost:8080 | grep -q "Stock Analysis"; then
    echo -e "${GREEN}✅ Port forward successful!${NC}"
    echo ""
    echo -e "${BLUE}🎉 Your Stock Analysis Platform is now accessible at:${NC}"
    echo -e "${GREEN}   http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}Features available:${NC}"
    echo "• Live NIFTY 50 data"
    echo "• Interactive stock charts"
    echo "• Real-time market updates"
    echo "• Professional trading interface"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop port forwarding${NC}"
    echo ""
    
    # Try to open browser (if available)
    if command -v xdg-open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        xdg-open http://localhost:8080 2>/dev/null &
    elif command -v open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        open http://localhost:8080 2>/dev/null &
    fi
    
    # Keep port forward running
    wait $PF_PID
else
    echo -e "${YELLOW}Port forward setup, but testing failed. Try manually:${NC}"
    echo -e "${BLUE}http://localhost:8080${NC}"
fi
