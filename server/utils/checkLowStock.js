const Stock = require('../models/Stock');
const ReorderRule = require('../models/ReorderRule');

/**
 * After a stock-reducing operation, checks if any affected products
 * fall below their reorder threshold and returns low-stock items.
 * lines: [{ productId, warehouseId }]
 */
const checkLowStock = async (lines) => {
  const alerts = [];
  for (const line of lines) {
    const rule = await ReorderRule.findOne({
      productId: line.productId,
      warehouseId: line.warehouseId,
    });
    if (!rule) continue;
    // Sum all stock for that product+warehouse across all locations
    const stocks = await Stock.find({ productId: line.productId, warehouseId: line.warehouseId });
    const totalQty = stocks.reduce((sum, s) => sum + s.quantity, 0);
    if (totalQty <= rule.minQty) {
      alerts.push({ productId: line.productId, warehouseId: line.warehouseId, totalQty, minQty: rule.minQty });
    }
  }
  return alerts;
};

module.exports = checkLowStock;
