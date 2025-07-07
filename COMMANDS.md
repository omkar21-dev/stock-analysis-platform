# 🚀 Stock Analysis Platform - Command Reference

This file contains all the essential commands to manage your Stock Analysis Platform with Docker Hub integration.

## 📋 Table of Contents
- [Quick Start Commands](#quick-start-commands)
- [Docker Management](#docker-management)
- [Development Commands](#development-commands)
- [Monitoring & Debugging](#monitoring--debugging)
- [GitHub Management](#github-management)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start Commands

### **Start the Application**
```bash
# Navigate to project directory
cd /home/omkar/stock-analysis-platform

# Start all services
docker-compose up -d

# Check status
./check-status.sh
```

### **Access Your Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Nginx Proxy**: http://localhost:80
- **Database**: localhost:5432
- **Redis**: localhost:6379

---

## 🐳 Docker Management

### **Basic Docker Commands**
```bash
# Login to Docker Hub
echo "Dockerom21" | docker login --username omkarmokal21 --password-stdin

# Pull latest images
docker-compose pull

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# View running containers
docker-compose ps

# Remove all containers and volumes
docker-compose down -v
```

### **Individual Service Management**
```bash
# Start specific service
docker-compose up -d frontend
docker-compose up -d backend
docker-compose up -d postgres
docker-compose up -d redis
docker-compose up -d nginx

# Restart specific service
docker-compose restart frontend
docker-compose restart backend
docker-compose restart postgres
docker-compose restart redis
docker-compose restart nginx

# Stop specific service
docker-compose stop frontend
docker-compose stop backend
```

### **Image Management**
```bash
# Pull specific images
docker pull omkarmokal21/stock-analysis-frontend:latest
docker pull omkarmokal21/stock-analysis-backend:latest

# List all images
docker images

# Remove unused images
docker image prune -f

# Remove all unused containers, networks, images
docker system prune -a
```

---

## 💻 Development Commands

### **Environment Setup**
```bash
# Create environment file
cat > .env << 'EOF'
DB_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key-for-development
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:3001/api
EOF

# Make scripts executable
chmod +x check-status.sh
chmod +x upload-to-github.sh
```

### **Configuration Updates**
```bash
# Edit docker-compose file
nano docker-compose.yml

# Edit nginx configuration
nano nginx/nginx.conf

# Edit environment variables
nano .env
```

---

## 📊 Monitoring & Debugging

### **Status Checks**
```bash
# Run status check script
./check-status.sh

# Check container health
docker-compose ps

# Check system resources
docker stats

# Check network connectivity
docker network ls
docker network inspect stock-analysis-platform_stock-network
```

### **Log Management**
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f frontend
docker-compose logs -f backend

# View last 50 lines of logs
docker-compose logs --tail=50 frontend

# View logs with timestamps
docker-compose logs -t backend
```

### **Container Inspection**
```bash
# Execute commands inside containers
docker exec -it stock-analysis-frontend /bin/sh
docker exec -it stock-analysis-api /bin/bash
docker exec -it stock-analysis-db psql -U postgres -d stock_analysis
docker exec -it stock-analysis-redis redis-cli

# Check container processes
docker exec stock-analysis-api ps aux
docker exec stock-analysis-frontend ps aux

# Check container file system
docker exec stock-analysis-api ls -la /app
docker exec stock-analysis-frontend ls -la /usr/share/nginx/html
```

---

## 🔧 GitHub Management

### **Basic Git Commands**
```bash
# Check git status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Check git log
git log --oneline -10
```

### **Repository Setup**
```bash
# Set user configuration
git config --global user.name "omkar21-dev"
git config --global user.email "omkarmokal0121@gmail.com"

# Add remote repository
git remote add origin https://github.com/omkar21-dev/stock-analysis-platform.git

# Check remote repositories
git remote -v

# Update remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/omkar21-dev/stock-analysis-platform.git
```

### **Branch Management**
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main
git checkout feature/new-feature

# List branches
git branch -a

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

---

## 🗄️ Database Management

### **PostgreSQL Commands**
```bash
# Connect to database
docker exec -it stock-analysis-db psql -U postgres -d stock_analysis

# Backup database
docker exec stock-analysis-db pg_dump -U postgres stock_analysis > backup.sql

# Restore database
docker exec -i stock-analysis-db psql -U postgres stock_analysis < backup.sql

# Check database size
docker exec stock-analysis-db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('stock_analysis'));"
```

### **Redis Commands**
```bash
# Connect to Redis
docker exec -it stock-analysis-redis redis-cli

# Check Redis info
docker exec stock-analysis-redis redis-cli info

# Flush all Redis data
docker exec stock-analysis-redis redis-cli flushall

# Check Redis memory usage
docker exec stock-analysis-redis redis-cli info memory
```

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

#### **Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80

# Kill process using port
sudo kill -9 $(sudo lsof -t -i:3000)
sudo kill -9 $(sudo lsof -t -i:3001)
sudo kill -9 $(sudo lsof -t -i:80)
```

#### **Container Won't Start**
```bash
# Check container logs
docker-compose logs [service-name]

# Remove and recreate containers
docker-compose down
docker-compose up -d --force-recreate

# Rebuild containers
docker-compose up -d --build
```

#### **Database Connection Issues**
```bash
# Check database container
docker-compose logs postgres

# Reset database
docker-compose down
docker volume rm stock-analysis-platform_postgres_data
docker-compose up -d
```

#### **Frontend Not Loading**
```bash
# Check frontend logs
docker-compose logs frontend

# Check nginx configuration
docker exec stock-analysis-nginx nginx -t

# Restart frontend and nginx
docker-compose restart frontend nginx
```

### **Performance Optimization**
```bash
# Clean up Docker system
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df

# Optimize images
docker image prune -a
```

### **Security Commands**
```bash
# Check for security vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image omkarmokal21/stock-analysis-frontend:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image omkarmokal21/stock-analysis-backend:latest

# Update all images to latest
docker-compose pull
docker-compose up -d
```

---

## 🎯 Quick Reference

### **One-Line Commands**
```bash
# Complete restart
docker-compose down && docker-compose up -d && ./check-status.sh

# Update and restart
docker-compose pull && docker-compose up -d && ./check-status.sh

# Clean restart
docker-compose down -v && docker-compose up -d && ./check-status.sh

# Push to GitHub
git add . && git commit -m "Update" && git push origin main

# Check all services
curl -s http://localhost:3000 && curl -s http://localhost:3001 && curl -s http://localhost:80
```

### **Emergency Commands**
```bash
# Stop everything immediately
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Reset everything
docker system prune -a --volumes

# Start fresh
docker-compose up -d --force-recreate
```

---

## 📞 Support

If you encounter any issues:

1. **Check Status**: Run `./check-status.sh`
2. **Check Logs**: Run `docker-compose logs [service-name]`
3. **Restart Service**: Run `docker-compose restart [service-name]`
4. **Full Restart**: Run `docker-compose down && docker-compose up -d`

---

## 📝 Notes

- Always run commands from the project directory: `/home/omkar/stock-analysis-platform`
- Keep your Docker Hub credentials secure
- Regularly backup your database
- Monitor system resources when running all services
- Use `./check-status.sh` to verify everything is working

---

**🎉 Your Stock Analysis Platform is ready to use!**

**Main URL**: http://localhost:3000
**API URL**: http://localhost:3001
**Proxy URL**: http://localhost:80
