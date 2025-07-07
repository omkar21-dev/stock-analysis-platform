#!/bin/bash

echo "🚀 Stock Analysis Platform - Update & Deploy Script"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="omkarmokal21"
BACKEND_IMAGE="stock-analysis-backend"
FRONTEND_IMAGE="stock-analysis-frontend"
VERSION="v$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "• Docker Username: $DOCKER_USERNAME"
echo "• Backend Image: $BACKEND_IMAGE"
echo "• Frontend Image: $FRONTEND_IMAGE"
echo "• Version Tag: $VERSION"
echo ""

# Step 1: Build Backend Image
echo -e "${YELLOW}🔨 Step 1: Building Backend Docker Image...${NC}"
cd backend
if docker build -t $DOCKER_USERNAME/$BACKEND_IMAGE:latest -t $DOCKER_USERNAME/$BACKEND_IMAGE:$VERSION .; then
    echo -e "${GREEN}✅ Backend image built successfully${NC}"
else
    echo -e "${RED}❌ Backend image build failed${NC}"
    exit 1
fi
cd ..

# Step 2: Build Frontend Image
echo -e "${YELLOW}🔨 Step 2: Building Frontend Docker Image...${NC}"
cd frontend
if docker build -t $DOCKER_USERNAME/$FRONTEND_IMAGE:latest -t $DOCKER_USERNAME/$FRONTEND_IMAGE:$VERSION .; then
    echo -e "${GREEN}✅ Frontend image built successfully${NC}"
else
    echo -e "${RED}❌ Frontend image build failed${NC}"
    exit 1
fi
cd ..

# Step 3: Push Images to Docker Hub
echo -e "${YELLOW}📤 Step 3: Pushing Images to Docker Hub...${NC}"

echo "Pushing backend image..."
if docker push $DOCKER_USERNAME/$BACKEND_IMAGE:latest && docker push $DOCKER_USERNAME/$BACKEND_IMAGE:$VERSION; then
    echo -e "${GREEN}✅ Backend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Backend image push failed${NC}"
    exit 1
fi

echo "Pushing frontend image..."
if docker push $DOCKER_USERNAME/$FRONTEND_IMAGE:latest && docker push $DOCKER_USERNAME/$FRONTEND_IMAGE:$VERSION; then
    echo -e "${GREEN}✅ Frontend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Frontend image push failed${NC}"
    exit 1
fi

# Step 4: Restart Kubernetes Deployments
echo -e "${YELLOW}🔄 Step 4: Restarting Kubernetes Deployments...${NC}"

echo "Restarting backend deployment..."
if kubectl rollout restart deployment/backend -n stock-analysis; then
    echo -e "${GREEN}✅ Backend deployment restarted${NC}"
else
    echo -e "${RED}❌ Backend deployment restart failed${NC}"
fi

echo "Restarting frontend deployment..."
if kubectl rollout restart deployment/frontend -n stock-analysis; then
    echo -e "${GREEN}✅ Frontend deployment restarted${NC}"
else
    echo -e "${RED}❌ Frontend deployment restart failed${NC}"
fi

# Step 5: Wait for Rollout to Complete
echo -e "${YELLOW}⏳ Step 5: Waiting for Rollout to Complete...${NC}"

echo "Waiting for backend rollout..."
kubectl rollout status deployment/backend -n stock-analysis --timeout=300s

echo "Waiting for frontend rollout..."
kubectl rollout status deployment/frontend -n stock-analysis --timeout=300s

# Step 6: Verify Deployment
echo -e "${YELLOW}🔍 Step 6: Verifying Deployment...${NC}"

echo "Checking pod status..."
kubectl get pods -n stock-analysis

echo ""
echo "Checking service status..."
kubectl get svc -n stock-analysis

# Step 7: Test New Endpoints
echo -e "${YELLOW}🧪 Step 7: Testing New API Endpoints...${NC}"

# Port forward for testing
kubectl port-forward svc/backend-service -n stock-analysis 3001:3001 > /dev/null 2>&1 &
PF_PID=$!
sleep 5

echo "Testing enhanced health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy\|OK"; then
    echo -e "${GREEN}✅ Health endpoint working${NC}"
else
    echo -e "${RED}❌ Health endpoint failed${NC}"
fi

echo "Testing API info endpoint..."
API_RESPONSE=$(curl -s http://localhost:3001/api)
if echo "$API_RESPONSE" | grep -q "Stock Analysis Platform API\|endpoints"; then
    echo -e "${GREEN}✅ API info endpoint working${NC}"
else
    echo -e "${RED}❌ API info endpoint failed${NC}"
fi

echo "Testing documentation endpoint..."
DOCS_RESPONSE=$(curl -s http://localhost:3001/api/docs)
if echo "$DOCS_RESPONSE" | grep -q "documentation\|endpoints"; then
    echo -e "${GREEN}✅ Documentation endpoint working${NC}"
else
    echo -e "${RED}❌ Documentation endpoint failed${NC}"
fi

# Clean up port forward
kill $PF_PID 2>/dev/null

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}📊 Access Your Enhanced Platform:${NC}"
echo "• Frontend: http://stock-analysis.local"
echo "• Backend API: http://stock-analysis.local/api"
echo "• Health Check: http://stock-analysis.local/api/health"
echo "• API Documentation: http://stock-analysis.local/api/docs"
echo "• API Explorer: http://stock-analysis.local/api/docs/explorer"
echo ""
echo -e "${BLUE}🔧 New Features Available:${NC}"
echo "• Technical Analysis API"
echo "• Market Sentiment Analysis"
echo "• Portfolio Performance Analysis"
echo "• Enhanced Health Monitoring"
echo "• Interactive API Documentation"
echo "• Performance Statistics"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "• Check pods: kubectl get pods -n stock-analysis"
echo "• View logs: kubectl logs -f deployment/backend -n stock-analysis"
echo "• Port forward: kubectl port-forward svc/backend-service -n stock-analysis 3001:3001"
echo ""
echo -e "${GREEN}✅ Your Stock Analysis Platform is now enhanced and ready!${NC}"
