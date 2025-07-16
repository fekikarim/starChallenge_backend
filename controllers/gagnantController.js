const Gagnant = require('../models/Gagnant');
const { validationResult } = require('express-validator');

class GagnantController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, utilisateurId, challengeId, classement } = req.body;
        try {
            const nouveauGagnant = new Gagnant(id, utilisateurId, challengeId, classement);
            await Gagnant.add(nouveauGagnant);
            res.status(201).json({ message: 'Gagnant créé avec succès', gagnant: nouveauGagnant });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const gagnants = await Gagnant.getAll();
            res.status(200).json(gagnants);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const gagnant = await Gagnant.getById(req.params.id);
            if (!gagnant) {
                return res.status(404).json({ message: 'Gagnant non trouvé.' });
            }
            res.status(200).json(gagnant);
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
            await Gagnant.update(req.params.id, req.body);
            res.status(200).json({ message: 'Gagnant mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Gagnant.delete(req.params.id);
            res.status(200).json({ message: 'Gagnant supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = GagnantController;