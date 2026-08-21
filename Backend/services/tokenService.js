import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_EXPIRES_IN = "24h";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

class TokenService {
  generateTokens(user) {
    const payload = {
      id: user._id || user.id,
      email: user.email,
      role: user.role || "customer",
      isSuperAdmin: user.isSuperAdmin || user.role === "super_admin",
    };

    // IMPORTANT:
    // Access token is ALWAYS 24 hours.
    // JWT_ACCESS_EXPIRE from .env is intentionally ignored.
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // Refresh token remains valid for 30 days.
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token) {
    try {
      if (!token) {
        throw new Error("No access token provided");
      }

      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Access token expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid access token");
      }

      throw error;
    }
  }

  verifyRefreshToken(token) {
    try {
      if (!token) {
        throw new Error("No refresh token provided");
      }

      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Refresh token expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid refresh token");
      }

      throw error;
    }
  }

  decodeToken(token) {
    if (!token) {
      return null;
    }

    return jwt.decode(token);
  }

  getTokenExpiry(token) {
    try {
      const decoded = jwt.decode(token);

      if (!decoded?.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  setAuthCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === "production";

    // Access token cookie = 24 hours
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    // Refresh token cookie = 30 days
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });
  }

  clearAuthCookies(res) {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
  }
}

export default new TokenService();
