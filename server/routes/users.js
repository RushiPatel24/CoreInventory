const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getMe, updateMe, changePassword, getUsers } = require('../controllers/userController');

router.use(auth);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/change-password', changePassword);
router.get('/', roleGuard('manager'), getUsers);

module.exports = router;
