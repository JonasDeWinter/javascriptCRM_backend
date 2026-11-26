import { Router } from "express";
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from "../controllers/companyController";

const router = Router();

router.get("/", listCompanies);
router.get("/:id", getCompany);
router.post("/", createCompany);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
