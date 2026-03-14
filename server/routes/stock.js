const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getStock } = require('../controllers/stockController');

router.use(auth);
router.get('/', getStock);

module.exports = router;
