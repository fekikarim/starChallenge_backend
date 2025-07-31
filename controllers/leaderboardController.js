const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Contrôleur pour les classements
 */
class LeaderboardController {
    
    /**
     * Obtenir le classement global
     * @route GET /api/leaderboard/global
     */
    static async getGlobalLeaderboard(req, res, next) {
        const { limit = 50 } = req.query;

        try {
            const leaderboard = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        u.id,
                        u.nom,
                        u.email,
                        u.role,
                        COALESCE(SUM(e.total), 0) as totalEtoiles,
                        COUNT(DISTINCT p.challengeId) as challengesParticipes,
                        COUNT(DISTINCT g.challengeId) as challengesGagnes,
                        ROUND(
                            CASE 
                                WHEN COUNT(DISTINCT p.challengeId) > 0 
                                THEN (COUNT(DISTINCT g.challengeId) * 100.0 / COUNT(DISTINCT p.challengeId))
                                ELSE 0 
                            END, 1
                        ) as tauxReussite,
                        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.total), 0) DESC) as rang
                    FROM Utilisateur u
                    LEFT JOIN Etoile e ON u.id = e.utilisateurId
                    LEFT JOIN Participant p ON u.id = p.utilisateurId
                    LEFT JOIN Gagnant g ON u.id = g.utilisateurId
                    WHERE u.role != 'admin'
                    GROUP BY u.id, u.nom, u.email, u.role
                    ORDER BY totalEtoiles DESC, challengesGagnes DESC
                    LIMIT ?
                `, [parseInt(limit)], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            res.status(200).json({
                success: true,
                data: {
                    type: 'global',
                    period: 'all_time',
                    leaderboard: leaderboard.map(user => ({
                        rang: user.rang,
                        utilisateur: {
                            id: user.id,
                            nom: user.nom,
                            email: user.email,
                            role: user.role
                        },
                        stats: {
                            totalEtoiles: parseInt(user.totalEtoiles),
                            challengesParticipes: parseInt(user.challengesParticipes),
                            challengesGagnes: parseInt(user.challengesGagnes),
                            tauxReussite: parseFloat(user.tauxReussite)
                        }
                    }))
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du classement global:', error);
            next(error);
        }
    }

    /**
     * Obtenir le classement hebdomadaire
     * @route GET /api/leaderboard/weekly
     */
    static async getWeeklyLeaderboard(req, res, next) {
        const { limit = 50 } = req.query;

        try {
            const leaderboard = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        u.id,
                        u.nom,
                        u.email,
                        u.role,
                        COALESCE(SUM(e.total), 0) as etoilesSemaine,
                        COUNT(DISTINCT CASE 
                            WHEN DATE(p.created_at) >= DATE('now', '-7 days') 
                            THEN p.challengeId 
                        END) as challengesSemaine,
                        COUNT(DISTINCT CASE 
                            WHEN DATE(g.created_at) >= DATE('now', '-7 days') 
                            THEN g.challengeId 
                        END) as victoiresSemaine,
                        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.total), 0) DESC) as rang
                    FROM Utilisateur u
                    LEFT JOIN Etoile e ON u.id = e.utilisateurId 
                        AND DATE(e.dateAttribution) >= DATE('now', '-7 days')
                    LEFT JOIN Participant p ON u.id = p.utilisateurId
                    LEFT JOIN Gagnant g ON u.id = g.utilisateurId
                    WHERE u.role != 'admin'
                    GROUP BY u.id, u.nom, u.email, u.role
                    HAVING etoilesSemaine > 0
                    ORDER BY etoilesSemaine DESC, victoiresSemaine DESC
                    LIMIT ?
                `, [parseInt(limit)], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            res.status(200).json({
                success: true,
                data: {
                    type: 'weekly',
                    period: 'last_7_days',
                    leaderboard: leaderboard.map(user => ({
                        rang: user.rang,
                        utilisateur: {
                            id: user.id,
                            nom: user.nom,
                            email: user.email,
                            role: user.role
                        },
                        stats: {
                            etoilesSemaine: parseInt(user.etoilesSemaine),
                            challengesSemaine: parseInt(user.challengesSemaine),
                            victoiresSemaine: parseInt(user.victoiresSemaine)
                        }
                    }))
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du classement hebdomadaire:', error);
            next(error);
        }
    }

    /**
     * Obtenir le classement mensuel
     * @route GET /api/leaderboard/monthly
     */
    static async getMonthlyLeaderboard(req, res, next) {
        const { limit = 50 } = req.query;

        try {
            const leaderboard = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        u.id,
                        u.nom,
                        u.email,
                        u.role,
                        COALESCE(SUM(e.total), 0) as etoilesMois,
                        COUNT(DISTINCT CASE 
                            WHEN DATE(p.created_at) >= DATE('now', '-30 days') 
                            THEN p.challengeId 
                        END) as challengesMois,
                        COUNT(DISTINCT CASE 
                            WHEN DATE(g.created_at) >= DATE('now', '-30 days') 
                            THEN g.challengeId 
                        END) as victoiresMois,
                        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.total), 0) DESC) as rang
                    FROM Utilisateur u
                    LEFT JOIN Etoile e ON u.id = e.utilisateurId 
                        AND DATE(e.dateAttribution) >= DATE('now', '-30 days')
                    LEFT JOIN Participant p ON u.id = p.utilisateurId
                    LEFT JOIN Gagnant g ON u.id = g.utilisateurId
                    WHERE u.role != 'admin'
                    GROUP BY u.id, u.nom, u.email, u.role
                    HAVING etoilesMois > 0
                    ORDER BY etoilesMois DESC, victoiresMois DESC
                    LIMIT ?
                `, [parseInt(limit)], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            res.status(200).json({
                success: true,
                data: {
                    type: 'monthly',
                    period: 'last_30_days',
                    leaderboard: leaderboard.map(user => ({
                        rang: user.rang,
                        utilisateur: {
                            id: user.id,
                            nom: user.nom,
                            email: user.email,
                            role: user.role
                        },
                        stats: {
                            etoilesMois: parseInt(user.etoilesMois),
                            challengesMois: parseInt(user.challengesMois),
                            victoiresMois: parseInt(user.victoiresMois)
                        }
                    }))
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération du classement mensuel:', error);
            next(error);
        }
    }

    /**
     * Obtenir la position d'un utilisateur dans le classement
     * @route GET /api/leaderboard/position/:userId
     */
    static async getUserPosition(req, res, next) {
        const { userId } = req.params;
        const { type = 'global' } = req.query;

        try {
            let query;
            let params = [userId];

            switch (type) {
                case 'weekly':
                    query = `
                        WITH RankedUsers AS (
                            SELECT 
                                u.id,
                                u.nom,
                                COALESCE(SUM(e.total), 0) as score,
                                ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.total), 0) DESC) as rang
                            FROM Utilisateur u
                            LEFT JOIN Etoile e ON u.id = e.utilisateurId 
                                AND DATE(e.dateAttribution) >= DATE('now', '-7 days')
                            WHERE u.role != 'admin'
                            GROUP BY u.id, u.nom
                        )
                        SELECT rang, score FROM RankedUsers WHERE id = ?
                    `;
                    break;
                case 'monthly':
                    query = `
                        WITH RankedUsers AS (
                            SELECT 
                                u.id,
                                u.nom,
                                COALESCE(SUM(e.total), 0) as score,
                                ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.total), 0) DESC) as rang
                            FROM Utilisateur u
                            LEFT JOIN Etoile e ON u.id = e.utilisateurId 
                                AND DATE(e.dateAttribution) >= DATE('now', '-30 days')
                            WHERE u.role != 'admin'
                            GROUP BY u.id, u.nom
                        )
                        SELECT rang, score FROM RankedUsers WHERE id = ?
                    `;
                    break;
                default: // global
                    query = `
                        WITH RankedUsers AS (
                            SELECT 
                                u.id,
                                u.nom,
                                COALESCE(SUM(e.total), 0) as score,
                                ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(e.total), 0) DESC) as rang
                            FROM Utilisateur u
                            LEFT JOIN Etoile e ON u.id = e.utilisateurId
                            WHERE u.role != 'admin'
                            GROUP BY u.id, u.nom
                        )
                        SELECT rang, score FROM RankedUsers WHERE id = ?
                    `;
            }

            const position = await new Promise((resolve, reject) => {
                db.get(query, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!position) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Utilisateur non trouvé dans le classement' 
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    userId: userId,
                    type: type,
                    position: parseInt(position.rang),
                    score: parseInt(position.score)
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de la position:', error);
            next(error);
        }
    }
}

module.exports = LeaderboardController;
