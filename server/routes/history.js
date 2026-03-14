const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getHistory } = require('../controllers/historyController');

router.use(auth);
router.get('/', getHistory);

module.exports = router;
