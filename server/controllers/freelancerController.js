// /controllers/freelancerController.js
import Freelancer from '../models/Freelancer.js'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import FreelancerJob from '../models/FreelancerJob.js'
import { getAuth } from '@clerk/express'
export const createFreelancer = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // 1) Hash del password
    const hashed = await bcrypt.hash(password, 10)

    // 2) Subida de imagen (si usas multer + Cloudinary)
    let imageUrl = ''
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'freelancers',
        use_filename: true,
        unique_filename: false
      })
      imageUrl = result.secure_url
      fs.unlinkSync(req.file.path)
    }

    // 3) Crear y guardar
    const freelancer = new Freelancer({
      name,
      email,
      password: hashed,    // ¡aquí metemos el hash!
      image: imageUrl,
      // los demás campos opcionales…
    })
    await freelancer.save()

    return res.json({
      success: true,
      message: 'Freelancer registrado',
      freelancer: {
        _id: freelancer._id,
        name: freelancer.name,
        email: freelancer.email,
        image: freelancer.image,
        date: freelancer.date
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
export const listFreelancers = async (req, res) => {
  try {
    const all = await Freelancer.find().sort({ date: -1 })
    res.json({ success: true, freelancers: all })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const toggleFreelancerVisibility = async (req, res) => {
  try {
    const f = await Freelancer.findById(req.body.id)
    f.visible = !f.visible
    await f.save()
    res.json({ success: true, message: 'Visibilidad actualizada' })
  } catch (e) {
    res.json({ success: false, message: e.message })
  }
}

export const loginFreelancer = async (req, res) => {
  console.log('⚙️ loginFreelancer req.body:', req.body)
  try {
    const { email, password } = req.body
    // 1) Buscar por email
    const freelancer = await Freelancer.findOne({ email })
    console.log('⚙️ freelancer encontrado:', freelancer)

    if (!freelancer) {
      return res.status(400).json({ success: false, message: 'Credenciales incorrectas' })
    }
    // 2) Comparar password
    const isMatch = await bcrypt.compare(password, freelancer.password)
    console.log('⚙️ isMatch:', isMatch)

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Credenciales incorrectas' })
    }
    // 3) Firmar JWT
    const token = jwt.sign(
      { id: freelancer._id, email: freelancer.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    // 4) Responder con token + datos (oculta password)
    const { password: _, ...freelancerData } = freelancer.toObject()
    res.json({ success: true, token, freelancer: freelancerData })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getFreelancerJob = async (req, res) => {
  try {
    const job = await FreelancerJob.findById(req.params.id)
      .populate({
        path: 'freelancerId',
        select: 'name image ratings averageRating'
      })
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // ensure they exist so client never sees undefined
    job.freelancerId.ratings = job.freelancerId.ratings || [];
    job.freelancerId.averageRating = job.freelancerId.averageRating || 0;

    return res.json({ success: true, job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/freelancers/:id/rate
export const rateFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const { userId }   = req.auth;                // comes from your auth middleware
    const { rating }   = req.body;

    if (![1,2,3,4,5].includes(rating)) {
      return res.status(400).json({ success:false, message:'Rating must be 1–5' });
    }

    const f = await Freelancer.findById(freelancerId);
    if (!f) {
      return res.status(404).json({ success:false, message:'Freelancer not found' });
    }

    const existing = f.ratings.find(r => r.user === userId);
    if (existing) {
      existing.rating = rating;
    } else {
      f.ratings.push({ user: userId, rating });
    }

    // recompute
    const sum = f.ratings.reduce((acc, x) => acc + x.rating, 0);
    f.averageRating = sum / f.ratings.length;

    await f.save();
    return res.json({ success:true, averageRating: f.averageRating });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message: err.message });
  }
};

// Add this function to your controller:

export const getFreelancerChatData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('FREELANCER CHAT DATA REQUESTED:', id);
    
    const freelancer = await Freelancer.findById(id);
    
    if (!freelancer) {
      console.error(`Freelancer not found with id: ${id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Freelancer not found' 
      });
    }
    
    console.log('Found freelancer data:', {
      id: freelancer._id,
      name: freelancer.name,
      email: freelancer.email
    });
    
    // Format the data to match what the chat app expects
    const chatUserData = {
      _id: freelancer._id,
      name: freelancer.name,
      firstName: freelancer.name.split(' ')[0] || '',
      lastName: freelancer.name.split(' ').slice(1).join(' ') || '',
      email: freelancer.email,
      profileImage: freelancer.image || '',
      image: freelancer.image || '',
      externalId: freelancer._id.toString()
    };
    
    console.log('Returning chat user data:', chatUserData);
    
    return res.status(200).json({
      success: true,
      data: chatUserData
    });
  } catch (error) {
    console.error('Error in getFreelancerChatData:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};