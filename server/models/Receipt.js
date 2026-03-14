const mongoose = require('mongoose');

const receiptLineSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  expectedQty: { type: Number, required: true, min: 0 },
  receivedQty: { type: Number, default: 0 },
});

const receiptSchema = new mongoose.Schema({
  refNo: { type: String, unique: true },
  supplier: { type: String, trim: true },
  status: { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], default: 'draft' },
  lines: [receiptLineSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: { type: Date },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
