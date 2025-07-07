const express = require('express');
const nseService = require('../services/nseService');
const cacheService = require('../services/cacheService');

const router = express.Router();

// Technical Analysis Calculations
class TechnicalAnalysis {
  // Simple Moving Average
  static calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Exponential Moving Average
  static calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    return ema;
  }

  // Relative Strength Index
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    
    return 100 - (100 / (1 + rs));
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;
    
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const macdLine = fastEMA - slowEMA;
    
    return {
      macd: macdLine,
      signal: this.calculateEMA([macdLine], signalPeriod),
      histogram: macdLine - this.calculateEMA([macdLine], signalPeriod)
    };
  }

  // Bollinger Bands
  static calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);
    
    const variance = recentPrices.reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }
}

// Get technical analysis for a stock
router.get('/technical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `technical_analysis_${symbol}`;
    
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

    // Get historical data (mock data for demo)
    const historicalData = await nseService.getHistoricalData(symbol);
    
    if (!historicalData || historicalData.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient historical data for technical analysis'
      });
    }

    const prices = historicalData.map(d => d.close);
    
    // Calculate technical indicators
    const analysis = {
      symbol: symbol.toUpperCase(),
      lastPrice: prices[prices.length - 1],
      indicators: {
        sma: {
          sma20: TechnicalAnalysis.calculateSMA(prices, 20),
          sma50: TechnicalAnalysis.calculateSMA(prices, 50),
          sma200: TechnicalAnalysis.calculateSMA(prices, 200)
        },
        ema: {
          ema12: TechnicalAnalysis.calculateEMA(prices, 12),
          ema26: TechnicalAnalysis.calculateEMA(prices, 26)
        },
        rsi: TechnicalAnalysis.calculateRSI(prices),
        macd: TechnicalAnalysis.calculateMACD(prices),
        bollingerBands: TechnicalAnalysis.calculateBollingerBands(prices)
      },
      signals: generateTradingSignals(prices),
      timestamp: new Date().toISOString()
    };

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, analysis, 300);

    res.json({
      success: true,
      data: analysis,
      cached: false
    });

  } catch (error) {
    console.error('Technical analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate technical analysis',
      error: error.message
    });
  }
});

// Generate trading signals based on technical indicators
function generateTradingSignals(prices) {
  const signals = [];
  const currentPrice = prices[prices.length - 1];
  
  // SMA signals
  const sma20 = TechnicalAnalysis.calculateSMA(prices, 20);
  const sma50 = TechnicalAnalysis.calculateSMA(prices, 50);
  
  if (sma20 && sma50) {
    if (sma20 > sma50 && currentPrice > sma20) {
      signals.push({
        type: 'BUY',
        indicator: 'SMA Crossover',
        strength: 'STRONG',
        description: 'Price above SMA20 and SMA20 above SMA50'
      });
    } else if (sma20 < sma50 && currentPrice < sma20) {
      signals.push({
        type: 'SELL',
        indicator: 'SMA Crossover',
        strength: 'STRONG',
        description: 'Price below SMA20 and SMA20 below SMA50'
      });
    }
  }

  // RSI signals
  const rsi = TechnicalAnalysis.calculateRSI(prices);
  if (rsi) {
    if (rsi < 30) {
      signals.push({
        type: 'BUY',
        indicator: 'RSI',
        strength: 'MODERATE',
        description: `RSI oversold at ${rsi.toFixed(2)}`
      });
    } else if (rsi > 70) {
      signals.push({
        type: 'SELL',
        indicator: 'RSI',
        strength: 'MODERATE',
        description: `RSI overbought at ${rsi.toFixed(2)}`
      });
    }
  }

  // Bollinger Bands signals
  const bb = TechnicalAnalysis.calculateBollingerBands(prices);
  if (bb) {
    if (currentPrice < bb.lower) {
      signals.push({
        type: 'BUY',
        indicator: 'Bollinger Bands',
        strength: 'MODERATE',
        description: 'Price below lower Bollinger Band'
      });
    } else if (currentPrice > bb.upper) {
      signals.push({
        type: 'SELL',
        indicator: 'Bollinger Bands',
        strength: 'MODERATE',
        description: 'Price above upper Bollinger Band'
      });
    }
  }

  return signals;
}

// Get market sentiment analysis
router.get('/sentiment/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `sentiment_${symbol}`;
    
    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Mock sentiment analysis (in real app, you'd use news API, social media, etc.)
    const sentiment = {
      symbol: symbol.toUpperCase(),
      overall: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE',
      score: (Math.random() * 2 - 1).toFixed(2), // -1 to 1
      sources: {
        news: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE',
        social: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE',
        analyst: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE'
      },
      confidence: (Math.random() * 0.5 + 0.5).toFixed(2), // 0.5 to 1
      timestamp: new Date().toISOString()
    };

    // Cache for 10 minutes
    await cacheService.set(cacheKey, sentiment, 600);

    res.json({
      success: true,
      data: sentiment,
      cached: false
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze sentiment',
      error: error.message
    });
  }
});

// Get portfolio analysis
router.post('/portfolio', async (req, res) => {
  try {
    const { holdings } = req.body;
    
    if (!holdings || !Array.isArray(holdings)) {
      return res.status(400).json({
        success: false,
        message: 'Holdings array is required'
      });
    }

    const portfolioAnalysis = {
      totalValue: 0,
      totalInvestment: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      holdings: [],
      diversification: {},
      riskMetrics: {}
    };

    for (const holding of holdings) {
      const { symbol, quantity, avgPrice } = holding;
      
      // Get current price
      const currentData = await nseService.getQuote(symbol);
      const currentPrice = currentData?.price || avgPrice;
      
      const investment = quantity * avgPrice;
      const currentValue = quantity * currentPrice;
      const gainLoss = currentValue - investment;
      const gainLossPercent = (gainLoss / investment) * 100;

      portfolioAnalysis.holdings.push({
        symbol,
        quantity,
        avgPrice,
        currentPrice,
        investment,
        currentValue,
        gainLoss,
        gainLossPercent: gainLossPercent.toFixed(2)
      });

      portfolioAnalysis.totalInvestment += investment;
      portfolioAnalysis.totalValue += currentValue;
    }

    portfolioAnalysis.totalGainLoss = portfolioAnalysis.totalValue - portfolioAnalysis.totalInvestment;
    portfolioAnalysis.totalGainLossPercent = 
      ((portfolioAnalysis.totalGainLoss / portfolioAnalysis.totalInvestment) * 100).toFixed(2);

    res.json({
      success: true,
      data: portfolioAnalysis
    });

  } catch (error) {
    console.error('Portfolio analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze portfolio',
      error: error.message
    });
  }
});

module.exports = router;
