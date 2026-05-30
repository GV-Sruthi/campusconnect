import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true },
  semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required: true },
  branch: { type: String, enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'], required: true },
  tags: [{ type: String }],
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  pdfLink: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
