module.exports = {
  // NSE API Configuration
  nse: {
    baseURL: 'https://www.nseindia.com',
    apiURL: 'https://www.nseindia.com/api',
    timeout: 10000,
    retries: 3,
    rateLimit: {
      requests: 60,
      window: 60000 // 1 minute
    }
  },

  // Cache Configuration
  cache: {
    defaultTTL: 60000, // 1 minute
    stockQuoteTTL: 30000, // 30 seconds
    historicalDataTTL: 300000, // 5 minutes
    searchResultsTTL: 120000, // 2 minutes
    marketStatusTTL: 60000, // 1 minute
    gainersLosersTTL: 120000 // 2 minutes
  },

  // Scheduler Configuration
  scheduler: {
    marketStatusInterval: '*/1 * * * *', // Every minute
    nifty50Interval: '*/2 * * * *', // Every 2 minutes
    gainersLosersInterval: '*/3 * * * *', // Every 3 minutes
    cacheCleanInterval: '*/10 * * * *' // Every 10 minutes
  },

  // Popular Indian Stock Symbols
  popularStocks: [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR',
    'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'SBIN',
    'BAJFINANCE', 'LICI', 'LT', 'HCLTECH', 'ASIANPAINT',
    'AXISBANK', 'MARUTI', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO'
  ],

  // Market Hours (IST)
  marketHours: {
    preOpen: { start: '09:00', end: '09:15' },
    regular: { start: '09:15', end: '15:30' },
    postClose: { start: '15:40', end: '16:00' }
  },

  // Request Headers for NSE
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};
