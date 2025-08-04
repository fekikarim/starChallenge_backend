const Participant = require('../models/Participant');
const { validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

class ParticipantController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, utilisateurId, challengeId, scoreTotal, isValidated } = req.body;
        try {
            const nouveauParticipant = new Participant(id, utilisateurId, challengeId, scoreTotal, isValidated);
            await Participant.add(nouveauParticipant);
            res.status(201).json({ message: 'Participant créé avec succès', participant: nouveauParticipant });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const participants = await Participant.getAll();
            res.status(200).json(participants);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const participant = await Participant.getById(req.params.id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant non trouvé.' });
            }
            res.status(200).json(participant);
        } catch (error) {
            next(error);
        }
    }

    static async getByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const participants = await Participant.getByUser(userId);
            res.status(200).json(participants);
        } catch (error) {
            next(error);
        }
    }

    static async getByUserAndStatus(req, res, next) {
        try {
            const { userId, status } = req.params;
            const participants = await Participant.getByUserAndStatus(userId, status);
            res.status(200).json(participants);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            await Participant.update(req.params.id, req.body);
            res.status(200).json({ message: 'Participant mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Participant.delete(req.params.id);
            res.status(200).json({ message: 'Participant supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Récupère le classement global de tous les participants avec leurs informations de challenge
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getGlobalLeaderboard(req, res, next) {
        const { limit = 100, challengeId } = req.query;

        try {
            const globalLeaderboard = await new Promise((resolve, reject) => {
                let query = `
                    SELECT
                        p.id as participantId,
                        p.utilisateurId,
                        p.challengeId,
                        p.scoreTotal,
                        p.created_at as participantCreatedAt,
                        u.nom as utilisateurNom,
                        u.email as utilisateurEmail,
                        u.role as utilisateurRole,
                        c.nom as challengeNom,
                        c.dateDebut as challengeDateDebut,
                        c.dateFin as challengeDateFin,
                        c.statut as challengeStatut,
                        ROW_NUMBER() OVER (ORDER BY p.scoreTotal DESC, p.created_at ASC) as rang
                    FROM Participant p
                    INNER JOIN Utilisateur u ON p.utilisateurId = u.id
                    INNER JOIN Challenge c ON p.challengeId = c.id
                    WHERE u.role != 'admin'
                `;

                const params = [];

                // Filtrer par challenge si spécifié
                if (challengeId) {
                    query += ` AND p.challengeId = ?`;
                    params.push(challengeId);
                }

                query += `
                    ORDER BY p.scoreTotal DESC, p.created_at ASC
                    LIMIT ?
                `;
                params.push(parseInt(limit));

                db.all(query, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            // Formater les données pour la réponse
            const formattedLeaderboard = globalLeaderboard.map(row => ({
                rang: row.rang,
                participant: {
                    id: row.participantId,
                    utilisateurId: row.utilisateurId,
                    challengeId: row.challengeId,
                    scoreTotal: row.scoreTotal,
                    created_at: row.participantCreatedAt
                },
                utilisateur: {
                    id: row.utilisateurId,
                    nom: row.utilisateurNom,
                    email: row.utilisateurEmail,
                    role: row.utilisateurRole
                },
                challenge: {
                    id: row.challengeId,
                    nom: row.challengeNom,
                    dateDebut: row.challengeDateDebut,
                    dateFin: row.challengeDateFin,
                    statut: row.challengeStatut
                }
            }));

            res.status(200).json({
                success: true,
                data: {
                    type: challengeId ? 'challenge_filtered' : 'global',
                    period: challengeId ? `Challenge: ${formattedLeaderboard[0]?.challenge?.nom || challengeId}` : 'Tous les challenges',
                    leaderboard: formattedLeaderboard,
                    total: formattedLeaderboard.length,
                    challengeFilter: challengeId || null
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du classement global:', error);
            next(error);
        }
    }
}

module.exports = ParticipantController;