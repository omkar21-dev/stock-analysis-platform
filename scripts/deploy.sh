#!/bin/bash

# Stock Analysis Platform Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="stock-analysis-platform"

echo -e "${GREEN}🚀 Starting deployment for ${PROJECT_NAME} - ${ENVIRONMENT} environment${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
for cmd in aws terraform docker docker-compose; do
    if ! command_exists $cmd; then
        echo -e "${RED}❌ $cmd is not installed${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All prerequisites met${NC}"

# AWS CLI configuration check
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured properly${NC}"
    exit 1
fi

# Create S3 bucket for Terraform state if it doesn't exist
BUCKET_NAME="${PROJECT_NAME}-terraform-state-${ENVIRONMENT}"
if ! aws s3 ls "s3://${BUCKET_NAME}" 2>/dev/null; then
    echo -e "${YELLOW}📦 Creating S3 bucket for Terraform state...${NC}"
    aws s3 mb "s3://${BUCKET_NAME}" --region $AWS_REGION
    aws s3api put-bucket-versioning \
        --bucket $BUCKET_NAME \
        --versioning-configuration Status=Enabled
fi

# Create ECR repositories if they don't exist
echo -e "${YELLOW}🐳 Setting up ECR repositories...${NC}"
for repo in "${PROJECT_NAME}-backend" "${PROJECT_NAME}-frontend"; do
    if ! aws ecr describe-repositories --repository-names $repo >/dev/null 2>&1; then
        aws ecr create-repository --repository-name $repo --region $AWS_REGION
        echo -e "${GREEN}✅ Created ECR repository: $repo${NC}"
    fi
done

# Generate key pair if it doesn't exist
KEY_PAIR_NAME="${PROJECT_NAME}-${ENVIRONMENT}-key"
if ! aws ec2 describe-key-pairs --key-names $KEY_PAIR_NAME >/dev/null 2>&1; then
    echo -e "${YELLOW}🔑 Creating EC2 key pair...${NC}"
    aws ec2 create-key-pair --key-name $KEY_PAIR_NAME \
        --query 'KeyMaterial' --output text > ~/.ssh/${KEY_PAIR_NAME}.pem
    chmod 400 ~/.ssh/${KEY_PAIR_NAME}.pem
    echo -e "${GREEN}✅ Key pair created: ~/.ssh/${KEY_PAIR_NAME}.pem${NC}"
fi

# Deploy infrastructure with Terraform
echo -e "${YELLOW}🏗️  Deploying infrastructure...${NC}"
cd infrastructure

# Initialize Terraform
terraform init \
    -backend-config="bucket=${BUCKET_NAME}" \
    -backend-config="key=${ENVIRONMENT}/terraform.tfstate" \
    -backend-config="region=${AWS_REGION}"

# Plan and apply
terraform plan \
    -var="environment=${ENVIRONMENT}" \
    -var="key_pair_name=${KEY_PAIR_NAME}" \
    -var="db_password=${DB_PASSWORD:-$(openssl rand -base64 32)}" \
    -out=tfplan

terraform apply tfplan

# Get outputs
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

cd ..

# Build and push Docker images
echo -e "${YELLOW}🐳 Building and pushing Docker images...${NC}"
ECR_REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push backend
docker build -t $ECR_REGISTRY/${PROJECT_NAME}-backend:latest ./backend
docker push $ECR_REGISTRY/${PROJECT_NAME}-backend:latest

# Build and push frontend
docker build -t $ECR_REGISTRY/${PROJECT_NAME}-frontend:latest ./frontend
docker push $ECR_REGISTRY/${PROJECT_NAME}-frontend:latest

# Deploy application to EC2 instances
echo -e "${YELLOW}🚀 Deploying application...${NC}"
./scripts/update-instances.sh $ENVIRONMENT

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application URL: http://${ALB_DNS}${NC}"
echo -e "${GREEN}📊 Database Endpoint: ${RDS_ENDPOINT}${NC}"

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 30
if curl -f "http://${ALB_DNS}/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
