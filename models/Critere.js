
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente un critère d'évaluation pour un challenge.
 */
class Critere {
    /**
     * @param {string} id - L'identifiant unique du critère.
     * @param {string} nom - Le nom du critère.
     * @param {number} poids - Le poids du critère dans le calcul du score.
     * @param {string} challengeId - L'ID du challenge auquel ce critère est associé.
     * @param {string} type - Le type du critère (quantitatif, qualitatif, etc.).
     */
    constructor(id, nom, poids, challengeId, type) {
        this.id = id;
        this.nom = nom;
        this.poids = poids;
        this.challengeId = challengeId;
        this.type = type;
    }

    /**
     * Ajoute un nouveau critère à la base de données.
     * @param {Critere} critere - L'objet critère à ajouter.
     * @returns {Promise<Critere>} - Le critère ajouté.
     */
    static add(critere) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Critere (id, nom, poids, challengeId, type) VALUES (?, ?, ?, ?, ?)';
            db.run(sql, [critere.id, critere.nom, critere.poids, critere.challengeId, critere.type], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(critere);
                }
            });
        });
    }

    /**
     * Récupère tous les critères de la base de données.
     * @returns {Promise<Critere[]>} - Une liste de tous les critères.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Critere';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Critere(row.id, row.nom, row.poids, row.challengeId, row.type)));
                }
            });
        });
    }

    /**
     * Récupère un critère par son ID.
     * @param {string} id - L'ID du critère.
     * @returns {Promise<Critere>} - Le critère trouvé.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Critere WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Critere(row.id, row.nom, row.poids, row.challengeId, row.type) : null);
                }
            });
        });
    }

    /**
     * Met à jour un critère.
     * @param {string} id - L'ID du critère à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Critere SET ${fields} WHERE id = ?`;
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
     * Supprime un critère.
     * @param {string} id - L'ID du critère à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Critere WHERE id = ?';
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

module.exports = Critere;
