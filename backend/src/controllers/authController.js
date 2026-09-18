import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../services/emailService.js';

/**
 * Helper to check if MongoDB connection is ready
 */
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Helper to generate a cryptographically secure 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Get OTP expiration in minutes from environment or default to 10
 */
const getOtpExpiryMinutes = () => {
  const parsed = parseInt(process.env.OTP_EXPIRY_MINUTES, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : 10;
};

/**
 * @desc    Register a new user and dispatch OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation: Missing fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password',
      });
    }

    // Validation: Email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validation: Password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Please try again later.',
      });
    }

    const expiryMinutes = getOtpExpiryMinutes();
    const existingUser = await User.findOne({ email: normalizedEmail }).select('+password +otp +otpExpiresAt +otpLastSentAt');

    // Case 1: User already registered and email is verified
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const otp = generateOtp();

    // Case 2: User exists but email is not verified yet
    if (existingUser && !existingUser.isEmailVerified) {
      const COOLDOWN_MS = 30 * 1000;
      if (existingUser.otpLastSentAt) {
        const timeSinceLast = Date.now() - new Date(existingUser.otpLastSentAt).getTime();
        if (timeSinceLast < COOLDOWN_MS) {
          const remainingSec = Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000);
          return res.status(429).json({
            success: false,
            message: `Resend available in ${remainingSec} seconds`,
            remainingSeconds: remainingSec,
          });
        }
      }

      // Update name, password, and set new OTP
      existingUser.name = name.trim();
      existingUser.password = password;
      existingUser.setOtp(otp, expiryMinutes);

      // Send OTP via Brevo
      try {
        await sendVerificationEmail({
          toEmail: normalizedEmail,
          toName: name.trim(),
          otp,
          expiryMinutes,
        });
      } catch (emailErr) {
        return res.status(502).json({
          success: false,
          message: 'Failed to send verification email. Please verify email configuration or try again.',
        });
      }

      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: 'A verification code has been sent to your email.',
        email: normalizedEmail,
      });
    }

    // Case 3: Fresh registration
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isEmailVerified: false,
    });

    newUser.setOtp(otp, expiryMinutes);

    // Send OTP via Brevo
    try {
      await sendVerificationEmail({
        toEmail: normalizedEmail,
        toName: name.trim(),
        otp,
        expiryMinutes,
      });
    } catch (emailErr) {
      return res.status(502).json({
        success: false,
        message: 'Failed to send verification email. Please verify email configuration or try again.',
      });
    }

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'Account created! Please enter the verification code sent to your email.',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

/**
 * @desc    Verify OTP for email activation
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and verification code',
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Please try again later.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt');

    // 1. User exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    // 5. User is not already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in directly.',
      });
    }

    // 2. OTP exists, 3. Not expired, 4. OTP matches
    const verification = user.verifyOtp(otp);

    if (!verification.valid) {
      if (verification.reason === 'NO_OTP') {
        return res.status(400).json({
          success: false,
          message: 'No pending verification code found. Please request a new OTP.',
        });
      }
      if (verification.reason === 'EXPIRED') {
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new OTP.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    // Mark as verified & invalidate OTP
    user.isEmailVerified = true;
    user.clearOtp();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
    });
  }
};

/**
 * @desc    Resend OTP to user email
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Please try again later.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt +otpLastSentAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in directly.',
      });
    }

    // Cooldown check (30 seconds)
    const COOLDOWN_MS = 30 * 1000;
    if (user.otpLastSentAt) {
      const timeSinceLast = Date.now() - new Date(user.otpLastSentAt).getTime();
      if (timeSinceLast < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000);
        return res.status(429).json({
          success: false,
          message: `Resend available in ${remainingSec} seconds`,
          remainingSeconds: remainingSec,
        });
      }
    }

    const otp = generateOtp();
    const expiryMinutes = getOtpExpiryMinutes();

    user.setOtp(otp, expiryMinutes);

    // Send OTP via Brevo
    try {
      await sendVerificationEmail({
        toEmail: normalizedEmail,
        toName: user.name,
        otp,
        expiryMinutes,
      });
    } catch (emailErr) {
      return res.status(502).json({
        success: false,
        message: 'Failed to send verification email. Please verify email configuration or try again.',
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('Resend OTP Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
    });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Please try again later.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // 1. Email exists?
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 2. Password correct?
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Email verified?
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        isEmailVerified: false,
        email: user.email,
      });
    }

    // 4. Generate JWT & respond
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get Current User Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
    });
  }
};

export default {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  getMe,
};
