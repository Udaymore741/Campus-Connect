const express = require('express');
const router = express.Router();
const College = require('../models/College');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// Get all colleges (public route)
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.json(colleges.map(college => ({
      ...college.toObject(),
      image: college.image ? `http://localhost:8080${college.image}` : ''
    })));
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
    const collegeData = college.toObject();
    collegeData.image = college.image ? `http://localhost:8080${college.image}` : '';
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

module.exports = router; 