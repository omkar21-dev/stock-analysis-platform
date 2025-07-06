const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const router = express.Router();

// Mock database - replace with actual database operations
let analyses = [];

// Get all analyses
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedAnalyses = analyses.slice(startIndex, endIndex);
    
    res.json({
      analyses: paginatedAnalyses,
      totalPages: Math.ceil(analyses.length / limit),
      currentPage: page,
      total: analyses.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new analysis
router.post('/', 
  auth,
  [
    body('symbol').notEmpty().withMessage('Stock symbol is required'),
    body('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('analysis').isLength({ min: 50 }).withMessage('Analysis must be at least 50 characters'),
    body('prediction').isIn(['BUY', 'SELL', 'HOLD']).withMessage('Invalid prediction'),
    body('targetPrice').isFloat({ min: 0 }).withMessage('Target price must be positive'),
    body('timeframe').notEmpty().withMessage('Timeframe is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newAnalysis = {
        id: Date.now().toString(),
        userId: req.user.id,
        username: req.user.username,
        ...req.body,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };

      analyses.unshift(newAnalysis);
      res.status(201).json(newAnalysis);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get single analysis
router.get('/:id', async (req, res) => {
  try {
    const analysis = analyses.find(a => a.id === req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update analysis
router.put('/:id', auth, async (req, res) => {
  try {
    const analysisIndex = analyses.findIndex(a => a.id === req.params.id);
    if (analysisIndex === -1) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const analysis = analyses[analysisIndex];
    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    analyses[analysisIndex] = { ...analysis, ...req.body, updatedAt: new Date().toISOString() };
    res.json(analyses[analysisIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete analysis
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysisIndex = analyses.findIndex(a => a.id === req.params.id);
    if (analysisIndex === -1) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const analysis = analyses[analysisIndex];
    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    analyses.splice(analysisIndex, 1);
    res.json({ message: 'Analysis deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
