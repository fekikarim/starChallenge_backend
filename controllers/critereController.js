const Critere = require('../models/Critere');
const { validationResult } = require('express-validator');

class CritereController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, nom, poids, challengeId, type } = req.body;
        try {
            const nouveauCritere = new Critere(id, nom, poids, challengeId, type);
            await Critere.add(nouveauCritere);
            res.status(201).json({ message: 'Critère créé avec succès', critere: nouveauCritere });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const criteres = await Critere.getAll();
            res.status(200).json(criteres);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const critere = await Critere.getById(req.params.id);
            if (!critere) {
                return res.status(404).json({ message: 'Critère non trouvé.' });
            }
            res.status(200).json(critere);
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
            await Critere.update(req.params.id, req.body);
            res.status(200).json({ message: 'Critère mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Critere.delete(req.params.id);
            res.status(200).json({ message: 'Critère supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CritereController;