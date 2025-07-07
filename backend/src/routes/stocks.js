const express = require('express');
const router = express.Router();
const nseService = require('../services/nseService');
const cacheService = require('../services/cacheService');

// Get stock data by symbol
router.get('/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const cacheKey = `quote_${symbol}`;
    
    // Check cache first
    let stockData = cacheService.get(cacheKey);
    
    if (!stockData) {
      stockData = await nseService.getStockQuote(symbol);
      // Cache for 30 seconds for real-time data
      cacheService.set(cacheKey, stockData, 30000);
    }
    
    res.json({
      success: true,
      data: stockData,
      cached: cacheService.has(cacheKey)
    });
  } catch (error) {
    console.error('Error fetching stock quote:', error.message);
    res.status(404).json({ 
      success: false,
      message: error.message || 'Stock not found' 
    });
  }
});

// Get historical data
router.get('/history/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const period = req.query.period || '1M';
    const cacheKey = `history_${symbol}_${period}`;
    
    let historicalData = cacheService.get(cacheKey);
    
    if (!historicalData) {
      historicalData = await nseService.getHistoricalData(symbol, period);
      // Cache historical data for 5 minutes
      cacheService.set(cacheKey, historicalData, 5 * 60 * 1000);
    }
    
    res.json({
      success: true,
      data: historicalData,
      symbol: symbol,
      period: period
    });
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to fetch historical data' 
    });
  }
});

// Search stocks
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const cacheKey = `search_${query.toLowerCase()}`;
    
    let results = cacheService.get(cacheKey);
    
    if (!results) {
      results = await nseService.searchStocks(query);
      // Cache search results for 2 minutes
      cacheService.set(cacheKey, results, 2 * 60 * 1000);
    }
    
    res.json({
      success: true,
      data: results,
      query: query
    });
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Search failed' 
    });
  }
});

// Get market status
router.get('/market/status', async (req, res) => {
  try {
    const cacheKey = 'market_status';
    
    let marketStatus = cacheService.get(cacheKey);
    
    if (!marketStatus) {
      marketStatus = await nseService.getMarketStatus();
      // Cache market status for 1 minute
      cacheService.set(cacheKey, marketStatus, 60000);
    }
    
    res.json({
      success: true,
      data: marketStatus
    });
  } catch (error) {
    console.error('Error fetching market status:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch market status' 
    });
  }
});

// Get top gainers
router.get('/market/gainers', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const cacheKey = `gainers_${count}`;
    
    let gainers = cacheService.get(cacheKey);
    
    if (!gainers) {
      gainers = await nseService.getTopGainers(count);
      // Cache for 2 minutes
      cacheService.set(cacheKey, gainers, 2 * 60 * 1000);
    }
    
    res.json({
      success: true,
      data: gainers
    });
  } catch (error) {
    console.error('Error fetching top gainers:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch top gainers' 
    });
  }
});

// Get top losers
router.get('/market/losers', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const cacheKey = `losers_${count}`;
    
    let losers = cacheService.get(cacheKey);
    
    if (!losers) {
      losers = await nseService.getTopLosers(count);
      // Cache for 2 minutes
      cacheService.set(cacheKey, losers, 2 * 60 * 1000);
    }
    
    res.json({
      success: true,
      data: losers
    });
  } catch (error) {
    console.error('Error fetching top losers:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch top losers' 
    });
  }
});

// Get NIFTY 50 stocks
router.get('/indices/nifty50', async (req, res) => {
  try {
    const cacheKey = 'nifty50';
    
    let nifty50 = cacheService.get(cacheKey);
    
    if (!nifty50) {
      nifty50 = await nseService.getNifty50();
      // Cache for 1 minute
      cacheService.set(cacheKey, nifty50, 60000);
    }
    
    res.json({
      success: true,
      data: nifty50
    });
  } catch (error) {
    console.error('Error fetching NIFTY 50:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch NIFTY 50 data' 
    });
  }
});

// Get popular stocks (NIFTY 50 as default)
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'popular_stocks';
    
    let popularStocks = cacheService.get(cacheKey);
    
    if (!popularStocks) {
      popularStocks = await nseService.getNifty50();
      // Cache for 2 minutes
      cacheService.set(cacheKey, popularStocks, 2 * 60 * 1000);
    }
    
    res.json({
      success: true,
      data: popularStocks.slice(0, 20) // Return top 20 for popular stocks
    });
  } catch (error) {
    console.error('Error fetching popular stocks:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch popular stocks' 
    });
  }
});

// Cache statistics endpoint
router.get('/cache/stats', (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch cache stats' 
    });
  }
});

module.exports = router;

module.exports = router;
