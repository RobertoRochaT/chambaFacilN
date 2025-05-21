import express from "express";
import { registerUser, loginUser } from '../controllers/auth.js';
import wrapAsync from "../middlewares/wrapAsync.js";
import { chambaFacilAuth } from "../middlewares/authorization.js";

const router = express.Router();

router.post("/signup", wrapAsync(registerUser));
router.post("/signin", wrapAsync(loginUser));
router.use(chambaFacilAuth);

export default router;