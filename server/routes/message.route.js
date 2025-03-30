import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { getConversationMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send/:receiverId', isAuthenticated, sendMessage);
router.get('/get-messages/:receiverId', isAuthenticated, getConversationMessages);

export default router;