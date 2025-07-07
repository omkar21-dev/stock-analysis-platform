#!/bin/bash

echo "🚀 Starting Stock Analysis Platform on Port 3001"
echo "================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    echo "Please install Node.js and try again"
    exit 1
fi

echo -e "${YELLOW}Step 1: Stopping existing services...${NC}"
pkill -f "kubectl port-forward" 2>/dev/null || true
pkill -f "proxy-server-3001.js" 2>/dev/null || true
sleep 2

echo -e "${YELLOW}Step 2: Starting Kubernetes port forwards...${NC}"

# Frontend on port 3000
kubectl port-forward svc/frontend-service -n stock-analysis 3000:80 > /tmp/frontend-3000.log 2>&1 &
FRONTEND_PID=$!

# Backend on port 3002
kubectl port-forward svc/backend-service -n stock-analysis 3002:3001 > /tmp/backend-3002.log 2>&1 &
BACKEND_PID=$!

sleep 5

echo -e "${YELLOW}Step 3: Testing Kubernetes services...${NC}"

# Test frontend
if curl -s http://localhost:3000 | grep -q "Stock Analysis" 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend service ready on port 3000${NC}"
    FRONTEND_OK=true
else
    echo -e "${RED}❌ Frontend service failed${NC}"
    cat /tmp/frontend-3000.log
    FRONTEND_OK=false
fi

# Test backend
if curl -s http://localhost:3002/health | grep -q "OK" 2>/dev/null; then
    echo -e "${GREEN}✅ Backend service ready on port 3002${NC}"
    BACKEND_OK=true
else
    echo -e "${RED}❌ Backend service failed${NC}"
    cat /tmp/backend-3002.log
    BACKEND_OK=false
fi

if [ "$FRONTEND_OK" = false ] || [ "$BACKEND_OK" = false ]; then
    echo -e "${RED}❌ Kubernetes services failed to start${NC}"
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${YELLOW}Step 4: Installing proxy dependencies...${NC}"
cd /home/omkar/stock-analysis-platform

# Check if http-proxy is installed
if ! node -e "require('http-proxy')" 2>/dev/null; then
    echo "Installing http-proxy..."
    npm install http-proxy 2>/dev/null || {
        echo -e "${YELLOW}Creating simple proxy without dependencies...${NC}"
        cat > simple-proxy-3001.js << 'EOF'
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Determine target
  const isAPI = req.url.startsWith('/api/') || req.url.startsWith('/health');
  const targetPort = isAPI ? 3002 : 3000;
  
  // Create proxy request
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
});

server.listen(3001, () => {
  console.log('🚀 Simple proxy server running on http://localhost:3001');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => process.exit(0));
});
EOF
        PROXY_FILE="simple-proxy-3001.js"
    }
else
    PROXY_FILE="proxy-server-3001.js"
fi

echo -e "${YELLOW}Step 5: Starting proxy server on port 3001...${NC}"

# Start proxy server
node $PROXY_FILE > /tmp/proxy-3001.log 2>&1 &
PROXY_PID=$!

sleep 3

echo -e "${YELLOW}Step 6: Testing final setup...${NC}"

# Test the proxy
if curl -s http://localhost:3001 | grep -q "Stock Analysis" 2>/dev/null; then
    echo -e "${GREEN}✅ Website accessible on port 3001${NC}"
    PROXY_OK=true
else
    echo -e "${RED}❌ Proxy failed${NC}"
    echo "Proxy log:"
    cat /tmp/proxy-3001.log
    PROXY_OK=false
fi

# Test API through proxy
if curl -s http://localhost:3001/health | grep -q "OK" 2>/dev/null; then
    echo -e "${GREEN}✅ API accessible through port 3001${NC}"
    API_OK=true
else
    echo -e "${YELLOW}⚠️ API might not be accessible through proxy${NC}"
    API_OK=false
fi

echo ""
echo -e "${BLUE}🌐 Access Information:${NC}"
echo "======================"

if [ "$PROXY_OK" = true ]; then
    echo -e "${GREEN}✅ Website: http://localhost:3001${NC}"
    echo -e "${GREEN}✅ API: http://localhost:3001/api/*${NC}"
    echo -e "${GREEN}✅ Health: http://localhost:3001/health${NC}"
    
    echo ""
    echo -e "${YELLOW}📊 Available Features:${NC}"
    echo "• Live NIFTY 50 Dashboard"
    echo "• Interactive Stock Charts"
    echo "• Real-time Market Data"
    echo "• Technical Analysis Tools"
    echo "• Portfolio Management"
    
    echo ""
    echo -e "${GREEN}🎉 Your Stock Analysis Platform is now running on port 3001!${NC}"
    echo ""
    
    # Try to open browser
    if command -v xdg-open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        xdg-open http://localhost:3001 2>/dev/null &
    elif command -v open > /dev/null; then
        echo -e "${BLUE}Opening browser...${NC}"
        open http://localhost:3001 2>/dev/null &
    fi
    
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Keep all services running
    trap "echo 'Stopping all services...'; kill $FRONTEND_PID $BACKEND_PID $PROXY_PID 2>/dev/null; exit" INT
    
    # Monitor services
    while true; do
        sleep 10
        if ! kill -0 $PROXY_PID 2>/dev/null; then
            echo -e "${RED}❌ Proxy server stopped unexpectedly${NC}"
            break
        fi
    done
    
else
    echo -e "${RED}❌ Setup failed${NC}"
    kill $FRONTEND_PID $BACKEND_PID $PROXY_PID 2>/dev/null
    exit 1
fi
