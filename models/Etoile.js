
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente une étoile attribuée à un utilisateur.
 */
class Etoile {
    /**
     * @param {string} id - L'identifiant unique de l'étoile.
     * @param {number} total - Le nombre total d'étoiles.
     * @param {Date} dateAttribution - La date d'attribution de l'étoile.
     * @param {string} raison - La raison de l'attribution.
     * @param {string} utilisateurId - L'ID de l'utilisateur qui a reçu l'étoile.
     */
    constructor(id, total, dateAttribution, raison, utilisateurId) {
        this.id = id;
        this.total = total;
        this.dateAttribution = dateAttribution;
        this.raison = raison;
        this.utilisateurId = utilisateurId;
    }

    /**
     * Ajoute une nouvelle étoile à la base de données.
     * @param {Etoile} etoile - L'objet étoile à ajouter.
     * @returns {Promise<Etoile>} - L'étoile ajoutée.
     */
    static add(etoile) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Etoile (id, total, dateAttribution, raison, utilisateurId) VALUES (?, ?, ?, ?, ?)';
            db.run(sql, [etoile.id, etoile.total, etoile.dateAttribution, etoile.raison, etoile.utilisateurId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(etoile);
                }
            });
        });
    }

    /**
     * Récupère toutes les étoiles de la base de données.
     * @returns {Promise<Etoile[]>} - Une liste de toutes les étoiles.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Etoile';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Etoile(row.id, row.total, row.dateAttribution, row.raison, row.utilisateurId)));
                }
            });
        });
    }

    /**
     * Récupère une étoile par son ID.
     * @param {string} id - L'ID de l'étoile.
     * @returns {Promise<Etoile>} - L'étoile trouvée.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Etoile WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Etoile(row.id, row.total, row.dateAttribution, row.raison, row.utilisateurId) : null);
                }
            });
        });
    }

    /**
     * Met à jour une étoile.
     * @param {string} id - L'ID de l'étoile à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Etoile SET ${fields} WHERE id = ?`;
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
     * Supprime une étoile.
     * @param {string} id - L'ID de l'étoile à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Etoile WHERE id = ?';
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

module.exports = Etoile;
