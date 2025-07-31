const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/authMiddleware');

/**
 * @route   GET /api/leaderboard/global
 * @desc    Obtenir le classement global
 * @access  Privé
 * @query   {number} limit - Nombre d'utilisateurs à retourner (défaut: 50)
 */
router.get('/global', LeaderboardController.getGlobalLeaderboard);

/**
 * @route   GET /api/leaderboard/weekly
 * @desc    Obtenir le classement hebdomadaire
 * @access  Privé
 * @query   {number} limit - Nombre d'utilisateurs à retourner (défaut: 50)
 */
router.get('/weekly', auth, LeaderboardController.getWeeklyLeaderboard);

/**
 * @route   GET /api/leaderboard/monthly
 * @desc    Obtenir le classement mensuel
 * @access  Privé
 * @query   {number} limit - Nombre d'utilisateurs à retourner (défaut: 50)
 */
router.get('/monthly', auth, LeaderboardController.getMonthlyLeaderboard);

/**
 * @route   GET /api/leaderboard/position/:userId
 * @desc    Obtenir la position d'un utilisateur dans le classement
 * @access  Privé
 * @query   {string} type - Type de classement (global, weekly, monthly)
 */
router.get('/position/:userId', auth, LeaderboardController.getUserPosition);

module.exports = router;
