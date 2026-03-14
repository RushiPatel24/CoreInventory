const mongoose = require('mongoose');

const deliveryLineSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  qty: { type: Number, required: true, min: 1 },
});

const deliverySchema = new mongoose.Schema({
  refNo: { type: String, unique: true },
  customer: { type: String, trim: true },
  status: { type: String, enum: ['draft', 'pick', 'pack', 'done', 'canceled'], default: 'draft' },
  lines: [deliveryLineSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: { type: Date },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
