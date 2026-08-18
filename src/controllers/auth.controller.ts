import User from "../modules/auth.module";
import asyncHandler from "../util/asyncHandler";
import AppError from "../util/AppError";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { JwtService } from "../util/jwt";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

class AuthController {
  // Login
  handleUserLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshToken",
    );

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const accessToken = JwtService.generateAccessToken(user.id, user.role);
    const refreshToken = JwtService.generateRefreshToken(user.id, user.role);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);

    await user.save({
      validateBeforeSave: false,
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  // Refresh Access Token
  handleRefreshAccessToken = asyncHandler(
    async (req: Request, res: Response) => {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError("Refresh token not found", 401);
      }

      const decoded = JwtService.verifyRefreshToken(refreshToken);

      if (decoded.type !== "refresh") {
        throw new AppError("Invalid token type", 401);
      }

      const user = await User.findById(decoded.sub).select("+refreshToken");

      if (!user || !user.refreshToken) {
        throw new AppError("Invalid refresh token", 401);
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isValid) {
        throw new AppError("Invalid refresh token", 401);
      }

      const accessToken = JwtService.generateAccessToken(user.id, user.role);

      const newRefreshToken = JwtService.generateRefreshToken(
        user.id,
        user.role,
      );

      user.refreshToken = await bcrypt.hash(newRefreshToken, 10);

      await user.save({
        validateBeforeSave: false,
      });

      res.cookie("refreshToken", newRefreshToken, cookieOptions);

      res.status(200).json({
        success: true,
        accessToken,
      });
    },
  );

  // Logout
  handleUserLogout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Already logged out", 400);
    }

    const decoded = JwtService.verifyRefreshToken(refreshToken);

    await User.findByIdAndUpdate(decoded.sub, {
      refreshToken: null,
    });

    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  });

  // Current User
  handleGetMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user?.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
}

export default new AuthController();
