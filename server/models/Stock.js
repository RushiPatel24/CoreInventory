const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

stockSchema.index({ productId: 1, warehouseId: 1, locationId: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
