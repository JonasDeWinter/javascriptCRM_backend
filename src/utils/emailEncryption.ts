import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const IV_LENGTH = 12;

export function encryptEmail(email: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(email, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptEmail(encryptedEmail: string, key: Buffer): string {
  const [version, encodedIv, encodedAuthTag, encodedData, ...extra] =
    encryptedEmail.split(".");
  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedAuthTag ||
    !encodedData ||
    extra.length > 0
  ) {
    throw new Error("Stored email has an unsupported encrypted format.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(encodedIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encodedAuthTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedData, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
