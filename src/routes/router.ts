import { Router } from "express";
import authRoutes from "./authRoutes";
import companyRoutes from "./companyRoutes";
import contactRoutes from "./contactRoutes";
import requireAuth from "../middlewares/requireAuth";
import { apiError, apiSuccess } from "../utils/apiResponse";

const router = Router();

router.get("/", (_req, res) => {
  res.json(apiSuccess({ message: "Hello World!" }));
});

router.use("/auth", authRoutes);
router.use("/contacts", requireAuth, contactRoutes);
router.use("/companies", requireAuth, companyRoutes);

router.use((_req, res) => {
  res.status(404).json(apiError(404, "Route not found"));
});

export default router;
