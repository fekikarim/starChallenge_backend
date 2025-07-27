
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
            try {
                // Vérifier que des champs sont fournis
                if (!updates || Object.keys(updates).length === 0) {
                    console.error('Aucune mise à jour fournie pour l\'utilisateur', id);
                    return reject(new Error('Aucune mise à jour fournie'));
                }

                // Vérifier que l'ID est valide
                if (!id) {
                    console.error('ID utilisateur manquant pour la mise à jour');
                    return reject(new Error('ID utilisateur manquant'));
                }

                // Préparer la requête SQL
                const fields = Object.keys(updates)
                    .filter(key => key !== 'id') // Exclure l'ID des champs à mettre à jour
                    .map(key => `${key} = ?`)
                    .join(', ');
                
                if (!fields) {
                    console.error('Aucun champ valide à mettre à jour pour l\'utilisateur', id);
                    return reject(new Error('Aucun champ valide à mettre à jour'));
                }

                const values = Object.entries(updates)
                    .filter(([key]) => key !== 'id')
                    .map(([_, value]) => value);

                const sql = `UPDATE Utilisateur SET ${fields} WHERE id = ?`;
                console.log('Exécution de la requête SQL:', sql);
                console.log('Valeurs:', [...values, id]);

                db.run(sql, [...values, id], function (err) {
                    if (err) {
                        console.error('Erreur lors de l\'exécution de la requête SQL:', {
                            sql,
                            params: [...values, id],
                            error: err.message
                        });
                        return reject(err);
                    }
                    
                    if (this.changes === 0) {
                        console.warn('Aucun utilisateur mis à jour avec l\'ID:', id);
                        return reject(new Error('Utilisateur non trouvé'));
                    }
                    
                    console.log(`Utilisateur ${id} mis à jour avec succès. ${this.changes} ligne(s) affectée(s).`);
                    resolve();
                });
            } catch (error) {
                console.error('Erreur inattendue dans Utilisateur.update:', error);
                reject(error);
            }
        });
    }

    /**
     * Supprime un utilisateur.
     * @param {string} id - L'ID de l'utilisateur à supprimer.
     * @returns {Promise<void>}
     */
    static delete(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                console.error('Tentative de suppression sans ID utilisateur');
                return reject(new Error('ID utilisateur manquant'));
            }

            const sql = 'DELETE FROM Utilisateur WHERE id = ?';
            console.log(`Exécution de la requête de suppression pour l'utilisateur: ${id}`);
            
            db.run(sql, [id], function (err) {
                if (err) {
                    console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, err.message);
                    return reject(err);
                }
                
                if (this.changes === 0) {
                    console.warn(`Aucun utilisateur trouvé avec l'ID: ${id} pour suppression`);
                    return reject(new Error('Utilisateur non trouvé'));
                }
                
                console.log(`Utilisateur ${id} supprimé avec succès. ${this.changes} ligne(s) affectée(s).`);
                resolve();
            });
        });
    }

    /**
     * Vérifie si un email existe déjà dans la base de données (insensible à la casse).
     * @param {string} email - L'email à vérifier.
     * @param {string} [excludeUserId=null] - ID d'utilisateur à exclure de la vérification (utile pour la mise à jour).
     * @returns {Promise<{exists: boolean, user: Object|null}>} - Un objet indiquant si l'email existe et l'utilisateur associé s'il existe.
     */
    static async checkEmailExists(email, excludeUserId = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!email) {
                    return resolve({ exists: false, user: null });
                }

                let sql = 'SELECT * FROM Utilisateur WHERE LOWER(email) = LOWER(?)';
                const params = [email];

                if (excludeUserId) {
                    sql += ' AND id != ?';
                    params.push(excludeUserId);
                }

                db.get(sql, params, (err, row) => {
                    if (err) {
                        console.error('Erreur lors de la vérification de l\'email:', err);
                        return reject(err);
                    }
                    
                    resolve({
                        exists: !!row,
                        user: row ? new Utilisateur(row.id, row.nom, row.email, row.motDePasseHash, row.role) : null
                    });
                });
            } catch (error) {
                console.error('Erreur inattendue dans checkEmailExists:', error);
                reject(error);
            }
        });
    }
}

module.exports = Utilisateur;
