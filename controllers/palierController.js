const Palier = require('../models/Palier');
const { validationResult } = require('express-validator');

class PalierController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, nom, etoilesMin, description } = req.body;
        try {
            const nouveauPalier = new Palier(id, nom, etoilesMin, description);
            await Palier.add(nouveauPalier);
            res.status(201).json({ message: 'Palier créé avec succès', palier: nouveauPalier });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const paliers = await Palier.getAll();
            res.status(200).json(paliers);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const palier = await Palier.getById(req.params.id);
            if (!palier) {
                return res.status(404).json({ message: 'Palier non trouvé.' });
            }
            res.status(200).json(palier);
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
            await Palier.update(req.params.id, req.body);
            res.status(200).json({ message: 'Palier mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Palier.delete(req.params.id);
            res.status(200).json({ message: 'Palier supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PalierController;