const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAdjustments, getAdjustment, createAdjustment, validateAdjustment, cancelAdjustment } = require('../controllers/adjustmentController');

router.use(auth);
router.get('/', getAdjustments);
router.get('/:id', getAdjustment);
router.post('/', createAdjustment);
router.post('/:id/validate', validateAdjustment);
router.post('/:id/cancel', cancelAdjustment);

module.exports = router;
