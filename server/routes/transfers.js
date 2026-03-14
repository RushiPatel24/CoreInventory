const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getTransfers, getTransfer, createTransfer, updateTransfer, validateTransfer, cancelTransfer } = require('../controllers/transferController');

router.use(auth);
router.get('/', getTransfers);
router.get('/:id', getTransfer);
router.post('/', createTransfer);
router.put('/:id', updateTransfer);
router.post('/:id/validate', validateTransfer);
router.post('/:id/cancel', cancelTransfer);

module.exports = router;
