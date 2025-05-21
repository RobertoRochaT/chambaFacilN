import express from "express";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
const createMessage = async (req, res) => {
	const { message, chatId } = req.body;
	if (message) {
		const newMessage = await Message.create({
			sender: req.user._id,
			message: message,
			chat: chatId,
		});
		const chat = await Chat.findByIdAndUpdate(chatId, {
			latestMessage: newMessage._id,
		});
		const fullMessage = await Message.findById(newMessage._id)
			.populate("sender", "-password")
			.populate({
				path: "chat",
				populate: { path: "users groupAdmin", select: "-password" },
			});
		return res.status(201).json({ data: fullMessage });
	} else {
		return res.status(400).json({ message: "Message not provide" });
	}
};

const allMessage = async (req, res) => {
	const chatId = req.params.chatId;
	const messages = await Message.find({ chat: chatId })
		.populate("sender", "-password")
		.populate("chat");
	return res.status(200).json({ data: messages });
};
const clearChat = async (req, res) => {
	const chatId = req.params.chatId;
	await Message.deleteMany({ chat: chatId });
	return res.status(200).json({ message: "success" });
};

// Add this new function to mark messages as read
const markMessagesAsRead = async (req, res) => {
    const chatId = req.params.chatId;
    
    try {
        // Find all unread messages in this chat not sent by the current user
        const messages = await Message.updateMany(
            { 
                chat: chatId, 
                read: false,
                sender: { $ne: req.user._id } // Not sent by current user
            },
            { 
                $set: { read: true },
                $addToSet: { readBy: req.user._id } 
            }
        );
        
        // Emit socket event to notify sender their messages have been read
        const updatedMessages = await Message.find({
            chat: chatId,
            read: true,
            readBy: { $elemMatch: { $eq: req.user._id } }
        }).populate("sender");
        
        if (updatedMessages.length > 0) {
            updatedMessages.forEach(message => {
                req.io.to(message.sender._id.toString()).emit("message read", message);
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: "Messages marked as read",
            count: messages.modifiedCount
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update the export
export { createMessage, allMessage, clearChat, markMessagesAsRead };

