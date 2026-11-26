import express from "express";
import mainRouter from "./routes/router";
import errorHandler from "./middlewares/errorHandler";
import { seedContacts } from "./services/contactService";
import { seedCompanies } from "./services/companyService";
import { setupDatabase } from "#config/databaseCreation.js";

const app = express();

seedContacts();
seedCompanies();

setupDatabase().then(() => {
    console.log("Database setup completed.");
    app.use(express.json());
    app.use("/", mainRouter);
    app.use(errorHandler);

}).catch((error) => {
  console.error("Error setting up the database:", error);
});

export default app;