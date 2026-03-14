const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getReceipts, getReceipt, createReceipt, updateReceipt, validateReceipt, cancelReceipt } = require('../controllers/receiptController');

router.use(auth);
router.get('/', getReceipts);
router.get('/:id', getReceipt);
router.post('/', createReceipt);
router.put('/:id', updateReceipt);
router.post('/:id/validate', validateReceipt);
router.post('/:id/cancel', cancelReceipt);

module.exports = router;
