import jwt from 'jsonwebtoken';

/**
 * Generate JSON Web Token
 * @param {string} id - User ID
 * @returns {string} - Signed JWT token
 */
export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'hackathon_default_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id }, secret, { expiresIn });
};

export default generateToken;
