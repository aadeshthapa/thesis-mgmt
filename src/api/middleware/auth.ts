import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Auth Header:", authHeader);

  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: UserRole;
    };
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("Authorizing roles:", {
      allowedRoles: roles,
      userRole: req.user?.role,
      userId: req.user?.userId,
    });

    if (!req.user) {
      console.log("No user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      console.log("User role not in allowed roles");
      return res.status(403).json({
        message: "Insufficient permissions",
        details: {
          userRole: req.user.role,
          requiredRoles: roles,
        },
      });
    }

    next();
  };
};
