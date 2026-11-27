import bcrypt from "bcrypt";
import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { TypedRequestBody } from "../utils/TypedRequestBody";
import { getAuthSettings } from "../config/authSettings";
import { apiError, apiSuccess } from "../utils/apiResponse";
import { encryptEmail } from "../utils/emailEncryption";
import { createUser, getUserByUsername } from "../services/userService";

const BCRYPT_ROUNDS = 12;
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_LIFETIME_SECONDS = 60 * 60;

interface RegisterBody {
  username?: unknown;
  password?: unknown;
  email?: unknown;
}

interface LoginBody {
  username?: unknown;
  password?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDuplicateUsername(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505" &&
    "constraint" in error &&
    error.constraint === "users_username_lower_idx"
  );
}

export async function register(
  req: TypedRequestBody<RegisterBody>,
  res: Response,
): Promise<void> {
  if (!isRecord(req.body)) {
    res.status(400).json(apiError(400, "A JSON object is required"));
    return;
  }

  const { username: rawUsername, password, email: rawEmail } = req.body;
  if (
    typeof rawUsername !== "string" ||
    typeof password !== "string" ||
    typeof rawEmail !== "string"
  ) {
    res
      .status(400)
      .json(apiError(400, "Username, password, and email are required"));
    return;
  }

  const username = rawUsername.trim().toLowerCase();
  const email = rawEmail.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    res
      .status(400)
      .json(
        apiError(
          400,
          "Username must be 3-32 characters using letters, numbers, '.', '_' or '-'.",
        ),
      );
    return;
  }
  if (!EMAIL_PATTERN.test(email) || Buffer.byteLength(email, "utf8") > 254) {
    res.status(400).json(apiError(400, "A valid email address is required"));
    return;
  }
  const passwordLength = Buffer.byteLength(password, "utf8");
  if (passwordLength < 12 || passwordLength > 72) {
    res.status(400)
      .json(apiError(400, "Password must be between 12 and 72 bytes."));
    return;
  }

  const { emailEncryptionKey } = getAuthSettings();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const encryptedEmail = encryptEmail(email, emailEncryptionKey);

  try {
    const user = await createUser(username, passwordHash, encryptedEmail);
    res.status(201).json(apiSuccess(user));
  } catch (error) {
    if (isDuplicateUsername(error)) {
      res.status(409).json(apiError(409, "Username is already taken"));
      return;
    }
    throw error;
  }
}

export async function login(
  req: TypedRequestBody<LoginBody>,
  res: Response,
): Promise<void> {
  if (!isRecord(req.body)) {
    res.status(400).json(apiError(400, "A JSON object is required"));
    return;
  }

  const { username: rawUsername, password } = req.body;
  if (typeof rawUsername !== "string" || typeof password !== "string") {
    res.status(400).json(apiError(400, "Username and password are required"));
    return;
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    res.status(401).json(apiError(401, "Invalid username or password"));
    return;
  }

  const username = rawUsername.trim().toLowerCase();
  const user = await getUserByUsername(username);
  let passwordMatches = false;
  if (user) {
    passwordMatches = await bcrypt.compare(password, user.password_hash);
  } else {
    await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  if (!user || !passwordMatches) {
    res.status(401).json(apiError(401, "Invalid username or password"));
    return;
  }

  const { jwtSecret } = getAuthSettings();
  const token = jwt.sign({ sub: user.id }, jwtSecret, {
    algorithm: "HS256",
    expiresIn: TOKEN_LIFETIME_SECONDS,
  });

  res.json(
    apiSuccess({
      token,
      tokenType: "Bearer",
      expiresIn: TOKEN_LIFETIME_SECONDS,
    }),
  );
}
