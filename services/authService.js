
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcrypt');

/**
 * Services d'authentification.
 */
class AuthService {
    /**
     * Vérifie les informations de connexion d'un utilisateur.
     * @param {string} email - L'email de l'utilisateur.
     * @param {string} motDePasse - Le mot de passe en clair.
     * @returns {Promise<Utilisateur|null>} - L'utilisateur si la connexion est réussie, sinon null.
     */
    static async verifierLogin(email, motDePasse) {
        try {
            const utilisateur = await new Promise((resolve, reject) => {
                const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
                db.get('SELECT * FROM Utilisateur WHERE email = ?', [email], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
                db.close();
            });

            if (utilisateur && await bcrypt.compare(motDePasse, utilisateur.motDePasseHash)) {
                return new Utilisateur(utilisateur.id, utilisateur.nom, utilisateur.email, utilisateur.motDePasseHash, utilisateur.role);
            }
            return null;
        } catch (error) {
            console.error("Erreur lors de la vérification de connexion:", error);
            return null;
        }
    }
}

module.exports = AuthService;
