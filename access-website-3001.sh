#!/bin/bash

echo "🚀 Stock Analysis Platform - Port 3001 Access"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Setting up your website on port 3001...${NC}"

# Clean up any existing port forwards
echo -e "${YELLOW}Cleaning up existing services...${NC}"
sudo pkill -f "kubectl port-forward" 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
sleep 3

# Start the website on port 3001
echo -e "${YELLOW}Starting website service...${NC}"
kubectl port-forward svc/frontend-service -n stock-analysis 3001:80 > /tmp/website-3001.log 2>&1 &
WEBSITE_PID=$!

sleep 5

# Test the website
echo -e "${YELLOW}Testing website access...${NC}"
if curl -s http://localhost:3001 | grep -q "Stock Analysis" 2>/dev/null; then
    echo -e "${GREEN}✅ SUCCESS: Website is running on port 3001!${NC}"
    
    echo ""
    echo -e "${BLUE}🌐 Your Stock Analysis Platform is now accessible at:${NC}"
    echo -e "${GREEN}   http://localhost:3001${NC}"
    echo ""
    
    echo -e "${YELLOW}🎯 Available Features:${NC}"
    echo "• 🏠 Enhanced Home Page with Live Market Data"
    echo "• 📊 NIFTY 50 Dashboard (click 'NIFTY 50' in navbar)"
    echo "• 📈 Interactive Stock Charts"
    echo "• ⚡ Real-time Market Updates"
    echo "• 💼 Professional Trading Interface"
    echo "• 📱 Mobile Responsive Design"
    
    echo ""
    echo -e "${YELLOW}🔗 Quick Navigation:${NC}"
    echo "• Home Page: http://localhost:3001"
    echo "• NIFTY 50: http://localhost:3001/nifty50"
    echo "• Dashboard: http://localhost:3001/dashboard"
    echo "• Login: http://localhost:3001/login"
    echo "• Register: http://localhost:3001/register"
    
    echo ""
    echo -e "${YELLOW}📊 What You'll See:${NC}"
    echo "• Live NIFTY 50 index with real-time changes"
    echo "• Top gainers and losers"
    echo "• All 50 NIFTY stocks with live prices"
    echo "• Interactive charts with multiple timeframes"
    echo "• Professional trading platform interface"
    
    echo ""
    # Try to open browser
    if command -v xdg-open > /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        xdg-open http://localhost:3001 2>/dev/null &
    elif command -v open > /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        open http://localhost:3001 2>/dev/null &
    else
        echo -e "${BLUE}🌐 Open your browser and visit: http://localhost:3001${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Your enhanced Stock Analysis Platform is ready!${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the service when you're done${NC}"
    echo ""
    
    # Keep the service running
    trap "echo -e '\n${YELLOW}Stopping website service...${NC}'; kill $WEBSITE_PID 2>/dev/null; echo -e '${GREEN}✅ Service stopped${NC}'; exit" INT
    
    # Monitor the service
    while kill -0 $WEBSITE_PID 2>/dev/null; do
        sleep 5
    done
    
    echo -e "${RED}❌ Service stopped unexpectedly${NC}"
    
else
    echo -e "${RED}❌ Failed to start website on port 3001${NC}"
    echo "Error log:"
    cat /tmp/website-3001.log
    kill $WEBSITE_PID 2>/dev/null
    
    echo ""
    echo -e "${YELLOW}💡 Alternative: Try these URLs instead:${NC}"
    echo "• http://stock-analysis.local"
    echo "• http://192.168.49.2"
    echo "• http://localhost:8080 (run: kubectl port-forward svc/frontend-service -n stock-analysis 8080:80)"
    
    exit 1
fi
