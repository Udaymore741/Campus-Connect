import express from 'express';
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Like from '../models/Like.js';

const router = Router();

// Get user's activity data
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's questions
    const questions = await Question.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .lean();

    // Fetch user's answers
    const answers = await Answer.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .populate('question', 'title')
      .lean();

    // Fetch user's likes
    const likes = await Like.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('item', 'title')
      .lean();

    // Transform likes data to include question/answer details
    const transformedLikes = likes.map(like => ({
      _id: like._id,
      type: like.itemType,
      itemId: like.item._id,
      itemTitle: like.item.title,
      likedAt: like.createdAt
    }));

    // Transform answers data to include question details
    const transformedAnswers = answers.map(answer => ({
      _id: answer._id,
      content: answer.content,
      questionId: answer.question._id,
      questionTitle: answer.question.title,
      upvotes: answer.upvotes,
      createdAt: answer.createdAt
    }));

    res.json({
      questions: questions.map(q => ({
        _id: q._id,
        title: q.title,
        content: q.content,
        category: q.category,
        upvotes: q.upvotes,
        answersCount: q.answersCount,
        createdAt: q.createdAt
      })),
      answers: transformedAnswers,
      likes: transformedLikes
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Failed to fetch user activity' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    const { name, email, phone, college, department, year } = req.body;

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update user fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.college = college || user.college;
        user.department = department || user.department;
        user.year = year || user.year;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router; 