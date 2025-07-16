

/**
 * Middleware de gestion des erreurs.
 * @param {Error} err - L'objet d'erreur.
 * @param {import('express').Request} req - La requête Express.
 * @param {import('express').Response} res - La réponse Express.
 * @param {import('express').NextFunction} next - Le middleware suivant.
 */
function errorController(err, req, res, next) {
    console.error(err.stack);

    // Erreurs de validation d'express-validator
    if (err.errors) {
        return res.status(400).json({ 
            message: "Erreur de validation",
            errors: err.errors 
        });
    }

    // Erreurs personnalisées
    if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Erreur serveur par défaut
    res.status(500).json({ message: "Une erreur interne est survenue." });
}

module.exports = errorController;

