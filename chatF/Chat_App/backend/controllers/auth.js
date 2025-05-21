import User from "../models/user.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { generateToken } from "../config/jwtProvider.js";
import jwt from "jsonwebtoken"; // Add this import for JWT

const registerUser = async (req, res, next) => {
    let { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).json({ message: `User Already Exist` });
    }
    password = bcrypt.hashSync(password, 8);
    const userData = new User({
        firstName,
        lastName,
        email,
        password,
    });
    const user = await userData.save();
    const jwtToken = generateToken(user._id);
    res.status(200).json({
        message: "Registration Successfully",
        token: jwtToken,
    });
};

const loginUser = async (req, res) => {
    let { email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ message: `User Not Found` });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid Password" });
    }
    const jwtToken = generateToken(user._id);
    user.password = null;
    res.status(200).json({
        message: "Login Successfully",
        data: user,
        token: jwtToken,
    });
};

// Update the externalSignup function to handle the user data properly

export const externalSignup = async (req, res) => {
  try {
    console.log("External signup request received:", req.body);
    
    const { externalId, firstName, lastName, email, password, profileImage } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    
    // Check if user already exists by externalId or email
    const existingUser = await User.findOne({ 
      $or: [
        { externalId: externalId },
        { email: email }
      ]
    });
    
    if (existingUser) {
      // If user exists, generate token and return user data
      const token = generateToken(existingUser._id);
      
      return res.status(200).json({
        message: "User already exists",
        _id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        profileImage: existingUser.profileImage,
        token
      });
    }
    
    // Create new user
    const hashedPassword = await bcrypt.hash(password, 8);
    
    const newUser = new User({
      firstName: firstName || 'User',
      lastName: lastName || '',
      email: email,
      password: hashedPassword,
      profileImage: profileImage,
      externalId: externalId
    });
    
    // Save the user to the database
    const savedUser = await newUser.save();
    const token = generateToken(savedUser._id);
    
    res.status(201).json({
      message: "Registration successful",
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      profileImage: savedUser.profileImage,
      token
    });
  } catch (error) {
    console.error("External signup error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

const checkUser = async (req, res) => {
  try {
    const { externalId } = req.body;
    
    console.log("Check user request for:", externalId);
    
    if (!externalId) {
      return res.status(400).json({ message: "External ID is required" });
    }
    
    const user = await User.findOne({ externalId }).select("-password");
    
    if (user) {
      // User exists, generate token
      const token = generateToken(user._id);
      
      console.log("User found:", {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      });
      
      return res.json({ 
        exists: true, 
        token: token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage || ''
        }
      });
    }
    
    console.log("No existing user found for externalId:", externalId);
    return res.json({ exists: false });
  } catch (error) {
    console.error("Check user error:", error);
    // Return a more graceful failure instead of 500
    res.status(200).json({ 
      exists: false, 
      error: error.message 
    });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    
    // Use the same secret as in generateToken
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    console.log("Getting all users request received");
    console.log("Auth user:", req.user ? req.user.email : "Not authenticated");
    
    // Find all users except the current user
    const allUsers = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${allUsers.length} users to return`);
    
    return res.status(200).json({ 
      success: true,
      data: allUsers 
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error fetching users" 
    });
  }
};

export { registerUser, loginUser, checkUser, verifyToken };
