
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
            for (const perf of performances) {
                const critere = criteres.find(c => c.id === perf.details.critereId); // Supposant que details contient critereId
                if (critere) {
                    scoreTotal += perf.valeur * critere.poids;
                }
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
