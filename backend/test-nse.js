const nseService = require('./src/services/nseService');

async function testNSEIntegration() {
  console.log('Testing NSE Integration...\n');

  try {
    // Test 1: Get market status
    console.log('1. Testing Market Status...');
    const marketStatus = await nseService.getMarketStatus();
    console.log('Market Status:', JSON.stringify(marketStatus, null, 2));
    console.log('✅ Market status test passed\n');

    // Test 2: Get stock quote
    console.log('2. Testing Stock Quote (RELIANCE)...');
    const stockQuote = await nseService.getStockQuote('RELIANCE');
    console.log('RELIANCE Quote:', JSON.stringify(stockQuote, null, 2));
    console.log('✅ Stock quote test passed\n');

    // Test 3: Search stocks
    console.log('3. Testing Stock Search (TCS)...');
    const searchResults = await nseService.searchStocks('TCS');
    console.log('Search Results:', JSON.stringify(searchResults, null, 2));
    console.log('✅ Stock search test passed\n');

    // Test 4: Get top gainers
    console.log('4. Testing Top Gainers...');
    const gainers = await nseService.getTopGainers(5);
    console.log('Top 5 Gainers:', JSON.stringify(gainers, null, 2));
    console.log('✅ Top gainers test passed\n');

    // Test 5: Get NIFTY 50
    console.log('5. Testing NIFTY 50...');
    const nifty50 = await nseService.getNifty50();
    console.log(`NIFTY 50 (showing first 3 stocks):`, JSON.stringify(nifty50.slice(0, 3), null, 2));
    console.log('✅ NIFTY 50 test passed\n');

    console.log('🎉 All NSE integration tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testNSEIntegration();
