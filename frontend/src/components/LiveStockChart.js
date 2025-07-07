import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ButtonGroup,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Fullscreen,
  Timeline,
  BarChart
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import axios from 'axios';

const LiveStockChart = ({ symbol, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('1D');
  const [chartType, setChartType] = useState('line');
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (symbol) {
      fetchChartData();
      fetchStockInfo();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol, period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/nifty/chart/${symbol}?period=${period}`);
      const data = response.data.data.data.map((point, index) => ({
        time: formatTime(point.timestamp, period),
        timestamp: point.timestamp,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        index
      }));
      setChartData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch chart data');
      console.error('Chart data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockInfo = async () => {
    try {
      const response = await axios.get(`/api/stocks/quote/${symbol}`);
      if (response.data.success) {
        setStockInfo(response.data.data);
      }
    } catch (err) {
      console.error('Stock info error:', err);
    }
  };

  const formatTime = (timestamp, period) => {
    const date = new Date(timestamp);
    switch (period) {
      case '1D':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case '1W':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          hour: '2-digit'
        });
      case '1M':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      default:
        return date.toLocaleTimeString();
    }
  };

  const toggleLiveUpdates = () => {
    if (isLive) {
      clearInterval(intervalRef.current);
      setIsLive(false);
    } else {
      intervalRef.current = setInterval(fetchChartData, 10000); // Update every 10 seconds
      setIsLive(true);
    }
  };

  const formatPrice = (price) => `₹${price?.toFixed(2) || '0.00'}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Open: {formatPrice(data.open)}
          </Typography>
          <Typography variant="body2" color="success.main">
            High: {formatPrice(data.high)}
          </Typography>
          <Typography variant="body2" color="error.main">
            Low: {formatPrice(data.low)}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            Close: {formatPrice(data.close)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Volume: {(data.volume / 1000000).toFixed(1)}M
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
          />
        </AreaChart>
      );
    } else if (chartType === 'volume') {
      return (
        <RechartsBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <RechartsTooltip 
            formatter={(value) => [(value / 1000000).toFixed(1) + 'M', 'Volume']}
          />
          <Bar dataKey="volume" fill="#82ca9d" />
        </RechartsBarChart>
      );
    } else {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
          <RechartsTooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }
  };

  if (loading && chartData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchChartData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  const currentPrice = chartData[chartData.length - 1]?.close;
  const previousPrice = chartData[chartData.length - 2]?.close;
  const priceChange = currentPrice && previousPrice ? currentPrice - previousPrice : 0;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {symbol}
            </Typography>
            {stockInfo && (
              <Typography variant="body2" color="text.secondary">
                {stockInfo.name}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isLive ? "Stop live updates" : "Start live updates"}>
              <IconButton 
                onClick={toggleLiveUpdates}
                color={isLive ? "success" : "default"}
              >
                <Timeline />
              </IconButton>
            </Tooltip>
            <IconButton onClick={fetchChartData} disabled={loading}>
              <Refresh />
            </IconButton>
            {onClose && (
              <Button onClick={onClose} size="small">
                Close
              </Button>
            )}
          </Box>
        </Box>

        {/* Price Info */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {formatPrice(currentPrice)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {priceChange > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                <Typography
                  variant="h6"
                  color={priceChange > 0 ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {isLive && (
                <Chip 
                  label="LIVE" 
                  color="success" 
                  size="small" 
                  icon={<Timeline />}
                />
              )}
              <Chip 
                label={`${period} Chart`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`${chartData.length} Points`} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ButtonGroup size="small" variant="outlined">
            {['1D', '1W', '1M'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'contained' : 'outlined'}
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </ButtonGroup>

          <ButtonGroup size="small" variant="outlined">
            {[
              { key: 'line', label: 'Line', icon: <Timeline /> },
              { key: 'area', label: 'Area', icon: <TrendingUp /> },
              { key: 'volume', label: 'Volume', icon: <BarChart /> }
            ].map((type) => (
              <Button
                key={type.key}
                variant={chartType === type.key ? 'contained' : 'outlined'}
                onClick={() => setChartType(type.key)}
                startIcon={type.icon}
              >
                {type.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 400, width: '100%' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </Box>

        {/* Chart Stats */}
        {chartData.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">High</Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                {formatPrice(Math.max(...chartData.map(d => d.high)))}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Low</Typography>
              <Typography variant="body1" fontWeight="bold" color="error.main">
                {formatPrice(Math.min(...chartData.map(d => d.low)))}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Volume</Typography>
              <Typography variant="body1" fontWeight="bold">
                {(chartData.reduce((sum, d) => sum + d.volume, 0) / 1000000).toFixed(1)}M
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Points</Typography>
              <Typography variant="body1" fontWeight="bold">
                {chartData.length}
              </Typography>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveStockChart;
