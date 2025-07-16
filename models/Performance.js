
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente la performance d'un participant à un challenge.
 */
class Performance {
    /**
     * @param {string} id - L'identifiant unique de la performance.
     * @param {string} participantId - L'ID du participant.
     * @param {number} valeur - La valeur de la performance.
     * @param {number} rang - Le rang de la performance.
     * @param {string} details - Les détails de la performance (JSON).
     */
    constructor(id, participantId, valeur, rang, details) {
        this.id = id;
        this.participantId = participantId;
        this.valeur = valeur;
        this.rang = rang;
        this.details = details;
    }

    /**
     * Ajoute une nouvelle performance à la base de données.
     * @param {Performance} performance - L'objet performance à ajouter.
     * @returns {Promise<Performance>} - La performance ajoutée.
     */
    static add(performance) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Performance (id, participantId, valeur, rang, details) VALUES (?, ?, ?, ?, ?)';
            db.run(sql, [performance.id, performance.participantId, performance.valeur, performance.rang, performance.details], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(performance);
                }
            });
        });
    }

    /**
     * Récupère toutes les performances de la base de données.
     * @returns {Promise<Performance[]>} - Une liste de toutes les performances.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Performance';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Performance(row.id, row.participantId, row.valeur, row.rang, row.details)));
                }
            });
        });
    }

    /**
     * Récupère une performance par son ID.
     * @param {string} id - L'ID de la performance.
     * @returns {Promise<Performance>} - La performance trouvée.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Performance WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Performance(row.id, row.participantId, row.valeur, row.rang, row.details) : null);
                }
            });
        });
    }

    /**
     * Met à jour une performance.
     * @param {string} id - L'ID de la performance à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Performance SET ${fields} WHERE id = ?`;
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
     * Supprime une performance.
     * @param {string} id - L'ID de la performance à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Performance WHERE id = ?';
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

module.exports = Performance;
