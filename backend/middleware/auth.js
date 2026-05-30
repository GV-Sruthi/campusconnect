import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const jwtSecret = process.env.JWT_SECRET || 'campusconnect_dev_secret';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) { return res.status(401).json({ success: false, message: 'Invalid token' }); }
};

export const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !roles.includes(user.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
      req.user = user;
      next();
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
  };
};
