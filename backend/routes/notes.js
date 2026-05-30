import express from 'express';
import { getNotes, uploadNote, getNoteById, upvoteNote, bookmarkNote, downloadNote } from '../controllers/notes.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadNotes } from '../middleware/upload.js';

const router = express.Router();
router.get('/', getNotes);
router.post('/', verifyToken, uploadNotes.single('pdf'), uploadNote);
router.get('/:id', getNoteById);
router.post('/:id/upvote', verifyToken, upvoteNote);
router.post('/:id/bookmark', verifyToken, bookmarkNote);
router.get('/:id/download', downloadNote);

export default router;
