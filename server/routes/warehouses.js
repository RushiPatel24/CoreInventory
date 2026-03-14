const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');

router.use(auth);
router.get('/', getWarehouses);
router.post('/', roleGuard('manager'), createWarehouse);
router.put('/:id', roleGuard('manager'), updateWarehouse);
router.delete('/:id', roleGuard('manager'), deleteWarehouse);

module.exports = router;
