const Counter = require('../models/Counter');

const generateRefNo = async (prefix) => {
  const counter = await Counter.findOneAndUpdate(
    { prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(4, '0');
  return `${prefix}-${padded}`;
};

module.exports = generateRefNo;
