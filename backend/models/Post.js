import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['announcement', 'lostfound', 'recruitment', 'discussion', 'urgent'], default: 'discussion' },
  audience: { type: String, enum: ['all', 'year', 'branch', 'section'], default: 'all' },
  targetYear: { type: Number, enum: [1, 2, 3, 4] },
  targetBranch: { type: String, enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'] },
  targetSemester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8] },
  targetSection: { type: String, trim: true, maxlength: 5 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
