import express from 'express';
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Authentication Routes
 */
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

/**
 * Protected Routes
 */
router.get('/me', protect, getMe);

export default router;
