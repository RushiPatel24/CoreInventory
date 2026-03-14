const Delivery = require('../models/Delivery');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const generateRefNo = require('../utils/generateRefNo');
const validateStockAvailability = require('../utils/stockValidator');
const checkLowStock = require('../utils/checkLowStock');

const getDeliveries = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const deliveries = await Delivery.find(filter)
    .populate('createdBy', 'name')
    .populate('lines.productId', 'name sku')
    .populate('lines.locationId', 'name code')
    .populate('lines.warehouseId', 'name')
    .sort({ createdAt: -1 });
  res.json(deliveries);
};

const getDelivery = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('lines.productId', 'name sku unitOfMeasure')
    .populate('lines.locationId', 'name code')
    .populate('lines.warehouseId', 'name');
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  res.json(delivery);
};

const createDelivery = async (req, res) => {
  const { customer, lines, notes } = req.body;
  const refNo = await generateRefNo('DEL');
  const delivery = await Delivery.create({ refNo, customer, lines, notes, createdBy: req.user._id, status: 'draft' });
  res.status(201).json(delivery);
};

const updateDelivery = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  if (delivery.status === 'done') return res.status(400).json({ message: 'Cannot edit a validated delivery' });
  Object.assign(delivery, req.body);
  await delivery.save();
  res.json(delivery);
};

const validateDelivery = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  if (delivery.status === 'done') return res.status(400).json({ message: 'Already validated' });

  // Check stock availability first
  await validateStockAvailability(delivery.lines.map(l => ({
    productId: l.productId, warehouseId: l.warehouseId, locationId: l.locationId, qty: l.qty
  })));

  // Deduct stock
  for (const line of delivery.lines) {
    await Stock.findOneAndUpdate(
      { productId: line.productId, warehouseId: line.warehouseId, locationId: line.locationId },
      { $inc: { quantity: -line.qty } }
    );
    await StockLedger.create({
      productId: line.productId,
      warehouseId: line.warehouseId,
      locationId: line.locationId,
      type: 'delivery',
      delta: -line.qty,
      refDoc: delivery._id,
      refDocModel: 'Delivery',
      doneBy: req.user._id,
    });
  }

  delivery.status = 'done';
  delivery.validatedAt = new Date();
  await delivery.save();

  // Check low stock alerts
  const alerts = await checkLowStock(delivery.lines.map(l => ({ productId: l.productId, warehouseId: l.warehouseId })));
  res.json({ message: 'Delivery validated', delivery, lowStockAlerts: alerts });
};

const cancelDelivery = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  if (delivery.status === 'done') return res.status(400).json({ message: 'Cannot cancel a validated delivery' });
  delivery.status = 'canceled';
  await delivery.save();
  res.json({ message: 'Delivery canceled' });
};

module.exports = { getDeliveries, getDelivery, createDelivery, updateDelivery, validateDelivery, cancelDelivery };
