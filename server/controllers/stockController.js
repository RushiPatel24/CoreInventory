const Stock = require('../models/Stock');

const getStock = async (req, res) => {
  const { productId, warehouseId, locationId } = req.query;
  const filter = {};
  if (productId) filter.productId = productId;
  if (warehouseId) filter.warehouseId = warehouseId;
  if (locationId) filter.locationId = locationId;
  const stock = await Stock.find(filter)
    .populate('productId', 'name sku')
    .populate('warehouseId', 'name')
    .populate('locationId', 'name code');
  res.json(stock);
};

module.exports = { getStock };
