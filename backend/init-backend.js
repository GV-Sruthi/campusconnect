#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const backendDir = '.';

// All file contents to create
const files = {
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

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
    },
    semester: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
      required: true,
    },
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'],
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    pdfLink: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
`,

  'models/Post.js': `import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      enum: ['announcement', 'lostfound', 'recruitment', 'discussion', 'urgent'],
      default: 'discussion',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [String],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
`,

  'models/Event.js': `import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Please provide an event name'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    registrationLink: String,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['workshop', 'hackathon', 'cultural', 'sports', 'seminar'],
      default: 'workshop',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
`,

  'models/Notification.js': `import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['post_comment', 'urgent_alert', 'new_note', 'event_reminder'],
      default: 'post_comment',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: String,
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
`,

  'models/index.js': `export { default as User } from './User.js';
export { default as Note } from './Note.js';
export { default as Post } from './Post.js';
export { default as Event } from './Event.js';
export { default as Notification } from './Notification.js';
`,

  'middleware/auth.js': `import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

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
      const User = (await import('../models/User.js')).default;
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
  params: {
    folder: 'notesnest/notes',
    resource_type: 'auto',
  },
});

export const uploadNotes = multer({ storage });
`,

  'controllers/auth.js': `import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;
    
    if (!name || !email || !password || !branch || !year) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({ name, email, password, branch, year });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadNote = async (req, res) => {
  try {
    const { title, subject, semester, branch, unit } = req.body;

    if (!title || !subject || !semester || !branch || !unit || !req.file) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

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

    res.status(201).json({ success: true, message: 'Note uploaded successfully', note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploadedBy', 'name profileImage')
      .populate('upvotes', 'name');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const userIndex = note.upvotes.indexOf(req.userId);
    if (userIndex > -1) {
      note.upvotes.splice(userIndex, 1);
    } else {
      note.upvotes.push(req.userId);
    }

    await note.save();
    res.json({ success: true, message: 'Upvote toggled', note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookmarkNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const bookmarkIndex = note.bookmarks.indexOf(req.userId);
    if (bookmarkIndex > -1) {
      note.bookmarks.splice(bookmarkIndex, 1);
    } else {
      note.bookmarks.push(req.userId);
    }

    await note.save();
    res.json({ success: true, message: 'Bookmark toggled', note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.downloads += 1;
    await note.save();

    res.json({ success: true, message: 'Download count incremented', downloadUrl: note.pdfLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`,

  'controllers/posts.js': `import Post from '../models/Post.js';

export const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const posts = await Post.find(filter)
      .populate('author', 'name profileImage branch')
      .populate('comments.author', 'name profileImage')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const post = new Post({
      title,
      description,
      category: category || 'discussion',
      tags: tags || [],
      author: req.userId,
    });

    await post.save();
    await post.populate('author', 'name profileImage branch');

    res.status(201).json({ success: true, message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profileImage branch')
      .populate('comments.author', 'name profileImage');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({ author: req.userId, text });
    await post.save();
    await post.populate('comments.author', 'name profileImage');

    res.json({ success: true, message: 'Comment added', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isAuthor = post.author.toString() === req.userId;
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);
    const isSuperAdmin = user && user.role === 'superadmin';

    if (!isAuthor && !isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pinPost = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);

    if (!user || !['club', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Only club/superadmin can pin' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ success: true, message: 'Pin status toggled', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIndex = post.upvotes.indexOf(req.userId);
    if (userIndex > -1) {
      post.upvotes.splice(userIndex, 1);
    } else {
      post.upvotes.push(req.userId);
    }

    await post.save();
    res.json({ success: true, message: 'Upvote toggled', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`,

  'controllers/events.js': `import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('postedBy', 'name profileImage')
      .sort({ date: 1 });

    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.userId);

    if (!user || !['club', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Only club/superadmin can create events' });
    }

    const { eventName, description, venue, date, time, registrationLink, category } = req.body;

    if (!eventName || !description || !venue || !date || !time) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const event = new Event({
      eventName,
      description,
      venue,
      date,
      time,
      registrationLink,
      category,
      postedBy: req.userId,
    });

    await event.save();
    await event.populate('postedBy', 'name profileImage');

    res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('postedBy', 'name profileImage');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`,

  'controllers/users.js': `import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, skills, interests, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, skills, interests, profileImage },
      { new: true }
    );

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { skills, branch } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (skills) filter.skills = { $in: skills.split(',') };

    const users = await User.find(filter).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`,

  'controllers/notifications.js': `import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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

  'seed.js': `import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import Note from './models/Note.js';
import Event from './models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Note.deleteMany({});
    await Event.deleteMany({});

    // Create users
    const users = await User.create([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@college.com',
        password: 'password123',
        branch: 'CSE',
        year: 2,
        skills: ['React', 'Node.js', 'MongoDB'],
        interests: ['Web Development', 'AI'],
        role: 'student',
      },
      {
        name: 'Priya Singh',
        email: 'priya@college.com',
        password: 'password123',
        branch: 'ECE',
        year: 3,
        skills: ['IoT', 'Arduino'],
        interests: ['Robotics'],
        role: 'club',
      },
      {
        name: 'Admin User',
        email: 'admin@college.com',
        password: 'password123',
        branch: 'CSE',
        year: 4,
        skills: [],
        role: 'superadmin',
      },
    ]);

    console.log('✓ Users created:', users.length);

    // Create posts
    const posts = await Post.create([
      {
        title: 'Campus Tech Hackathon 2024',
        description: 'Join us for an amazing hackathon on Dec 15th! All students welcome.',
        category: 'announcement',
        author: users[0]._id,
        tags: ['hackathon', 'coding'],
      },
      {
        title: 'Lost: Blue Backpack',
        description: 'Lost my blue backpack near the library. Contains important notes. Please contact if found.',
        category: 'lostfound',
        author: users[1]._id,
        tags: ['lost'],
      },
      {
        title: 'Looking for React Developers',
        description: 'Our startup is hiring React developers. Contact for internship opportunities.',
        category: 'recruitment',
        author: users[0]._id,
        tags: ['recruitment', 'react'],
      },
      {
        title: 'URGENT: Classes Rescheduled',
        description: 'All classes on Monday are rescheduled to Tuesday due to infrastructure issues.',
        category: 'urgent',
        author: users[2]._id,
        tags: ['urgent', 'academic'],
        isPinned: true,
      },
      {
        title: 'Discussion: Best Programming Languages',
        description: 'What do you think is the best programming language for beginners?',
        category: 'discussion',
        author: users[1]._id,
        tags: ['programming', 'discussion'],
      },
    ]);

    console.log('✓ Posts created:', posts.length);

    // Create notes
    const notes = await Note.create([
      {
        title: 'Data Structures - Unit 1',
        subject: 'Data Structures',
        semester: 2,
        branch: 'CSE',
        unit: 'Unit 1 - Arrays & Linked Lists',
        pdfLink: 'https://via.placeholder.com/150.pdf',
        uploadedBy: users[0]._id,
      },
      {
        title: 'Digital Electronics Notes',
        subject: 'Digital Electronics',
        semester: 3,
        branch: 'ECE',
        unit: 'Unit 2 - Logic Gates',
        pdfLink: 'https://via.placeholder.com/150.pdf',
        uploadedBy: users[1]._id,
      },
      {
        title: 'Database Management System',
        subject: 'DBMS',
        semester: 4,
        branch: 'CSE',
        unit: 'Unit 3 - Normalization',
        pdfLink: 'https://via.placeholder.com/150.pdf',
        uploadedBy: users[0]._id,
      },
    ]);

    console.log('✓ Notes created:', notes.length);

    // Create events
    const events = await Event.create([
      {
        eventName: 'Annual Tech Fest 2024',
        description: 'Biggest technical festival of the year with competitions and workshops.',
        venue: 'Main Campus Hall',
        date: new Date('2024-12-15'),
        time: '10:00 AM',
        registrationLink: 'https://forms.example.com/techfest',
        postedBy: users[1]._id,
        category: 'hackathon',
      },
      {
        eventName: 'Expert Talk: AI in Industry',
        description: 'Hear from leading AI researchers about the future of artificial intelligence.',
        venue: 'Auditorium',
        date: new Date('2024-12-10'),
        time: '2:00 PM',
        registrationLink: 'https://forms.example.com/aitalk',
        postedBy: users[2]._id,
        category: 'seminar',
      },
    ]);

    console.log('✓ Events created:', events.length);

    console.log('\\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
`,
};

// Create all directories and files using filesystem operations
function createStructure() {
  const baseDir = '.';
  
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = filePath;
    const parts = fullPath.split('/');
    
    // Create parent directories
    let currentDir = baseDir;
    for (let i = 0; i < parts.length - 1; i++) {
      currentDir = currentDir + '/' + parts[i];
      if (!fs.existsSync(currentDir)) {
        fs.mkdirSync(currentDir, { recursive: true });
      }
    }
    
    // Create file
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
      console.log(`✓ Created: ${filePath}`);
    } else {
      console.log(`⚠ Already exists: ${filePath}`);
    }
  }
}

createStructure();
`,
  'utils/init.js': '' // placeholder
};

// Actually let me create this file with better structure
