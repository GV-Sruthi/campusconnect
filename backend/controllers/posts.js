import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const jwtSecret = process.env.JWT_SECRET || 'campusconnect_dev_secret';

const parseUserFromToken = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return await User.findById(decoded.id).select('branch year semester section');
  } catch {
    return null;
  }
};

const buildAudienceFilter = (user) => ({
  $or: [
    { audience: 'all' },
    { audience: 'year', targetYear: user.year },
    { audience: 'branch', targetBranch: user.branch },
    { audience: 'section', targetSection: user.section },
  ],
});

const notifyUrgentPost = async (post) => {
  const audienceFilter = {};
  if (post.audience === 'year') audienceFilter.year = post.targetYear;
  if (post.audience === 'branch') audienceFilter.branch = post.targetBranch;
  if (post.audience === 'section') audienceFilter.section = post.targetSection;

  const recipients = post.audience === 'all'
    ? await User.find({}).select('_id')
    : await User.find(audienceFilter).select('_id');

  const notifications = recipients
    .filter((recipient) => recipient._id.toString() !== post.author.toString())
    .map((recipient) => ({
      userId: recipient._id,
      message: `Urgent alert: ${post.title}`,
      type: 'urgent_alert',
      link: '/community',
    }));

  if (notifications.length) {
    await Notification.insertMany(notifications);
  }
};

export const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const currentUser = await parseUserFromToken(req);
    if (currentUser) Object.assign(filter, buildAudienceFilter(currentUser));
    const posts = await Post.find(filter).populate('author', 'name profileImage branch').sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, description, category, tags, audience: audienceInput, targetYear, targetBranch, targetSemester, targetSection } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description required' });

    const author = await User.findById(req.userId).select('branch year semester section');
    if (!author) return res.status(401).json({ success: false, message: 'User not found' });

    const audience = ['all', 'year', 'branch', 'section'].includes(audienceInput) ? audienceInput : 'all';
    const post = new Post({
      title,
      description,
      category: category || 'discussion',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      audience,
      targetYear: audience === 'year' ? parseInt(targetYear, 10) || author.year : undefined,
      targetBranch: audience === 'branch' ? targetBranch || author.branch : undefined,
      targetSemester: audience !== 'all' ? parseInt(targetSemester, 10) || author.semester : undefined,
      targetSection: audience === 'section' ? targetSection || author.section : undefined,
      author: req.userId,
    });

    await post.save();
    await post.populate('author', 'name profileImage branch');

    if (post.category === 'urgent') {
      await notifyUrgentPost(post);
    }

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name profileImage branch');
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });

    const commenter = await User.findById(req.userId).select('name');
    post.comments.push({ author: req.userId, text });
    await post.save();
    await post.populate('comments.author', 'name profileImage');

    if (post.author.toString() !== req.userId) {
      await Notification.create({
        userId: post.author,
        message: `${commenter?.name || 'Someone'} commented on your community post`,
        type: 'post_comment',
        link: '/community',
      });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
