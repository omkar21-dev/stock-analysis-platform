const express = require('express');
const os = require('os');
const schedulerService = require('../services/schedulerService');
const cacheService = require('../services/cacheService');

const router = express.Router();

// Enhanced health check with system metrics
router.get('/', async (req, res) => {
  try {
    const schedulerStatus = schedulerService.getStatus();
    const cacheStatus = await cacheService.getStatus();
    
    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024)
      }
    };

    // Service status
    const serviceStatus = {
      scheduler: schedulerStatus,
      cache: cacheStatus,
      database: 'connected', // You can add actual DB health check here
      api: 'healthy'
    };

    // Overall health determination
    const isHealthy = schedulerStatus.running && cacheStatus.connected;
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: serviceStatus,
      metrics: systemMetrics,
      checks: {
        scheduler: schedulerStatus.running ? 'pass' : 'fail',
        cache: cacheStatus.connected ? 'pass' : 'fail',
        memory: systemMetrics.memory.used < 500 ? 'pass' : 'warn',
        uptime: systemMetrics.uptime > 60 ? 'pass' : 'starting'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: {
        api: 'fail'
      }
    });
  }
});

// Readiness probe for Kubernetes
router.get('/ready', async (req, res) => {
  try {
    const schedulerStatus = schedulerService.getStatus();
    const cacheStatus = await cacheService.getStatus();
    
    const isReady = schedulerStatus.running && cacheStatus.connected;
    
    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      timestamp: new Date().toISOString(),
      services: {
        scheduler: schedulerStatus.running,
        cache: cacheStatus.connected
      }
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe for Kubernetes
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
