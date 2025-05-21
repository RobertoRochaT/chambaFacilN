import wrapAsync from "../middlewares/wrapAsync.js";
import { authorization } from "../middlewares/authorization.js";
import { createMessage, allMessage, clearChat, markMessagesAsRead } from "../controllers/message.js";
import { deleteGroup, removeFromGroup, addToGroup } from "../controllers/chat.js";
import { postChat, getChat, createGroup, renameGroup, getFreelancerChatData } from "../controllers/chat.js";
import { externalSignup, verifyToken, checkUser } from "../controllers/auth.js";
import express from "express";
const router = express.Router();

router.post("/", authorization, wrapAsync(postChat));
router.get("/", authorization, wrapAsync(getChat));

router.post("/group", authorization, wrapAsync(createGroup));
router.delete(
	"/deleteGroup/:chatId",
	authorization,
	wrapAsync(deleteGroup)
);
router.post("/rename", authorization, wrapAsync(renameGroup));
router.post(
	"/groupremove",
	authorization,
	wrapAsync(removeFromGroup)
);
router.post("/groupadd", authorization, wrapAsync(addToGroup));

router.get("/:chatId", authorization, wrapAsync(allMessage));
router.get(
    "/clearChat/:chatId",
    authorization,
    wrapAsync(clearChat)
);
router.post(
    "/read/:chatId",
    authorization,
    wrapAsync(markMessagesAsRead)
);

// Add this new route to get freelancer data for chat
router.get('/chat/:id', getFreelancerChatData);
export default router;