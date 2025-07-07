const express = require('express');
const cacheService = require('../services/cacheService');
const nseService = require('../services/nseService');

const router = express.Router();

// NIFTY 50 stock symbols
const NIFTY_50_STOCKS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
  'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'NESTLEIND',
  'HCLTECH', 'BAJFINANCE', 'M&M', 'TITAN', 'SUNPHARMA', 'ULTRACEMCO', 'WIPRO',
  'NTPC', 'JSWSTEEL', 'POWERGRID', 'TATAMOTORS', 'TECHM', 'GRASIM', 'ADANIPORTS',
  'COALINDIA', 'BAJAJFINSV', 'HDFCLIFE', 'SBILIFE', 'BPCL', 'BRITANNIA', 'EICHERMOT',
  'DRREDDY', 'CIPLA', 'DIVISLAB', 'HEROMOTOCO', 'TATACONSUM', 'BAJAJ-AUTO', 'APOLLOHOSP',
  'INDUSINDBK', 'ONGC', 'UPL', 'TATASTEEL', 'HINDALCO', 'ADANIENT', 'LTIM'
];

// Get NIFTY 50 index data
router.get('/index', async (req, res) => {
  try {
    const cacheKey = 'nifty_50_index';
    
    // Check cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Mock NIFTY 50 index data (replace with real NSE API)
    const niftyData = {
      symbol: 'NIFTY 50',
      name: 'NIFTY 50',
      price: 19674.25 + (Math.random() - 0.5) * 200, // Mock live price
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 2,
      high: 19750.30,
      low: 19580.15,
      open: 19620.45,
      previousClose: 19650.80,
      volume: 125000000,
      marketCap: 2450000000000,
      timestamp: new Date().toISOString(),
      marketStatus: isMarketOpen() ? 'OPEN' : 'CLOSED'
    };

    // Cache for 30 seconds
    await cacheService.set(cacheKey, niftyData, 30000);

    res.json({
      success: true,
      data: niftyData,
      cached: false
    });

  } catch (error) {
    console.error('NIFTY index error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NIFTY 50 index data',
      error: error.message
    });
  }
});

// Get all NIFTY 50 stocks with live data
router.get('/stocks', async (req, res) => {
  try {
    const cacheKey = 'nifty_50_stocks';
    
    // Check cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const stocksData = [];
    
    // Generate mock data for all NIFTY 50 stocks
    for (const symbol of NIFTY_50_STOCKS) {
      const basePrice = getBasePriceForStock(symbol);
      const stock = {
        symbol,
        name: getStockName(symbol),
        price: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
        change: (Math.random() - 0.5) * basePrice * 0.05,
        changePercent: (Math.random() - 0.5) * 5,
        high: basePrice * (1 + Math.random() * 0.03),
        low: basePrice * (1 - Math.random() * 0.03),
        open: basePrice * (1 + (Math.random() - 0.5) * 0.02),
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: basePrice * Math.floor(Math.random() * 1000000000) + 100000000000,
        sector: getSectorForStock(symbol),
        timestamp: new Date().toISOString()
      };
      
      // Calculate derived values
      stock.changePercent = ((stock.change / (stock.price - stock.change)) * 100).toFixed(2);
      stock.price = parseFloat(stock.price.toFixed(2));
      stock.change = parseFloat(stock.change.toFixed(2));
      
      stocksData.push(stock);
    }

    // Sort by market cap (largest first)
    stocksData.sort((a, b) => b.marketCap - a.marketCap);

    // Cache for 1 minute
    await cacheService.set(cacheKey, stocksData, 60000);

    res.json({
      success: true,
      data: stocksData,
      cached: false,
      count: stocksData.length
    });

  } catch (error) {
    console.error('NIFTY stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NIFTY 50 stocks data',
      error: error.message
    });
  }
});

// Get top gainers from NIFTY 50
router.get('/gainers', async (req, res) => {
  try {
    const cacheKey = 'nifty_50_gainers';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Get all NIFTY 50 stocks
    const allStocksResponse = await fetch(`${req.protocol}://${req.get('host')}/api/nifty/stocks`);
    const allStocks = await allStocksResponse.json();
    
    if (!allStocks.success) {
      throw new Error('Failed to fetch stocks data');
    }

    // Get top 10 gainers
    const gainers = allStocks.data
      .filter(stock => stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    await cacheService.set(cacheKey, gainers, 60000);

    res.json({
      success: true,
      data: gainers,
      cached: false
    });

  } catch (error) {
    console.error('NIFTY gainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NIFTY 50 gainers',
      error: error.message
    });
  }
});

// Get top losers from NIFTY 50
router.get('/losers', async (req, res) => {
  try {
    const cacheKey = 'nifty_50_losers';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Get all NIFTY 50 stocks
    const allStocksResponse = await fetch(`${req.protocol}://${req.get('host')}/api/nifty/stocks`);
    const allStocks = await allStocksResponse.json();
    
    if (!allStocks.success) {
      throw new Error('Failed to fetch stocks data');
    }

    // Get top 10 losers
    const losers = allStocks.data
      .filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

    await cacheService.set(cacheKey, losers, 60000);

    res.json({
      success: true,
      data: losers,
      cached: false
    });

  } catch (error) {
    console.error('NIFTY losers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NIFTY 50 losers',
      error: error.message
    });
  }
});

// Get historical chart data for a stock
router.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1D', interval = '5m' } = req.query;
    
    const cacheKey = `chart_${symbol}_${period}_${interval}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Generate mock historical data
    const chartData = generateMockChartData(symbol, period, interval);

    // Cache based on period
    const cacheTime = period === '1D' ? 30000 : period === '1W' ? 300000 : 600000;
    await cacheService.set(cacheKey, chartData, cacheTime);

    res.json({
      success: true,
      data: chartData,
      cached: false
    });

  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
});

// Helper functions
function isMarketOpen() {
  const now = new Date();
  const hours = now.getHours();
  const day = now.getDay();
  
  // Market open Monday-Friday, 9:15 AM to 3:30 PM IST
  return day >= 1 && day <= 5 && hours >= 9 && hours < 16;
}

function getBasePriceForStock(symbol) {
  const basePrices = {
    'RELIANCE': 2450, 'TCS': 3650, 'HDFCBANK': 1580, 'INFY': 1420, 'HINDUNILVR': 2680,
    'ICICIBANK': 950, 'KOTAKBANK': 1780, 'BHARTIARTL': 850, 'ITC': 420, 'SBIN': 580,
    'LT': 2850, 'AXISBANK': 980, 'ASIANPAINT': 3200, 'MARUTI': 10500, 'NESTLEIND': 22000,
    'HCLTECH': 1180, 'BAJFINANCE': 6800, 'M&M': 1450, 'TITAN': 3100, 'SUNPHARMA': 1080
  };
  return basePrices[symbol] || 1000 + Math.random() * 2000;
}

function getStockName(symbol) {
  const names = {
    'RELIANCE': 'Reliance Industries Ltd',
    'TCS': 'Tata Consultancy Services Ltd',
    'HDFCBANK': 'HDFC Bank Ltd',
    'INFY': 'Infosys Ltd',
    'HINDUNILVR': 'Hindustan Unilever Ltd',
    'ICICIBANK': 'ICICI Bank Ltd',
    'KOTAKBANK': 'Kotak Mahindra Bank Ltd',
    'BHARTIARTL': 'Bharti Airtel Ltd',
    'ITC': 'ITC Ltd',
    'SBIN': 'State Bank of India'
  };
  return names[symbol] || `${symbol} Ltd`;
}

function getSectorForStock(symbol) {
  const sectors = {
    'RELIANCE': 'Oil & Gas', 'TCS': 'IT Services', 'HDFCBANK': 'Banking', 'INFY': 'IT Services',
    'HINDUNILVR': 'FMCG', 'ICICIBANK': 'Banking', 'KOTAKBANK': 'Banking', 'BHARTIARTL': 'Telecom',
    'ITC': 'FMCG', 'SBIN': 'Banking', 'LT': 'Construction', 'AXISBANK': 'Banking'
  };
  return sectors[symbol] || 'Others';
}

function generateMockChartData(symbol, period, interval) {
  const basePrice = getBasePriceForStock(symbol);
  const dataPoints = [];
  const now = new Date();
  
  let points, intervalMs;
  
  switch (period) {
    case '1D':
      points = 78; // 6.5 hours * 12 (5-minute intervals)
      intervalMs = 5 * 60 * 1000;
      break;
    case '1W':
      points = 35; // 5 days * 7 points per day
      intervalMs = 2 * 60 * 60 * 1000;
      break;
    case '1M':
      points = 30; // 30 days
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    default:
      points = 78;
      intervalMs = 5 * 60 * 1000;
  }

  let currentPrice = basePrice;
  
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * intervalMs));
    
    // Add some realistic price movement
    const change = (Math.random() - 0.5) * basePrice * 0.02;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.8);
    currentPrice = Math.min(currentPrice, basePrice * 1.2);
    
    const high = currentPrice + Math.random() * basePrice * 0.01;
    const low = currentPrice - Math.random() * basePrice * 0.01;
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    dataPoints.push({
      timestamp: timestamp.toISOString(),
      open: parseFloat((currentPrice - change).toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
      volume: volume
    });
  }

  return {
    symbol,
    period,
    interval,
    data: dataPoints,
    meta: {
      totalPoints: dataPoints.length,
      firstPrice: dataPoints[0]?.close,
      lastPrice: dataPoints[dataPoints.length - 1]?.close,
      priceChange: dataPoints.length > 1 ? 
        (dataPoints[dataPoints.length - 1].close - dataPoints[0].close).toFixed(2) : 0
    }
  };
}

module.exports = router;
