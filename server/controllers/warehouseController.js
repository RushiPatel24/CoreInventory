const Warehouse = require('../models/Warehouse');

const getWarehouses = async (req, res) => {
  const warehouses = await Warehouse.find().sort({ name: 1 });
  res.json(warehouses);
};

const createWarehouse = async (req, res) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const warehouse = await Warehouse.create({ name, address });
  res.status(201).json(warehouse);
};

const updateWarehouse = async (req, res) => {
  const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
  res.json(warehouse);
};

const deleteWarehouse = async (req, res) => {
  await Warehouse.findByIdAndDelete(req.params.id);
  res.json({ message: 'Warehouse deleted' });
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };
