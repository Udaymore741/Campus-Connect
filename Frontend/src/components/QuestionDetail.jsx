import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Check, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
  withCredentials: true
});

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchQuestion();
    
    // Join question room for real-time updates
    socket.emit('join-question', id);

    // Listen for real-time updates
    socket.on('new-answer', (answer) => {
      setQuestion(prev => ({
        ...prev,
        answers: [...prev.answers, answer]
      }));
    });

    socket.on('answer-updated', (updatedAnswer) => {
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(a => a._id === updatedAnswer._id ? updatedAnswer : a)
      }));
    });

    socket.on('answer-deleted', (answerId) => {
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.filter(a => a._id !== answerId)
      }));
    });

    socket.on('answer-likes-updated', ({ answerId, likes }) => {
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(a => 
          a._id === answerId ? { ...a, likes } : a
        )
      }));
    });

    socket.on('new-comment', ({ answerId, comment }) => {
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(a => 
          a._id === answerId 
            ? { ...a, comments: [...a.comments, comment] }
            : a
        )
      }));
    });

    return () => {
      socket.emit('leave-question', id);
      socket.off('new-answer');
      socket.off('answer-updated');
      socket.off('answer-deleted');
      socket.off('answer-likes-updated');
      socket.off('new-comment');
    };
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:8080/api/questions/${id}`, {
        withCredentials: true
      });
      
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      setIsSubmitting(true);
      await axios.post('http://localhost:8080/api/answers', {
        content: newAnswer,
        questionId: id
      }, {
        withCredentials: true
      });
      
      setNewAnswer('');
      toast.success('Answer posted successfully');
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error('Failed to post answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeAnswer = async (answerId) => {
    try {
      await axios.post(`http://localhost:8080/api/answers/${answerId}/like`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error liking answer:', error);
      toast.error('Failed to like answer');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await axios.post(`http://localhost:8080/api/answers/${answerId}/accept`, {}, {
        withCredentials: true
      });
      toast.success('Answer accepted');
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast.error('Failed to accept answer');
    }
  };

  const handleSubmitComment = async (answerId) => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/answers/${answerId}/comments`, {
        content: newComment
      }, {
        withCredentials: true
      });
      
      setNewComment('');
      setShowCommentInput(null);
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6">
        <h1 className="text-3xl font-bold mb-4 text-foreground">{question.title}</h1>
        <p className="text-muted-foreground whitespace-pre-wrap">{question.content}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers.length} answers</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{question.likes.length} likes</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Asked by {question.author.name} on {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmitAnswer} className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Answer</h2>
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Write your answer here..."
          className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-background text-foreground"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Answer'}
        </button>
      </form>

      {/* Answers List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Answers</h2>
        {question.answers.map((answer) => (
          <div
            key={answer._id}
            className={`bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 ${
              answer.isAccepted ? 'border-primary' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-muted-foreground whitespace-pre-wrap">{answer.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                      onClick={() => handleLikeAnswer(answer._id)}
                      className={`flex items-center gap-1 ${
                        answer.likes.includes(answer.author._id)
                          ? 'text-primary'
                          : 'hover:text-primary'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{answer.likes.length}</span>
                    </button>
                    <button
                      onClick={() => setShowCommentInput(showCommentInput === answer._id ? null : answer._id)}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{answer.comments.length}</span>
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Answered by {answer.author.name} on {new Date(answer.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Comments */}
                {answer.comments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {answer.comments.map((comment, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">{comment.content}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {comment.author.name} • {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {showCommentInput === answer._id && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-foreground"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitComment(answer._id)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Post Comment
                      </button>
                      <button
                        onClick={() => setShowCommentInput(null)}
                        className="px-3 py-1 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {question.author._id === answer.author._id && (
                <button
                  onClick={() => handleAcceptAnswer(answer._id)}
                  disabled={answer.isAccepted}
                  className={`p-2 rounded-lg transition-colors ${
                    answer.isAccepted
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Check className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 