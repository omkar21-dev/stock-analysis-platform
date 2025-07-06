#!/bin/bash

# Script to upload the project to GitHub
# Run this after creating the repository on GitHub

echo "🚀 Uploading Stock Analysis Platform to GitHub..."

# Set the remote repository URL
REPO_URL="https://github.com/omkar21-dev/stock-analysis-platform.git"

# Add remote origin
git remote add origin $REPO_URL

# Rename master to main (GitHub's default)
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Successfully uploaded to GitHub!"
echo "🌐 Repository URL: https://github.com/omkar21-dev/stock-analysis-platform"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Add repository secrets for CI/CD:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY" 
echo "   - DB_PASSWORD"
echo "   - JWT_SECRET"
echo "3. Run ./scripts/deploy.sh to deploy to AWS"
