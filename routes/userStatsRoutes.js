const express = require('express');
const router = express.Router();
const UserStatsController = require('../controllers/userStatsController');
const auth = require('../middleware/authMiddleware');

/**
 * @route   GET /api/user-stats/overview/:userId
 * @desc    Obtenir l'aperçu rapide d'un utilisateur
 * @access  Privé
 */
router.get('/overview/:userId', UserStatsController.getOverview);

/**
 * @route   GET /api/user-stats/activities/:userId
 * @desc    Obtenir les activités récentes d'un utilisateur
 * @access  Privé
 * @query   {number} limit - Nombre d'activités à retourner (défaut: 10)
 */
router.get('/activities/:userId', UserStatsController.getRecentActivities);

/**
 * @route   GET /api/user-stats/achievements/:userId
 * @desc    Obtenir les accomplissements d'un utilisateur
 * @access  Privé
 */
router.get('/achievements/:userId', UserStatsController.getAchievements);

module.exports = router;
