const express = require('express');
const router = express.Router();
const ClassementController = require('../controllers/classementController');

/**
 * @route   GET /api/classement/:challengeId
 * @desc    Récupérer le classement en temps réel d'un challenge
 * @access  Public
 */
router.get('/:challengeId', ClassementController.getClassementTempsReel);

/**
 * @route   GET /api/classement/:challengeId/stats
 * @desc    Récupérer les statistiques de classement d'un challenge
 * @access  Public
 */
router.get('/:challengeId/stats', ClassementController.getStatistiquesClassement);

module.exports = router;
