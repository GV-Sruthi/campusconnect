#!/usr/bin/env node
/**
 * NotesNest Backend Complete Setup Script
 * Run this once to create all backend files and directories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, 'backend');

// Ensure backend directory exists
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
}

// All files to create
const filesStructure = {
  'models/User.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\\w+([\\.\\-]?\\w+)*@\\w+([\\.\\-]?\\w+)*(\\.\\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'],
      required: true,
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    skills: [String],
    interests: [String],
    profileImage: String,
    role: {
      type: String,
      enum: ['student', 'club', 'superadmin'],
      default: 'student',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
`,
  'models/Note.js': `import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required: true },
  branch: { type: String, enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'], required: true },
  unit: { type: String, required: true },
  pdfLink: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
`,
  'models/Post.js': `import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['announcement', 'lostfound', 'recruitment', 'discussion', 'urgent'], default: 'discussion' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
`,
  'models/Event.js': `import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  registrationLink: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['workshop', 'hackathon', 'cultural', 'sports', 'seminar'], default: 'workshop' },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
`,
  'models/Notification.js': `import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['post_comment', 'urgent_alert', 'new_note', 'event_reminder'], default: 'post_comment' },
  isRead: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
`,
  'controllers/auth.js': `import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;
    if (!name || !email || !password || !branch || !year) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });
    user = new User({ name, email, password, branch, year });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'User registered successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Logged in successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`,
  'middleware/auth.js': `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};
`,
  'routes/auth.js': `import express from 'express';
import { register, login, getMe } from '../controllers/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

export default router;
`,
  '.gitignore': `node_modules/
.env
.env.local
*.log
.DS_Store
`,
};

// Create all files
let created = 0;
for (const [filePath, content] of Object.entries(filesStructure)) {
  const fullPath = path.join(backendDir, filePath);
  const dir = path.dirname(fullPath);

  // Create directory if needed
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create file if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Created: ${filePath}`);
    created++;
  }
}

console.log(`\n✅ Created ${created} files. Backend structure initialized!`);
