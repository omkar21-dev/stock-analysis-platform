const express = require('express');
const router = express.Router();

// API Documentation
router.get('/', (req, res) => {
  const documentation = {
    title: 'Stock Analysis Platform API Documentation',
    version: '1.2.0',
    description: 'Professional Stock Trading Analysis Platform with Live NSE Data Integration',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    
    endpoints: {
      authentication: {
        path: '/auth',
        methods: {
          'POST /auth/register': {
            description: 'Register a new user',
            body: {
              username: 'string',
              email: 'string',
              password: 'string'
            }
          },
          'POST /auth/login': {
            description: 'Login user',
            body: {
              email: 'string',
              password: 'string'
            }
          },
          'POST /auth/logout': {
            description: 'Logout user',
            headers: {
              Authorization: 'Bearer <token>'
            }
          }
        }
      },
      
      stocks: {
        path: '/stocks',
        methods: {
          'GET /stocks/quote/:symbol': {
            description: 'Get real-time stock quote',
            parameters: {
              symbol: 'Stock symbol (e.g., RELIANCE, TCS)'
            },
            example: '/stocks/quote/RELIANCE'
          },
          'GET /stocks/search/:query': {
            description: 'Search stocks by name or symbol',
            parameters: {
              query: 'Search term'
            },
            example: '/stocks/search/reliance'
          },
          'GET /stocks/top-gainers': {
            description: 'Get top gaining stocks'
          },
          'GET /stocks/top-losers': {
            description: 'Get top losing stocks'
          },
          'GET /stocks/nifty50': {
            description: 'Get NIFTY 50 index data'
          }
        }
      },
      
      analytics: {
        path: '/analytics',
        methods: {
          'GET /analytics/technical/:symbol': {
            description: 'Get technical analysis for a stock',
            parameters: {
              symbol: 'Stock symbol'
            },
            returns: {
              indicators: {
                sma: 'Simple Moving Averages (20, 50, 200)',
                ema: 'Exponential Moving Averages (12, 26)',
                rsi: 'Relative Strength Index',
                macd: 'MACD indicator',
                bollingerBands: 'Bollinger Bands'
              },
              signals: 'Trading signals based on technical indicators'
            }
          },
          'GET /analytics/sentiment/:symbol': {
            description: 'Get market sentiment analysis',
            parameters: {
              symbol: 'Stock symbol'
            }
          },
          'POST /analytics/portfolio': {
            description: 'Analyze portfolio performance',
            body: {
              holdings: [
                {
                  symbol: 'string',
                  quantity: 'number',
                  avgPrice: 'number'
                }
              ]
            }
          }
        }
      },
      
      analysis: {
        path: '/analysis',
        methods: {
          'GET /analysis': {
            description: 'Get all stock analyses'
          },
          'POST /analysis': {
            description: 'Create new stock analysis',
            headers: {
              Authorization: 'Bearer <token>'
            },
            body: {
              symbol: 'string',
              analysis: 'string',
              prediction: 'BUY|SELL|HOLD',
              targetPrice: 'number'
            }
          }
        }
      },
      
      health: {
        path: '/health',
        methods: {
          'GET /health': {
            description: 'Comprehensive health check with system metrics'
          },
          'GET /health/ready': {
            description: 'Kubernetes readiness probe'
          },
          'GET /health/live': {
            description: 'Kubernetes liveness probe'
          }
        }
      },
      
      admin: {
        path: '/admin',
        methods: {
          'POST /admin/scheduler/start': {
            description: 'Start the data scheduler',
            headers: {
              'X-Admin-Key': 'Admin authentication key'
            }
          },
          'POST /admin/scheduler/stop': {
            description: 'Stop the data scheduler',
            headers: {
              'X-Admin-Key': 'Admin authentication key'
            }
          },
          'GET /admin/scheduler/status': {
            description: 'Get scheduler status',
            headers: {
              'X-Admin-Key': 'Admin authentication key'
            }
          }
        }
      }
    },
    
    responseFormat: {
      success: {
        success: true,
        data: 'Response data',
        timestamp: 'ISO timestamp',
        cached: 'boolean (if data is from cache)'
      },
      error: {
        success: false,
        message: 'Error message',
        requestId: 'Request tracking ID',
        timestamp: 'ISO timestamp'
      }
    },
    
    features: [
      'Live NSE Data Integration',
      'Technical Analysis (SMA, EMA, RSI, MACD, Bollinger Bands)',
      'Market Sentiment Analysis',
      'Portfolio Performance Analysis',
      'Real-time Stock Quotes',
      'Stock Search and Discovery',
      'Top Gainers/Losers',
      'NIFTY 50 Index Data',
      'Comprehensive Health Monitoring',
      'Request Rate Limiting',
      'Response Caching',
      'Error Tracking',
      'Performance Metrics'
    ],
    
    technicalIndicators: {
      SMA: 'Simple Moving Average - Average price over a specific period',
      EMA: 'Exponential Moving Average - Weighted average giving more importance to recent prices',
      RSI: 'Relative Strength Index - Momentum oscillator (0-100)',
      MACD: 'Moving Average Convergence Divergence - Trend-following momentum indicator',
      BollingerBands: 'Volatility bands around a moving average'
    },
    
    tradingSignals: {
      BUY: 'Bullish signal - Consider buying',
      SELL: 'Bearish signal - Consider selling',
      HOLD: 'Neutral signal - Hold current position'
    },
    
    examples: {
      getTechnicalAnalysis: {
        url: '/analytics/technical/RELIANCE',
        response: {
          success: true,
          data: {
            symbol: 'RELIANCE',
            lastPrice: 2450.50,
            indicators: {
              sma: {
                sma20: 2420.30,
                sma50: 2380.75,
                sma200: 2350.20
              },
              rsi: 65.4,
              signals: [
                {
                  type: 'BUY',
                  indicator: 'SMA Crossover',
                  strength: 'STRONG'
                }
              ]
            }
          }
        }
      }
    },
    
    rateLimit: {
      '/api/auth': '5 requests per 15 minutes',
      '/api/stocks': '30 requests per minute',
      '/api/analytics': '20 requests per 5 minutes',
      'default': '200 requests per 15 minutes'
    },
    
    caching: {
      'Stock quotes': '30 seconds',
      'Technical analysis': '5 minutes',
      'Market sentiment': '10 minutes',
      'Top gainers/losers': '2 minutes'
    }
  };

  res.json(documentation);
});

// Interactive API explorer
router.get('/explorer', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Stock Analysis Platform API Explorer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            .endpoint { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
            .method { font-weight: bold; color: #27ae60; }
            .path { font-family: monospace; background: #34495e; color: white; padding: 2px 6px; border-radius: 3px; }
            .try-btn { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-left: 10px; }
            .try-btn:hover { background: #2980b9; }
            pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .feature { background: #e8f5e8; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #27ae60; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📈 Stock Analysis Platform API Explorer</h1>
            <p>Interactive API documentation and testing interface</p>
            
            <h2>🚀 Quick Test Endpoints</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> <span class="path">/health</span>
                <button class="try-btn" onclick="testEndpoint('/health')">Try It</button>
                <p>Comprehensive health check with system metrics</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <span class="path">/api</span>
                <button class="try-btn" onclick="testEndpoint('/api')">Try It</button>
                <p>API information and available endpoints</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <span class="path">/api/stocks/quote/RELIANCE</span>
                <button class="try-btn" onclick="testEndpoint('/api/stocks/quote/RELIANCE')">Try It</button>
                <p>Get real-time quote for Reliance Industries</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <span class="path">/api/analytics/technical/TCS</span>
                <button class="try-btn" onclick="testEndpoint('/api/analytics/technical/TCS')">Try It</button>
                <p>Technical analysis for TCS stock</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <span class="path">/api/stocks/top-gainers</span>
                <button class="try-btn" onclick="testEndpoint('/api/stocks/top-gainers')">Try It</button>
                <p>Get today's top gaining stocks</p>
            </div>
            
            <h2>📊 Response</h2>
            <pre id="response">Click "Try It" on any endpoint above to see the response</pre>
            
            <h2>🎯 Features</h2>
            <div class="feature">✅ Live NSE Data Integration</div>
            <div class="feature">📈 Technical Analysis (SMA, EMA, RSI, MACD, Bollinger Bands)</div>
            <div class="feature">🎭 Market Sentiment Analysis</div>
            <div class="feature">💼 Portfolio Performance Analysis</div>
            <div class="feature">⚡ Real-time Caching</div>
            <div class="feature">🛡️ Rate Limiting & Security</div>
            
            <h2>📚 Full Documentation</h2>
            <p><a href="/api/docs" target="_blank">View Complete API Documentation</a></p>
        </div>
        
        <script>
            async function testEndpoint(path) {
                const responseEl = document.getElementById('response');
                responseEl.textContent = 'Loading...';
                
                try {
                    const response = await fetch(path);
                    const data = await response.json();
                    responseEl.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    responseEl.textContent = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

module.exports = router;
