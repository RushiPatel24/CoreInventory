const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getDeliveries, getDelivery, createDelivery, updateDelivery, validateDelivery, cancelDelivery } = require('../controllers/deliveryController');

router.use(auth);
router.get('/', getDeliveries);
router.get('/:id', getDelivery);
router.post('/', createDelivery);
router.put('/:id', updateDelivery);
router.post('/:id/validate', validateDelivery);
router.post('/:id/cancel', cancelDelivery);

module.exports = router;
