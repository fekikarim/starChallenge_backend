const express = require('express');
const router = express.Router();
const PerformanceController = require('../controllers/performanceController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('participantId').notEmpty(),
    body('valeur').isFloat(),
    body('rang').isInt(),
    body('details').isJSON()
], PerformanceController.create);

router.get('/', PerformanceController.getAll);
router.get('/:id', PerformanceController.getById);
router.put('/:id', auth, PerformanceController.update);
router.delete('/:id', auth, PerformanceController.delete);

module.exports = router;