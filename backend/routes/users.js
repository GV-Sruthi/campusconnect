import express from 'express';
import { getUserProfile, updateProfile, searchUsers } from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.patch('/profile', verifyToken, updateProfile);

export default router;
