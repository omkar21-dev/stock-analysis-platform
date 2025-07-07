#!/bin/bash

echo "🚀 Stock Analysis Platform - Status Check"
echo "=========================================="
echo ""

echo "📊 Container Status:"
docker-compose ps
echo ""

echo "🌐 Application Access Points:"
echo "• Frontend (React App): http://localhost:3000"
echo "• Backend API: http://localhost:3001"
echo "• Nginx Proxy: http://localhost:80"
echo "• Database: localhost:5432"
echo "• Redis Cache: localhost:6379"
echo ""

echo "🔍 Health Checks:"
echo -n "Frontend: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "Backend: "
if curl -s http://localhost:3001 | grep -q "message"; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "Nginx Proxy: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200"; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo ""
echo "📝 Quick Commands:"
echo "• View logs: docker-compose logs [service-name]"
echo "• Stop all: docker-compose down"
echo "• Start all: docker-compose up -d"
echo "• Restart service: docker-compose restart [service-name]"
echo ""
echo "🎯 Main Application URL: http://localhost:3000"
echo "🎯 Alternative URL (via Nginx): http://localhost:80"
