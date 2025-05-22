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
app.use(clerkMiddleware())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// Routes
app.get('/', (req, res) => res.send("API Working"))

app.use(clerkMiddleware({secretKey: process.env.CLERK_API_KEY}))

app.post('/webhooks', clerkWebhooks)
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/freelancers', freelancerRoutes)
app.use('/api/freelancers/jobs', freelancerJobRoutes)

// Port
const PORT = process.env.PORT || 5002


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})