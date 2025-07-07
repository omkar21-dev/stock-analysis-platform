# 🔰 Beginner's Guide - Stock Analysis Platform

This guide is for complete beginners who want to run the Stock Analysis Platform on their computer.

## 🎯 What You'll Get

A complete stock trading analysis website with:
- 📈 Live NSE (Indian Stock Market) data
- 💹 Technical analysis tools
- 👥 Community features
- 📱 Mobile-friendly design
- 🔐 User authentication

## 📋 Prerequisites (What You Need)

1. **Docker** installed on your computer
2. **Git** installed on your computer
3. **Internet connection**

## 🚀 Super Easy Setup (Just 3 Steps!)

### **Step 1: Download the Project**
```bash
git clone https://github.com/omkar21-dev/stock-analysis-platform.git
cd stock-analysis-platform
```

### **Step 2: Make Scripts Executable**
```bash
chmod +x quick-start.sh
chmod +x check-status.sh
```

### **Step 3: Run the Magic Script**
```bash
./quick-start.sh
```

**That's it! Your website will be running! 🎉**

## 🌐 How to Access Your Website

After running the setup, open your web browser and go to:
- **http://localhost:3000** (Main website)
- **http://localhost:80** (Alternative URL)

## 📱 What You Can Do

1. **Register/Login** - Create your account
2. **View Live Stock Data** - See real NSE stock prices
3. **Post Analysis** - Share your stock predictions
4. **Read Community Posts** - Learn from others
5. **Comment & Discuss** - Engage with the community

## 🔧 Basic Commands (Copy & Paste)

### **Check if Everything is Working**
```bash
./check-status.sh
```

### **Stop the Website**
```bash
docker-compose down
```

### **Start the Website Again**
```bash
docker-compose up -d
```

### **See What's Happening (Logs)**
```bash
docker-compose logs frontend
docker-compose logs backend
```

### **Restart Everything**
```bash
docker-compose restart
```

## 🆘 If Something Goes Wrong

### **Problem: Port Already in Use**
**Solution:**
```bash
docker-compose down
./quick-start.sh
```

### **Problem: Website Not Loading**
**Solution:**
```bash
docker-compose restart
./check-status.sh
```

### **Problem: Want to Start Fresh**
**Solution:**
```bash
docker-compose down -v
./quick-start.sh
```

## 📊 Understanding the Status

When you run `./check-status.sh`, you'll see:
- ✅ = Working perfectly
- ❌ = Something is wrong

## 🔍 File Structure (What Each File Does)

```
stock-analysis-platform/
├── quick-start.sh          # Magic setup script
├── check-status.sh         # Check if everything works
├── docker-compose.yml      # Configuration file
├── COMMANDS.md            # All available commands
├── BEGINNER_GUIDE.md      # This file
├── .env                   # Secret settings
└── nginx/                 # Web server settings
```

## 🎓 Learning More

- **COMMANDS.md** - All available commands
- **README.md** - Technical details
- **Docker Hub** - Where the app images are stored

## 💡 Tips for Beginners

1. **Always run commands from the project folder**
2. **Use `./check-status.sh` to see if everything is working**
3. **If something breaks, try `docker-compose restart`**
4. **Keep your computer connected to internet**
5. **Don't close the terminal while the website is running**

## 🎉 Success Indicators

You know everything is working when:
1. `./check-status.sh` shows all ✅
2. You can open http://localhost:3000 in your browser
3. You see the Stock Analysis Platform homepage
4. You can register and login

## 📞 Quick Help

**Website not loading?**
```bash
./check-status.sh
```

**Want to restart everything?**
```bash
docker-compose down && ./quick-start.sh
```

**Want to stop everything?**
```bash
docker-compose down
```

**Want to start again?**
```bash
./quick-start.sh
```

---

## 🎯 Summary

1. Run `./quick-start.sh` once
2. Open http://localhost:3000
3. Enjoy your stock analysis platform!

**That's it! You're now running a professional stock analysis platform! 🚀**
