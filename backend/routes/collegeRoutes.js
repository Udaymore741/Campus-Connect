import express from 'express';
import { Router } from 'express';
import College from '../models/College.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Enrollment from '../models/Enrollment.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Get all colleges (public route with optional auth)
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    
    // Get user's enrollments if user is logged in
    let userEnrollments = [];
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          userEnrollments = user.enrolledColleges || [];
        }
      } catch (err) {
        // Token verification failed, continue without enrollment data
        console.log('Token verification failed:', err.message);
      }
    }

    // Get member counts and question counts for each college
    const collegesWithCounts = await Promise.all(colleges.map(async college => {
      const memberCount = await Enrollment.countDocuments({ college: college._id });
      const questionCount = await Question.countDocuments({ college: college._id });
      
      return {
        ...college.toObject(),
        image: college.image ? `http://localhost:8080${college.image}` : '',
        isEnrolled: userEnrollments.includes(college._id.toString()),
        members: memberCount,
        questionsCount: questionCount
      };
    }));

    res.json(collegesWithCounts);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ message: 'Error fetching colleges' });
  }
});

// Get single college (public route)
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get member count and question count
    const memberCount = await Enrollment.countDocuments({ college: college._id });
    const questionCount = await Question.countDocuments({ college: college._id });

    const collegeData = {
      ...college.toObject(),
      image: college.image ? `http://localhost:8080${college.image}` : '',
      members: memberCount,
      questionsCount: questionCount
    };

    res.json(collegeData);
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ message: 'Error fetching college' });
  }
});

// Add new college (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      location, 
      established,
      courses,
      facilities,
      achievements,
      contactInfo,
      website, 
      departments, 
      accreditation, 
      ranking 
    } = req.body;

    if (!name || !description || !location || !established || !contactInfo || !req.file) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'description', 'location', 'established', 'contactInfo', 'image']
      });
    }

    const existingCollege = await College.findOne({ name });
    if (existingCollege) {
      return res.status(400).json({ message: 'College with this name already exists' });
    }

    const college = new College({
      name,
      description,
      location,
      established,
      courses: courses ? JSON.parse(courses) : [],
      facilities: facilities ? JSON.parse(facilities) : [],
      achievements,
      contactInfo,
      image: `/uploads/colleges/${req.file.filename}`,
      website,
      departments: departments ? JSON.parse(departments) : [],
      accreditation,
      ranking: ranking ? parseInt(ranking) : undefined,
      createdBy: req.userId
    });

    await college.save();
    
    const collegeData = college.toObject();
    collegeData.image = `http://localhost:8080${college.image}`;
    
    res.status(201).json({
      message: 'College added successfully',
      college: collegeData
    });
  } catch (error) {
    console.error('Error adding college:', error);
    res.status(500).json({ message: 'Error adding college' });
  }
});

// Update college (admin only)
router.patch('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (req.file) {
      updates.image = `/uploads/colleges/${req.file.filename}`;
    }

    if (updates.courses) {
      updates.courses = JSON.parse(updates.courses);
    }

    if (updates.facilities) {
      updates.facilities = JSON.parse(updates.facilities);
    }

    if (updates.departments) {
      updates.departments = JSON.parse(updates.departments);
    }

    if (updates.ranking) {
      updates.ranking = parseInt(updates.ranking);
    }

    const college = await College.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const collegeData = college.toObject();
    collegeData.image = college.image ? `http://localhost:8080${college.image}` : '';
    
    res.json({
      message: 'College updated successfully',
      college: collegeData
    });
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ message: 'Error updating college' });
  }
});

// Delete college (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ message: 'Error deleting college' });
  }
});

// Join college (authenticated users only)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.userId,
      college: college._id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this college' });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      user: req.userId,
      college: college._id
    });

    await enrollment.save();

    // Get updated member count
    const memberCount = await Enrollment.countDocuments({ college: college._id });

    res.json({ 
      message: 'Successfully joined college',
      members: memberCount
    });
  } catch (error) {
    console.error('Error joining college:', error);
    res.status(500).json({ message: 'Error joining college' });
  }
});

// Unjoin college (authenticated users only)
router.post('/:id/unjoin', auth, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove enrollment
    await Enrollment.findOneAndDelete({
      user: req.userId,
      college: college._id
    });

    // Get updated member count
    const memberCount = await Enrollment.countDocuments({ college: college._id });

    res.json({ 
      message: 'Successfully unjoined college',
      members: memberCount
    });
  } catch (error) {
    console.error('Error unjoining college:', error);
    res.status(500).json({ message: 'Error unjoining college' });
  }
});

export default router; 