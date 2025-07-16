const express = require('express');
const router = express.Router();
const GagnantController = require('../controllers/gagnantController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, [
    body('id').notEmpty(),
    body('utilisateurId').notEmpty(),
    body('challengeId').notEmpty(),
    body('classement').isInt({ gt: 0 })
], GagnantController.create);

router.get('/', GagnantController.getAll);
router.get('/:id', GagnantController.getById);
router.put('/:id', auth, GagnantController.update);
router.delete('/:id', auth, GagnantController.delete);

module.exports = router;