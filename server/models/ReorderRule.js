const mongoose = require('mongoose');

const reorderRuleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  minQty: { type: Number, required: true, default: 10 },
}, { timestamps: true });

reorderRuleSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

module.exports = mongoose.model('ReorderRule', reorderRuleSchema);
