import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true, maxlength: 50 },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'] },
    password: { type: String, required: [true, 'Please provide a password'], minlength: 6, select: false },
    rollNumber: { type: String, required: [true, 'Please provide a roll number'], trim: true, maxlength: 30 },
    branch: { type: String, enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BT', 'OTHER'], required: true },
    year: { type: Number, enum: [1, 2, 3, 4], required: true },
    semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required: true },
    section: { type: String, trim: true, maxlength: 5, required: true },
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
