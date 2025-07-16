const express = require('express');
const router = express.Router();
const EtoileController = require('../controllers/etoileController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('total').isInt({ gt: 0 }),
    body('dateAttribution').isISO8601().toDate(),
    body('raison').notEmpty(),
    body('utilisateurId').notEmpty()
], EtoileController.create);

router.get('/', EtoileController.getAll);
router.get('/:id', EtoileController.getById);
router.put('/:id', auth, EtoileController.update);
router.delete('/:id', auth, EtoileController.delete);

module.exports = router;