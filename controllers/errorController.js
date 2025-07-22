const logger = require('../utils/logger');

/**
 * Middleware de gestion des erreurs.
 * @param {Error} err - L'objet d'erreur.
 * @param {import('express').Request} req - La requête Express.
 * @param {import('express').Response} res - La réponse Express.
 * @param {import('express').NextFunction} next - Le middleware suivant.
 */
function errorController(err, req, res, next) {
    // Journaliser l'erreur avec des détails de la requête
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
        user: req.user ? req.user.id : 'non authentifié'
    });

    // Erreurs de validation d'express-validator
    if (err.errors) {
        return res.status(400).json({ 
            success: false,
            message: "Erreur de validation",
            errors: err.errors 
        });
    }

    // Erreurs personnalisées
    if (err.statusCode) {
        return res.status(err.statusCode).json({ 
            success: false,
            message: err.message 
        });
    }

    // Erreur serveur par défaut
    res.status(500).json({ 
        success: false,
        message: "Une erreur interne est survenue.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}

module.exports = errorController;
