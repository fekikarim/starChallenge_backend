const Recompense = require('../models/Recompense');
const { validationResult } = require('express-validator');

class RecompenseController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, type, description, dateAttribution, palierId } = req.body;
        try {
            const nouvelleRecompense = new Recompense(id, type, description, dateAttribution, palierId);
            await Recompense.add(nouvelleRecompense);
            res.status(201).json({ message: 'Récompense créée avec succès', recompense: nouvelleRecompense });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const recompenses = await Recompense.getAll();
            res.status(200).json(recompenses);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const recompense = await Recompense.getById(req.params.id);
            if (!recompense) {
                return res.status(404).json({ message: 'Récompense non trouvée.' });
            }
            res.status(200).json(recompense);
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
            await Recompense.update(req.params.id, req.body);
            res.status(200).json({ message: 'Récompense mise à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Recompense.delete(req.params.id);
            res.status(200).json({ message: 'Récompense supprimée avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RecompenseController;