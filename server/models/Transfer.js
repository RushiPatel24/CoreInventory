const mongoose = require('mongoose');

const transferLineSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true, min: 1 },
});

const transferSchema = new mongoose.Schema({
  refNo: { type: String, unique: true },
  fromLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  fromWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  toWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status: { type: String, enum: ['draft', 'ready', 'done', 'canceled'], default: 'draft' },
  lines: [transferLineSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
