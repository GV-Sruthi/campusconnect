import Event from '../models/Event.js';
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
