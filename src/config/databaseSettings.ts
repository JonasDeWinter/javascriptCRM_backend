import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// this is only used for creating the database if it doesn't exist yet see src/config/databaseCreation.ts
export const databaseAdminConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  port: Number(process.env.DB_PORT || 5432),
};

// this is used for connecting to the database after it has been created
// and for creating/updating tables and columns on startup 
export const databaseConfig = {
  ...databaseAdminConfig,
  database: process.env.DB_NAME || "javascriptCRM",
};

export const pool = new pg.Pool(databaseConfig);
