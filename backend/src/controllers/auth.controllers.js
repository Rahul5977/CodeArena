import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../libs/email.lib.js";

// Single-admin model: the one admin is whoever registers with ADMIN_EMAIL.
const roleFor = (email) =>
  process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
    ? "ADMIN"
    : "USER";

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!name || !email || !password) throw new ApiError(400, "All fields are required");
    if (!isValidEmail(email)) throw new ApiError(400, "Please provide a valid email address");
    if (!isValidPassword(password)) {
      throw new ApiError(400, "Password must be at least 8 characters with uppercase, lowercase, and number");
    }

    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) throw new ApiError(400, "User already exists with this email");

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = roleFor(email);
    const emailVerificationToken = generateResetToken();

    const newUser = await db.user.create({
      data: { email: email.toLowerCase(), password: hashedPassword, name: name.trim(), role, emailVerificationToken },
    });
    sendVerificationEmail(newUser.email, emailVerificationToken).catch(() => {});

    const { accessToken, refreshToken } = generateTokens(newUser.id);
    await db.user.update({ where: { id: newUser.id }, data: { refreshToken } });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, image: newUser.image, emailVerified: newUser.emailVerified },
          accessToken,
        },
        "User created successfully"
      )
    );
  } catch (error) {
    return handleError(res, error, "Error creating user");
  }
};

export const login = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  try {
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    if (!isValidEmail(email)) throw new ApiError(400, "Please provide a valid email address");

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password) throw new ApiError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");

    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshTokenMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    await db.user.update({ where: { id: user.id }, data: { refreshToken, lastLoginAt: new Date() } });
    setAuthCookies(res, accessToken, refreshToken, refreshTokenMs);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role, image: user.image, emailVerified: user.emailVerified, lastLoginAt: new Date() },
          accessToken,
        },
        "User logged in successfully"
      )
    );
  } catch (error) {
    return handleError(res, error, "Error logging in");
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new ApiError(401, "Refresh token not provided");

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || process.env.SECRET);
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await db.user.findUnique({ where: { id: decoded.id }, select: { id: true, refreshToken: true } });
    if (!user || user.refreshToken !== refreshToken) throw new ApiError(401, "Invalid refresh token");

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    await db.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json(new ApiResponse(200, { accessToken }, "Token refreshed successfully"));
  } catch (error) {
    return handleError(res, error, "Error refreshing token");
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) throw new ApiError(400, "Current password and new password are required");
    if (!isValidPassword(newPassword)) {
      throw new ApiError(400, "New password must be at least 8 characters with uppercase, lowercase, and number");
    }

    const user = await db.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user?.password || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new ApiError(400, "Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { password: hashedNewPassword, refreshToken: null } });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    return handleError(res, error, "Error changing password");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) throw new ApiError(400, "Please provide a valid email address");

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always respond the same way — never reveal whether the account exists,
    // and never return the token in the response body.
    if (user) {
      const resetToken = generateResetToken();
      await db.user.update({
        where: { id: user.id },
        data: { passwordResetToken: resetToken, passwordResetExpiry: new Date(Date.now() + 10 * 60 * 1000) },
      });
      await sendPasswordResetEmail(user.email, resetToken);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "If an account with that email exists, a password reset link has been sent"));
  } catch (error) {
    return handleError(res, error, "Error processing password reset request");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new ApiError(400, "Reset token and new password are required");
    if (!isValidPassword(newPassword)) {
      throw new ApiError(400, "Password must be at least 8 characters with uppercase, lowercase, and number");
    }

    const user = await db.user.findFirst({
      where: { passwordResetToken: token, passwordResetExpiry: { gt: new Date() } },
    });
    if (!user) throw new ApiError(400, "Invalid or expired reset token");

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordResetToken: null, passwordResetExpiry: null, refreshToken: null },
    });

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error) {
    return handleError(res, error, "Error resetting password");
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, username: true, email: true, image: true, bio: true,
        githubUrl: true, websiteUrl: true, role: true, points: true,
        emailVerified: true, createdAt: true, lastLoginAt: true,
      },
    });
    return res.status(200).json(new ApiResponse(200, { user }, "Profile fetched successfully"));
  } catch (error) {
    return handleError(res, error, "Error fetching profile");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, image, bio, username, githubUrl, websiteUrl } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.username = username;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;

    const updatedUser = await db.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, username: true, email: true, image: true, bio: true, role: true },
    });
    return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "That username is already taken" });
    }
    return handleError(res, error, "Error updating profile");
  }
};

export const logout = async (req, res) => {
  try {
    await db.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
    clearAuthCookies(res);
    return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
  } catch (error) {
    return handleError(res, error, "Error logging out");
  }
};

// With single-token sessions, logout-all == logout. Real per-device logout
// arrives with Redis sessions in Phase 4.
export const logoutAll = logout;

export const legacyLogout = async (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV !== "development" });
  return res.status(200).json({ success: true, message: "User logged out" });
};

export const healthCheck = async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    return res.status(200).json({ success: true, message: "Service is healthy", timestamp: new Date().toISOString(), uptime: process.uptime() });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({ success: false, message: "Service is unhealthy", timestamp: new Date().toISOString() });
  }
};

export const check = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, username: true, email: true, image: true, role: true, lastLoginAt: true, isActive: true, emailVerified: true },
    });
    return res.status(200).json(new ApiResponse(200, { user }, "User authenticated successfully"));
  } catch (error) {
    return handleError(res, error, "Error in check route");
  }
};

// Clicked from the verification email → mark verified, bounce back to the app.
export const verifyEmail = async (req, res) => {
  const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  const { token } = req.query;
  if (!token) return res.redirect(`${origin}/login`);
  try {
    const user = await db.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user) return res.redirect(`${origin}/login?verified=invalid`);
    await db.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerificationToken: null } });
    return res.redirect(`${origin}/app?verified=1`);
  } catch (error) {
    console.error("Verify email error:", error);
    return res.redirect(`${origin}/login?verified=error`);
  }
};

// Re-send the verification email to the logged-in user (the "Resend" button in
// the verify banner). No-op success if already verified.
export const resendVerification = async (req, res) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, emailVerified: true } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.emailVerified) {
      return res.status(200).json(new ApiResponse(200, { alreadyVerified: true }, "Your email is already verified"));
    }
    const token = generateResetToken();
    await db.user.update({ where: { id: user.id }, data: { emailVerificationToken: token } });
    await sendVerificationEmail(user.email, token);
    return res.status(200).json(new ApiResponse(200, { sent: true }, "Verification email sent — check your inbox"));
  } catch (error) {
    return handleError(res, error, "Error resending verification email");
  }
};

// ── helpers ──────────────────────────────────────────────────────────────
// sameSite 'lax' (not 'strict'): still CSRF-safe for a token-cookie SPA, but it
// also lets the session cookie ride the OAuth provider → /app top-level redirect
// so social login lands authenticated without a refresh. path '/' so set/clear match.
const cookieBase = () => ({ httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV !== "development", path: "/" });

function setAuthCookies(res, accessToken, refreshToken, refreshMs = 7 * 24 * 60 * 60 * 1000) {
  res.cookie("accessToken", accessToken, { ...cookieBase(), maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieBase(), maxAge: refreshMs });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", cookieBase());
  res.clearCookie("refreshToken", cookieBase());
}

function handleError(res, error, fallback) {
  console.error(`${fallback}:`, error);
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: fallback });
}

const generateTokens = (userId) => ({
  accessToken: jwt.sign({ id: userId, type: "access" }, process.env.SECRET, { expiresIn: "15m" }),
  refreshToken: jwt.sign({ id: userId, type: "refresh" }, process.env.REFRESH_SECRET || process.env.SECRET, { expiresIn: "7d" }),
});

const generateResetToken = () => crypto.randomBytes(32).toString("hex");
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password);
