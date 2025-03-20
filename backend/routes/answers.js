const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const auth = require('../middleware/auth');
const {
  emitNewAnswer,
  emitAnswerUpdate,
  emitAnswerDelete,
  emitAnswerLikeUpdate,
  emitNewComment
} = require('../services/socketService');

// Get all answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});

// Create a new answer
router.post('/', auth, async (req, res) => {
  try {
    const { content, questionId } = req.body;
    
    const answer = new Answer({
      content,
      author: req.userId,
      question: questionId
    });

    await answer.save();

    // Add answer to question's answers array
    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: answer._id }
    });
    
    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'name profilePicture');

    // Emit socket event for new answer
    emitNewAnswer(questionId, populatedAnswer);

    res.status(201).json(populatedAnswer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ message: 'Error creating answer' });
  }
});

// Update an answer
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this answer' });
    }

    answer.content = content;
    await answer.save();
    
    const updatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'name profilePicture');

    // Emit socket event for answer update
    emitAnswerUpdate(answer.question, updatedAnswer);

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ message: 'Error updating answer' });
  }
});

// Delete an answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    // Store question ID before removing answer
    const questionId = answer.question;

    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(questionId, {
      $pull: { answers: answer._id }
    });
    
    // Delete the answer
    await answer.remove();

    // Emit socket event for answer deletion
    emitAnswerDelete(questionId, answer._id);

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ message: 'Error deleting answer' });
  }
});

// Like/Unlike an answer
router.post('/:id/like', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const likeIndex = answer.likes.indexOf(req.userId);
    if (likeIndex === -1) {
      answer.likes.push(req.userId);
    } else {
      answer.likes.splice(likeIndex, 1);
    }

    await answer.save();

    // Emit socket event for answer likes update
    emitAnswerLikeUpdate(answer.question, answer._id, answer.likes);

    res.json({ likes: answer.likes.length });
  } catch (error) {
    console.error('Error updating answer likes:', error);
    res.status(500).json({ message: 'Error updating likes' });
  }
});

// Accept an answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const question = await Question.findById(answer.question);
    
    if (!answer || !question) {
      return res.status(404).json({ message: 'Answer or question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the question author can accept an answer' });
    }

    // Mark answer as accepted
    answer.isAccepted = true;
    await answer.save();

    // Mark question as resolved
    question.isResolved = true;
    await question.save();

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ message: 'Error accepting answer' });
  }
});

// Add a comment to an answer
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const comment = {
      content,
      author: req.userId
    };

    answer.comments.push(comment);
    await answer.save();
    
    const updatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    // Emit socket event for new comment
    emitNewComment(answer.question, answer._id, comment);

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router; 