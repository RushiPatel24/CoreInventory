const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: role || 'staff' });
  const token = signToken(user._id, user.role);
  res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user._id, user.role);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No account found with that email' });
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await User.findByIdAndUpdate(user._id, { otp, otpExpiry });
  // In production: send via email. For now, log to console.
  console.log(`[OTP] For ${email}: ${otp}`);
  res.json({ message: 'OTP sent (check server console)' });
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });
  res.json({ message: 'OTP verified', email });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await User.findByIdAndUpdate(user._id, { passwordHash, otp: null, otpExpiry: null });
  res.json({ message: 'Password reset successful' });
};

module.exports = { signup, login, forgotPassword, verifyOTP, resetPassword };
