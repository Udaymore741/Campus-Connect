import express from 'express';
import { isAdmin, auth } from '../middleware/auth.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

const router = express.Router();

// Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const { reportedContent, contentType, category, description } = req.body;
    
    // If reporting an answer, get the question ID
    let questionId = null;
    if (contentType === 'answer') {
      const answer = await Answer.findById(reportedContent);
      if (answer) {
        questionId = answer.question;
      }
    }
    
    const report = new Report({
      reporter: req.user._id,
      reportedContent,
      contentType,
      category,
      description,
      questionId
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reports (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type && type !== 'all') {
      query.contentType = type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query)
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resolve a report
router.put('/:id/resolve', isAdmin, async (req, res) => {
  try {
    const { resolution } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status === 'resolved') {
      return res.status(400).json({ message: 'Report already resolved' });
    }

    report.status = 'resolved';
    report.resolution = resolution;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();

    await report.save();

    // Handle suspension if needed
    if (resolution === 'suspended') {
      const content = report.contentType === 'question' 
        ? await Question.findById(report.reportedContent)
        : await Answer.findById(report.reportedContent);
      
      if (content) {
        const user = await User.findById(content.author);
        if (user) {
          user.suspensionCount = (user.suspensionCount || 0) + 1;
          if (user.suspensionCount >= 5) {
            user.isPermanentlySuspended = true;
          } else {
            user.isSuspended = true;
            user.suspensionEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
          }
          await user.save();
        }
      }
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a report
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 