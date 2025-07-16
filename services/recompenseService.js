
const Etoile = require('../models/Etoile');
const Palier = require('../models/Palier');
const Recompense = require('../models/Recompense');
const Performance = require('../models/Performance');

/**
 * Services pour les récompenses.
 */
class RecompenseService {

    /**
     * Calcule le nombre d'étoiles à attribuer en fonction d'une performance.
     * @param {string} performanceId - L'ID de la performance.
     * @returns {Promise<number>} - Le nombre d'étoiles calculées.
     */
    static async calculerEtoiles(performanceId) {
        try {
            const performance = await Performance.getById(performanceId);
            if (!performance) throw new Error("Performance non trouvée.");

            // Logique de calcul des étoiles (exemple simple)
            const etoiles = Math.floor(performance.valeur / 10);
            const etoile = new Etoile(Date.now().toString(), etoiles, new Date(), `Performance ${performanceId}`, performance.participantId);
            await Etoile.add(etoile);

            return etoiles;
        } catch (error) {
            console.error("Erreur lors du calcul des étoiles:", error);
            return 0;
        }
    }

    /**
     * Débloque les récompenses si un palier est atteint par un utilisateur.
     * @param {string} utilisateurId - L'ID de l'utilisateur.
     * @returns {Promise<Recompense[]>} - Les récompenses débloquées.
     */
    static async debloquerSiPalierAtteint(utilisateurId) {
        try {
            const etoiles = await new Promise((resolve, reject) => {
                const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
                db.all('SELECT SUM(total) as totalEtoiles FROM Etoile WHERE utilisateurId = ?', [utilisateurId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows[0].totalEtoiles || 0);
                });
                db.close();
            });

            const paliers = await new Promise((resolve, reject) => {
                const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
                db.all('SELECT * FROM Palier WHERE etoilesMin <= ?', [etoiles], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
                db.close();
            });

            const recompensesDebloquees = [];
            for (const palier of paliers) {
                const recompense = new Recompense(Date.now().toString(), 'Badge', `Badge pour le palier ${palier.nom}`, new Date(), palier.id);
                await Recompense.add(recompense);
                recompensesDebloquees.push(recompense);
            }

            return recompensesDebloquees;
        } catch (error) {
            console.error("Erreur lors du déblocage des récompenses:", error);
            return [];
        }
    }
}

module.exports = RecompenseService;
