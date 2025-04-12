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

const router = Router();

// Get all questions for a college
router.get('/college/:collegeId', async (req, res) => {
  try {
    const { category, sort = 'newest' } = req.query;
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

    const questions = await Question.find(query)
      .sort(sortOption)
      .populate('author', 'name profilePicture')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
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
      .populate('author', 'name profilePicture')
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

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid question ID format' });
    }
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create a new question
router.post('/', auth, contentFilter, async (req, res) => {
  try {
    const { title, content, college, category, tags } = req.body;
    
    const question = new Question({
      title,
      content,
      author: req.userId,
      college,
      category,
      tags: tags || []
    });

    await question.save();
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name profilePicture');

    // Emit socket event for new question
    emitNewQuestion(college, populatedQuestion);

    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question' });
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

export default router; 