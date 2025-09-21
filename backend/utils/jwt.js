import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user authentication
 * @param {Object} payload - User data to include in token
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  const { userId, email } = payload;
  
  if (!userId || !email) {
    throw new Error('User ID and email are required for token generation');
  }

  const tokenPayload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'udaan-ai',
    audience: process.env.JWT_AUDIENCE || 'udaan-ai-users'
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, options);
};

/**
 * Generate refresh token for token renewal
 * @param {Object} payload - User data to include in token
 * @param {string} payload.userId - User ID
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  const { userId } = payload;
  
  if (!userId) {
    throw new Error('User ID is required for refresh token generation');
  }

  const tokenPayload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'udaan-ai',
    audience: process.env.JWT_AUDIENCE || 'udaan-ai-users'
  };

  return jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, options);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token is required for verification');
  }

  try {
    const options = {
      issuer: process.env.JWT_ISSUER || 'udaan-ai',
      audience: process.env.JWT_AUDIENCE || 'udaan-ai-users'
    };

    return jwt.verify(token, process.env.JWT_SECRET, options);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Verify refresh token
 * @param {string} refreshToken - Refresh token to verify
 * @returns {Object} Decoded refresh token payload
 */
export const verifyRefreshToken = (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required for verification');
  }

  try {
    const options = {
      issuer: process.env.JWT_ISSUER || 'udaan-ai',
      audience: process.env.JWT_AUDIENCE || 'udaan-ai-users'
    };

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, options);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Check if token is expired
 * @param {Object} decodedToken - Decoded JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};