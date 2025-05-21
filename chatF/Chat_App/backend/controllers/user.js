import User from "../models/user.js";

const getAuthUser = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: `User Not Found` });
  }
  res.status(200).json({
    data: req.user,
  });
};

// Update the getAllUsers function with more logging
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

export { getAuthUser };