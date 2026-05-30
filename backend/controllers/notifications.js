import Notification from '../models/Notification.js';

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
