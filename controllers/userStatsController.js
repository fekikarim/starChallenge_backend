const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Contrôleur pour les statistiques utilisateur personnalisées
 */
class UserStatsController {
    
    /**
     * Obtenir l'aperçu rapide pour un utilisateur
     * @route GET /api/user-stats/overview/:userId
     */
    static async getOverview(req, res, next) {
        const { userId } = req.params;
        
        try {
            // Obtenir les statistiques de base de l'utilisateur
            const userStats = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT 
                        u.id,
                        u.nom,
                        u.email,
                        u.role,
                        u.created_at,
                        COALESCE(SUM(e.total), 0) as totalEtoiles,
                        COUNT(DISTINCT p.challengeId) as challengesParticipes,
                        COUNT(DISTINCT g.challengeId) as challengesGagnes
                    FROM Utilisateur u
                    LEFT JOIN Etoile e ON u.id = e.utilisateurId
                    LEFT JOIN Participant p ON u.id = p.utilisateurId
                    LEFT JOIN Gagnant g ON u.id = g.utilisateurId
                    WHERE u.id = ?
                    GROUP BY u.id
                `, [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!userStats) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            // Obtenir le palier actuel
            const currentLevel = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT * FROM Palier 
                    WHERE etoilesMin <= ? 
                    ORDER BY etoilesMin DESC 
                    LIMIT 1
                `, [userStats.totalEtoiles], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            // Obtenir le prochain palier
            const nextLevel = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT * FROM Palier 
                    WHERE etoilesMin > ? 
                    ORDER BY etoilesMin ASC 
                    LIMIT 1
                `, [userStats.totalEtoiles], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            // Obtenir les challenges actifs
            const activeChallenges = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT COUNT(*) as count
                    FROM Challenge c
                    INNER JOIN Participant p ON c.id = p.challengeId
                    WHERE p.utilisateurId = ? 
                    AND c.statut = 'en_cours'
                    AND DATE(c.dateFin) >= DATE('now')
                `, [userId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0]?.count || 0);
                });
            });

            // Obtenir les étoiles gagnées cette semaine
            const weeklyStars = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COALESCE(SUM(total), 0) as total
                    FROM Etoile 
                    WHERE utilisateurId = ? 
                    AND DATE(dateAttribution) >= DATE('now', '-7 days')
                `, [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row?.total || 0);
                });
            });

            // Calculer le pourcentage de progression vers le prochain palier
            let progressPercentage = 100;
            if (nextLevel) {
                const starsNeeded = nextLevel.etoilesMin - userStats.totalEtoiles;
                const totalStarsForLevel = nextLevel.etoilesMin - (currentLevel?.etoilesMin || 0);
                progressPercentage = Math.max(0, Math.min(100, 
                    ((userStats.totalEtoiles - (currentLevel?.etoilesMin || 0)) / totalStarsForLevel) * 100
                ));
            }

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: userStats.id,
                        nom: userStats.nom,
                        email: userStats.email,
                        role: userStats.role,
                        createdAt: userStats.created_at
                    },
                    stats: {
                        totalEtoiles: parseInt(userStats.totalEtoiles),
                        challengesParticipes: parseInt(userStats.challengesParticipes),
                        challengesGagnes: parseInt(userStats.challengesGagnes),
                        challengesActifs: parseInt(activeChallenges),
                        etoilesSemaine: parseInt(weeklyStars),
                        tauxReussite: userStats.challengesParticipes > 0 
                            ? Math.round((userStats.challengesGagnes / userStats.challengesParticipes) * 100)
                            : 0
                    },
                    level: {
                        current: currentLevel || { nom: 'Débutant', etoilesMin: 0 },
                        next: nextLevel,
                        progress: Math.round(progressPercentage),
                        starsToNext: nextLevel ? nextLevel.etoilesMin - userStats.totalEtoiles : 0
                    }
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération de l\'aperçu utilisateur:', error);
            next(error);
        }
    }

    /**
     * Obtenir les activités récentes d'un utilisateur
     * @route GET /api/user-stats/activities/:userId
     */
    static async getRecentActivities(req, res, next) {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        try {
            const activities = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        'etoile' as type,
                        e.id,
                        e.total as value,
                        e.raison as description,
                        e.dateAttribution as date,
                        e.created_at,
                        NULL as challengeNom
                    FROM Etoile e
                    WHERE e.utilisateurId = ?
                    
                    UNION ALL
                    
                    SELECT 
                        'participation' as type,
                        p.id,
                        p.scoreTotal as value,
                        'Participation au challenge' as description,
                        c.dateDebut as date,
                        p.created_at,
                        c.nom as challengeNom
                    FROM Participant p
                    INNER JOIN Challenge c ON p.challengeId = c.id
                    WHERE p.utilisateurId = ?
                    
                    UNION ALL
                    
                    SELECT 
                        'victoire' as type,
                        g.id,
                        g.classement as value,
                        'Victoire dans un challenge' as description,
                        c.dateFin as date,
                        g.created_at,
                        c.nom as challengeNom
                    FROM Gagnant g
                    INNER JOIN Challenge c ON g.challengeId = c.id
                    WHERE g.utilisateurId = ?
                    
                    ORDER BY created_at DESC
                    LIMIT ?
                `, [userId, userId, userId, parseInt(limit)], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            res.status(200).json({
                success: true,
                data: activities.map(activity => ({
                    id: activity.id,
                    type: activity.type,
                    value: activity.value,
                    description: activity.description,
                    challengeNom: activity.challengeNom,
                    date: activity.date,
                    createdAt: activity.created_at
                }))
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des activités:', error);
            next(error);
        }
    }

    /**
     * Obtenir les accomplissements d'un utilisateur
     * @route GET /api/user-stats/achievements/:userId
     */
    static async getAchievements(req, res, next) {
        const { userId } = req.params;

        try {
            // Obtenir les récompenses obtenues
            const rewards = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        r.id,
                        r.type,
                        r.description,
                        r.dateAttribution,
                        p.nom as palierNom,
                        p.etoilesMin
                    FROM Recompense r
                    INNER JOIN Palier p ON r.palierId = p.id
                    INNER JOIN (
                        SELECT SUM(total) as userStars
                        FROM Etoile 
                        WHERE utilisateurId = ?
                    ) us ON p.etoilesMin <= us.userStars
                    ORDER BY r.dateAttribution DESC
                `, [userId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            // Obtenir les badges spéciaux basés sur les performances
            const specialBadges = [];
            
            // Badge "Premier challenge"
            const firstChallenge = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT MIN(created_at) as firstParticipation
                    FROM Participant 
                    WHERE utilisateurId = ?
                `, [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (firstChallenge?.firstParticipation) {
                specialBadges.push({
                    id: 'first_challenge',
                    type: 'badge',
                    description: 'Premier challenge complété',
                    dateAttribution: firstChallenge.firstParticipation,
                    icon: '🏆'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    rewards: rewards,
                    specialBadges: specialBadges,
                    total: rewards.length + specialBadges.length
                }
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des accomplissements:', error);
            next(error);
        }
    }
}

module.exports = UserStatsController;
