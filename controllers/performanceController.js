const Performance = require('../models/Performance');
const { validationResult } = require('express-validator');

class PerformanceController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, participantId, valeur, rang, details, critereId } = req.body;
        try {
            const nouvellePerformance = new Performance(id, participantId, valeur, rang, details, critereId);
            await Performance.add(nouvellePerformance);
            res.status(201).json({ message: 'Performance créée avec succès', performance: nouvellePerformance });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const performances = await Performance.getAll();
            res.status(200).json(performances);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const performance = await Performance.getById(req.params.id);
            if (!performance) {
                return res.status(404).json({ message: 'Performance non trouvée.' });
            }
            res.status(200).json(performance);
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
            await Performance.update(req.params.id, req.body);
            res.status(200).json({ message: 'Performance mise à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Performance.delete(req.params.id);
            res.status(200).json({ message: 'Performance supprimée avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PerformanceController;