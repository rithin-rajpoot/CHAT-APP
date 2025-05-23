import express from 'express';
import { getOtherUsers, getProfile, login, logout, register, updateProfile } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register)
router.post('/login',login);
router.get('/get-profile',isAuthenticated, getProfile);
router.get('/get-other-users',isAuthenticated, getOtherUsers);
router.post('/logout',isAuthenticated, logout);

router.post('/update-profile',isAuthenticated, updateProfile);

export default router;  // Exports the router module for use in other files.  This allows other files to import the router and use it in their routes.js file.  In this case, routes.js is the main entry point for the server.js file.  It defines all the routes for the server.  The server.js file then uses this router to handle incoming requests.  The router.get('/login',login) line in server.js is a route
