export interface AuthSettings {
  jwtSecret: string;
  emailEncryptionKey: Buffer;
}

export function getAuthSettings(): AuthSettings {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be set and contain at least 32 bytes.");
  }

  const encodedEmailEncryptionKey = process.env.EMAIL_ENCRYPTION_KEY;
  if (!encodedEmailEncryptionKey) {
    throw new Error("EMAIL_ENCRYPTION_KEY must be set.");
  }

  const emailEncryptionKey = Buffer.from(encodedEmailEncryptionKey, "base64");
  if (
    emailEncryptionKey.length !== 32 ||
    emailEncryptionKey.toString("base64") !== encodedEmailEncryptionKey
  ) {
    throw new Error(
      "EMAIL_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
    );
  }

  return { jwtSecret, emailEncryptionKey };
}

export function validateAuthSettings(): void {
  getAuthSettings();
}
