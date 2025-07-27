const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.utilisateur && req.utilisateur.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
};

// Apply auth and admin middleware to all routes
const protectAndAdmin = [authMiddleware, requireAdmin];

// GET /api/stats/overview
router.get('/overview', ...protectAndAdmin, statisticsController.getOverviewStats);

// GET /api/stats/challenges
router.get('/challenges', ...protectAndAdmin, statisticsController.getChallengesStats);

// GET /api/stats/performances
router.get('/performances', ...protectAndAdmin, statisticsController.getPerformanceStats);

// GET /api/stats/recompenses
router.get('/recompenses', ...protectAndAdmin, statisticsController.getRewardsStats);

module.exports = router;
