# Deployment Guide

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Terraform** >= 1.0
4. **Docker** and **Docker Compose**
5. **Node.js** >= 18
6. **Git** for version control

## Quick Start

### 1. Clone and Setup Repository

```bash
git clone <your-repo-url>
cd stock-analysis-platform
```

### 2. Environment Configuration

Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment  
cp frontend/.env.example frontend/.env
```

Update the environment variables with your values.

### 3. Local Development

```bash
# Start all services locally
docker-compose up -d

# Or start individual services
docker-compose up postgres redis
npm run dev --prefix backend
npm start --prefix frontend
```

### 4. AWS Deployment

```bash
# Set required environment variables
export AWS_REGION=us-east-1
export DB_PASSWORD=your-secure-password

# Deploy to AWS
./scripts/deploy.sh prod
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │  Application    │    │   Database      │
│   (CDN)         │───▶│  Load Balancer  │───▶│   (RDS)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Auto Scaling  │
                       │   Group (EC2)   │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Docker        │
                       │   Containers    │
                       └─────────────────┘
```

## Infrastructure Components

### Networking
- **VPC** with public and private subnets
- **Internet Gateway** for public access
- **NAT Gateway** for private subnet internet access
- **Security Groups** with least privilege access

### Compute
- **Application Load Balancer** for traffic distribution
- **Auto Scaling Group** with EC2 instances
- **Launch Template** with user data for container deployment

### Database
- **RDS PostgreSQL** in private subnets
- **Multi-AZ** deployment for high availability
- **Automated backups** and point-in-time recovery

### Storage
- **S3 Buckets** for static assets and backups
- **ECR** for Docker image storage

## CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Code Quality Checks**
   - ESLint and Prettier
   - Security scanning with Trivy
   - Dependency vulnerability checks

2. **Testing**
   - Unit tests for backend and frontend
   - Integration tests
   - Code coverage reporting

3. **Build and Deploy**
   - Docker image building
   - Push to ECR
   - Infrastructure updates with Terraform
   - Zero-downtime deployment

## Monitoring and Logging

### Metrics Collection
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **AlertManager** for alerting

### Log Management
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Filebeat** for log shipping
- **CloudWatch** for AWS service logs

### Key Metrics Monitored
- Application response times
- Error rates
- Database performance
- Infrastructure utilization
- Business metrics (user registrations, posts created)

## Security Best Practices

1. **Network Security**
   - Private subnets for application and database
   - Security groups with minimal required access
   - WAF for application protection

2. **Data Protection**
   - Encryption at rest and in transit
   - Secrets management with AWS Secrets Manager
   - Regular security updates

3. **Access Control**
   - IAM roles with least privilege
   - Multi-factor authentication
   - Regular access reviews

## Scaling Considerations

### Horizontal Scaling
- Auto Scaling Groups automatically adjust capacity
- Load balancer distributes traffic evenly
- Database read replicas for read-heavy workloads

### Vertical Scaling
- Instance types can be upgraded
- Database instance classes can be modified
- Storage can be expanded without downtime

## Disaster Recovery

1. **Backup Strategy**
   - Automated RDS backups
   - S3 cross-region replication
   - Infrastructure code in version control

2. **Recovery Procedures**
   - Point-in-time database recovery
   - Infrastructure recreation with Terraform
   - Application deployment with CI/CD pipeline

## Cost Optimization

1. **Resource Optimization**
   - Right-sizing instances based on metrics
   - Scheduled scaling for predictable workloads
   - Reserved instances for steady-state workloads

2. **Storage Optimization**
   - S3 lifecycle policies
   - Database storage optimization
   - CloudFront for content delivery

## Troubleshooting

### Common Issues

1. **Application Not Starting**
   ```bash
   # Check container logs
   docker logs <container-name>
   
   # Check EC2 instance logs
   aws logs get-log-events --log-group-name /aws/ec2/stock-analysis
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connectivity
   psql -h <rds-endpoint> -U postgres -d stockanalysis
   ```

3. **Load Balancer Health Checks Failing**
   ```bash
   # Check target group health
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   ```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Check AWS CloudWatch metrics
4. Create an issue in the GitHub repository
