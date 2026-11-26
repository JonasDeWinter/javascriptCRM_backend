import { Router } from "express";
import companyRoutes from "./companyRoutes";
import contactRoutes from "./contactRoutes";
import { apiError, apiSuccess } from "../utils/apiResponse";

const router = Router();

router.get("/", (_req, res) => {
  res.json(apiSuccess({ message: "Hello World!" }));
});

router.use("/contacts", contactRoutes);
router.use("/companies", companyRoutes);

router.use((_req, res) => {
  res.status(404).json(apiError(404, "Route not found"));
});

export default router;
