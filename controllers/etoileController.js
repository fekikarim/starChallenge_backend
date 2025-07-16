const Etoile = require('../models/Etoile');
const { validationResult } = require('express-validator');

class EtoileController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, total, dateAttribution, raison, utilisateurId } = req.body;
        try {
            const nouvelleEtoile = new Etoile(id, total, dateAttribution, raison, utilisateurId);
            await Etoile.add(nouvelleEtoile);
            res.status(201).json({ message: 'Etoile créée avec succès', etoile: nouvelleEtoile });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const etoiles = await Etoile.getAll();
            res.status(200).json(etoiles);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const etoile = await Etoile.getById(req.params.id);
            if (!etoile) {
                return res.status(404).json({ message: 'Etoile non trouvée.' });
            }
            res.status(200).json(etoile);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            await Etoile.update(req.params.id, req.body);
            res.status(200).json({ message: 'Etoile mise à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Etoile.delete(req.params.id);
            res.status(200).json({ message: 'Etoile supprimée avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = EtoileController;