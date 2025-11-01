import express from 'express';
import { Router } from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { auth } from '../middleware/auth.js';
import { contentFilter } from '../middleware/contentFilter.js';
import { 
  emitNewQuestion, 
  emitQuestionUpdate, 
  emitQuestionDelete,
  emitLikeUpdate 
} from '../services/socketService.js';
import { moderateContent } from '../utils/contentModerator.js';

const router = Router();

// Get all questions for a college
router.get('/college/:collegeId', async (req, res) => {
  try {
    const { category, sort = 'newest', search } = req.query;
    const query = { college: req.params.collegeId };
    
    if (category) {
      query.category = category;
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'most-answered':
        sortOption = { answers: -1 };
        break;
      case 'most-viewed':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    let questions;
    if (search) {
      // Use regex search for more flexible matching
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      questions = await Question.find({
        $and: [
          { college: req.params.collegeId },
          {
            $or: [
              { title: searchRegex },
              { content: searchRegex },
              { tags: { $in: [searchRegex] } }
            ]
          }
        ]
      })
      .sort(sortOption)
      .populate('author', 'name profilePicture')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });
    } else {
      // Regular query without search
      questions = await Question.find(query)
        .sort(sortOption)
        .populate('author', 'name profilePicture')
        .populate({
          path: 'answers',
          populate: {
            path: 'author',
            select: 'name profilePicture'
          }
        });
    }

    // Normalize author profile picture URLs
    const normalized = questions.map(q => {
      const qObj = q.toObject ? q.toObject() : q;
      if (qObj.author && qObj.author.profilePicture && !qObj.author.profilePicture.startsWith('http')) {
        qObj.author.profilePicture = `http://localhost:8080${qObj.author.profilePicture}`;
      }
      if (Array.isArray(qObj.answers)) {
        qObj.answers = qObj.answers.map(a => {
          if (a.author && a.author.profilePicture && !a.author.profilePicture.startsWith('http')) {
            a.author.profilePicture = `http://localhost:8080${a.author.profilePicture}`;
          }
          return a;
        });
      }
      return qObj;
    });

    res.json(normalized);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      message: 'Error fetching questions',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get a single question with its answers
router.get('/:id', async (req, res) => {
  try {
    // Check if ID is valid
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid question ID' });
    }

    const question = await Question.findById(req.params.id)
      .populate('author', 'name profilePicture role department year rollNumber cgpa position qualification specialization experience email')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    // Normalize URLs for single question response
    const qObj = question.toObject ? question.toObject() : question;
    if (qObj.author && qObj.author.profilePicture && !qObj.author.profilePicture.startsWith('http')) {
      qObj.author.profilePicture = `http://localhost:8080${qObj.author.profilePicture}`;
    }
    if (Array.isArray(qObj.answers)) {
      qObj.answers = qObj.answers.map(a => {
        if (a.author && a.author.profilePicture && !a.author.profilePicture.startsWith('http')) {
          a.author.profilePicture = `http://localhost:8080${a.author.profilePicture}`;
        }
        return a;
      });
    }

    res.json(qObj);
  } catch (error) {
    console.error('Error fetching question:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid question ID format' });
    }
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create a new question
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags, college } = req.body;

    if (!college) {
      return res.status(400).json({ message: 'College is required to post a question.' });
    }

    // Moderate the content
    const { isClean, flaggedWords } = await moderateContent(content);
    if (!isClean) {
      return res.status(400).json({ 
        message: `Your content contains inappropriate language: ${flaggedWords.join(', ')}`,
        flaggedWords
      });
    }

    const question = new Question({
      title,
      content,
      category,
      tags,
      college,
      author: req.user._id
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: error.message || 'Error creating question' });
  }
});

// Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this question' });
    }

    question.title = title;
    question.content = content;
    question.category = category;
    question.tags = tags || question.tags;

    await question.save();
    
    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'name profilePicture');

    // Emit socket event for question update
    emitQuestionUpdate(question.college, updatedQuestion);

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Delete all answers associated with this question
    await Answer.deleteMany({ question: question._id });
    
    // Store college ID before deleting
    const collegeId = question.college;
    
    // Delete the question
    await question.remove();

    // Emit socket event for question deletion
    emitQuestionDelete(collegeId, question._id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Like/Unlike a question
router.post('/:id/like', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const likeIndex = question.likes.indexOf(req.userId);
    if (likeIndex === -1) {
      question.likes.push(req.userId);
    } else {
      question.likes.splice(likeIndex, 1);
    }

    await question.save();

    // Emit socket event for likes update
    emitLikeUpdate(question._id, question.likes);

    res.json({ likes: question.likes.length });
  } catch (error) {
    console.error('Error updating question likes:', error);
    res.status(500).json({ message: 'Error updating likes' });
  }
});

// Add an answer to a question
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { content } = req.body;

    // Moderate the content
    const isContentClean = await moderateContent(content);
    if (!isContentClean) {
      return res.status(400).json({ 
        message: 'Your content contains inappropriate language. Please revise and try again.' 
      });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.answers.push({
      content,
      author: req.user._id
    });

    await question.save();
    res.json(question);
  } catch (error) {
    console.error('Error adding answer:', error);
    res.status(500).json({ message: 'Error adding answer' });
  }
});

export default router; 