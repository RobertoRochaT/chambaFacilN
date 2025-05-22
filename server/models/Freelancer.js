// models/Freelancer.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user:    { type: String, required: true },    // <-- was ObjectId, now a plain string
  rating:  { type: Number, required: true, min: 1, max: 5 }
}, { _id: false });

const freelancerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  password: { type: String, required: true },
  visible: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
  ratings: {type: [ratingSchema], default: []},
  averageRating: { type: Number, default: 0 }
});

export default mongoose.model('Freelancer', freelancerSchema);
