import express from 'express'
import {
  postFreelancerJob,
  listFreelancerJobs,
  getFreelancerJob
} from '../controllers/freelancerJobController.js'
import { freelancerAuth } from '../middleware/authMiddleware.js'
import upload from '../config/multer.js'
const router = express.Router()

// require login (analiza token y pone req.freelancer.id)
router.post('/post-job',freelancerAuth,upload.fields([{ name:'images'}]),postFreelancerJob)
router.get('/my-jobs',freelancerAuth,listFreelancerJobs)
router.get('/list',listFreelancerJobs)
router.get('/:id', getFreelancerJob)
export default router
