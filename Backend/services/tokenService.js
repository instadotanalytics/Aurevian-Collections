import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class TokenService {
  generateTokens(user) {
    const payload = {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'customer',
      // Add this to identify super admin
      isSuperAdmin: user.isSuperAdmin || user.role === 'super_admin',
    };

    // FORCE access token to expire after 24 hours.
    // This intentionally does NOT use JWT_ACCESS_EXPIRE from .env,
    // so a production environment variable such as JWT_ACCESS_EXPIRE=15m
    // cannot override it.
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: '24h',
      }
    );

    // Refresh token remains valid for 30 days.
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }

      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }

  getTokenExpiry(token) {
    try {
      const decoded = jwt.decode(token);

      return decoded?.exp
        ? new Date(decoded.exp * 1000)
        : null;
    } catch {
      return null;
    }
  }

  setAuthCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie: FORCE 24 hours
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Refresh token cookie: 30 days
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  clearAuthCookies(res) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
  }
}

export default new TokenService();
