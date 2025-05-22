import jwt from 'jsonwebtoken'
import Company from '../models/Company.js'
import Freelancer from '../models/Freelancer.js'
import User from '../models/User.js';
import { requireAuth } from '@clerk/clerk-sdk-node'
// Middleware ( Protect Company Routes )
export const protectCompany = async (req,res,next) => {

    // Getting Token Froms Headers
    const token = req.headers.token

    
    if (!token) {
        return res.json({ success:false, message:'Not authorized, Login Again'})
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.company = await Company.findById(decoded.id).select('-password')

        next()

    } catch (error) {
        res.json({success:false, message: error.message})
    }

}

export const freelancerAuth = async (req, res, next) => {
    try {
      // 1) Leer token
      const token = req.headers.token
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' })
      }
  
      // 2) Verificar JWT
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      if (!payload?.id) {
        return res.status(401).json({ success: false, message: 'Token inválido' })
      }
  
      // 3) Buscar al freelancer
      const freelancer = await Freelancer.findById(payload.id)
      if (!freelancer) {
        return res.status(404).json({ success: false, message: 'Freelancer no encontrado' })
      }
  
      // 4) Inyectar en la request
      req.freelancer = { id: freelancer._id }
      next()
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Auth falló: ' + err.message })
    }
  }


  export const userAuth = requireAuth();

