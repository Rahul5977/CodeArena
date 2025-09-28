import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    if (!isValidPassword(password)) {
      throw new ApiError(
        400,
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if this is the first user (make them SUPERADMIN)
    const userCount = await db.user.count();
    const role = userCount === 0 ? UserRole.SUPERADMIN : UserRole.USER;

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role,
      },
    });

    const { accessToken, refreshToken } = generateTokens(newUser.id);

    // Store refresh token in database
    await db.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log role change if SUPERADMIN
    if (role === UserRole.SUPERADMIN) {
      await db.roleChange.create({
        data: {
          userId: newUser.id,
          changedBy: newUser.id, // Self-assigned
          previousRole: UserRole.USER,
          newRole: UserRole.SUPERADMIN,
          reason: "First user - auto-promoted to SUPERADMIN",
        },
      });
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            image: newUser.image,
          },
          accessToken,
        },
        `User created successfully${role === UserRole.SUPERADMIN ? " as SUPERADMIN" : ""}`
      )
    );
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

export const login = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  try {
    // Validation
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roleChanges: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check if account is locked or deactivated (if such fields exist)
    // Add your account status checks here

    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshTokenExpiry = rememberMe ? "30d" : "7d";
    const refreshTokenMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    // Update refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
      },
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: refreshTokenMs,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            lastLoginAt: new Date(),
          },
          accessToken,
        },
        "User logged in successfully"
      )
    );
  } catch (error) {
    console.error("Error logging in:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token not provided");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || process.env.SECRET);
    } catch (error) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, refreshToken: true },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    // Update refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, "Token refreshed successfully"));
  } catch (error) {
    console.error("Error refreshing token:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error refreshing token",
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    if (!isValidPassword(newPassword)) {
      throw new ApiError(
        400,
        "New password must be at least 8 characters with uppercase, lowercase, and number"
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ApiError(400, "Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        refreshToken: null, // Invalidate all sessions
      },
    });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    console.error("Error changing password:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            "If an account with that email exists, a password reset link has been sent"
          )
        );
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    });

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    return res
      .status(200)
      .json(new ApiResponse(200, { resetToken }, "Password reset link sent successfully"));
  } catch (error) {
    console.error("Error in forgot password:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error processing password reset request",
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, "Reset token and new password are required");
    }

    if (!isValidPassword(newPassword)) {
      throw new ApiError(
        400,
        "Password must be at least 8 characters with uppercase, lowercase, and number"
      );
    }

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        refreshToken: null, // Invalidate all sessions
      },
    });

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        roleChanges: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            changedByUser: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    return res.status(200).json(new ApiResponse(200, { user }, "Profile fetched successfully"));
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, image } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

// Logout from current device
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear refresh token from database
    await db.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear all refresh tokens
    await db.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Logged out from all devices successfully"));
  } catch (error) {
    console.error("Error in logout all:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging out from all devices",
    });
  }
};

// Legacy logout for backward compatibility
export const legacyLogout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out",
    });
  } catch (error) {
    console.error("Error in legacy logout:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging out user",
    });
  }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "Service is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({
      success: false,
      message: "Service is unhealthy",
      timestamp: new Date().toISOString(),
    });
  }
};

// Authentication check endpoint
export const check = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lastLoginAt: true,
        isActive: true,
        emailVerified: true,
      },
    });

    return res.status(200).json(new ApiResponse(200, { user }, "User authenticated successfully"));
  } catch (error) {
    console.error("Error in check route:", error);
    return res.status(500).json({
      success: false,
      message: "Error in check route",
    });
  }
};

// Helper functions
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId, type: "access" }, process.env.SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(
    { id: userId, type: "refresh" },
    process.env.REFRESH_SECRET || process.env.SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
