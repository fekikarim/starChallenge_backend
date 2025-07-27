const express = require('express');
const router = express.Router();
const UtilisateurController = require('../controllers/utilisateurController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

/**
 * @route   GET /api/utilisateurs/check-email
 * @desc    Vérifier si un email est déjà utilisé
 * @access  Public
 * @query   {string} email - L'email à vérifier
 * @query   {string} [excludeId] - ID d'utilisateur à exclure (pour la mise à jour)
 */
router.get('/check-email', UtilisateurController.checkEmail);

/**
 * @route   GET /api/utilisateurs/:id/check-email
 * @desc    Vérifier si un email est déjà utilisé (version avec ID d'exclusion)
 * @access  Public
 * @query   {string} email - L'email à vérifier
 */
router.get('/:id/check-email', UtilisateurController.checkEmail);

/**
 * @route   POST /api/utilisateurs/login
 * @desc    Connecter un utilisateur
 * @access  Public
 */
router.post('/login', [
    body('email', 'Veuillez fournir un email valide').isEmail(),
    body('motDePasse', 'Le mot de passe est requis').notEmpty()
], UtilisateurController.login);

/**
 * @route   POST /api/utilisateurs
 * @desc    Créer un nouvel utilisateur
 * @access  Privé (Admin)
 */
router.post('/', auth, [
    body('id', 'L\'ID est requis').notEmpty(),
    body('nom', 'Le nom est requis').notEmpty(),
    body('email', 'Veuillez fournir un email valide').isEmail(),
    body('motDePasse', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
    body('role', 'Le rôle est requis').notEmpty()
], UtilisateurController.create);

/**
 * @route   GET /api/utilisateurs
 * @desc    Récupérer tous les utilisateurs
 * @access  Privé
 */
router.get('/', auth, UtilisateurController.getAll);

/**
 * @route   GET /api/utilisateurs/:id
 * @desc    Récupérer un utilisateur par ID
 * @access  Privé
 */
router.get('/:id', auth, UtilisateurController.getById);

/**
 * @route   PUT /api/utilisateurs/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Privé
 */
router.put('/:id', auth, UtilisateurController.update);

/**
 * @route   DELETE /api/utilisateurs/:id
 * @desc    Supprimer un utilisateur
 * @access  Privé
 */
router.delete('/:id', auth, UtilisateurController.delete);

module.exports = router;