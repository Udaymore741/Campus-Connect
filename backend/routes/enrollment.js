import express from 'express';
import { Router } from 'express';
import User from '../models/User.js';
import College from '../models/College.js';
import Enrollment from '../models/Enrollment.js';
import auth from '../middleware/auth.js';

const router = Router();

// Enroll in a college
router.post('/enroll/:collegeId', auth, async (req, res) => {
  try {
    console.log('Enrollment request received for college:', req.params.collegeId);
    console.log('User ID:', req.userId);

    const college = await College.findById(req.params.collegeId);
    if (!college) {
      console.log('College not found:', req.params.collegeId);
      return res.status(404).json({ message: 'College not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.userId,
      college: req.params.collegeId
    });

    if (existingEnrollment) {
      console.log('User already enrolled in college');
      return res.status(400).json({ message: 'Already enrolled in this college' });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      user: req.userId,
      college: req.params.collegeId
    });

    await enrollment.save();
    console.log('Successfully enrolled user in college');
    res.json({ message: 'Successfully enrolled in college' });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Unenroll from a college
router.delete('/unenroll/:collegeId', auth, async (req, res) => {
  try {
    console.log('Unenrollment request received for college:', req.params.collegeId);
    console.log('User ID:', req.userId);

    const result = await Enrollment.findOneAndDelete({
      user: req.userId,
      college: req.params.collegeId
    });

    if (!result) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    console.log('Successfully unenrolled user from college');
    res.json({ message: 'Successfully unenrolled from college' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user's enrolled colleges
router.get('/my-colleges', auth, async (req, res) => {
  try {
    console.log('Fetching enrolled colleges for user:', req.userId);
    const enrollments = await Enrollment.find({ user: req.userId })
      .populate('college')
      .sort('-enrolledAt');

    console.log('Successfully fetched enrolled colleges');
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrolled colleges:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Check enrollment status for a specific college
router.get('/check/:collegeId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.userId,
      college: req.params.collegeId
    });
    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
});

export default router; 