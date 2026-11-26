import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export const databaseAdminConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  port: Number(process.env.DB_PORT || 5432),
};

export const databaseConfig = {
  ...databaseAdminConfig,
  database: process.env.DB_NAME || "javascriptCRM",
};

export const pool = new pg.Pool(databaseConfig);
