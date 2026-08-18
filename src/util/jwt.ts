import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  role: "ADMIN" | "USER";
  type: "access" | "refresh";
}

export class JwtService {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly ISSUER = process.env.JWT_ISSUER!;
  private static readonly AUDIENCE = process.env.JWT_AUDIENCE!;

  static {
    if (
      !this.ACCESS_SECRET ||
      !this.REFRESH_SECRET ||
      !this.ISSUER ||
      !this.AUDIENCE
    ) {
      throw new Error("Missing required JWT environment variables.");
    }
  }

  static generateAccessToken(userId: string, role: JwtPayload["role"]): string {
    return jwt.sign(
      {
        sub: userId,
        role,
        type: "access",
      },
      this.ACCESS_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "15m",
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );
  }

  static generateRefreshToken(
    userId: string,
    role: JwtPayload["role"],
  ): string {
    return jwt.sign(
      {
        sub: userId,
        role,
        type: "refresh",
      },
      this.REFRESH_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "7d",
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: this.ISSUER,
      audience: this.AUDIENCE,
    }) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.REFRESH_SECRET, {
      algorithms: ["HS256"],
      issuer: this.ISSUER,
      audience: this.AUDIENCE,
    }) as JwtPayload;
  }
}
