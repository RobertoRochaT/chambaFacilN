import wrapAsync from "../middlewares/wrapAsync.js";
import { authorization } from "../middlewares/authorization.js";
import { createMessage, allMessage, clearChat } from "../controllers/message.js";
import express from "express";
const router = express.Router();
router.post("/", authorization, wrapAsync(createMessage));
router.get("/:chatId", authorization, wrapAsync(allMessage));
router.get(
	"/clearChat/:chatId",
	authorization,
	wrapAsync(clearChat)
);

export default router;