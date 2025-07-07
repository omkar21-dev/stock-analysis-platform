# NSE Live Data Integration

This document describes the integration of live NSE (National Stock Exchange) data into the Stock Analysis Platform.

## Features Added

### 1. Real-time Stock Data
- Live stock quotes from NSE
- Real-time price updates
- Market status information
- Historical data (basic implementation)

### 2. Market Data
- Top gainers and losers
- NIFTY 50 index data
- Market status (open/closed)
- Popular Indian stocks

### 3. Search Functionality
- Search stocks by symbol or name
- Autocomplete suggestions
- Real-time search results

### 4. Performance Optimization
- In-memory caching system
- Configurable cache TTL
- Background data updates
- Rate limiting protection

## API Endpoints

### Stock Data
```
GET /api/stocks/quote/:symbol          # Get stock quote
GET /api/stocks/history/:symbol        # Get historical data
GET /api/stocks/search/:query          # Search stocks
GET /api/stocks/                       # Get popular stocks
```

### Market Data
```
GET /api/stocks/market/status          # Market status
GET /api/stocks/market/gainers         # Top gainers
GET /api/stocks/market/losers          # Top losers
GET /api/stocks/indices/nifty50        # NIFTY 50 data
```

### Admin Endpoints
```
POST /api/admin/scheduler/start        # Start scheduler
POST /api/admin/scheduler/stop         # Stop scheduler
POST /api/admin/scheduler/trigger      # Manual update
GET  /api/admin/scheduler/status       # Scheduler status
```

## Example API Responses

### Stock Quote Response
```json
{
  "success": true,
  "data": {
    "symbol": "RELIANCE",
    "name": "Reliance Industries Limited",
    "price": 2456.75,
    "change": 23.50,
    "changePercent": 0.97,
    "open": 2440.00,
    "high": 2465.80,
    "low": 2435.20,
    "volume": 1234567,
    "marketCap": 1658234567890,
    "pe": 15.67,
    "pb": 2.34,
    "sector": "Oil Gas & Consumable Fuels",
    "lastUpdated": "2025-07-07T08:00:00.000Z"
  },
  "cached": false
}
```

### Market Status Response
```json
{
  "success": true,
  "data": {
    "marketStatus": "Open",
    "timestamp": "2025-07-07T08:00:00.000Z",
    "markets": [
      {
        "market": "Capital Market",
        "marketStatus": "Open",
        "tradeDate": "07-Jul-2025",
        "index": "NIFTY 50"
      }
    ]
  }
}
```

## Configuration

### Environment Variables
```bash
# Optional: Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Optional: Node environment
NODE_ENV=development
```

### Cache Configuration
- Stock quotes: 30 seconds TTL
- Historical data: 5 minutes TTL
- Market status: 1 minute TTL
- Search results: 2 minutes TTL

### Scheduler Configuration
- Market status: Updates every 1 minute
- NIFTY 50: Updates every 2 minutes
- Gainers/Losers: Updates every 3 minutes
- Cache cleanup: Every 10 minutes

## Services Architecture

### NSEService
- Handles all NSE API interactions
- Session management
- Error handling and retries
- Data transformation

### CacheService
- In-memory caching
- TTL management
- Automatic cleanup
- Cache statistics

### SchedulerService
- Background data updates
- Cron job management
- Manual triggers
- Graceful shutdown

## Popular Indian Stocks Supported

The system includes data for popular Indian stocks including:
- RELIANCE, TCS, HDFCBANK, INFY, HINDUNILVR
- ICICIBANK, KOTAKBANK, BHARTIARTL, ITC, SBIN
- BAJFINANCE, LICI, LT, HCLTECH, ASIANPAINT
- AXISBANK, MARUTI, SUNPHARMA, TITAN, ULTRACEMCO

## Testing

Run the NSE integration test:
```bash
cd backend
node test-nse.js
```

## Error Handling

The system includes comprehensive error handling:
- Network timeouts and retries
- Invalid symbol handling
- Market closed scenarios
- Rate limiting protection
- Graceful degradation

## Performance Considerations

1. **Caching**: Reduces API calls and improves response times
2. **Rate Limiting**: Prevents overwhelming NSE servers
3. **Background Updates**: Keeps popular data fresh
4. **Error Recovery**: Automatic retry mechanisms
5. **Memory Management**: Automatic cache cleanup

## Market Hours

The system is aware of Indian market hours (IST):
- Pre-open: 09:00 - 09:15
- Regular: 09:15 - 15:30
- Post-close: 15:40 - 16:00

## Deployment Notes

1. Install new dependencies: `npm install`
2. The scheduler starts automatically with the server
3. Monitor logs for NSE API connectivity
4. Consider implementing Redis for production caching
5. Set up monitoring for API rate limits

## Future Enhancements

1. **Real Historical Data**: Integrate with dedicated historical data providers
2. **WebSocket Support**: Real-time price streaming
3. **Technical Indicators**: Moving averages, RSI, MACD
4. **Options Data**: Options chain and derivatives
5. **News Integration**: Stock-specific news feeds
6. **Alerts System**: Price and volume alerts

## Troubleshooting

### Common Issues

1. **NSE API Access**: NSE may block requests from certain IPs
2. **Rate Limiting**: Implement proper delays between requests
3. **Session Management**: NSE requires session cookies
4. **Data Format Changes**: NSE may change API response formats

### Solutions

1. Use proper headers and session management
2. Implement exponential backoff
3. Monitor and log all API interactions
4. Have fallback data sources ready

## Support

For issues related to NSE integration:
1. Check server logs for API errors
2. Verify network connectivity to NSE
3. Monitor cache hit rates
4. Check scheduler status via admin endpoints
