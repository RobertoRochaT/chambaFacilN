// server/routes/freelancerRoutes.js
import express from 'express';
import {
  createFreelancer,
  listFreelancers,
  toggleFreelancerVisibility,
  loginFreelancer,
  getFreelancerJob,
  rateFreelancer,
  getFreelancerChatData
} from '../controllers/freelancerController.js';
import upload from '../config/multer.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

router.get('/:id/chat', getFreelancerChatData);
router.post('/register', upload.single('image'), createFreelancer);
router.post('/login', loginFreelancer);
router.get('/list', listFreelancers);
router.post('/toggle-visibility', toggleFreelancerVisibility);
router.get('/:id', getFreelancerJob);

// Protege con requireAuth(); el usuario debe estar autenticado
router.post('/:id/rate', requireAuth(), rateFreelancer);

export default router;
