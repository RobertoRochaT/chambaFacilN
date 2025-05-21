import express from "express";
import { registerUser, loginUser, externalSignup, verifyToken, checkUser, getAllUsers } from '../controllers/auth.js';
import wrapAsync from "../middlewares/wrapAsync.js";
import { chambaFacilAuth } from "../middlewares/authorization.js";
import { authorization } from "../middlewares/authorization.js";

const router = express.Router();

// External auth endpoints
router.post("/check-user", wrapAsync(checkUser));
router.post("/external-signup", wrapAsync(externalSignup));
router.get("/verify", wrapAsync(verifyToken));

// Standard auth endpoints
router.post("/signup", wrapAsync(registerUser));
router.post("/signin", wrapAsync(loginUser));

// User listing endpoint
router.get("/users", authorization, wrapAsync(getAllUsers));

// Apply Chamba Facil middleware to future routes if needed
router.use(chambaFacilAuth);

export default router;