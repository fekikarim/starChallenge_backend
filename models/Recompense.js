
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente une récompense.
 */
class Recompense {
    /**
     * @param {string} id - L'identifiant unique de la récompense.
     * @param {string} type - Le type de récompense (ex: "badge", "bon d'achat").
     * @param {string} description - La description de la récompense.
     * @param {Date} dateAttribution - La date d'attribution de la récompense.
     * @param {string} palierId - L'ID du palier qui débloque cette récompense.
     */
    constructor(id, type, description, dateAttribution, palierId) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.dateAttribution = dateAttribution;
        this.palierId = palierId;
    }

    /**
     * Ajoute une nouvelle récompense à la base de données.
     * @param {Recompense} recompense - L'objet récompense à ajouter.
     * @returns {Promise<Recompense>} - La récompense ajoutée.
     */
    static add(recompense) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Recompense (id, type, description, dateAttribution, palierId) VALUES (?, ?, ?, ?, ?)';
            db.run(sql, [recompense.id, recompense.type, recompense.description, recompense.dateAttribution, recompense.palierId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(recompense);
                }
            });
        });
    }

    /**
     * Récupère toutes les récompenses de la base de données.
     * @returns {Promise<Recompense[]>} - Une liste de toutes les récompenses.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Recompense';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Recompense(row.id, row.type, row.description, row.dateAttribution, row.palierId)));
                }
            });
        });
    }

    /**
     * Récupère une récompense par son ID.
     * @param {string} id - L'ID de la récompense.
     * @returns {Promise<Recompense>} - La récompense trouvée.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Recompense WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Recompense(row.id, row.type, row.description, row.dateAttribution, row.palierId) : null);
                }
            });
        });
    }

    /**
     * Met à jour une récompense.
     * @param {string} id - L'ID de la récompense à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Recompense SET ${fields} WHERE id = ?`;
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
     * Supprime une récompense.
     * @param {string} id - L'ID de la récompense à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Recompense WHERE id = ?';
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

module.exports = Recompense;
