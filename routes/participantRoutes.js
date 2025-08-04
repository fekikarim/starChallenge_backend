const express = require('express');
const router = express.Router();
const ParticipantController = require('../controllers/participantController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('utilisateurId').notEmpty(),
    body('challengeId').notEmpty(),
    body('scoreTotal').isFloat(),
    body('isValidated').optional().isString()
], ParticipantController.create);

router.get('/', ParticipantController.getAll);
router.get('/global-leaderboard', ParticipantController.getGlobalLeaderboard);
router.get('/user/:userId', ParticipantController.getByUser);
router.get('/user/:userId/status/:status', ParticipantController.getByUserAndStatus);
router.get('/:id', ParticipantController.getById);
router.put('/:id', auth, ParticipantController.update);
router.delete('/:id', auth, ParticipantController.delete);

module.exports = router;