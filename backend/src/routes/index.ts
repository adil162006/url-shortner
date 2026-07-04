import { Router } from "express";
import authRoutes from "./auth.route";
import urlRoutes from "./url.route"
const router = Router();

router.use("/auth", authRoutes);
router.use("/url",urlRoutes)

export default router;