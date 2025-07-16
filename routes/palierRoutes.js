const express = require('express');
const router = express.Router();
const PalierController = require('../controllers/palierController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('nom').notEmpty(),
    body('etoilesMin').isInt({ gt: 0 }),
    body('description').notEmpty()
], PalierController.create);

router.get('/', PalierController.getAll);
router.get('/:id', PalierController.getById);
router.put('/:id', auth, PalierController.update);
router.delete('/:id', auth, PalierController.delete);

module.exports = router;