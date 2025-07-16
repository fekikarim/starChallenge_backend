const Participant = require('../models/Participant');
const { validationResult } = require('express-validator');

class ParticipantController {
    static async create(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id, utilisateurId, challengeId, scoreTotal } = req.body;
        try {
            const nouveauParticipant = new Participant(id, utilisateurId, challengeId, scoreTotal);
            await Participant.add(nouveauParticipant);
            res.status(201).json({ message: 'Participant créé avec succès', participant: nouveauParticipant });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const participants = await Participant.getAll();
            res.status(200).json(participants);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const participant = await Participant.getById(req.params.id);
            if (!participant) {
                return res.status(404).json({ message: 'Participant non trouvé.' });
            }
            res.status(200).json(participant);
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
            await Participant.update(req.params.id, req.body);
            res.status(200).json({ message: 'Participant mis à jour avec succès.' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await Participant.delete(req.params.id);
            res.status(200).json({ message: 'Participant supprimé avec succès.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ParticipantController;