import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../lib/jwt";
import type { JwtPayloadType } from "../interfaces/auth.interface";

const getAccessToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const cookies = req.headers.cookie?.split(";").map((cookie) => cookie.trim()) ?? [];
  const accessTokenCookie = cookies.find((cookie) => cookie.startsWith("accessToken="));

  return accessTokenCookie?.split("=")[1];
};

export const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      throw new AppError("No token provided", 401);
    }

    const decoded = verifyAccessToken(accessToken) as JwtPayloadType;
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};