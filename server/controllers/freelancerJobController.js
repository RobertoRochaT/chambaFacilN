import FreelancerJob from '../models/FreelancerJob.js'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
// Publicar un servicio
export const postFreelancerJob = async (req, res) => {
  try {
    const { title, description, category, location, rate } = req.body
    const uploaded = []
    if (req.files && req.files.images) {
     for (let file of req.files.images) {
       const result = await cloudinary.uploader.upload(file.path, {
         folder: 'freelancer_jobs',
         use_filename: true,
         unique_filename: false
       })
       uploaded.push(result.secure_url)
       fs.unlinkSync(file.path)
     }
    }
    const newJob = new FreelancerJob({
      freelancerId: req.freelancer.id,
      title, description, category, location, rate,
      images: uploaded,
    })
    await newJob.save()
    res.json({ success: true, message: 'Servicio publicado', job: newJob })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Listar mis servicios publicados
export const listFreelancerJobs = async (req, res) => {
  try {
    const jobs = await FreelancerJob
      .find({ visible: true })
      .populate('freelancerId', 'name image')
      .sort({ date: -1 })

    res.json({ success: true, jobs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getFreelancerJob = async (req, res) => {
  try {
    const job = await FreelancerJob
      .findById(req.params.id)
      .populate('freelancerId', 'name image')
    if (!job) {
      return res.status(404).json({ success: false, message: 'No encontrado' })
    }
    res.json({ success: true, job })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
