#!/bin/bash

# 🚀 Stock Analysis Platform - Quick Start Script
# This script will set up and start your entire application

echo "🚀 Starting Stock Analysis Platform Setup..."
echo "============================================="

# Step 1: Login to Docker Hub
echo "📦 Step 1: Logging into Docker Hub..."
echo "Dockerom21" | docker login --username omkarmokal21 --password-stdin

# Step 2: Pull latest images
echo "⬇️  Step 2: Pulling latest Docker images..."
docker-compose pull

# Step 3: Stop any existing containers
echo "🛑 Step 3: Stopping existing containers..."
docker-compose down

# Step 4: Start all services
echo "🚀 Step 4: Starting all services..."
docker-compose up -d

# Step 5: Wait for services to start
echo "⏳ Step 5: Waiting for services to initialize..."
sleep 30

# Step 6: Check status
echo "✅ Step 6: Checking application status..."
./check-status.sh

echo ""
echo "🎉 Setup Complete!"
echo "==================="
echo "Your Stock Analysis Platform is now running!"
echo ""
echo "🌐 Access your application at:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend:  http://localhost:3001"
echo "   • Proxy:    http://localhost:80"
echo ""
echo "📋 Useful commands:"
echo "   • Check status: ./check-status.sh"
echo "   • View logs: docker-compose logs [service-name]"
echo "   • Stop all: docker-compose down"
echo "   • Restart: docker-compose restart"
echo ""
echo "📖 For more commands, check COMMANDS.md file"
