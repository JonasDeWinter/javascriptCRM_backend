import app from "./app";
import { setupDatabase } from "./config/databaseCreation";

const port = process.env.PORT ?? "9001";

async function startServer(): Promise<void> {
  await setupDatabase();
  app.listen(port, () => {
    console.log(`CRM backend listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Error setting up the database:", error);
  process.exitCode = 1;
});
