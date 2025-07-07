# 🌐 Stock Analysis Platform - Website Access Guide

## 🚨 **If stock-analysis.local doesn't work in browser:**

### **✅ Method 1: Direct IP Access (Works Immediately)**
```
http://192.168.49.2
```
**Note**: Add this header in browser developer tools: `Host: stock-analysis.local`

Or use this curl command to test:
```bash
curl -H "Host: stock-analysis.local" http://192.168.49.2
```

### **✅ Method 2: Port Forward (Guaranteed to Work)**
```bash
# Run this command in terminal:
kubectl port-forward svc/frontend-service -n stock-analysis 8080:80

# Then visit in browser:
http://localhost:8080
```

### **✅ Method 3: Fix Domain Access**

#### **For Linux/Mac:**
```bash
# Check if entry exists
grep "stock-analysis.local" /etc/hosts

# If not found, add it:
echo "192.168.49.2 stock-analysis.local" | sudo tee -a /etc/hosts

# Then visit:
http://stock-analysis.local
```

#### **For Windows:**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add line: `192.168.49.2 stock-analysis.local`
4. Save file
5. Visit: http://stock-analysis.local

### **✅ Method 4: NodePort Access (Alternative)**
```bash
# Get minikube IP
minikube ip

# Visit in browser:
http://192.168.49.2:32187
```

---

## 🎯 **Quick Access Commands:**

### **Start Port Forward (Easiest Method):**
```bash
cd /home/omkar/stock-analysis-platform
kubectl port-forward svc/frontend-service -n stock-analysis 8080:80
```
**Then visit**: http://localhost:8080

### **Test All Access Methods:**
```bash
# Test domain access
curl -s http://stock-analysis.local | grep -i "stock analysis"

# Test direct IP
curl -s -H "Host: stock-analysis.local" http://192.168.49.2 | grep -i "stock analysis"

# Test port forward
curl -s http://localhost:8080 | grep -i "stock analysis"
```

---

## 🔧 **Troubleshooting:**

### **If nothing works:**
```bash
# Check if minikube is running
minikube status

# Check if pods are running
kubectl get pods -n stock-analysis

# Check if services are available
kubectl get svc -n stock-analysis

# Restart if needed
minikube start
```

### **Browser Issues:**
- Clear browser cache
- Try incognito/private mode
- Try different browser
- Disable browser extensions
- Check if antivirus is blocking

---

## 🎉 **Your Website Features:**

Once you access the website, you'll see:

### **🏠 Enhanced Home Page:**
- Live NIFTY 50 index
- Top gainers/losers
- Professional platform features

### **📊 NIFTY 50 Dashboard:**
- Click "NIFTY 50" in navbar
- All 50 stocks with live prices
- Interactive charts
- Search functionality

### **📈 Live Stock Charts:**
- Click any stock to view chart
- Multiple timeframes (1D, 1W, 1M)
- Real-time updates
- Professional trading interface

---

## 🚀 **Recommended Access Method:**

**Use Port Forward for guaranteed access:**

1. Open terminal
2. Run: `kubectl port-forward svc/frontend-service -n stock-analysis 8080:80`
3. Open browser to: **http://localhost:8080**
4. Enjoy your enhanced Stock Analysis Platform!

---

## 📱 **Mobile Access:**

If you want to access from mobile device:
1. Get your computer's IP: `hostname -I`
2. Use port forward method
3. Visit: `http://YOUR_COMPUTER_IP:8080`

---

**Your Stock Analysis Platform with Live NSE Data & Charts is ready! 🎉📈**
