#!/bin/bash

echo "🚀 Setting up Stock Analysis Platform on Port 3001"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Stopping existing port forwards...${NC}"
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 2

echo -e "${YELLOW}Setting up port forwarding...${NC}"

# Frontend on port 3001
kubectl port-forward svc/frontend-service -n stock-analysis 3001:80 > /tmp/frontend-3001.log 2>&1 &
FRONTEND_PID=$!

# Backend on port 3002 (moved from 3001)
kubectl port-forward svc/backend-service -n stock-analysis 3002:3001 > /tmp/backend-3002.log 2>&1 &
BACKEND_PID=$!

sleep 5

echo -e "${YELLOW}Testing connections...${NC}"

# Test frontend
if curl -s http://localhost:3001 | grep -q "Stock Analysis"; then
    echo -e "${GREEN}✅ Frontend accessible on port 3001${NC}"
    FRONTEND_OK=true
else
    echo -e "${RED}❌ Frontend not accessible on port 3001${NC}"
    echo "Frontend log:"
    cat /tmp/frontend-3001.log
    FRONTEND_OK=false
fi

# Test backend
if curl -s http://localhost:3002/health | grep -q "OK"; then
    echo -e "${GREEN}✅ Backend accessible on port 3002${NC}"
    BACKEND_OK=true
else
    echo -e "${RED}❌ Backend not accessible on port 3002${NC}"
    echo "Backend log:"
    cat /tmp/backend-3002.log
    BACKEND_OK=false
fi

echo ""
echo -e "${BLUE}🌐 Access Information:${NC}"
echo "======================"

if [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✅ Website (Frontend): http://localhost:3001${NC}"
    echo "   Features: Live NIFTY 50, Interactive Charts, Real-time Data"
else
    echo -e "${RED}❌ Website not accessible on port 3001${NC}"
fi

if [ "$BACKEND_OK" = true ]; then
    echo -e "${GREEN}✅ API (Backend): http://localhost:3002${NC}"
    echo "   Endpoints: /health, /api/nifty/*, /api/analytics/*"
else
    echo -e "${RED}❌ API not accessible on port 3002${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Available Features:${NC}"
echo "• Live NIFTY 50 Dashboard"
echo "• Interactive Stock Charts"
echo "• Real-time Market Data"
echo "• Technical Analysis Tools"
echo "• Portfolio Management"

echo ""
if [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}🎉 Your Stock Analysis Platform is now accessible at:${NC}"
    echo -e "${BLUE}   http://localhost:3001${NC}"
    echo ""
    
    # Try to open browser
    if command -v xdg-open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        xdg-open http://localhost:3001 2>/dev/null &
    elif command -v open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        open http://localhost:3001 2>/dev/null &
    fi
    
    echo -e "${YELLOW}Press Ctrl+C to stop the services${NC}"
    echo ""
    
    # Keep services running
    trap "echo 'Stopping services...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
    wait
else
    echo -e "${RED}Setup failed. Please check the logs above.${NC}"
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 1
fi
