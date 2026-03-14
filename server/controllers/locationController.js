const Location = require('../models/Location');

const getLocations = async (req, res) => {
  const { warehouseId } = req.query;
  const filter = warehouseId ? { warehouseId } : {};
  const locations = await Location.find(filter).populate('warehouseId', 'name').sort({ name: 1 });
  res.json(locations);
};

const createLocation = async (req, res) => {
  const { warehouseId, name, code } = req.body;
  if (!warehouseId || !name) return res.status(400).json({ message: 'warehouseId and name are required' });
  const location = await Location.create({ warehouseId, name, code });
  res.status(201).json(await location.populate('warehouseId', 'name'));
};

const updateLocation = async (req, res) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('warehouseId', 'name');
  if (!location) return res.status(404).json({ message: 'Location not found' });
  res.json(location);
};

const deleteLocation = async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ message: 'Location deleted' });
};

module.exports = { getLocations, createLocation, updateLocation, deleteLocation };
