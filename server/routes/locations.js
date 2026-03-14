const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const roleGuard = require('../middleware/roleGuard');
const { getLocations, createLocation, updateLocation, deleteLocation } = require('../controllers/locationController');

router.use(auth);
router.get('/', getLocations);
router.post('/', roleGuard('manager'), createLocation);
router.put('/:id', roleGuard('manager'), updateLocation);
router.delete('/:id', roleGuard('manager'), deleteLocation);

module.exports = router;
