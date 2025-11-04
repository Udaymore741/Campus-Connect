import { Server } from 'socket.io';
import { getFrontendUrl } from '../utils/urlHelper.js';

let io;

const initializeSocket = (server) => {
  const frontendUrl = getFrontendUrl();
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        frontendUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join a college room
    socket.on('join-college', (collegeId) => {
      socket.join(`college-${collegeId}`);
      console.log(`Client joined college room: ${collegeId}`);
    });

    // Leave a college room
    socket.on('leave-college', (collegeId) => {
      socket.leave(`college-${collegeId}`);
      console.log(`Client left college room: ${collegeId}`);
    });

    // Join a question room
    socket.on('join-question', (questionId) => {
      socket.join(`question-${questionId}`);
      console.log(`Client joined question room: ${questionId}`);
    });

    // Leave a question room
    socket.on('leave-question', (questionId) => {
      socket.leave(`question-${questionId}`);
      console.log(`Client left question room: ${questionId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const emitNewQuestion = (collegeId, question) => {
  if (io) {
    io.to(`college-${collegeId}`).emit('new-question', question);
  }
};

const emitNewAnswer = (questionId, answer) => {
  if (io) {
    io.to(`question-${questionId}`).emit('new-answer', answer);
  }
};

const emitQuestionUpdate = (collegeId, question) => {
  if (io) {
    io.to(`college-${collegeId}`).emit('question-updated', question);
  }
};

const emitAnswerUpdate = (questionId, answer) => {
  if (io) {
    io.to(`question-${questionId}`).emit('answer-updated', answer);
  }
};

const emitQuestionDelete = (collegeId, questionId) => {
  if (io) {
    io.to(`college-${collegeId}`).emit('question-deleted', questionId);
  }
};

const emitAnswerDelete = (questionId, answerId) => {
  if (io) {
    io.to(`question-${questionId}`).emit('answer-deleted', answerId);
  }
};

const emitLikeUpdate = (questionId, likes) => {
  if (io) {
    io.to(`question-${questionId}`).emit('likes-updated', likes);
  }
};

const emitAnswerLikeUpdate = (questionId, answerId, likes) => {
  if (io) {
    io.to(`question-${questionId}`).emit('answer-likes-updated', { answerId, likes });
  }
};

const emitNewComment = (questionId, answerId, comment) => {
  if (io) {
    io.to(`question-${questionId}`).emit('new-comment', { answerId, comment });
  }
};

export {
  initializeSocket,
  emitNewQuestion,
  emitNewAnswer,
  emitQuestionUpdate,
  emitAnswerUpdate,
  emitQuestionDelete,
  emitAnswerDelete,
  emitLikeUpdate,
  emitAnswerLikeUpdate,
  emitNewComment
}; 