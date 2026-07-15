import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class TokenService {
  generateAccessToken(userId, email, role) {
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_ACCESS_SECRET || 'default_access_secret',
      { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );
  }

  generateRefreshToken(userId, email, role) {
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
  }

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user._id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user._id, user.email, user.role);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default_access_secret');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }

  getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  }

  setAuthCookies(res, accessToken, refreshToken) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      signed: true,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      signed: true,
    });
  }

  clearAuthCookies(res) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: isProd ? 'none' : 'lax' 
    });
    res.clearCookie('refreshToken', { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: isProd ? 'none' : 'lax' 
    });
  }
}

export default new TokenService();