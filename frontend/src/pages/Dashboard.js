import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Add, TrendingUp, Analytics } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Analyses', value: '12', icon: <Analytics /> },
    { label: 'Successful Predictions', value: '8', icon: <TrendingUp /> },
    { label: 'Followers', value: '24', icon: <TrendingUp /> }
  ];

  const recentAnalyses = [
    {
      id: 1,
      symbol: 'AAPL',
      title: 'Apple Bullish Breakout Pattern',
      prediction: 'BUY',
      date: '2025-01-05',
      likes: 15
    },
    {
      id: 2,
      symbol: 'TSLA',
      title: 'Tesla Support Level Analysis',
      prediction: 'HOLD',
      date: '2025-01-04',
      likes: 8
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.username}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your trading analysis dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Actions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/create"
          size="large"
        >
          Create New Analysis
        </Button>
      </Box>

      {/* Recent Analyses */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Recent Analyses
        </Typography>
        <Grid container spacing={3}>
          {recentAnalyses.map((analysis) => (
            <Grid item xs={12} md={6} key={analysis.id}>
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
                      {analysis.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      👍 {analysis.likes} likes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
