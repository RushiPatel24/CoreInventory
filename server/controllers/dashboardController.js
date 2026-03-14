const Stock = require('../models/Stock');
const ReorderRule = require('../models/ReorderRule');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');

const getDashboard = async (req, res) => {
  // Total products in stock (distinct products with qty > 0)
  const inStockDocs = await Stock.distinct('productId', { quantity: { $gt: 0 } });
  const totalInStock = inStockDocs.length;

  // Out of stock products (quantity === 0 or no stock entry at all)
  const outOfStockCount = await Product.countDocuments({ isArchived: false, _id: { $nin: inStockDocs } });

  // Low stock: products where total qty across all locations <= reorder rule minQty
  const rules = await ReorderRule.find();
  let lowStockCount = 0;
  for (const rule of rules) {
    const stocks = await Stock.find({ productId: rule.productId, warehouseId: rule.warehouseId });
    const totalQty = stocks.reduce((sum, s) => sum + s.quantity, 0);
    if (totalQty <= rule.minQty) lowStockCount++;
  }

  // Pending receipts (waiting or ready)
  const pendingReceipts = await Receipt.countDocuments({ status: { $in: ['waiting', 'ready', 'draft'] } });

  // Pending deliveries
  const pendingDeliveries = await Delivery.countDocuments({ status: { $in: ['draft', 'pick', 'pack'] } });

  // Scheduled transfers
  const scheduledTransfers = await Transfer.countDocuments({ status: { $in: ['draft', 'ready'] } });

  // Recent activity — last 10 ledger entries
  const recentActivity = await StockLedger.find()
    .populate('productId', 'name sku')
    .populate('warehouseId', 'name')
    .populate('locationId', 'name')
    .populate('doneBy', 'name')
    .sort({ timestamp: -1 })
    .limit(10);

  // Bar chart: stock movements over last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailyMovements = await StockLedger.aggregate([
    { $match: { timestamp: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        totalIn: { $sum: { $cond: [{ $gt: ['$delta', 0] }, '$delta', 0] } },
        totalOut: { $sum: { $cond: [{ $lt: ['$delta', 0] }, { $abs: '$delta' }, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Donut chart: stock by category
  const stockByCategory = await Stock.aggregate([
    { $group: { _id: '$productId', totalQty: { $sum: '$quantity' } } },
    {
      $lookup: {
        from: 'products', localField: '_id', foreignField: '_id', as: 'product',
        pipeline: [{ $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } }],
      },
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: { $arrayElemAt: ['$product.category.name', 0] },
        qty: { $sum: '$totalQty' },
      },
    },
    { $project: { category: { $ifNull: ['$_id', 'Uncategorized'] }, qty: 1 } },
  ]);

  res.json({
    kpis: { totalInStock, outOfStockCount, lowStockCount, pendingReceipts, pendingDeliveries, scheduledTransfers },
    recentActivity,
    dailyMovements,
    stockByCategory,
  });
};

module.exports = { getDashboard };
