const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Mock users data - replace with actual database
let users = [];

// Get user profile
router.get('/profile', auth, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { username, email } = req.body;
    
    // Check if username/email already exists (excluding current user)
    const existingUser = users.find(u => 
      u.id !== req.user.id && (u.username === username || u.email === email)
    );
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    users[userIndex] = {
      ...users[userIndex],
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's analyses
router.get('/analyses', auth, (req, res) => {
  try {
    // This would typically query the analyses table
    // For now, return empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
