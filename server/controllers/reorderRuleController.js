const ReorderRule = require('../models/ReorderRule');

const getRules = async (req, res) => {
  const { productId, warehouseId } = req.query;
  const filter = {};
  if (productId) filter.productId = productId;
  if (warehouseId) filter.warehouseId = warehouseId;
  const rules = await ReorderRule.find(filter)
    .populate('productId', 'name sku')
    .populate('warehouseId', 'name');
  res.json(rules);
};

const upsertRule = async (req, res) => {
  const { productId, warehouseId, minQty } = req.body;
  if (!productId || !warehouseId || minQty === undefined)
    return res.status(400).json({ message: 'productId, warehouseId, minQty required' });
  const rule = await ReorderRule.findOneAndUpdate(
    { productId, warehouseId },
    { minQty },
    { new: true, upsert: true }
  ).populate('productId', 'name sku').populate('warehouseId', 'name');
  res.json(rule);
};

const deleteRule = async (req, res) => {
  await ReorderRule.findByIdAndDelete(req.params.id);
  res.json({ message: 'Rule deleted' });
};

module.exports = { getRules, upsertRule, deleteRule };
