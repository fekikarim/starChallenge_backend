const express = require('express');
const router = express.Router();
const ChallengeController = require('../controllers/challengeController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

/**
 * @route   POST /api/challenges
 * @desc    Créer un nouveau challenge
 * @access  Privé (Admin)
 */
router.post('/', auth, [
    body('id', 'L\'ID est requis').notEmpty(),
    body('nom', 'Le nom est requis').notEmpty(),
    body('dateDebut', 'La date de début est requise').isISO8601().toDate(),
    body('dateFin', 'La date de fin est requise').isISO8601().toDate(),
    body('statut', 'Le statut est requis').notEmpty(),
    body('createurId', 'L\'ID du créateur est requis').notEmpty()
], ChallengeController.create);

/**
 * @route   GET /api/challenges
 * @desc    Récupérer tous les challenges
 * @access  Public
 */
router.get('/', ChallengeController.getAll);

/**
 * @route   GET /api/challenges/:id
 * @desc    Récupérer un challenge par ID
 * @access  Public
 */
router.get('/:id', ChallengeController.getById);

/**
 * @route   PUT /api/challenges/:id
 * @desc    Mettre à jour un challenge
 * @access  Privé
 */
router.put('/:id', auth, ChallengeController.update);

/**
 * @route   DELETE /api/challenges/:id
 * @desc    Supprimer un challenge
 * @access  Privé
 */
router.delete('/:id', auth, ChallengeController.delete);

/**
 * @route   GET /api/challenges/:id/classement
 * @desc    Récupérer le classement d'un challenge
 * @access  Public
 */
router.get('/:id/classement', ChallengeController.getClassement);

/**
 * @route   GET /api/challenges/:id/gagnants
 * @desc    Déterminer les gagnants d'un challenge
 * @access  Public
 */
router.get('/:id/gagnants', ChallengeController.getGagnants);

module.exports = router;