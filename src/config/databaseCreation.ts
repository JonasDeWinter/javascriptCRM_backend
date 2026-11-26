import pg from "pg";
import { databaseAdminConfig, databaseConfig } from "./databaseSettings";

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

export async function setupDatabase(): Promise<void> {
  
  // Connect to the PostgreSQL server using the admin configuration
  const adminClient = new pg.Client({
    ...databaseAdminConfig,
  });

  //  check if the database exists, and create it if it doesn't
  try {
    await adminClient.connect();
    const database = await adminClient.query(
      "SELECT 1 FROM pg_catalog.pg_database WHERE datname = $1",
      [databaseConfig.database],
    );

    if (database.rowCount === 0) {
      console.log(`${databaseConfig.database} database not found, creating it.`);
      await adminClient.query(
        `CREATE DATABASE ${quoteIdentifier(databaseConfig.database)}`,
      );
      console.log(`Created database ${databaseConfig.database}.`);
    } else {
      console.log(`${databaseConfig.database} database already exists.`);
    }
  } finally {
    await adminClient.end();
  }

  //  connect to the newly created database and create the tables if they don't exist
  const client = new pg.Client(databaseConfig);

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
      await client.query(`
        CREATE TABLE IF NOT EXISTS crm_startup_state (
          key TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    
      // Seed the database with initial sample data if the tables are empty and the seed state has not been applied yet
      const seedState = await client.query(
        "SELECT 1 FROM crm_startup_state WHERE key = $1",
        ["initial_sample_data"],
      );
      if (seedState.rowCount === 0) {
        await client.query("LOCK TABLE companies, contacts IN SHARE ROW EXCLUSIVE MODE");
        const tablesAreEmpty = await client.query<{ is_empty: boolean }>(`
          SELECT NOT EXISTS (SELECT 1 FROM companies)
             AND NOT EXISTS (SELECT 1 FROM contacts) AS is_empty
        `);

        if (tablesAreEmpty.rows[0].is_empty) {
          await client.query(`
            INSERT INTO companies (name, industry, website, phone)
            VALUES
              ('Northstar Design', 'Design', 'https://northstar.example.test', '555-0201'),
              ('Juniper Labs', 'Technology', 'https://juniper.example.test', '555-0202'),
              ('Harbor Consulting', 'Consulting', 'https://harbor.example.test', '555-0203');

            INSERT INTO contacts (first_name, last_name, email, phone, company)
            VALUES
              ('Alex', 'Morgan', 'alex.morgan@example.test', '555-0101', 'Northstar Design'),
              ('Jamie', 'Chen', 'jamie.chen@example.test', '555-0102', 'Juniper Labs'),
              ('Sam', 'Rivera', 'sam.rivera@example.test', '555-0103', 'Harbor Consulting');
          `);
        }

        await client.query(
          "INSERT INTO crm_startup_state (key) VALUES ($1) ON CONFLICT (key) DO NOTHING",
          ["initial_sample_data"],
        );
      }

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
