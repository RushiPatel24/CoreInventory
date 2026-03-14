const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getRules, upsertRule, deleteRule } = require('../controllers/reorderRuleController');

router.use(auth);
router.get('/', getRules);
router.post('/', upsertRule);
router.delete('/:id', deleteRule);

module.exports = router;
