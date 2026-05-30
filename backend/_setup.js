#!/usr/bin/env node
/**
 * NotesNest Complete Backend Setup
 * This script creates all necessary backend files and directories
 * Run from the backend directory: node _setup.js
 */

import fs from 'fs';
import path from 'path';

const files = {
  'models/User.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true, maxlength: 50 },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true, match: [/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please provide a valid email'] },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 6, select: false },
    branch: { type: String, enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'], required: true },
    year: { type: Number, enum: [1, 2, 3, 4], required: true },
    skills: [String],
    interests: [String],
    profileImage: String,
    role: { type: String, enum: ['student', 'club', 'superadmin'], default: 'student' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) { next(error); }
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
  comments: [{ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
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

  'middleware/auth.js': `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
`,

  'middleware/upload.js': `import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'notesnest/notes', resource_type: 'auto' },
});

export const uploadNotes = multer({ storage });
`,

  'controllers/auth.js': `import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;
    if (!name || !email || !password || !branch || !year) return res.status(400).json({ success: false, message: 'All fields required' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User exists' });
    user = new User({ name, email, password, branch, year });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name, email, role: user.role } });
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
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
`,

  'controllers/notes.js': `import Note from '../models/Note.js';

export const getNotes = async (req, res) => {
  try {
    const { branch, semester, subject } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    const notes = await Note.find(filter).populate('uploadedBy', 'name profileImage').sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const uploadNote = async (req, res) => {
  try {
    const { title, subject, semester, branch, unit } = req.body;
    if (!title || !subject || !semester || !branch || !unit || !req.file) return res.status(400).json({ success: false, message: 'All fields required' });
    // multer-storage-cloudinary sets file.path to the Cloudinary secure URL
    const note = new Note({
      title,
      subject,
      semester: parseInt(semester),
      branch,
      unit,
      pdfLink: req.file.path,
      uploadedBy: req.userId,
    });
    await note.save();
    await note.populate('uploadedBy', 'name profileImage');
    res.status(201).json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name profileImage');
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const upvoteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });
    const idx = note.upvotes.indexOf(req.userId);
    if (idx > -1) note.upvotes.splice(idx, 1);
    else note.upvotes.push(req.userId);
    await note.save();
    res.json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const bookmarkNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });
    const idx = note.bookmarks.indexOf(req.userId);
    if (idx > -1) note.bookmarks.splice(idx, 1);
    else note.bookmarks.push(req.userId);
    await note.save();
    res.json({ success: true, note });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });
    note.downloads += 1;
    await note.save();
    res.json({ success: true, downloadUrl: note.pdfLink });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
`,

  'controllers/posts.js': `import Post from '../models/Post.js';
import User from '../models/User.js';

export const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const posts = await Post.find(filter).populate('author', 'name profileImage branch').sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description required' });
    const post = new Post({ title, description, category: category || 'discussion', tags: tags || [], author: req.userId });
    await post.save();
    await post.populate('author', 'name profileImage branch');
    res.status(201).json({ success: true, post });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name profileImage branch');
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, post });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    post.comments.push({ author: req.userId, text });
    await post.save();
    await post.populate('comments.author', 'name profileImage');
    res.json({ success: true, post });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    const isAuthor = post.author.toString() === req.userId;
    const user = await User.findById(req.userId);
    const isSuperAdmin = user && user.role === 'superadmin';
    if (!isAuthor && !isSuperAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const pinPost = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !['club', 'superadmin'].includes(user.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ success: true, post });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    const idx = post.upvotes.indexOf(req.userId);
    if (idx > -1) post.upvotes.splice(idx, 1);
    else post.upvotes.push(req.userId);
    await post.save();
    res.json({ success: true, post });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
`,

  'controllers/events.js': `import Event from '../models/Event.js';
import User from '../models/User.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('postedBy', 'name profileImage').sort({ date: 1 });
    res.json({ success: true, events });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !['club', 'superadmin'].includes(user.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const { eventName, description, venue, date, time, registrationLink, category } = req.body;
    if (!eventName || !description || !venue || !date || !time) return res.status(400).json({ success: false, message: 'All fields required' });
    const event = new Event({ eventName, description, venue, date, time, registrationLink, category, postedBy: req.userId });
    await event.save();
    await event.populate('postedBy', 'name profileImage');
    res.status(201).json({ success: true, event });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('postedBy', 'name profileImage');
    if (!event) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, event });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
`,

  'controllers/users.js': `import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, skills, interests, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { name, skills, interests, profileImage }, { new: true });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const searchUsers = async (req, res) => {
  try {
    const { skills, branch } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (skills) filter.skills = { $in: skills.split(',') };
    const users = await User.find(filter).select('-password');
    res.json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
`,

  'controllers/notifications.js': `import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, notification });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
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

  'routes/notes.js': `import express from 'express';
import { getNotes, uploadNote, getNoteById, upvoteNote, bookmarkNote, downloadNote } from '../controllers/notes.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadNotes } from '../middleware/upload.js';

const router = express.Router();
router.get('/', getNotes);
router.post('/', verifyToken, uploadNotes.single('pdf'), uploadNote);
router.get('/:id', getNoteById);
router.post('/:id/upvote', verifyToken, upvoteNote);
router.post('/:id/bookmark', verifyToken, bookmarkNote);
router.get('/:id/download', downloadNote);

export default router;
`,

  'routes/posts.js': `import express from 'express';
import { getPosts, createPost, getPostById, addComment, deletePost, pinPost, upvotePost } from '../controllers/posts.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getPosts);
router.post('/', verifyToken, createPost);
router.get('/:id', getPostById);
router.post('/:id/comment', verifyToken, addComment);
router.delete('/:id', verifyToken, deletePost);
router.patch('/:id/pin', verifyToken, pinPost);
router.post('/:id/upvote', verifyToken, upvotePost);

export default router;
`,

  'routes/events.js': `import express from 'express';
import { getEvents, createEvent, getEventById } from '../controllers/events.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getEvents);
router.post('/', verifyToken, createEvent);
router.get('/:id', getEventById);

export default router;
`,

  'routes/users.js': `import express from 'express';
import { getUserProfile, updateProfile, searchUsers } from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.patch('/profile', verifyToken, updateProfile);

export default router;
`,

  'routes/notifications.js': `import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markAsRead);

export default router;
`,
};

// Create all directories and files
let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(path.resolve('.'), filePath);
  const dir = path.dirname(fullPath);

  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ ${filePath}`);
    count++;
  }
}

console.log(`\n✅ Created ${count} backend files!`);
