const express = require('express');
const router = express.Router();
const CritereController = require('../controllers/critereController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('nom').notEmpty(),
    body('poids').isFloat({ gt: 0 }),
    body('challengeId').notEmpty()
], CritereController.create);

router.get('/', CritereController.getAll);
router.get('/:id', CritereController.getById);
router.put('/:id', auth, CritereController.update);
router.delete('/:id', auth, CritereController.delete);

module.exports = router;