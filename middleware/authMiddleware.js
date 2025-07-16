
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

/**
 * Middleware pour vérifier le token JWT.
 * @param {import('express').Request} req - La requête Express.
 * @param {import('express').Response} res - La réponse Express.
 * @param {import('express').NextFunction} next - Le middleware suivant.
 */
function authMiddleware(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Aucun token, autorisation refusée.' });
    }

    const token = authHeader.split(' ')[1]; // Récupère uniquement la partie token

    try {
        const decoded = jwt.verify(token, config.secret);
        req.utilisateur = decoded.utilisateur;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token non valide.' });
    }
}


module.exports = authMiddleware;
