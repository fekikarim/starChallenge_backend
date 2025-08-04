
const Participant = require('../models/Participant');
const Performance = require('../models/Performance');
const Critere = require('../models/Critere');

/**
 * Services pour les participants.
 */
class ParticipantService {

    /**
     * Calcule et met à jour le score total d'un participant.
     * Le score est basé sur les performances et les critères du challenge.
     * @param {string} participantId - L'ID du participant.
     * @returns {Promise<number>} - Le score total calculé.
     */
    static async calculerScoreTotal(participantId) {
        try {
            const participant = await Participant.getById(participantId);
            if (!participant) throw new Error("Participant non trouvé.");

            const performances = await new Promise((resolve, reject) => {
                const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
                db.all('SELECT * FROM Performance WHERE participantId = ?', [participantId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
                db.close();
            });

            const criteres = await new Promise((resolve, reject) => {
                const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
                db.all('SELECT * FROM Critere WHERE challengeId = ?', [participant.challengeId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
                db.close();
            });

            let scoreTotal = 0;
            // Créer un map des critères pour une recherche plus rapide
            const critereMap = new Map(criteres.map(c => [c.id, c]));
            const missingCriteres = new Set();

            for (const perf of performances) {
                // Utiliser le champ critereId direct ou essayer de le parser depuis details
                let critereId = perf.critereId;
                if (!critereId && perf.details) {
                    try {
                        const parsedDetails = JSON.parse(perf.details);
                        critereId = parsedDetails.critereId;
                    } catch (e) {
                        // Ignorer si details n'est pas du JSON valide
                    }
                }

                const critere = critereMap.get(critereId);
                if (critere) {
                    const contribution = perf.valeur * critere.poids;
                    scoreTotal += contribution;
                    console.log(`[ParticipantService] Performance ${perf.id}: valeur=${perf.valeur}, poids=${critere.poids}, contribution=${contribution}`);
                } else if (critereId && !missingCriteres.has(critereId)) {
                    missingCriteres.add(critereId);
                    console.warn(`[ParticipantService] Critère non trouvé pour l'ID: ${critereId}`);
                }
            }

            if (missingCriteres.size > 0) {
                console.warn(`[ParticipantService] ${missingCriteres.size} critères manquants détectés pour le participant ${participantId}`);
            }

            await Participant.update(participantId, { scoreTotal });
            return scoreTotal;
        } catch (error) {
            console.error("Erreur lors du calcul du score total:", error);
            return 0;
        }
    }
}

module.exports = ParticipantService;
