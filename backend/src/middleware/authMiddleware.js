import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes and verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extract token from Bearer header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'hackathon_default_secret_key';
      const decoded = jwt.verify(token, secret);

      // Attach user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account has been removed',
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Email not verified. Please verify your email to access protected resources.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

export default protect;
