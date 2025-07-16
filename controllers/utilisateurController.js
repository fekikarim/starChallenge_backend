const Utilisateur = require('../models/Utilisateur');
const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

/**
 * Contrôleur pour les utilisateurs.
 */
class UtilisateurController {

    /**
     * Gère la connexion d'un utilisateur.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async login(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, motDePasse } = req.body;
        try {
            const utilisateur = await AuthService.verifierLogin(email, motDePasse);
            if (!utilisateur) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            }
            const payload = {
                utilisateur: {
                    id: utilisateur.id,
                    role: utilisateur.role
                }
            };
            const token = jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
            res.status(200).json({ message: 'Connexion réussie', token, utilisateur });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Crée un nouvel utilisateur.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, nom, email, motDePasse, role } = req.body;
        try {
            const motDePasseHash = await bcrypt.hash(motDePasse, 10);
            const nouvelUtilisateur = new Utilisateur(id, nom, email, motDePasseHash, role);
            await Utilisateur.add(nouvelUtilisateur);
            res.status(201).json({ message: 'Utilisateur créé avec succès', utilisateur: nouvelUtilisateur });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère tous les utilisateurs.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getAll(req, res, next) {
        try {
            const utilisateurs = await Utilisateur.getAll(); // Supposons que Utilisateur.getAll() existe
            res.status(200).json(utilisateurs);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère un utilisateur par son ID.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getById(req, res, next) {
        try {
            const utilisateur = await Utilisateur.getById(req.params.id);
            if (!utilisateur) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            res.status(200).json(utilisateur);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Met à jour un utilisateur.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async update(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            await Utilisateur.update(req.params.id, req.body);
            res.status(200).json({ message: 'Utilisateur mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Supprime un utilisateur.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async delete(req, res, next) {
        try {
            await Utilisateur.delete(req.params.id);
            res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UtilisateurController;