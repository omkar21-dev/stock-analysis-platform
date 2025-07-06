#!/bin/bash

echo "🚀 Uploading Stock Analysis Platform to GitHub with Personal Access Token..."
echo ""
echo "⚠️  Make sure you have:"
echo "1. Created the GitHub repository: stock-analysis-platform"
echo "2. Generated a Personal Access Token with 'repo' permissions"
echo ""

# Prompt for token
read -s -p "Enter your GitHub Personal Access Token: " TOKEN
echo ""

# Set the remote repository URL with token
REPO_URL="https://${TOKEN}@github.com/omkar21-dev/stock-analysis-platform.git"

# Remove existing remote if it exists
git remote remove origin 2>/dev/null || true

# Add remote origin with token
git remote add origin $REPO_URL

# Rename master to main (GitHub's default)
git branch -M main

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push -u origin main; then
    echo ""
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
else
    echo ""
    echo "❌ Upload failed. Please check:"
    echo "1. Repository exists on GitHub"
    echo "2. Personal Access Token is correct"
    echo "3. Token has 'repo' permissions"
fi
