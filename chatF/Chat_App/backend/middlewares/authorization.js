import { getUserIdFromToken } from "../config/jwtProvider.js";
import User from "../models/user.js";
import wrapAsync from "./wrapAsync.js";
import jwt from "jsonwebtoken";

// Enhance the authorization middleware to handle token issues better

// Update authorization middleware with better debugging
const authorization = async (req, res, next) => {
  try {
    console.log("Authentication middleware called");
    
    // Check if Authorization header exists
    if (!req.headers.authorization) {
      console.log("No authorization header");
      return res.status(401).json({ error: "No authorization token, access denied" });
    }
    
    // Get the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      console.log("No token in authorization header");
      return res.status(401).json({ error: "No token, access denied" });
    }
    
    console.log("Token received, validating...");
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully:", decoded.id);
      
      // Find the user
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("User not found for token");
        return res.status(404).json({ error: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Authorization middleware error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};



const chambaFacilAuth = async (req, res, next) => {
  const { userId } = req.query;
  
  if (!userId) {
    return next(); // No userId, proceed to normal auth flow
  }

  try {
    // Call the chamba-facil API to get user data
    const response = await axios.get(`http://localhost:5002/api/users/user/${userId}`);
    
    if (response.data.success && response.data.data) {
      // Create or update user in chat database
      const userData = response.data.data;
      
      // Find or create user in chat database
      const chatUser = await req.db.collection('users').findOneAndUpdate(
        { chambaFacilId: userId },
        { 
          $set: {
            name: userData.name,
            email: userData.email,
            avatar: userData.image,
            chambaFacilId: userId,
            lastLogin: new Date()
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
      
      // Set user data in request
      req.user = chatUser.value || chatUser;
      return next();
    }
  } catch (error) {
    console.error('Error authenticating Chamba Facil user:', error);
  }
  
  // If we reach here, authentication failed
  next();
};


export { chambaFacilAuth, authorization };