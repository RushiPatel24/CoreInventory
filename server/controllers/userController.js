const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateMe = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true }).select('-passwordHash -otp -otpExpiry');
  res.json(user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated' });
};

const getUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash -otp -otpExpiry').sort({ createdAt: -1 });
  res.json(users);
};

module.exports = { getMe, updateMe, changePassword, getUsers };
