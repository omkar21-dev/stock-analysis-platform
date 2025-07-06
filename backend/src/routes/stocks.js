const express = require('express');
const router = express.Router();

// Mock stock data - in production, this would connect to a real stock API
const mockStockData = {
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.30, changePercent: 1.33 },
  'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: -15.20, changePercent: -0.55 },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.60, change: 8.90, changePercent: 3.76 },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 4.50, changePercent: 1.20 },
  'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3380.50, change: -12.30, changePercent: -0.36 }
};

// Get stock data by symbol
router.get('/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stockData = mockStockData[symbol];
    
    if (!stockData) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search stocks
router.get('/search/:query', (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const results = Object.values(mockStockData).filter(stock => 
      stock.symbol.toLowerCase().includes(query) || 
      stock.name.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular stocks
router.get('/', (req, res) => {
  try {
    res.json(Object.values(mockStockData));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
