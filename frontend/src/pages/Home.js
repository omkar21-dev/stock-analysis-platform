import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Analytics, 
  People, 
  ShowChart,
  Timeline,
  Speed,
  Security,
  TrendingDown
} from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
  const [niftyData, setNiftyData] = useState(null);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const [niftyRes, gainersRes, losersRes] = await Promise.all([
        axios.get('/api/nifty/index'),
        axios.get('/api/nifty/gainers'),
        axios.get('/api/nifty/losers')
      ]);

      setNiftyData(niftyRes.data.data);
      setTopGainers(gainersRes.data.data.slice(0, 3));
      setTopLosers(losersRes.data.data.slice(0, 3));
    } catch (error) {
      console.error('Market data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Timeline sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Live NSE Data',
      description: 'Real-time stock quotes, NIFTY 50 index, and live market movements'
    },
    {
      icon: <ShowChart sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Interactive Charts',
      description: 'Advanced charting with technical indicators, multiple timeframes, and live updates'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Technical Analysis',
      description: 'SMA, EMA, RSI, MACD, Bollinger Bands with automated trading signals'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Portfolio Tracking',
      description: 'Track your investments, analyze performance, and get insights'
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Community Driven',
      description: 'Connect with traders, share insights, and learn from experts'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Enterprise Grade',
      description: 'Kubernetes deployment, auto-scaling, and 99.9% uptime'
    }
  ];

  const formatPrice = (price) => `₹${price?.toFixed(2) || '0.00'}`;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          📈 Invest Karega India
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Professional Stock Trading Analysis with Live NSE Data Integration
        </Typography>
        
        {/* Live Market Status */}
        {!loading && niftyData && (
          <Card sx={{ 
            mt: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Grid container alignItems="center" justifyContent="center" spacing={3}>
                <Grid item>
                  <Typography variant="h6">NIFTY 50</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatPrice(niftyData.price)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Box display="flex" alignItems="center" gap={1}>
                    {niftyData.change > 0 ? <TrendingUp /> : <TrendingDown />}
                    <Typography variant="h6">
                      {niftyData.change > 0 ? '+' : ''}{niftyData.change.toFixed(2)} 
                      ({niftyData.changePercent.toFixed(2)}%)
                    </Typography>
                  </Box>
                  <Chip 
                    label={niftyData.marketStatus} 
                    color={niftyData.marketStatus === 'OPEN' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/nifty50"
            startIcon={<ShowChart />}
            sx={{ mr: 2 }}
          >
            View NIFTY 50
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/register"
          >
            Get Started Free
          </Button>
        </Box>
      </Box>

      {/* Live Market Movers */}
      {!loading && (topGainers.length > 0 || topLosers.length > 0) && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
            Live Market Movers
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    🚀 Top Gainers
                  </Typography>
                  {topGainers.map((stock, index) => (
                    <Box key={stock.symbol} sx={{ mb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight="bold">
                          {stock.symbol}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {formatPrice(stock.price)}
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            +{stock.changePercent}%
                          </Typography>
                        </Box>
                      </Box>
                      {index < topGainers.length - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    📉 Top Losers
                  </Typography>
                  {topLosers.map((stock, index) => (
                    <Box key={stock.symbol} sx={{ mb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight="bold">
                          {stock.symbol}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {formatPrice(stock.price)}
                          </Typography>
                          <Typography variant="body2" color="error.main" fontWeight="bold">
                            {stock.changePercent}%
                          </Typography>
                        </Box>
                      </Box>
                      {index < topLosers.length - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
        Professional Trading Platform Features
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Platform Stats */}
      <Card sx={{ mb: 6, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Platform Statistics
          </Typography>
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight="bold">50+</Typography>
              <Typography variant="h6">NIFTY 50 Stocks</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight="bold">Live</Typography>
              <Typography variant="h6">Real-time Data</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight="bold">5+</Typography>
              <Typography variant="h6">Technical Indicators</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" fontWeight="bold">24/7</Typography>
              <Typography variant="h6">Platform Uptime</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Box textAlign="center" sx={{ mt: 6, p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Start Professional Trading?
        </Typography>
        <Typography variant="h6" paragraph>
          Join our platform with live NSE data, advanced charts, and technical analysis tools!
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/nifty50"
            startIcon={<ShowChart />}
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main', 
              mr: 2,
              '&:hover': { bgcolor: 'grey.100' } 
            }}
          >
            Explore NIFTY 50
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/register"
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Register Free
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
