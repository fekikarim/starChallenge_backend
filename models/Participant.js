
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente un participant à un challenge.
 */
class Participant {
    /**
     * @param {string} id - L'identifiant unique du participant.
     * @param {string} utilisateurId - L'ID de l'utilisateur participant.
     * @param {string} challengeId - L'ID du challenge auquel l'utilisateur participe.
     * @param {number} scoreTotal - Le score total du participant.
     */
    constructor(id, utilisateurId, challengeId, scoreTotal) {
        this.id = id;
        this.utilisateurId = utilisateurId;
        this.challengeId = challengeId;
        this.scoreTotal = scoreTotal;
    }

    /**
     * Ajoute un nouveau participant à la base de données.
     * @param {Participant} participant - L'objet participant à ajouter.
     * @returns {Promise<Participant>} - Le participant ajouté.
     */
    static add(participant) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Participant (id, utilisateurId, challengeId, scoreTotal) VALUES (?, ?, ?, ?)';
            db.run(sql, [participant.id, participant.utilisateurId, participant.challengeId, participant.scoreTotal], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(participant);
                }
            });
        });
    }

    /**
     * Récupère tous les participants de la base de données.
     * @returns {Promise<Participant[]>} - Une liste de tous les participants.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Participant';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Participant(row.id, row.utilisateurId, row.challengeId, row.scoreTotal)));
                }
            });
        });
    }

    /**
     * Récupère un participant par son ID.
     * @param {string} id - L'ID du participant.
     * @returns {Promise<Participant>} - Le participant trouvé.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Participant WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Participant(row.id, row.utilisateurId, row.challengeId, row.scoreTotal) : null);
                }
            });
        });
    }

    /**
     * Met à jour un participant.
     * @param {string} id - L'ID du participant à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Participant SET ${fields} WHERE id = ?`;
            db.run(sql, [...values, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Supprime un participant.
     * @param {string} id - L'ID du participant à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Participant WHERE id = ?';
            db.run(sql, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = Participant;
