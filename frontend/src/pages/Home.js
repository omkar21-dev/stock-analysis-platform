import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { TrendingUp, Analytics, People } from '@mui/icons-material';

const Home = () => {
  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Technical Analysis',
      description: 'Share detailed technical analysis with charts, indicators, and predictions'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Stock Predictions',
      description: 'Get BUY, SELL, or HOLD recommendations from experienced traders'
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Community Driven',
      description: 'Connect with traders, share insights, and learn from the community'
    }
  ];

  const sampleAnalyses = [
    {
      symbol: 'AAPL',
      title: 'Apple Stock Bullish Breakout',
      prediction: 'BUY',
      author: 'TradingPro',
      likes: 24
    },
    {
      symbol: 'TSLA',
      title: 'Tesla Consolidation Pattern',
      prediction: 'HOLD',
      author: 'StockGuru',
      likes: 18
    },
    {
      symbol: 'GOOGL',
      title: 'Google Support Level Analysis',
      prediction: 'BUY',
      author: 'MarketExpert',
      likes: 31
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          📈 Stock Analysis Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Share technical analysis, get stock predictions, and connect with traders
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/register"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/login"
          >
            Login
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
        Why Choose Our Platform?
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

      {/* Sample Analyses */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
        Latest Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {sampleAnalyses.map((analysis, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    ${analysis.symbol}
                  </Typography>
                  <Chip 
                    label={analysis.prediction} 
                    color={analysis.prediction === 'BUY' ? 'success' : analysis.prediction === 'SELL' ? 'error' : 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="body1" gutterBottom>
                  {analysis.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    by {analysis.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    👍 {analysis.likes}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CTA Section */}
      <Box textAlign="center" sx={{ mt: 6, p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Start Trading Smarter?
        </Typography>
        <Typography variant="h6" paragraph>
          Join our community of traders and start sharing your analysis today!
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={Link} 
          to="/register"
          sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
        >
          Join Now - It's Free!
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
