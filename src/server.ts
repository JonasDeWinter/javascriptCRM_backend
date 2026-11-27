import app from "./app";
import { validateAuthSettings } from "./config/authSettings";
import { setupDatabase } from "./config/databaseCreation";

const port = process.env.PORT ?? "9001";

async function startServer(): Promise<void> {
  validateAuthSettings();
  await setupDatabase();
  app.listen(port, () => {
    console.log(`CRM backend listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Error setting up the database:", error);
  process.exitCode = 1;
});
