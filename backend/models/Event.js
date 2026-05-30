import mongoose from 'mongoose';

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
