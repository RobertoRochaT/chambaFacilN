import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"

// Get User Data
export const getUserData = async (req, res) => {

    const userId = req.auth.userId
    try {

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

export const getUserChatData = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('USER CHAT DATA REQUESTED:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User not found with id: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('Found user data:', {
      id: user._id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
    });
    
    // Format the data to match what the chat app expects
    const chatUserData = {
      _id: user._id,
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      profileImage: user.profileImage || user.image || '',
      externalId: user._id.toString()
    };
    
    console.log('Returning formatted user data:', chatUserData);
    
    return res.status(200).json({
      success: true,
      data: chatUserData
    });
  } catch (error) {
    console.error('Error in getUserChatData:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body

    const userId = req.auth.userId

    try {

        const isAlreadyApplied = await JobApplication.find({ jobId, userId })

        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.auth.userId

        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .exec()

        if (!applications) {
            return res.json({ success: false, message: 'No job applications found for this user.' })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}