import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database

export const clerkWebhooks = async (req, res) => {
    try {
        console.log("Webhook received:", req.body.type);

        // Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verifying Headers
        try {
            await whook.verify(JSON.stringify(req.body), {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
            console.log("Webhook signature verified successfully");
        } catch (verifyError) {
            console.error("Webhook verification failed:", verifyError);
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        // Getting Data from request body
        const { data, type } = req.body;
        console.log("Webhook event type:", type);
        console.log("Webhook data:", JSON.stringify(data, null, 2));

        // Switch Cases for different Events
        switch (type) {
            case 'user.created': {
                console.log("Processing user.created webhook");
                
                const email = data.email_addresses?.[0]?.email_address;
                if (!email) {
                    console.error("No email found in webhook data");
                    return res.status(400).json({ success: false, message: "No email in user data" });
                }
                
                const firstName = data.first_name || '';
                const lastName = data.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
                
                const userData = {
                    _id: data.id,
                    email: email,
                    name: fullName,
                    image: data.image_url || '',
                    resume: ''
                };
                
                console.log("Creating user with data:", userData);
                
                try {
                    const newUser = await User.create(userData);
                    console.log("User created successfully:", newUser._id);
                    return res.json({ success: true });
                } catch (dbError) {
                    console.error("Database error creating user:", dbError);
                    
                    // If it's a duplicate key error, the user might already exist
                    if (dbError.code === 11000) {
                        console.log("User already exists, updating instead");
                        await User.findByIdAndUpdate(data.id, userData);
                        return res.json({ success: true, updated: true });
                    }
                    
                    throw dbError;
                }
            }

            case 'user.updated': {
                console.log("Processing user.updated webhook");
                
                const userData = {
                    email: data.email_addresses?.[0]?.email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    image: data.image_url || '',
                };
                
                console.log("Updating user with data:", userData);
                
                const updated = await User.findByIdAndUpdate(data.id, userData);
                console.log("User updated:", updated ? "success" : "not found");
                
                return res.json({ success: !!updated });
            }
            
            case 'user.deleted': {
                console.log("Processing user.deleted webhook");
                
                const deleted = await User.findByIdAndDelete(data.id);
                console.log("User deleted:", deleted ? "success" : "not found");
                
                return res.json({ success: !!deleted });
            }
            
            default:
                console.log("Unhandled webhook type:", type);
                return res.json({ success: true, handled: false });
        }
    } catch (error) {
        console.error("Webhook handler error:", error);
        res.status(500).json({ success: false, message: "Error in Clerk Webhook", error: error.message });
    }
}