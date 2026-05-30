import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, skills, interests, profileImage, section, semester, rollNumber } = req.body;
    const updateFields = { name, skills, interests, profileImage };
    if (section) updateFields.section = section;
    if (semester) updateFields.semester = semester;
    if (rollNumber) updateFields.rollNumber = rollNumber;
    const user = await User.findByIdAndUpdate(req.userId, updateFields, { new: true });
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
