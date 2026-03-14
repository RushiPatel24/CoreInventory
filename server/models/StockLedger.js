const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  type: { type: String, enum: ['receipt', 'delivery', 'transfer_out', 'transfer_in', 'adjustment'], required: true },
  delta: { type: Number, required: true },
  refDoc: { type: mongoose.Schema.Types.ObjectId, refPath: 'refDocModel' },
  refDocModel: { type: String, enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'] },
  doneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
