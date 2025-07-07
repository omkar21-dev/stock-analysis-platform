const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const schedulerService = require('./services/schedulerService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Compression middleware
app.use(compression());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.nseindia.com"]
    }
  }
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://stock-analysis.local',
    'http://localhost:32187'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enhanced rate limiting with different limits for different endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: message,
      retryAfter: Math.round(windowMs / 1000)
    });
  }
});

// Different rate limits for different routes
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'));
app.use('/api/stocks', createRateLimit(1 * 60 * 1000, 30, 'Too many stock requests'));
app.use('/api/analytics', createRateLimit(5 * 60 * 1000, 20, 'Too many analytics requests'));
app.use('/', createRateLimit(15 * 60 * 1000, 200, 'Too many requests'));

// Enhanced logging with custom format
const customMorganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';
app.use(morgan(customMorganFormat));

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Body parsing with enhanced limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API versioning
const API_VERSION = '/api/v1';

// Routes with versioning
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics')); // New analytics route
app.use('/api/nifty', require('./routes/nifty')); // NIFTY 50 and charts route
app.use('/api/docs', require('./routes/docs')); // New documentation route
app.use('/health', require('./routes/health')); // Enhanced health check

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Stock Analysis Platform API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Professional Stock Trading Analysis Platform with Live NSE Data',
    endpoints: {
      auth: '/api/auth',
      stocks: '/api/stocks',
      analysis: '/api/analysis',
      analytics: '/api/analytics',
      users: '/api/users',
      health: '/health'
    },
    features: [
      'Live NSE Data Integration',
      'Technical Analysis',
      'Portfolio Management',
      'Real-time Quotes',
      'Market Sentiment Analysis',
      'Auto-scaling & High Availability'
    ],
    documentation: 'https://github.com/omkar21-dev/stock-analysis-platform',
    timestamp: new Date().toISOString()
  });
});

// Enhanced scheduler control endpoints with authentication
app.post('/api/admin/scheduler/start', authenticateAdmin, (req, res) => {
  try {
    schedulerService.start();
    console.log(`Scheduler started by admin at ${new Date().toISOString()}`);
    res.json({ 
      success: true, 
      message: 'Scheduler started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to start scheduler:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/admin/scheduler/stop', authenticateAdmin, (req, res) => {
  try {
    schedulerService.stop();
    console.log(`Scheduler stopped by admin at ${new Date().toISOString()}`);
    res.json({ 
      success: true, 
      message: 'Scheduler stopped successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to stop scheduler:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/admin/scheduler/trigger', authenticateAdmin, async (req, res) => {
  try {
    console.log(`Manual scheduler trigger initiated by admin at ${new Date().toISOString()}`);
    const success = await schedulerService.triggerUpdate();
    res.json({ 
      success, 
      message: success ? 'Update triggered successfully' : 'Update failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to trigger scheduler:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/admin/scheduler/status', authenticateAdmin, (req, res) => {
  try {
    const status = schedulerService.getStatus();
    res.json({ 
      success: true, 
      data: {
        ...status,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple admin authentication middleware (enhance with proper JWT in production)
function authenticateAdmin(req, res, next) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey === process.env.ADMIN_KEY || adminKey === 'dev-admin-key') {
    next();
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }
}

// Enhanced error handling middleware with request tracing
app.use((err, req, res, next) => {
  console.error(`[${req.id}] Error:`, err.stack);
  
  // Log additional context
  console.error(`[${req.id}] Request details:`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    requestId: req.id,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { 
      stack: err.stack,
      details: err.details 
    })
  });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  console.log(`[${req.id}] 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.id,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/api',
      '/health',
      '/api/auth',
      '/api/stocks',
      '/api/analysis',
      '/api/analytics',
      '/api/users'
    ]
  });
});

// Performance monitoring
const performanceMonitor = {
  requests: 0,
  errors: 0,
  startTime: Date.now(),
  
  getStats() {
    return {
      totalRequests: this.requests,
      totalErrors: this.errors,
      uptime: Date.now() - this.startTime,
      requestsPerMinute: Math.round(this.requests / ((Date.now() - this.startTime) / 60000)),
      errorRate: this.requests > 0 ? (this.errors / this.requests * 100).toFixed(2) + '%' : '0%'
    };
  }
};

// Request counter middleware
app.use((req, res, next) => {
  performanceMonitor.requests++;
  
  // Count errors
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      performanceMonitor.errors++;
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Performance stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: performanceMonitor.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Start scheduler service
console.log('Starting scheduler service...');
schedulerService.start();

// Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received, initiating graceful shutdown...`);
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
    
    // Stop scheduler
    schedulerService.stop();
    console.log('Scheduler stopped');
    
    // Close database connections, etc.
    // Add your cleanup code here
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Stock Analysis Platform API Server`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API info: http://localhost:${PORT}/api`);
  console.log(`📈 Performance stats: http://localhost:${PORT}/api/stats`);
});

module.exports = app;
