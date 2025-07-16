const Challenge = require('../models/Challenge');
const ChallengeService = require('../services/challengeService');
const { validationResult } = require('express-validator');

/**
 * Contrôleur pour les challenges.
 */
class ChallengeController {

    /**
     * Crée un nouveau challenge.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, nom, dateDebut, dateFin, statut, createurId } = req.body;
        try {
            const nouveauChallenge = new Challenge(id, nom, dateDebut, dateFin, statut, createurId);
            await Challenge.add(nouveauChallenge);
            res.status(201).json({ message: 'Challenge créé avec succès', challenge: nouveauChallenge });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère tous les challenges.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getAll(req, res, next) {
        try {
            const challenges = await Challenge.getAll();
            res.status(200).json(challenges);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère un challenge par son ID.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getById(req, res, next) {
        try {
            const challenge = await Challenge.getById(req.params.id);
            if (!challenge) {
                return res.status(404).json({ message: 'Challenge non trouvé.' });
            }
            res.status(200).json(challenge);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Met à jour un challenge.
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
            await Challenge.update(req.params.id, req.body);
            res.status(200).json({ message: 'Challenge mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Supprime un challenge.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async delete(req, res, next) {
        try {
            await Challenge.delete(req.params.id);
            res.status(200).json({ message: 'Challenge supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère le classement d'un challenge.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getClassement(req, res, next) {
        const { id } = req.params;
        try {
            const classement = await ChallengeService.calculerClassement(id);
            res.status(200).json(classement);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Détermine les gagnants d'un challenge.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getGagnants(req, res, next) {
        const { id } = req.params;
        try {
            const gagnants = await ChallengeService.determinerGagnants(id);
            res.status(200).json(gagnants);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ChallengeController;