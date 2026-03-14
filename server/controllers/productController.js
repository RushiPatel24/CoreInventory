const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const { search, category, archived } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
  if (category) filter.category = category;
  if (archived !== undefined) filter.isArchived = archived === 'true';
  else filter.isArchived = false;
  const products = await Product.find(filter).populate('category', 'name').populate('createdBy', 'name');
  res.json(products);
};

const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category').populate('createdBy', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const createProduct = async (req, res) => {
  const { name, sku, category, unitOfMeasure, reorderQty } = req.body;
  if (!name || !sku) return res.status(400).json({ message: 'Name and SKU are required' });
  const existing = await Product.findOne({ sku });
  if (existing) return res.status(400).json({ message: 'SKU already exists' });
  const product = await Product.create({ name, sku, category, unitOfMeasure, reorderQty, createdBy: req.user._id });
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const { name, sku, category, unitOfMeasure, reorderQty } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id, { name, sku, category, unitOfMeasure, reorderQty }, { new: true }
  ).populate('category');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const archiveProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product archived', product });
};

const unarchiveProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: false }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product unarchived', product });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, archiveProduct, unarchiveProduct, deleteProduct };
