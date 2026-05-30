import express from 'express';
import { getPosts, createPost, getPostById, addComment, deletePost, pinPost, upvotePost } from '../controllers/posts.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getPosts);
router.post('/', verifyToken, createPost);
router.get('/:id', getPostById);
router.post('/:id/comment', verifyToken, addComment);
router.delete('/:id', verifyToken, deletePost);
router.patch('/:id/pin', verifyToken, pinPost);
router.post('/:id/upvote', verifyToken, upvotePost);

export default router;
