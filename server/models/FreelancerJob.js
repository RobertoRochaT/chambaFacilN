import mongoose from 'mongoose'

const freelancerJobSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true
  },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true },
  location:    { type: String, required: true },
  images:       [{ type: String }],
  rate:        { type: Number, required: true },
  date:        { type: Date, default: Date.now },
  visible:     { type: Boolean, default: true }
})

export default mongoose.model('FreelancerJob', freelancerJobSchema)
