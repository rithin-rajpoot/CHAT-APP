import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { clearChat, getConversationMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send/:receiverId', isAuthenticated, sendMessage);
router.get('/get-messages/:receiverId', isAuthenticated, getConversationMessages);
router.delete('/clear-chat/:receiverId', isAuthenticated, clearChat);

export default router;