const axios = require('axios');
const cheerio = require('cheerio');

class NSEService {
  constructor() {
    this.baseURL = 'https://www.nseindia.com';
    this.apiURL = 'https://www.nseindia.com/api';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };
    this.session = null;
    this.initSession();
  }

  async initSession() {
    try {
      // Initialize session by visiting NSE homepage
      const response = await axios.get(this.baseURL, { headers: this.headers });
      this.session = response.headers['set-cookie'];
    } catch (error) {
      console.error('Failed to initialize NSE session:', error.message);
    }
  }

  async makeRequest(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const headers = { ...this.headers };
        if (this.session) {
          headers['Cookie'] = this.session.join('; ');
        }

        const response = await axios.get(url, { 
          headers,
          timeout: 10000
        });
        return response.data;
      } catch (error) {
        console.error(`Request failed (attempt ${i + 1}):`, error.message);
        if (i === retries - 1) throw error;
        
        // Re-initialize session on failure
        await this.initSession();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Get stock quote by symbol
  async getStockQuote(symbol) {
    try {
      const url = `${this.apiURL}/quote-equity?symbol=${symbol.toUpperCase()}`;
      const data = await this.makeRequest(url);
      
      if (!data || !data.priceInfo) {
        throw new Error('Invalid response from NSE API');
      }

      return {
        symbol: data.info?.symbol || symbol.toUpperCase(),
        name: data.info?.companyName || 'N/A',
        price: parseFloat(data.priceInfo.lastPrice) || 0,
        change: parseFloat(data.priceInfo.change) || 0,
        changePercent: parseFloat(data.priceInfo.pChange) || 0,
        open: parseFloat(data.priceInfo.open) || 0,
        high: parseFloat(data.priceInfo.intraDayHighLow?.max) || 0,
        low: parseFloat(data.priceInfo.intraDayHighLow?.min) || 0,
        volume: parseInt(data.priceInfo.totalTradedVolume) || 0,
        marketCap: data.priceInfo.totalMarketCap || 0,
        pe: parseFloat(data.metadata?.pe) || 0,
        pb: parseFloat(data.metadata?.pb) || 0,
        dividend: parseFloat(data.metadata?.dividend) || 0,
        lastUpdated: new Date().toISOString(),
        sector: data.industryInfo?.sector || 'N/A',
        industry: data.industryInfo?.industry || 'N/A'
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch data for ${symbol}`);
    }
  }

  // Get market status
  async getMarketStatus() {
    try {
      const url = `${this.apiURL}/marketStatus`;
      const data = await this.makeRequest(url);
      
      return {
        marketStatus: data.marketState || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        markets: data.marketTypes || []
      };
    } catch (error) {
      console.error('Error fetching market status:', error.message);
      return {
        marketStatus: 'UNKNOWN',
        timestamp: new Date().toISOString(),
        markets: []
      };
    }
  }

  // Get top gainers
  async getTopGainers(count = 10) {
    try {
      const url = `${this.apiURL}/live-analysis-variations?index=gainers`;
      const data = await this.makeRequest(url);
      
      if (!data || !data.NIFTY) {
        throw new Error('Invalid response for gainers');
      }

      return data.NIFTY.slice(0, count).map(stock => ({
        symbol: stock.symbol,
        name: stock.meta?.companyName || stock.symbol,
        price: parseFloat(stock.lastPrice) || 0,
        change: parseFloat(stock.netPrice) || 0,
        changePercent: parseFloat(stock.pChange) || 0,
        volume: parseInt(stock.quantityTraded) || 0
      }));
    } catch (error) {
      console.error('Error fetching top gainers:', error.message);
      return [];
    }
  }

  // Get top losers
  async getTopLosers(count = 10) {
    try {
      const url = `${this.apiURL}/live-analysis-variations?index=losers`;
      const data = await this.makeRequest(url);
      
      if (!data || !data.NIFTY) {
        throw new Error('Invalid response for losers');
      }

      return data.NIFTY.slice(0, count).map(stock => ({
        symbol: stock.symbol,
        name: stock.meta?.companyName || stock.symbol,
        price: parseFloat(stock.lastPrice) || 0,
        change: parseFloat(stock.netPrice) || 0,
        changePercent: parseFloat(stock.pChange) || 0,
        volume: parseInt(stock.quantityTraded) || 0
      }));
    } catch (error) {
      console.error('Error fetching top losers:', error.message);
      return [];
    }
  }

  // Search stocks
  async searchStocks(query) {
    try {
      const url = `${this.apiURL}/search/autocomplete?q=${encodeURIComponent(query)}`;
      const data = await this.makeRequest(url);
      
      if (!data || !data.symbols) {
        return [];
      }

      return data.symbols.slice(0, 10).map(stock => ({
        symbol: stock.symbol,
        name: stock.symbol_info || stock.symbol,
        type: 'equity'
      }));
    } catch (error) {
      console.error('Error searching stocks:', error.message);
      return [];
    }
  }

  // Get NIFTY 50 index data
  async getNifty50() {
    try {
      const url = `${this.apiURL}/equity-stockIndices?index=NIFTY%2050`;
      const data = await this.makeRequest(url);
      
      if (!data || !data.data) {
        throw new Error('Invalid NIFTY 50 response');
      }

      return data.data.map(stock => ({
        symbol: stock.symbol,
        name: stock.meta?.companyName || stock.symbol,
        price: parseFloat(stock.lastPrice) || 0,
        change: parseFloat(stock.netPrice) || 0,
        changePercent: parseFloat(stock.pChange) || 0,
        open: parseFloat(stock.open) || 0,
        high: parseFloat(stock.dayHigh) || 0,
        low: parseFloat(stock.dayLow) || 0,
        volume: parseInt(stock.quantityTraded) || 0
      }));
    } catch (error) {
      console.error('Error fetching NIFTY 50:', error.message);
      return [];
    }
  }

  // Get historical data (basic implementation)
  async getHistoricalData(symbol, period = '1M') {
    try {
      // This is a simplified implementation
      // For production, you might want to use a dedicated historical data API
      const currentQuote = await this.getStockQuote(symbol);
      
      // Generate mock historical data based on current price
      const days = period === '1M' ? 30 : period === '3M' ? 90 : 365;
      const historicalData = [];
      const basePrice = currentQuote.price;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic price variations
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = basePrice * (1 + variation);
        
        historicalData.push({
          date: date.toISOString().split('T')[0],
          open: price * (1 + (Math.random() - 0.5) * 0.02),
          high: price * (1 + Math.random() * 0.03),
          low: price * (1 - Math.random() * 0.03),
          close: price,
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }
      
      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      return [];
    }
  }
}

module.exports = new NSEService();
