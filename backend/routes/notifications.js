import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markAsRead);

export default router;
