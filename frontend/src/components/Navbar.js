import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, ShowChart, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Invest Karega India
            <Chip label="Live NSE Data" size="small" color="success" />
          </Link>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<TrendingUp />}
          >
            Home
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/nifty50"
            startIcon={<ShowChart />}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            NIFTY 50
          </Button>
          
          {user ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/dashboard"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/create">
                Create Analysis
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Logout ({user.username})
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
