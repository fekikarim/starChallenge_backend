const ChallengeService = require('../services/challengeService');
const ParticipantService = require('../services/participantService');

/**
 * Contrôleur pour la gestion des classements en temps réel.
 */
class ClassementController {

    /**
     * Récupère le classement en temps réel d'un challenge.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getClassementTempsReel(req, res, next) {
        const { challengeId } = req.params;
        try {
            console.log(`[ClassementController] Récupération du classement pour le challenge: ${challengeId}`);
            
            // Recalculer les scores de tous les participants avant de retourner le classement
            await ClassementController.recalculerTousLesScores(challengeId);
            
            // Récupérer le classement mis à jour
            const classement = await ChallengeService.calculerClassement(challengeId);
            
            console.log(`[ClassementController] Classement récupéré: ${classement.length} participants`);
            res.status(200).json({
                success: true,
                challengeId: challengeId,
                classement: classement,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[ClassementController] Erreur lors de la récupération du classement:', error);
            next(error);
        }
    }

    /**
     * Recalcule les scores de tous les participants d'un challenge.
     * @param {string} challengeId - L'ID du challenge.
     */
    static async recalculerTousLesScores(challengeId) {
        try {
            console.log(`[ClassementController] Recalcul des scores pour le challenge: ${challengeId}`);
            
            // Récupérer tous les participants du challenge
            const participants = await new Promise((resolve, reject) => {
                const sqlite3 = require('sqlite3').verbose();
                const db = new sqlite3.Database('./database/starchallenge.db');
                db.all('SELECT id FROM Participant WHERE challengeId = ?', [challengeId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
                db.close();
            });

            // Recalculer le score de chaque participant
            for (const participant of participants) {
                await ParticipantService.calculerScoreTotal(participant.id);
            }
            
            console.log(`[ClassementController] Scores recalculés pour ${participants.length} participants`);
        } catch (error) {
            console.error('[ClassementController] Erreur lors du recalcul des scores:', error);
            throw error;
        }
    }

    /**
     * Met à jour le classement après un changement de performance.
     * @param {string} participantId - L'ID du participant concerné.
     */
    static async mettreAJourClassement(participantId) {
        try {
            console.log(`[ClassementController] Mise à jour du classement pour le participant: ${participantId}`);
            
            // Recalculer le score du participant
            const nouveauScore = await ParticipantService.calculerScoreTotal(participantId);
            
            console.log(`[ClassementController] Nouveau score calculé: ${nouveauScore}`);
            return nouveauScore;
        } catch (error) {
            console.error('[ClassementController] Erreur lors de la mise à jour du classement:', error);
            throw error;
        }
    }

    /**
     * Récupère les statistiques de classement pour un challenge.
     * @param {import('express').Request} req - La requête Express.
     * @param {import('express').Response} res - La réponse Express.
     * @param {import('express').NextFunction} next - Le middleware suivant.
     */
    static async getStatistiquesClassement(req, res, next) {
        const { challengeId } = req.params;
        try {
            const classement = await ChallengeService.calculerClassement(challengeId);
            
            const stats = {
                totalParticipants: classement.length,
                scoreMax: classement.length > 0 ? classement[0].scoreTotal : 0,
                scoreMin: classement.length > 0 ? classement[classement.length - 1].scoreTotal : 0,
                scoreMoyen: classement.length > 0 
                    ? classement.reduce((sum, p) => sum + p.scoreTotal, 0) / classement.length 
                    : 0,
                derniereMiseAJour: new Date().toISOString()
            };

            res.status(200).json({
                success: true,
                challengeId: challengeId,
                statistiques: stats
            });
        } catch (error) {
            console.error('[ClassementController] Erreur lors de la récupération des statistiques:', error);
            next(error);
        }
    }
}

module.exports = ClassementController;
