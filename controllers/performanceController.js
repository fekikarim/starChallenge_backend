const Performance = require('../models/Performance');
const { validationResult } = require('express-validator');
const ClassementController = require('./classementController');
const socketService = require('../services/socketService');

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

            // Mettre à jour le classement en temps réel
            await ClassementController.mettreAJourClassement(participantId);

            // Notifier via Socket.IO
            await socketService.notifyPerformanceChange(participantId, 'create');

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
            // Récupérer la performance avant mise à jour pour obtenir le participantId
            const performance = await Performance.getById(req.params.id);
            if (!performance) {
                return res.status(404).json({ message: 'Performance non trouvée.' });
            }

            await Performance.update(req.params.id, req.body);

            // Mettre à jour le classement en temps réel
            await ClassementController.mettreAJourClassement(performance.participantId);

            // Notifier via Socket.IO
            await socketService.notifyPerformanceChange(performance.participantId, 'update');

            res.status(200).json({ message: 'Performance mise à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            // Récupérer la performance avant suppression pour obtenir le participantId
            const performance = await Performance.getById(req.params.id);
            if (!performance) {
                return res.status(404).json({ message: 'Performance non trouvée.' });
            }

            await Performance.delete(req.params.id);

            // Mettre à jour le classement en temps réel
            await ClassementController.mettreAJourClassement(performance.participantId);

            // Notifier via Socket.IO
            await socketService.notifyPerformanceChange(performance.participantId, 'delete');

            res.status(200).json({ message: 'Performance supprimée avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PerformanceController;