
const Challenge = require('../models/Challenge');
const Participant = require('../models/Participant');
const Gagnant = require('../models/Gagnant');

/**
 * Services pour les challenges.
 */
class ChallengeService {

    /**
     * Calcule le classement des participants à un challenge en fonction de leur score.
     * @param {string} challengeId - L'ID du challenge.
     * @returns {Promise<Object[]>} - Une liste de participants classés avec leurs informations utilisateur.
     */
    static async calculerClassement(challengeId) {
        try {
            const classement = await new Promise((resolve, reject) => {
                const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
                const sql = `
                    SELECT
                        U.nom,
                        P.scoreTotal,
                        P.id as participantId,
                        P.utilisateurId,
                        P.challengeId,
                        P.isValidated,
                        U.email,
                        U.role,
                        ROW_NUMBER() OVER (ORDER BY P.scoreTotal DESC) as rang
                    FROM
                        Participant P
                    JOIN
                        Utilisateur U ON U.id = P.utilisateurId
                    WHERE
                        P.challengeId = ?
                    ORDER BY
                        P.scoreTotal DESC
                `;
                db.all(sql, [challengeId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
                db.close();
            });
            return classement;
        } catch (error) {
            console.error("Erreur lors du calcul du classement:", error);
            return [];
        }
    }

    /**
     * Détermine les gagnants d'un challenge et les enregistre.
     * @param {string} challengeId - L'ID du challenge.
     * @param {number} nombreGagnants - Le nombre de gagnants à déterminer.
     * @returns {Promise<Gagnant[]>} - La liste des gagnants.
     */
    static async determinerGagnants(challengeId, nombreGagnants = 3) {
        try {
            const classement = await this.calculerClassement(challengeId);
            const gagnants = classement.slice(0, nombreGagnants);
            const resultats = [];

            for (let i = 0; i < gagnants.length; i++) {
                const gagnant = new Gagnant(Date.now().toString(), gagnants[i].utilisateurId, challengeId, i + 1);
                await Gagnant.add(gagnant);
                resultats.push(gagnant);
            }
            return resultats;
        } catch (error) {
            console.error("Erreur lors de la détermination des gagnants:", error);
            return [];
        }
    }
}

module.exports = ChallengeService;
