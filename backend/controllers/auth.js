import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'campusconnect_dev_secret';
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Using a default development secret. Set JWT_SECRET in backend/.env for production.');
}

const generateToken = (id) => jwt.sign({ id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRE || '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, rollNumber, branch, year, semester, section } = req.body;
    if (!name || !email || !password || !rollNumber || !branch || !year || !semester || !section) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User exists' });
    user = new User({ name, email, password, rollNumber, branch, year, semester, section });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name,
        email,
        rollNumber,
        branch,
        year,
        semester,
        section,
        role: user.role,
        profileImage: user.profileImage || '',
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Credentials required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const valid = await user.matchPassword(password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email,
        rollNumber: user.rollNumber,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        section: user.section,
        role: user.role,
        profileImage: user.profileImage || '',
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
