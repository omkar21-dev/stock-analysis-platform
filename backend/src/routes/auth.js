const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock users database - replace with actual database
let users = [];
// Store password reset tokens temporarily
let resetTokens = [];

// Register user
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // Create JWT token
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      token, 
      user: { id: user.id, username, email },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, email: user.email },
      message: 'Login successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Request reset
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.',
        success: true
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Store reset token (in production, store in database)
    resetTokens = resetTokens.filter(token => token.email !== email); // Remove old tokens
    resetTokens.push({
      email,
      token: resetToken,
      expires: resetTokenExpiry,
      used: false
    });

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL: http://localhost:3001/reset-password?token=${resetToken}`);

    res.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.',
      success: true,
      // For demo purposes, include the token (remove in production)
      resetToken: resetToken,
      resetUrl: `http://localhost:3001/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password - Verify token and reset
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find reset token
    const resetTokenData = resetTokens.find(t => t.token === token && !t.used);
    if (!resetTokenData) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (Date.now() > resetTokenData.expires) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Find user
    const user = users.find(u => u.email === resetTokenData.email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;
    user.passwordResetAt = new Date().toISOString();

    // Mark token as used
    resetTokenData.used = true;

    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.',
      success: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset token (for frontend validation)
router.get('/verify-reset-token/:token', (req, res) => {
  try {
    const { token } = req.params;

    const resetTokenData = resetTokens.find(t => t.token === token && !t.used);
    if (!resetTokenData) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid reset token' 
      });
    }

    if (Date.now() > resetTokenData.expires) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Reset token has expired' 
      });
    }

    res.json({ 
      valid: true, 
      email: resetTokenData.email,
      message: 'Token is valid' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({ 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    } 
  });
});

module.exports = router;
