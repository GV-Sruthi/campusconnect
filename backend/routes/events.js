import express from 'express';
import { getEvents, createEvent, getEventById } from '../controllers/events.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getEvents);
router.post('/', verifyToken, createEvent);
router.get('/:id', getEventById);

export default router;
