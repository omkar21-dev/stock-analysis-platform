import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Refresh,
  ShowChart,
  Timeline
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Nifty50Dashboard = () => {
  const [niftyIndex, setNiftyIndex] = useState(null);
  const [niftyStocks, setNiftyStocks] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    fetchNiftyData();
    const interval = setInterval(fetchNiftyData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNiftyData = async () => {
    try {
      setLoading(true);
      const [indexRes, stocksRes, gainersRes, losersRes] = await Promise.all([
        axios.get('/api/nifty/index'),
        axios.get('/api/nifty/stocks'),
        axios.get('/api/nifty/gainers'),
        axios.get('/api/nifty/losers')
      ]);

      setNiftyIndex(indexRes.data.data);
      setNiftyStocks(stocksRes.data.data);
      setGainers(gainersRes.data.data);
      setLosers(losersRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch NIFTY data');
      console.error('NIFTY data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (symbol, period = '1D') => {
    try {
      setChartLoading(true);
      const response = await axios.get(`/api/nifty/chart/${symbol}?period=${period}`);
      setChartData(response.data.data.data.map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString(),
        price: point.close,
        volume: point.volume
      })));
    } catch (err) {
      console.error('Chart data error:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    fetchChartData(stock.symbol);
  };

  const filteredStocks = niftyStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => `₹${price.toFixed(2)}`;
  const formatChange = (change, changePercent) => (
    <Box display="flex" alignItems="center" gap={0.5}>
      {change > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
      <Typography
        variant="body2"
        color={change > 0 ? 'success.main' : 'error.main'}
        fontWeight="bold"
      >
        {change > 0 ? '+' : ''}{change.toFixed(2)} ({changePercent}%)
      </Typography>
    </Box>
  );

  if (loading && !niftyIndex) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchNiftyData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* NIFTY 50 Index Card */}
      {niftyIndex && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h4" color="white" fontWeight="bold">
                  NIFTY 50
                </Typography>
                <Typography variant="h3" color="white" fontWeight="bold">
                  {formatPrice(niftyIndex.price)}
                </Typography>
              </Grid>
              <Grid item>
                <Box textAlign="right">
                  <Typography variant="h6" color="white">
                    {niftyIndex.change > 0 ? '+' : ''}{niftyIndex.change.toFixed(2)}
                  </Typography>
                  <Typography variant="h6" color="white">
                    ({niftyIndex.changePercent.toFixed(2)}%)
                  </Typography>
                  <Chip
                    label={niftyIndex.marketStatus}
                    color={niftyIndex.marketStatus === 'OPEN' ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Chart Section */}
      {selectedStock && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {selectedStock.symbol} - Live Chart
              </Typography>
              <Box>
                <Button size="small" onClick={() => fetchChartData(selectedStock.symbol, '1D')}>1D</Button>
                <Button size="small" onClick={() => fetchChartData(selectedStock.symbol, '1W')}>1W</Button>
                <Button size="small" onClick={() => fetchChartData(selectedStock.symbol, '1M')}>1M</Button>
              </Box>
            </Box>
            {chartLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatPrice(value), 'Price']} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Stocks" />
            <Tab label="Top Gainers" />
            <Tab label="Top Losers" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Search and Refresh */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ width: 300 }}
            />
            <IconButton onClick={fetchNiftyData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>

          {/* Stock Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Symbol</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell align="right"><strong>Price</strong></TableCell>
                  <TableCell align="right"><strong>Change</strong></TableCell>
                  <TableCell align="right"><strong>Volume</strong></TableCell>
                  <TableCell><strong>Sector</strong></TableCell>
                  <TableCell align="center"><strong>Chart</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(activeTab === 0 ? filteredStocks : activeTab === 1 ? gainers : losers)
                  .slice(0, 20)
                  .map((stock) => (
                    <TableRow 
                      key={stock.symbol} 
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleStockClick(stock)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {stock.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {stock.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatPrice(stock.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatChange(stock.change, stock.changePercent)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={stock.sector} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStockClick(stock);
                          }}
                        >
                          <ShowChart />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    Top Gainer
                  </Typography>
                  {gainers[0] && (
                    <>
                      <Typography variant="h5" fontWeight="bold">
                        {gainers[0].symbol}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +{gainers[0].changePercent}%
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    Top Loser
                  </Typography>
                  {losers[0] && (
                    <>
                      <Typography variant="h5" fontWeight="bold">
                        {losers[0].symbol}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {losers[0].changePercent}%
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    Market Status
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {niftyIndex?.marketStatus || 'CLOSED'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date().toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Nifty50Dashboard;
