const http = require('http');
const httpProxy = require('http-proxy');

// Create proxy server
const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route API requests to backend (port 3002)
  if (req.url.startsWith('/api/') || req.url.startsWith('/health')) {
    proxy.web(req, res, { 
      target: 'http://localhost:3002',
      changeOrigin: true 
    });
  } else {
    // Route everything else to frontend (port 3000)
    proxy.web(req, res, { 
      target: 'http://localhost:3000',
      changeOrigin: true 
    });
  }
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error occurred');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Stock Analysis Platform Proxy Server running on http://localhost:${PORT}`);
  console.log('📊 Frontend: http://localhost:3000 -> http://localhost:3001');
  console.log('🔧 Backend API: http://localhost:3002 -> http://localhost:3001/api');
  console.log('');
  console.log('✅ Your website is now accessible at: http://localhost:3001');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Proxy server stopped');
    process.exit(0);
  });
});
