const StockLedger = require('../models/StockLedger');

const getHistory = async (req, res) => {
  const { productId, warehouseId, type, startDate, endDate, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (productId) filter.productId = productId;
  if (warehouseId) filter.warehouseId = warehouseId;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const [entries, total] = await Promise.all([
    StockLedger.find(filter)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name')
      .populate('locationId', 'name code')
      .populate('doneBy', 'name')
      .populate('refDoc', 'refNo customer supplier toWarehouseId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit)),
    StockLedger.countDocuments(filter),
  ]);

  res.json({ entries, total, page: Number(page), pages: Math.ceil(total / limit) });
};

module.exports = { getHistory };
