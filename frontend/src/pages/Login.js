import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Box,
  Link as MuiLink,
  Divider
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LockOpen, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a success message from password reset
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Person sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to Invest Karega India
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
          />
          
          <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
            <MuiLink 
              component={Link} 
              to="/forgot-password" 
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Forgot Password?
            </MuiLink>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<LockOpen />}
            sx={{ mt: 2, mb: 2 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }} />

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Don't have an account?
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            fullWidth
            sx={{ mt: 1 }}
          >
            Create New Account
          </Button>
        </Box>

        <Box textAlign="center" sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Having trouble logging in?{' '}
            <MuiLink 
              component={Link} 
              to="/forgot-password" 
              variant="body2"
              color="primary"
            >
              Reset your password
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
