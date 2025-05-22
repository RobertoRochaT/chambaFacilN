import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import freelancerRoutes from './routes/freelancerRoutes.js'
import freelancerJobRoutes from './routes/freelancerJobRoutes.js'

// Initialize Express
const app = express()

// Connect to database
connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send("API Working"))

// IMPORTANT: Use CLERK_SECRET_KEY for middleware, not WEBHOOK_SECRET
app.use(clerkMiddleware({secretKey: process.env.CLERK_SECRET_KEY}))

// Add logging for webhook requests
app.post('/webhooks', (req, res, next) => {
  console.log('📣 WEBHOOK RECEIVED:', {
    headers: {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'] ? '✓ Present' : '❌ Missing'
    },
    body: {
      type: req.body?.type,
      data: req.body?.data ? 'Data present' : 'No data'
    }
  });
  next();
}, clerkWebhooks);

app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/freelancers', freelancerRoutes)
app.use('/api/freelancers/jobs', freelancerJobRoutes)

// Add debug endpoint to check webhook configuration
app.get('/api/webhook-test', (req, res) => {
  res.json({
    success: true,
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET ? '✓ Configured' : '❌ Missing',
    secretKey: process.env.CLERK_SECRET_KEY ? '✓ Configured' : '❌ Missing'
  });
});

// Port
const PORT = process.env.PORT || 5002

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhooks`);
  console.log('⚠️ For local development, you need to expose this endpoint to the internet');
  console.log('⚠️ Use ngrok or a similar tool: npx ngrok http 5002');
})