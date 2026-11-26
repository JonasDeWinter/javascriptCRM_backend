import express from "express";
import mainRouter from "./routes/router";
import errorHandler from "./middlewares/errorHandler";
import { seedContacts } from "./services/contactService";
import { seedCompanies } from "./services/companyService";

const app = express();

seedContacts();
seedCompanies();
app.use(express.json());
app.use("/", mainRouter);
app.use(errorHandler);

export default app;