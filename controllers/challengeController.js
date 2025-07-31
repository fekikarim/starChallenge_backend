const Challenge = require('../models/Challenge');
const ChallengeService = require('../services/challengeService');
const { validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

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
     * Récupère les challenges avec détails pour l'application mobile
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getChallengesForApp(req, res, next) {
        const { status, userId } = req.query;

        try {
            const getChallengesWithDetails = () => {
                return new Promise((resolve, reject) => {
                    let query = `
                        SELECT
                            c.id,
                            c.nom,
                            c.dateDebut,
                            c.dateFin,
                            c.statut,
                            c.createurId,
                            c.created_at,
                            COUNT(DISTINCT p.id) as participantsCount,
                            COUNT(DISTINCT g.id) as winnersCount,
                            CASE
                                WHEN up.id IS NOT NULL THEN 1
                                ELSE 0
                            END as isParticipating
                        FROM Challenge c
                        LEFT JOIN Participant p ON c.id = p.challengeId
                        LEFT JOIN Gagnant g ON c.id = g.challengeId
                        LEFT JOIN Participant up ON c.id = up.challengeId AND up.utilisateurId = ?
                        WHERE 1=1
                    `;

                    const params = [userId || ''];

                    if (status) {
                        query += ` AND c.statut = ?`;
                        params.push(status);
                    }

                    query += `
                        GROUP BY c.id, c.nom, c.dateDebut, c.dateFin, c.statut, c.createurId, c.created_at, up.id
                        ORDER BY
                            CASE c.statut
                                WHEN 'en_cours' THEN 1
                                WHEN 'en_attente' THEN 2
                                WHEN 'termine' THEN 3
                                ELSE 4
                            END,
                            c.dateDebut DESC
                    `;

                    db.all(query, params, (err, rows) => {
                        if (err) {
                            console.error('Error fetching challenges:', err);
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    });
                });
            };

            const challenges = await getChallengesWithDetails();

            // Enrichir les données avec le statut calculé
            const enrichedChallenges = challenges.map(challenge => {
                const now = new Date();
                const startDate = new Date(challenge.dateDebut);
                const endDate = new Date(challenge.dateFin);

                let calculatedStatus = challenge.statut;
                if (challenge.statut === 'en_attente' && now >= startDate) {
                    calculatedStatus = 'en_cours';
                } else if (challenge.statut === 'en_cours' && now > endDate) {
                    calculatedStatus = 'termine';
                }

                return {
                    ...challenge,
                    statut: calculatedStatus,
                    participantsCount: parseInt(challenge.participantsCount),
                    winnersCount: parseInt(challenge.winnersCount),
                    isParticipating: Boolean(challenge.isParticipating),
                    daysRemaining: calculatedStatus === 'en_cours' ?
                        Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))) : null
                };
            });

            res.status(200).json({
                success: true,
                data: enrichedChallenges
            });
        } catch (error) {
            console.error('Error in getChallengesForApp:', error);
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