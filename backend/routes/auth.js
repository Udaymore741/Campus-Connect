import express from 'express';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {auth} from '../middleware/auth.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { normalizeUrl, getFrontendUrl } from '../utils/urlHelper.js';

const router = Router();

// Create email transporter with environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'udaymore742@gmail.com',
    pass: process.env.EMAIL_PASS || 'euhw ward izif xgni'
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check for permanent suspension
    if (user.isPermanentlySuspended) {
      return res.status(403).json({
        message: 'Your account has been permanently suspended.',
        isSuspended: true,
        isPermanent: true
      });
    }

    // Check for temporary suspension
    if (user.isSuspended && user.suspensionEndsAt) {
      const now = new Date();
      if (now < user.suspensionEndsAt) {
        const hoursLeft = Math.ceil((user.suspensionEndsAt - now) / (1000 * 60 * 60));
        return res.status(403).json({
          message: `Your account is suspended for ${hoursLeft} more hours.`,
          isSuspended: true,
          isPermanent: false,
          suspensionEndsAt: user.suspensionEndsAt
        });
      } else {
        // Suspension period is over, clear the suspension
        user.isSuspended = false;
        user.suspensionEndsAt = null;
        await user.save();
      }
    }

    const token = jwt.sign({ 
      userId: user._id,
      role: user.role,
      isAdmin: user.role === 'admin'
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ 
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        profilePicture: user.profilePicture ? normalizeUrl(user.profilePicture) : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password', 'name', 'role']
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during registration',
      error: error.message 
    });
  }
});

// Logout route
router.post('/logout', auth, (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Check auth status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture ? normalizeUrl(user.profilePicture) : ''
      }
    });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send email
    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER || 'udaymore742@gmail.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
});

// Reset Password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Mark the password as modified to trigger the pre-save middleware
    user.password = password;
    user.markModified('password');
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 