import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // Try to verify as NextAuth JWT first
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // NextAuth JWT has 'id' field, custom JWT has 'userId'
    if (decoded.id) {
      req.userId = decoded.id;
    } else if (decoded.userId) {
      req.userId = decoded.userId;
    } else {
      return res.status(403).json({ message: "Invalid token structure" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
