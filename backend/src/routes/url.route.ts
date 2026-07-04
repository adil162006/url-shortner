import { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware";
import { getUserUrls,createShortCode,getOriginal } from "../controller/url.controller";

const router = Router();

router.use(protectedRoute)

router.get("/myurls",getUserUrls)
router.post("/create-url",createShortCode)
router.get("/:shortCode",getOriginal)


export default router
