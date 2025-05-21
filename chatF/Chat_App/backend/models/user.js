import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    // Replace clerkId with externalId or update your code to use clerkId consistently
    externalId: { 
      type: String, 
      sparse: true,  // This makes the index only apply to documents that have the field
      index: true
    },
    // If you still need clerkId field but want to fix the uniqueness issue:
    clerkId: {
      type: String,
      sparse: true,  // Makes index only apply to non-null values
      index: true
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;