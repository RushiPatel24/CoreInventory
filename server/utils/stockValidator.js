const Stock = require('../models/Stock');

/**
 * Checks if each line has sufficient stock. Throws with a descriptive message if not.
 * lines: [{ productId, warehouseId, locationId, qty }]
 */
const validateStockAvailability = async (lines) => {
  for (const line of lines) {
    const stock = await Stock.findOne({
      productId: line.productId,
      warehouseId: line.warehouseId,
      locationId: line.locationId,
    });
    const available = stock ? stock.quantity : 0;
    if (available < line.qty) {
      const err = new Error(
        `Insufficient stock for product ${line.productId}: need ${line.qty}, have ${available}`
      );
      err.statusCode = 400;
      throw err;
    }
  }
};

module.exports = validateStockAvailability;
