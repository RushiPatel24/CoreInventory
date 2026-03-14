const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProducts, getProduct, createProduct, updateProduct, archiveProduct, unarchiveProduct, deleteProduct } = require('../controllers/productController');

router.use(auth);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/archive', archiveProduct);
router.patch('/:id/unarchive', unarchiveProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
