const Transfer = require('../models/Transfer');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const generateRefNo = require('../utils/generateRefNo');
const validateStockAvailability = require('../utils/stockValidator');
const checkLowStock = require('../utils/checkLowStock');

const getTransfers = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const transfers = await Transfer.find(filter)
    .populate('createdBy', 'name')
    .populate('fromLocationId', 'name code')
    .populate('fromWarehouseId', 'name')
    .populate('toLocationId', 'name code')
    .populate('toWarehouseId', 'name')
    .populate('lines.productId', 'name sku')
    .sort({ createdAt: -1 });
  res.json(transfers);
};

const getTransfer = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('fromLocationId', 'name code')
    .populate('fromWarehouseId', 'name')
    .populate('toLocationId', 'name code')
    .populate('toWarehouseId', 'name')
    .populate('lines.productId', 'name sku unitOfMeasure');
  if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
  res.json(transfer);
};

const createTransfer = async (req, res) => {
  const { fromLocationId, fromWarehouseId, toLocationId, toWarehouseId, lines, notes } = req.body;
  const refNo = await generateRefNo('TRF');
  const transfer = await Transfer.create({ refNo, fromLocationId, fromWarehouseId, toLocationId, toWarehouseId, lines, notes, createdBy: req.user._id, status: 'draft' });
  res.status(201).json(transfer);
};

const updateTransfer = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
  if (transfer.status === 'done') return res.status(400).json({ message: 'Cannot edit a validated transfer' });
  Object.assign(transfer, req.body);
  await transfer.save();
  res.json(transfer);
};

const validateTransfer = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
  if (transfer.status === 'done') return res.status(400).json({ message: 'Already validated' });

  // Check source stock
  await validateStockAvailability(transfer.lines.map(l => ({
    productId: l.productId,
    warehouseId: transfer.fromWarehouseId,
    locationId: transfer.fromLocationId,
    qty: l.qty,
  })));

  for (const line of transfer.lines) {
    // Deduct from source
    await Stock.findOneAndUpdate(
      { productId: line.productId, warehouseId: transfer.fromWarehouseId, locationId: transfer.fromLocationId },
      { $inc: { quantity: -line.qty } }
    );
    await StockLedger.create({
      productId: line.productId, warehouseId: transfer.fromWarehouseId, locationId: transfer.fromLocationId,
      type: 'transfer_out', delta: -line.qty, refDoc: transfer._id, refDocModel: 'Transfer', doneBy: req.user._id,
    });

    // Add to destination
    await Stock.findOneAndUpdate(
      { productId: line.productId, warehouseId: transfer.toWarehouseId, locationId: transfer.toLocationId },
      { $inc: { quantity: line.qty } },
      { upsert: true }
    );
    await StockLedger.create({
      productId: line.productId, warehouseId: transfer.toWarehouseId, locationId: transfer.toLocationId,
      type: 'transfer_in', delta: line.qty, refDoc: transfer._id, refDocModel: 'Transfer', doneBy: req.user._id,
    });
  }

  transfer.status = 'done';
  await transfer.save();

  const alerts = await checkLowStock(transfer.lines.map(l => ({ productId: l.productId, warehouseId: transfer.fromWarehouseId })));
  res.json({ message: 'Transfer validated', transfer, lowStockAlerts: alerts });
};

const cancelTransfer = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
  if (transfer.status === 'done') return res.status(400).json({ message: 'Cannot cancel a validated transfer' });
  transfer.status = 'canceled';
  await transfer.save();
  res.json({ message: 'Transfer canceled' });
};

module.exports = { getTransfers, getTransfer, createTransfer, updateTransfer, validateTransfer, cancelTransfer };
