#!/bin/bash

echo "🚀 Deploying Stock Analysis Platform to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your connection."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Apply all manifests
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

echo "🔐 Creating secrets..."
kubectl apply -f secrets.yaml

echo "💾 Creating persistent volumes..."
kubectl apply -f persistent-volume.yaml

echo "🗄️ Deploying PostgreSQL..."
kubectl apply -f postgres-deployment.yaml

echo "🔄 Deploying Redis..."
kubectl apply -f redis-deployment.yaml

echo "⚙️ Deploying Backend..."
kubectl apply -f backend-deployment.yaml

echo "🌐 Deploying Frontend..."
kubectl apply -f frontend-deployment.yaml

echo "🌍 Creating Ingress..."
kubectl apply -f ingress.yaml

echo "📈 Setting up Auto-scaling..."
kubectl apply -f hpa.yaml

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n stock-analysis
kubectl wait --for=condition=available --timeout=300s deployment/redis -n stock-analysis
kubectl wait --for=condition=available --timeout=300s deployment/backend -n stock-analysis
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n stock-analysis

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Checking deployment status..."
kubectl get pods -n stock-analysis
echo ""
echo "🌐 Services:"
kubectl get services -n stock-analysis
echo ""
echo "🔗 Access your application:"
echo "Frontend: http://$(minikube ip):$(kubectl get service frontend-service -n stock-analysis -o jsonpath='{.spec.ports[0].nodePort}')"
echo "Backend: http://$(minikube ip):$(kubectl get service backend-service -n stock-analysis -o jsonpath='{.spec.ports[0].nodePort}')"
echo ""
echo "📝 To monitor your application:"
echo "kubectl get pods -n stock-analysis -w"
echo "kubectl logs -f deployment/backend -n stock-analysis"
