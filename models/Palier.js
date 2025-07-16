
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente un palier de récompenses.
 */
class Palier {
    /**
     * @param {string} id - L'identifiant unique du palier.
     * @param {string} nom - Le nom du palier.
     * @param {number} etoilesMin - Le nombre minimum d'étoiles pour atteindre le palier.
     * @param {string} description - La description du palier.
     */
    constructor(id, nom, etoilesMin, description) {
        this.id = id;
        this.nom = nom;
        this.etoilesMin = etoilesMin;
        this.description = description;
    }

    /**
     * Ajoute un nouveau palier à la base de données.
     * @param {Palier} palier - L'objet palier à ajouter.
     * @returns {Promise<Palier>} - Le palier ajouté.
     */
    static add(palier) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Palier (id, nom, etoilesMin, description) VALUES (?, ?, ?, ?)';
            db.run(sql, [palier.id, palier.nom, palier.etoilesMin, palier.description], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(palier);
                }
            });
        });
    }

    /**
     * Récupère tous les paliers de la base de données.
     * @returns {Promise<Palier[]>} - Une liste de tous les paliers.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Palier';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Palier(row.id, row.nom, row.etoilesMin, row.description)));
                }
            });
        });
    }

    /**
     * Récupère un palier par son ID.
     * @param {string} id - L'ID du palier.
     * @returns {Promise<Palier>} - Le palier trouvé.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Palier WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Palier(row.id, row.nom, row.etoilesMin, row.description) : null);
                }
            });
        });
    }

    /**
     * Met à jour un palier.
     * @param {string} id - L'ID du palier à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Palier SET ${fields} WHERE id = ?`;
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
     * Supprime un palier.
     * @param {string} id - L'ID du palier à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Palier WHERE id = ?';
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

module.exports = Palier;
