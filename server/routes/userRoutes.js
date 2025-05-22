import express from 'express'
import { applyForJob, getUserData, getUserJobApplications, updateUserResume, getUserChatData } from '../controllers/userController.js'
import upload from '../config/multer.js'


const router = express.Router()

// Get user Data
router.get('/user', getUserData)

// Apply for a job
router.post('/apply', applyForJob)

// Get applied jobs data
router.get('/applications', getUserJobApplications)

// Update user profile (resume)
router.post('/update-resume', upload.single('resume'), updateUserResume)

router.get('/user/:userId', getUserChatData);
router.get('/:userId/chat', getUserChatData);  // Add this new route

export default router;