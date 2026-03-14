const mongoose = require('mongoose');

const adjustmentLineSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  countedQty: { type: Number, required: true, min: 0 },
  delta: { type: Number },
  reason: { type: String, trim: true },
});

const adjustmentSchema = new mongoose.Schema({
  refNo: { type: String, unique: true },
  status: { type: String, enum: ['draft', 'done', 'canceled'], default: 'draft' },
  lines: [adjustmentLineSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Adjustment', adjustmentSchema);
