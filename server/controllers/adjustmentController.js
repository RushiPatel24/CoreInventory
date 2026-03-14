const Adjustment = require('../models/Adjustment');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const generateRefNo = require('../utils/generateRefNo');
const checkLowStock = require('../utils/checkLowStock');

const getAdjustments = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const adjustments = await Adjustment.find(filter)
    .populate('createdBy', 'name')
    .populate('lines.productId', 'name sku')
    .populate('lines.locationId', 'name code')
    .populate('lines.warehouseId', 'name')
    .sort({ createdAt: -1 });
  res.json(adjustments);
};

const getAdjustment = async (req, res) => {
  const adjustment = await Adjustment.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('lines.productId', 'name sku unitOfMeasure')
    .populate('lines.locationId', 'name code')
    .populate('lines.warehouseId', 'name');
  if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });
  res.json(adjustment);
};

const createAdjustment = async (req, res) => {
  const { lines, notes } = req.body;
  const refNo = await generateRefNo('ADJ');
  const adjustment = await Adjustment.create({ refNo, lines, notes, createdBy: req.user._id, status: 'draft' });
  res.status(201).json(adjustment);
};

const validateAdjustment = async (req, res) => {
  const adjustment = await Adjustment.findById(req.params.id);
  if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });
  if (adjustment.status === 'done') return res.status(400).json({ message: 'Already validated' });

  for (const line of adjustment.lines) {
    const stock = await Stock.findOne({ productId: line.productId, warehouseId: line.warehouseId, locationId: line.locationId });
    const currentQty = stock ? stock.quantity : 0;
    const delta = line.countedQty - currentQty;
    line.delta = delta;

    await Stock.findOneAndUpdate(
      { productId: line.productId, warehouseId: line.warehouseId, locationId: line.locationId },
      { quantity: line.countedQty },
      { upsert: true }
    );
    await StockLedger.create({
      productId: line.productId,
      warehouseId: line.warehouseId,
      locationId: line.locationId,
      type: 'adjustment',
      delta,
      refDoc: adjustment._id,
      refDocModel: 'Adjustment',
      doneBy: req.user._id,
    });
  }

  adjustment.status = 'done';
  await adjustment.save();

  const decreased = adjustment.lines.filter(l => l.delta < 0);
  const alerts = decreased.length
    ? await checkLowStock(decreased.map(l => ({ productId: l.productId, warehouseId: l.warehouseId })))
    : [];

  res.json({ message: 'Adjustment validated', adjustment, lowStockAlerts: alerts });
};

const cancelAdjustment = async (req, res) => {
  const adjustment = await Adjustment.findById(req.params.id);
  if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });
  if (adjustment.status === 'done') return res.status(400).json({ message: 'Cannot cancel a validated adjustment' });
  adjustment.status = 'canceled';
  await adjustment.save();
  res.json({ message: 'Adjustment canceled' });
};

module.exports = { getAdjustments, getAdjustment, createAdjustment, validateAdjustment, cancelAdjustment };
