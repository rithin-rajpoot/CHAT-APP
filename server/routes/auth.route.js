import express from "express";
import { googleAuth } from "../controllers/auth.controller.js";

const router = express.Router();

// Google OAuth login/signup
router.post("/google", googleAuth);

export default router;
