import Note from '../models/Note.js';

export const getNotes = async (req, res) => {
  try {
    const { branch, semester, subject, title, keyword, tags, uploadedBy, bookmarkedBy, sort } = req.query;

    const filter = {};
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { subject: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (tags) filter.tags = { $in: tags.split(',').map((tag) => tag.trim()) };
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (bookmarkedBy) filter.bookmarks = bookmarkedBy;

    const sortOption = sort === 'downloads' ? { downloads: -1 } : sort === 'recommended' ? { downloads: -1, createdAt: -1 } : { createdAt: -1 };

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name profileImage branch year')
      .sort(sortOption);

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadNote = async (req, res) => {
  try {
    const { title, description, subject, semester, branch, tags } = req.body;

    if (!title || !subject || !semester || !branch || !req.file) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const fileType = req.file.mimetype || 'application/octet-stream';
    let fileUrl = req.file.path;
    if (!fileUrl.startsWith('http')) {
      fileUrl = `/uploads/notes/${req.file.filename}`;
    }

    const note = new Note({
      title,
      description: description || '',
      subject,
      semester: parseInt(semester),
      branch,
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      fileUrl,
      fileType,
      pdfLink: fileUrl,
      uploadedBy: req.userId,
    });

    await note.save();
    await note.populate('uploadedBy', 'name profileImage branch year');

    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name profileImage branch year');
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });

    const idx = note.upvotes.indexOf(req.userId);
    if (idx > -1) note.upvotes.splice(idx, 1);
    else note.upvotes.push(req.userId);

    await note.save();
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookmarkNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });

    const idx = note.bookmarks.indexOf(req.userId);
    if (idx > -1) note.bookmarks.splice(idx, 1);
    else note.bookmarks.push(req.userId);

    await note.save();
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });

    note.downloads += 1;
    await note.save();

    if (note.fileUrl.startsWith('http')) {
      return res.json({ success: true, downloadUrl: note.fileUrl });
    }

    const base = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const publicUrl = note.fileUrl.startsWith('/') ? `${base}${note.fileUrl}` : `${base}/${note.fileUrl.replace(/\\/g, '/')}`;
    res.json({ success: true, downloadUrl: publicUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

