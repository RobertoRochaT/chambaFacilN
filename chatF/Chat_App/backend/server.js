import dotenv from "dotenv";
// Load environment variables before anything else
dotenv.config();

import http from "http";
import {Server} from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Now import routes after environment variables are loaded
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import User from "./models/user.js";

import { authorization } from "./middlewares/authorization.js";

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });


const app = express();

const corsOptions = {
	origin: '*',
	methods: ["GET", "POST", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

console.log("Env vars loaded:", {
  PORT: !!process.env.PORT,
  MONGODB_URI: !!process.env.MONGODB_URI,
  FRONTEND_URL: !!process.env.FRONTEND_URL,
  JWT_SECRET: !!process.env.JWT_SECRET
});

// Test JWT functionality early
try {
  const testToken = jwt.sign({ test: true }, process.env.JWT_SECRET);
  const verified = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log("JWT verification working properly");
} catch (error) {
  console.error("JWT ERROR! Check your JWT_SECRET:", error.message);
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Connect to Database
main()
	.then(() => console.log("Database Connection established"))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect(process.env.MONGODB_URI);
}

// Root route
app.get("/", (req, res) => {
	res.json({
		message: "Welcome to Chat Application!",
		frontend_url: process.env.FRONTEND_URL,
	});
});

// All routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Test JWT functionality
console.log("Testing JWT functionality...");
try {
  const testPayload = { id: "test_id", test: true };
  console.log("JWT_SECRET available:", !!process.env.JWT_SECRET);
  
  const testToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log("Token generated successfully");
  
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log("Token verified successfully:", decoded.id === testPayload.id);
} catch (error) {
  console.error("JWT TEST FAILED:", error.message);
}

app.get('/api/debug/auth', authorization, (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    },
    message: 'Authorization working correctly'
  });
});

// Check if external user exists
// Check if external user exists
// Update the check-user endpoint to handle both types of IDs

app.post('/api/auth/check-user', async (req, res) => {
  try {
    const { externalId } = req.body;
    
    if (!externalId) {
      return res.status(400).json({ message: "External ID is required" });
    }
    
    // Find user by externalId
    const existingUser = await User.findOne({ externalId });
    
    if (existingUser) {
      // Generate token for existing user
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: '48h'
      });
      
      // Return user data and token
      return res.json({
        exists: true,
        token,
        user: {
          _id: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          profileImage: existingUser.profileImage || ""
        }
      });
    }
    
    // If no user found
    return res.json({ exists: false });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register external user

app.post('/api/auth/external-signup', async (req, res) => {
  try {
    const { externalId, firstName, lastName, email, password, profileImage } = req.body;
    
    console.log("External signup request received:", { 
      externalId, 
      firstName, 
      lastName, 
      email, 
      hasPassword: !!password,
      hasProfileImage: !!profileImage
    });
    
    // Extract name from email if firstName/lastName are missing
    let finalFirstName = firstName || email.split('@')[0];
    let finalLastName = lastName || '';
    
    if (!externalId || !email || !password) {
      return res.status(400).json({ message: "Missing required fields: ID, email or password" });
    }
    
    // Normalize the email to prevent case sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
    
    // First check if user exists by externalId
    let user = await User.findOne({ externalId });
    
    // Also check by email as a fallback
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
    }
    
    if (user) {
      // User exists, update their data and return token
      user.firstName = finalFirstName;
      user.lastName = finalLastName;
      
      // Only update these if provided
      if (profileImage) user.profileImage = profileImage;
      
      await user.save();
      
      // Generate token
      const token = generateToken(user._id);
      
      return res.json({
        message: "Login successful",
        token,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    }
    
    // Create new user if not exists
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const newUser = new User({
      firstName: finalFirstName,
      lastName: finalLastName,
      email: normalizedEmail,
      password: hashedPassword,
      externalId,
      profileImage: profileImage || ""
    });
    
    await newUser.save();
    
    // Generate token for the new user
    const token = generateToken(newUser._id);
    
    res.status(201).json({
      message: "Registration successful",
      token,
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    });
  } catch (error) {
    console.error("External signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this near your existing /api/freelancers routes
// Update the existing /api/freelancers/:id/chat endpoint to be consistent
app.get('/api/freelancers/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 FREELANCER CHAT DATA REQUESTED:', id);
    
    // Validate MongoDB ObjectId to prevent errors
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`❌ Invalid ObjectId format: ${id}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid freelancer ID format'
      });
    }
    
    // Find the freelancer by ID
    const freelancer = await Freelancer.findById(id);
    
    if (!freelancer) {
      console.error(`❌ No freelancer found with ID: ${id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Freelancer not found' 
      });
    }
    
    console.log('✅ Found freelancer:', {
      id: freelancer._id,
      name: freelancer.name,
      email: freelancer.email
    });
    
    // Parse name into first and last components
    const nameParts = freelancer.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Format data for chat application - use REAL data
    const chatData = {
      _id: freelancer._id,
      name: freelancer.name,
      firstName: firstName,
      lastName: lastName,
      email: freelancer.email,
      profileImage: freelancer.image || '',
      image: freelancer.image || '',
      externalId: freelancer._id.toString()
    };
    
    console.log('✅ Returning real freelancer chat data:', chatData);
    
    // Return both formats for maximum compatibility
    return res.json({ 
      success: true,
      user: chatData,
      data: chatData
    });
  } catch (error) {
    console.error('❌ Error in freelancer chat endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
});

// Invaild routes
app.all("*", (req, res) => {
	res.json({ error: "Invaild Route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	const errorMessage = err.message || "Something Went Wrong!";
	res.status(500).json({ message: errorMessage });
});

// Start the server
const server = app.listen(PORT, async () => {
	console.log(`Server listening on ${PORT}`);
});

// Socket.IO setup
const io = new Server(server, {
	pingTimeout: 60000,
	transports: ["websocket"],
	cors: corsOptions,
});

// Socket connection
io.on("connection", (socket) => {
	console.log("Connected to socket.io:", socket.id);

	// Join user and message send to client
	const setupHandler = (userId) => {
		if (!socket.hasJoined) {
			socket.join(userId);
			socket.hasJoined = true;
			console.log("User joined:", userId);
			socket.emit("connected");
		}
	};
	const newMessageHandler = (newMessageReceived) => {
		let chat = newMessageReceived?.chat;
		chat?.users.forEach((user) => {
			if (user._id === newMessageReceived.sender._id) return;
			console.log("Message received by:", user._id);
			socket.in(user._id).emit("message received", newMessageReceived);
		});
	};

	// Join a Chat Room and Typing effect
	const joinChatHandler = (room) => {
		if (socket.currentRoom) {
			if (socket.currentRoom === room) {
				console.log(`User already in Room: ${room}`);
				return;
			}
			socket.leave(socket.currentRoom);
			console.log(`User left Room: ${socket.currentRoom}`);
		}
		socket.join(room);
		socket.currentRoom = room;
		console.log("User joined Room:", room);
	};
	const typingHandler = (room) => {
		socket.in(room).emit("typing");
	};
	const stopTypingHandler = (room) => {
		socket.in(room).emit("stop typing");
	};

	// Clear, Delete and Create chat handlers
	const clearChatHandler = (chatId) => {
		socket.in(chatId).emit("clear chat", chatId);
	};
	const deleteChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			console.log("Chat delete:", user._id);
			socket.in(user._id).emit("delete chat", chat._id);
		});
	};
	const chatCreateChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			console.log("Create chat:", user._id);
			socket.in(user._id).emit("chat created", chat);
		});
	};

	socket.on("setup", setupHandler);
	socket.on("new message", newMessageHandler);
	socket.on("join chat", joinChatHandler);
	socket.on("typing", typingHandler);
	socket.on("stop typing", stopTypingHandler);
	socket.on("clear chat", clearChatHandler);
	socket.on("delete chat", deleteChatHandler);
	socket.on("chat created", chatCreateChatHandler);

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
		socket.off("setup", setupHandler);
		socket.off("new message", newMessageHandler);
		socket.off("join chat", joinChatHandler);
		socket.off("typing", typingHandler);
		socket.off("stop typing", stopTypingHandler);
		socket.off("clear chat", clearChatHandler);
		socket.off("delete chat", deleteChatHandler);
		socket.off("chat created", chatCreateChatHandler);
	});
});
