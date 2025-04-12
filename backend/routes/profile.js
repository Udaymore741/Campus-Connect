import express from 'express';
import { Router } from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return some basic stats
    res.json({
      totalPosts: 0, // You can implement this based on your post model
      totalComments: 0, // You can implement this based on your comment model
      totalLikes: 0, // You can implement this based on your like model
      joinDate: user.createdAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user activity
router.get('/activity', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return recent activity
    res.json({
      recentPosts: [], // You can implement this based on your post model
      recentComments: [], // You can implement this based on your comment model
      recentLikes: [] // You can implement this based on your like model
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get additional user info
router.get('/additional-info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return additional user info
    res.json({
      skills: user.skills || [],
      education: user.education || [],
      achievements: user.achievements || [],
      socialLinks: {
        linkedin: user.linkedinProfile || '',
        github: user.github || '',
        twitter: user.twitter || ''
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const { skills, achievements, ...otherFields } = req.body;
    const updateData = { ...otherFields };

    if (skills) {
      updateData.skills = skills;
    }

    if (achievements) {
      updateData.achievements = achievements;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Upload profile picture
router.post('/upload-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's profile picture
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: `http://localhost:8080${user.profilePicture}`
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
});

export default router; 