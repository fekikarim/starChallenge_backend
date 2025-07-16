
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/starchallenge.db');

/**
 * Représente un utilisateur dans le système.
 */
class Utilisateur {
    /**
     * @param {string} id - L'identifiant unique de l'utilisateur.
     * @param {string} nom - Le nom de l'utilisateur.
     * @param {string} email - L'adresse email de l'utilisateur.
     * @param {string} motDePasseHash - Le hash du mot de passe de l'utilisateur.
     * @param {string} role - Le rôle de l'utilisateur (ex: "admin", "participant").
     */
    constructor(id, nom, email, motDePasseHash, role) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.motDePasseHash = motDePasseHash;
        this.role = role;
    }

    /**
     * Ajoute un nouvel utilisateur à la base de données.
     * @param {Utilisateur} utilisateur - L'objet utilisateur à ajouter.
     * @returns {Promise<Utilisateur>} - L'utilisateur ajouté.
     */
    static add(utilisateur) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Utilisateur (id, nom, email, motDePasseHash, role) VALUES (?, ?, ?, ?, ?)';
            db.run(sql, [utilisateur.id, utilisateur.nom, utilisateur.email, utilisateur.motDePasseHash, utilisateur.role], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(utilisateur);
                }
            });
        });
    }

    /**
     * Récupère tous les utilisateurs de la base de données.
     * @returns {Promise<Utilisateur[]>} - Une liste de tous les utilisateurs.
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Utilisateur';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new Utilisateur(row.id, row.nom, row.email, row.motDePasseHash, row.role)));
                }
            });
        });
    }

    /**
     * Récupère un utilisateur par son ID.
     * @param {string} id - L'ID de l'utilisateur.
     * @returns {Promise<Utilisateur>} - L'utilisateur trouvé.
     */
    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Utilisateur WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new Utilisateur(row.id, row.nom, row.email, row.motDePasseHash, row.role) : null);
                }
            });
        });
    }

    /**
     * Met à jour un utilisateur.
     * @param {string} id - L'ID de l'utilisateur à mettre à jour.
     * @param {object} updates - Les champs à mettre à jour.
     * @returns {Promise<void>}
     */
    static update(id, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const sql = `UPDATE Utilisateur SET ${fields} WHERE id = ?`;
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
     * Supprime un utilisateur.
     * @param {string} id - L'ID de l'utilisateur à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Utilisateur WHERE id = ?';
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

module.exports = Utilisateur;
