import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME || "javascriptCRM";
const DB_USER = process.env.DB_USER || "postgres";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";
const DB_PORT = Number(process.env.DB_PORT || 5432);

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

export async function setupDatabase(): Promise<void> {
  const adminClient = new pg.Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  try {
    await adminClient.connect();
    const database = await adminClient.query(
      "SELECT 1 FROM pg_catalog.pg_database WHERE datname = $1",
      [DB_NAME]
    );

    if (database.rowCount === 0) {
      console.log(`${DB_NAME} database not found, creating it.`);
      await adminClient.query(`CREATE DATABASE ${quoteIdentifier(DB_NAME)}`);
      console.log(`Created database ${DB_NAME}.`);
    } else {
      console.log(`${DB_NAME} database already exists.`);
    }
  } finally {
    await adminClient.end();
  }

  const client = new pg.Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME
  });

  try {
    await client.connect();
    await client.query("BEGIN");
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          industry TEXT,
          website TEXT,
          phone TEXT,
          address TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        ALTER TABLE companies
          ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid(),
          ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS industry TEXT,
          ADD COLUMN IF NOT EXISTS website TEXT,
          ADD COLUMN IF NOT EXISTS phone TEXT,
          ADD COLUMN IF NOT EXISTS address TEXT,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

        CREATE TABLE IF NOT EXISTS contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          company TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        ALTER TABLE contacts
          ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid(),
          ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '',
          ADD COLUMN IF NOT EXISTS email TEXT,
          ADD COLUMN IF NOT EXISTS phone TEXT,
          ADD COLUMN IF NOT EXISTS company TEXT,
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      `);
      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Database schema setup failed and the transaction could not be rolled back.",
        );
      }
      throw error;
    }
    console.log("Company and contact tables are ready.");
  } finally {
    await client.end();
  }
}
