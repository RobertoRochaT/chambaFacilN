import Chat from "../models/chat.js";
import Message from "../models/message.js";
const postChat = async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(200).json({ message: "userId not provide" });
	}
	const existingChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		});

	if (existingChat.length == 0) {
		const chatName = "Messenger";
		const isGroupChat = false;
		const users = [req.user._id, userId];
		const chat = await Chat.create({
			chatName,
			isGroupChat,
			users,
		});
		const chatAll = await Chat.findOne({ _id: chat._id }).populate(
			"users",
			"-password"
		);
		return res.status(200).json({ data: chatAll });
	} else {
		const chat = existingChat[0];
		return res.status(200).json({ data: chat });
	}
};
const getChat = async (req, res) => {
	const chat = await Chat.find({
		users: { $elemMatch: { $eq: req.user._id } },
	})
		.sort({ updatedAt: -1 })
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		})
		.populate("groupAdmin", "-password");
	return res.status(200).json({ data: chat });
};
const createGroup = async (req, res) => {
	if (!req.body.users || !req.body.name) {
		return res.status(200).json({ message: "users and name not provide" });
	}
	const users = req.body.users;
	if (users.length < 2) {
		return res
			.status(200)
			.json({ message: "min 2 users required for group" });
	}
	users.push(req.user._id);
	const groupChat = await Chat.create({
		chatName: req.body.name,
		isGroupChat: true,
		users: users,
		groupAdmin: req.user._id,
	});
	const groups = await Chat.findOne({ _id: groupChat._id })
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	res.status(200).json({ data: groups });
};
const deleteGroup = async (req, res) => {
	const chatId = req.params.chatId;
	await Message.deleteMany({ chat: chatId });
	await Chat.deleteOne({ _id: chatId });
	return res.status(200).json({ message: "success" });
};
const renameGroup = async (req, res) => {
	const { name, chatId } = req.body;
	if (!name || !chatId) {
		return res.status(200).json({ message: "name and chatId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ chatName: name },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};
const removeFromGroup = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res
			.status(200)
			.json({ message: "chatId and userId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $pull: { users: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};
const addToGroup = async (req, res) => {
	const { chatId, userId } = req.body;
	if (!chatId || !userId) {
		return res
			.status(200)
			.json({ message: "chatId and userId not provide" });
	}
	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $push: { users: userId } },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!chat) {
		return res.status(200).json({ message: "chat not found" });
	} else {
		return res.status(200).json({ data: chat });
	}
};

export {
	postChat,
	getChat,
	createGroup,
	deleteGroup,
	renameGroup,
	removeFromGroup,
	addToGroup,
};

// Update the getFreelancerChatData function to ensure consistent data structure
export const getFreelancerChatData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('FREELANCER CHAT DATA REQUESTED FOR ID:', id);
    
    const freelancer = await Freelancer.findById(id);
    
    if (!freelancer) {
      console.error(`No freelancer found with ID: ${id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Freelancer not found' 
      });
    }
    
    console.log('Found freelancer data:', freelancer);
    
    // Format the freelancer data to match the expected format in the frontend
    const nameParts = freelancer.name ? freelancer.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Format data specifically for chat application
    const chatUserData = {
      _id: freelancer._id,
      name: freelancer.name || '',
      firstName: firstName,
      lastName: lastName,
      email: freelancer.email || '',
      profileImage: freelancer.image || '',
      image: freelancer.image || '',
      externalId: freelancer._id
    };
    
    console.log('Returning formatted freelancer data:', chatUserData);
    
    return res.json({ 
      success: true,
      user: chatUserData,
      data: chatUserData
    });
  } catch (error) {
    console.error('Error in getFreelancerChatData:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
};