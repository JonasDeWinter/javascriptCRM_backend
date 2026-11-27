import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { getAuthSettings } from "../config/authSettings";
import { apiError } from "../utils/apiResponse";

const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json(apiError(401, "A bearer token is required"));
    return;
  }

  const token = authorization.slice("Bearer ".length);
  if (!token) {
    res.status(401).json(apiError(401, "A bearer token is required"));
    return;
  }

  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, getAuthSettings().jwtSecret, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(apiError(401, "Invalid or expired bearer token"));
      return;
    }
    next(error);
    return;
  }

  if (
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    typeof payload.exp !== "number"
  ) {
    res.status(401).json(apiError(401, "Invalid or expired bearer token"));
    return;
  }

  next();
};

export default requireAuth;
