#!/bin/bash

echo "🌐 Stock Analysis Platform - Port 3001 Access"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Setting up website access on port 3001...${NC}"

# Stop existing port forwards
pkill -f "kubectl port-forward" 2>/dev/null || true
sleep 2

# Start frontend on port 3001 directly
echo -e "${YELLOW}Starting frontend service on port 3001...${NC}"
kubectl port-forward svc/frontend-service -n stock-analysis 3001:80 > /tmp/website-3001.log 2>&1 &
PF_PID=$!

sleep 5

# Test access
echo -e "${YELLOW}Testing website access...${NC}"
if curl -s http://localhost:3001 | grep -q "Stock Analysis" 2>/dev/null; then
    echo -e "${GREEN}✅ Website is accessible on port 3001${NC}"
    
    echo ""
    echo -e "${BLUE}🎉 Your Stock Analysis Platform is now available at:${NC}"
    echo -e "${GREEN}   http://localhost:3001${NC}"
    echo ""
    
    echo -e "${YELLOW}📊 Features Available:${NC}"
    echo "• Enhanced Home Page with Live Market Data"
    echo "• NIFTY 50 Dashboard (click NIFTY 50 in navbar)"
    echo "• Interactive Stock Charts"
    echo "• Real-time Market Updates"
    echo "• Professional Trading Interface"
    echo "• Mobile Responsive Design"
    
    echo ""
    echo -e "${YELLOW}🔗 Navigation:${NC}"
    echo "• Home: http://localhost:3001"
    echo "• NIFTY 50: http://localhost:3001/nifty50"
    echo "• Dashboard: http://localhost:3001/dashboard"
    echo "• Login: http://localhost:3001/login"
    
    echo ""
    # Try to open browser
    if command -v xdg-open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        xdg-open http://localhost:3001 2>/dev/null &
    elif command -v open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        open http://localhost:3001 2>/dev/null &
    else
        echo -e "${BLUE}Open your browser and visit: http://localhost:3001${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop the service${NC}"
    
    # Keep service running
    trap "echo 'Stopping website service...'; kill $PF_PID 2>/dev/null; exit" INT
    wait $PF_PID
    
else
    echo -e "${RED}❌ Website not accessible${NC}"
    echo "Port forward log:"
    cat /tmp/website-3001.log
    kill $PF_PID 2>/dev/null
    exit 1
fi
