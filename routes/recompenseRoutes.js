const express = require('express');
const router = express.Router();
const RecompenseController = require('../controllers/recompenseController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('type').notEmpty(),
    body('description').notEmpty(),
    body('dateAttribution').isISO8601().toDate(),
    body('palierId').notEmpty()
], RecompenseController.create);

router.get('/', RecompenseController.getAll);
router.get('/:id', RecompenseController.getById);
router.put('/:id', auth, RecompenseController.update);
router.delete('/:id', auth, RecompenseController.delete);

module.exports = router;