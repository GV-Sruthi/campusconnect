#!/usr/bin/env node
/**
 * Backend initialization script - Creates directory structure and initial files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const backendDir = path.dirname(__filename);

// Define all files to create with their content
const filesToCreate = {
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
};

// Create directories and files
async function initialize() {
  try {
    // Create directories
    const dirs = ['models', 'routes', 'controllers', 'middleware', 'utils'];
    for (const dir of dirs) {
      const dirPath = path.join(backendDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      }
    }

    // Create files
    for (const [filePath, content] of Object.entries(filesToCreate)) {
      const fullPath = path.join(backendDir, filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content);
        console.log(`✓ Created file: ${filePath}`);
      }
    }

    console.log('\\n✅ Backend initialization complete!');
  } catch (error) {
    console.error('Error initializing backend:', error);
    process.exit(1);
  }
}

initialize();
`,
  'initialize.js': '' // We'll create this file now
};

// Actually, let me create this file properly
