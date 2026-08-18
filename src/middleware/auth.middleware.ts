import { Request, Response, NextFunction } from "express";
import AppError from "../util/AppError";
import { JwtService } from "../util/jwt";
import User from "../modules/auth.module";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Access token required", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = JwtService.verifyAccessToken(token);

    if (decoded.type !== "access") {
      throw new AppError("Invalid token type", 401);
    }

    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    (req as any).user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorizeRoles = (...roles: ("USER" | "ADMIN")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user || !roles.includes((req as any).user.role)) {
      return next(new AppError("You do not have permission", 403));
    }

    next();
  };
};
