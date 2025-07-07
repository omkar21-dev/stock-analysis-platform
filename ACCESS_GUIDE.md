# 🌐 Stock Analysis Platform - Access Guide

## 🎯 Your Website is Available At:

### ✅ **WORKING NOW - Domain Access (Recommended)**
```
🌐 Frontend:        http://stock-analysis.local
📊 Backend API:     http://stock-analysis.local/api
📚 API Docs:        http://stock-analysis.local/api/docs
🧪 API Explorer:    http://stock-analysis.local/api/docs/explorer
💊 Health Check:    http://stock-analysis.local/api/health
```

**Status**: ✅ **READY TO USE** (hosts entry added automatically)

---

### 🔧 **Alternative Access Methods:**

#### **1. Port Forward (Always Works)**
```bash
# Frontend Access
kubectl port-forward svc/frontend-service -n stock-analysis 3000:80
# Then visit: http://localhost:3000

# Backend API Access  
kubectl port-forward svc/backend-service -n stock-analysis 3001:3001
# Then visit: http://localhost:3001
```

#### **2. Direct Minikube IP**
```bash
# Frontend
curl http://192.168.49.2

# Backend API (with Host header)
curl -H 'Host: stock-analysis.local' http://192.168.49.2/api
```

---

## 🚀 **Quick Start - Open Your Website:**

### **Option 1: Open in Browser (Recommended)**
```bash
# Open your Stock Analysis Platform
open http://stock-analysis.local
# or
xdg-open http://stock-analysis.local
```

### **Option 2: Test with curl**
```bash
# Test frontend
curl http://stock-analysis.local

# Test backend API
curl http://stock-analysis.local/api

# Test health
curl http://stock-analysis.local/health
```

---

## 📊 **What You'll See:**

### **🎨 Frontend Features:**
- **Live Stock Quotes** - Real-time NSE data
- **Technical Analysis** - Charts and indicators  
- **Stock Search** - Find any NSE stock
- **Market Overview** - Top gainers/losers
- **User Dashboard** - Personal analysis tracking
- **Community Features** - Share analysis with others

### **🔧 Backend API Features:**
- **REST API** - Complete stock data API
- **Technical Indicators** - SMA, EMA, RSI, MACD, Bollinger Bands
- **Market Sentiment** - AI-powered sentiment analysis
- **Portfolio Analysis** - Track your investments
- **Real-time Data** - Live NSE integration
- **Interactive Docs** - Built-in API explorer

---

## 🧪 **Test Your Platform:**

### **Frontend Test:**
```bash
curl -s http://stock-analysis.local | grep -i "stock\|analysis" | head -3
```

### **Backend API Test:**
```bash
# Get API info
curl -s http://stock-analysis.local/api | jq .

# Get health status
curl -s http://stock-analysis.local/health | jq .

# Test stock quote (example)
curl -s http://stock-analysis.local/api/stocks/quote/RELIANCE | jq .
```

---

## 🎯 **Platform Status:**

| Component | Status | URL |
|-----------|--------|-----|
| **Frontend** | ✅ Running | http://stock-analysis.local |
| **Backend API** | ✅ Running | http://stock-analysis.local/api |
| **Database** | ✅ Running | Internal |
| **Cache** | ✅ Running | Internal |
| **Ingress** | ✅ Active | stock-analysis.local |

---

## 🔍 **Troubleshooting:**

### **If website doesn't load:**
```bash
# Check pods
kubectl get pods -n stock-analysis

# Check services  
kubectl get svc -n stock-analysis

# Check ingress
kubectl get ingress -n stock-analysis

# Test connectivity
ping stock-analysis.local
```

### **Alternative access if domain fails:**
```bash
# Use port forwarding
kubectl port-forward svc/frontend-service -n stock-analysis 3000:80 &
open http://localhost:3000
```

---

## 🎉 **Your Stock Analysis Platform is LIVE!**

**Main Website**: http://stock-analysis.local

**Features Available:**
- ✅ Live NSE Stock Data
- ✅ Technical Analysis Tools  
- ✅ Portfolio Management
- ✅ Market Sentiment Analysis
- ✅ Interactive API Documentation
- ✅ Real-time Health Monitoring
- ✅ Auto-scaling & High Availability
- ✅ GitOps Deployment with ArgoCD

**Ready for Professional Stock Trading Analysis! 📈🚀**
