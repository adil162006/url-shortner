import { Router } from "express";
import { login, logout, refresh, register,me } from "../controller/auth.controller";
import { protectedRoute } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protectedRoute, logout);
router.get("/me",protectedRoute,me)
router.post("/refresh", refresh);
export default router