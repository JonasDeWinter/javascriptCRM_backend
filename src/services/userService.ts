import { pool } from "../config/databaseSettings";
import type { UserRecord } from "../models/user";

export async function createUser(
  username: string,
  passwordHash: string,
  encryptedEmail: string,
): Promise<Pick<UserRecord, "id" | "username">> {
  const result = await pool.query<Pick<UserRecord, "id" | "username">>(
    `INSERT INTO users (username, password_hash, email_encrypted)
     VALUES ($1, $2, $3)
     RETURNING id, username`,
    [username, passwordHash, encryptedEmail],
  );

  return result.rows[0];
}

export async function getUserByUsername(
  username: string,
): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRecord>(
    `SELECT id, username, password_hash, email_encrypted
     FROM users
     WHERE LOWER(username) = LOWER($1)`,
    [username],
  );

  return result.rows[0];
}
