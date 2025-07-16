
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente un challenge.
 */
class Challenge {
    /**
     * @param {string} id - L'identifiant unique du challenge.
     * @param {string} nom - Le nom du challenge.
     * @param {Date} dateDebut - La date de début du challenge.
     * @param {Date} dateFin - La date de fin du challenge.
     * @param {string} statut - Le statut du challenge (ex: "en cours", "terminé").
     * @param {string} createurId - L'ID de l'utilisateur qui a créé le challenge.
     */
    constructor(id, nom, dateDebut, dateFin, statut, createurId) {
        this.id = id;
        this.nom = nom;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.statut = statut;
        this.createurId = createurId;
    }

    /**
     * Ajoute un nouveau challenge à la base de données.
     * @param {Challenge} challenge - L'objet challenge à ajouter.
     * @returns {Promise<Challenge>} - Le challenge ajouté.
     */
    static add(challenge) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Challenge (id, nom, dateDebut, dateFin, statut, createurId) VALUES (?, ?, ?, ?, ?, ?)';
            db.run(sql, [challenge.id, challenge.nom, challenge.dateDebut, challenge.dateFin, challenge.statut, challenge.createurId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(challenge);
                }
            });
        });
    }

    /**
     * Récupère tous les challenges de la base de données.
     * @returns {Promise<Challenge[]>} - Une liste de tous les challenges.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Challenge';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Challenge(row.id, row.nom, row.dateDebut, row.dateFin, row.statut, row.createurId)));
                }
            });
        });
    }

    /**
     * Récupère un challenge par son ID.
     * @param {string} id - L'ID du challenge.
     * @returns {Promise<Challenge>} - Le challenge trouvé.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Challenge WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Challenge(row.id, row.nom, row.dateDebut, row.dateFin, row.statut, row.createurId) : null);
                }
            });
        });
    }

    /**
     * Met à jour un challenge.
     * @param {string} id - L'ID du challenge à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Challenge SET ${fields} WHERE id = ?`;
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
     * Supprime un challenge.
     * @param {string} id - L'ID du challenge à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Challenge WHERE id = ?';
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

module.exports = Challenge;
