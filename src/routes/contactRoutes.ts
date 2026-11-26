import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
} from "../controllers/contactController";

const router = Router();

router.get("/", listContacts);
router.get("/:id", getContact);
router.post("/", createContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
