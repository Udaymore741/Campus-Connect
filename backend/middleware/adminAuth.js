import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.userId = decoded.userId;
    req.user = user;
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 