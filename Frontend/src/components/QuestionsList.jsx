import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Clock, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
  withCredentials: true
});

export default function QuestionsList({ collegeId, category }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuestions();
    
    // Join college room for real-time updates
    socket.emit('join-college', collegeId);

    // Listen for real-time updates
    socket.on('new-question', (question) => {
      setQuestions(prev => [question, ...prev]);
    });

    socket.on('question-updated', (updatedQuestion) => {
      setQuestions(prev => 
        prev.map(q => q._id === updatedQuestion._id ? updatedQuestion : q)
      );
    });

    socket.on('question-deleted', (questionId) => {
      setQuestions(prev => prev.filter(q => q._id !== questionId));
    });

    socket.on('likes-updated', ({ questionId, likes }) => {
      setQuestions(prev => 
        prev.map(q => q._id === questionId ? { ...q, likes } : q)
      );
    });

    return () => {
      socket.emit('leave-college', collegeId);
      socket.off('new-question');
      socket.off('question-updated');
      socket.off('question-deleted');
      socket.off('likes-updated');
    };
  }, [collegeId, category, sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:8080/api/questions/college/${collegeId}`, {
        params: { 
          category,
          sort: sortBy,
          search: searchQuery
        },
        withCredentials: true
      });
      
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (questionId) => {
    try {
      await axios.post(`http://localhost:8080/api/questions/${questionId}/like`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error liking question:', error);
      toast.error('Failed to like question');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Questions</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 rounded-lg border border-border bg-background"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-answered">Most Answered</option>
            <option value="most-viewed">Most Viewed</option>
          </select>
          <Link
            to={`/college/${collegeId}/ask`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ask Question
          </Link>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No questions found. Be the first to ask a question!
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Link
              key={question._id}
              to={`/question/${question._id}`}
              className="block bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{question.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{question.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{question.answers?.length || 0} answers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{question.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLike(question._id);
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                      question.likes?.includes(question.author._id)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{question.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 