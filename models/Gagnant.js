
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente un gagnant d'un challenge.
 */
class Gagnant {
    /**
     * @param {string} id - L'identifiant unique du gagnant.
     * @param {string} utilisateurId - L'ID de l'utilisateur gagnant.
     * @param {string} challengeId - L'ID du challenge remporté.
     * @param {number} classement - Le classement du gagnant.
     */
    constructor(id, utilisateurId, challengeId, classement) {
        this.id = id;
        this.utilisateurId = utilisateurId;
        this.challengeId = challengeId;
        this.classement = classement;
    }

    /**
     * Ajoute un nouveau gagnant à la base de données.
     * @param {Gagnant} gagnant - L'objet gagnant à ajouter.
     * @returns {Promise<Gagnant>} - Le gagnant ajouté.
     */
    static add(gagnant) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Gagnant (id, utilisateurId, challengeId, classement) VALUES (?, ?, ?, ?)';
            db.run(sql, [gagnant.id, gagnant.utilisateurId, gagnant.challengeId, gagnant.classement], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(gagnant);
                }
            });
        });
    }

    /**
     * Récupère tous les gagnants de la base de données.
     * @returns {Promise<Gagnant[]>} - Une liste de tous les gagnants.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Gagnant';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Gagnant(row.id, row.utilisateurId, row.challengeId, row.classement)));
                }
            });
        });
    }

    /**
     * Récupère un gagnant par son ID.
     * @param {string} id - L'ID du gagnant.
     * @returns {Promise<Gagnant>} - Le gagnant trouvé.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Gagnant WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Gagnant(row.id, row.utilisateurId, row.challengeId, row.classement) : null);
                }
            });
        });
    }

    /**
     * Met à jour un gagnant.
     * @param {string} id - L'ID du gagnant à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Gagnant SET ${fields} WHERE id = ?`;
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
     * Supprime un gagnant.
     * @param {string} id - L'ID du gagnant à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Gagnant WHERE id = ?';
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

module.exports = Gagnant;
