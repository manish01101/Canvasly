import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import {  getJwtSecret } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const secret = getJwtSecret(); 
    // console.log("DEBUG: Verifying with Secret:", secret);
    const decoded = jwt.verify(token, secret!, {
      algorithms: ["HS256"],
    }) as any;
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    return res.status(403).json({ message: `Auth Error: ${error.message}` });
  }
};
