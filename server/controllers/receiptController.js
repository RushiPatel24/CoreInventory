const Receipt = require('../models/Receipt');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const generateRefNo = require('../utils/generateRefNo');
const checkLowStock = require('../utils/checkLowStock');

const getReceipts = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const receipts = await Receipt.find(filter)
    .populate('createdBy', 'name')
    .populate('lines.productId', 'name sku')
    .populate('lines.locationId', 'name code')
    .populate('lines.warehouseId', 'name')
    .sort({ createdAt: -1 });
  res.json(receipts);
};

const getReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('lines.productId', 'name sku unitOfMeasure')
    .populate('lines.locationId', 'name code')
    .populate('lines.warehouseId', 'name');
  if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
  res.json(receipt);
};

const createReceipt = async (req, res) => {
  const { supplier, lines, notes } = req.body;
  const refNo = await generateRefNo('REC');
  const receipt = await Receipt.create({ refNo, supplier, lines, notes, createdBy: req.user._id, status: 'draft' });
  res.status(201).json(receipt);
};

const updateReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
  if (receipt.status === 'done') return res.status(400).json({ message: 'Cannot edit a validated receipt' });
  Object.assign(receipt, req.body);
  await receipt.save();
  res.json(receipt);
};

const validateReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
  if (receipt.status === 'done') return res.status(400).json({ message: 'Already validated' });

  for (const line of receipt.lines) {
    const receivedQty = line.receivedQty || line.expectedQty;
    line.receivedQty = receivedQty;

    // Upsert stock
    await Stock.findOneAndUpdate(
      { productId: line.productId, warehouseId: line.warehouseId, locationId: line.locationId },
      { $inc: { quantity: receivedQty } },
      { upsert: true }
    );

    // Log to ledger
    await StockLedger.create({
      productId: line.productId,
      warehouseId: line.warehouseId,
      locationId: line.locationId,
      type: 'receipt',
      delta: receivedQty,
      refDoc: receipt._id,
      refDocModel: 'Receipt',
      doneBy: req.user._id,
    });
  }

  receipt.status = 'done';
  receipt.validatedAt = new Date();
  await receipt.save();
  res.json({ message: 'Receipt validated', receipt });
};

const cancelReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
  if (receipt.status === 'done') return res.status(400).json({ message: 'Cannot cancel a validated receipt' });
  receipt.status = 'canceled';
  await receipt.save();
  res.json({ message: 'Receipt canceled' });
};

module.exports = { getReceipts, getReceipt, createReceipt, updateReceipt, validateReceipt, cancelReceipt };
