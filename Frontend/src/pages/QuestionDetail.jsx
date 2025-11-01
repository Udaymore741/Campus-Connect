import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import QuestionCard from "@/components/QuestionCard";
import AnswerCard from "@/components/AnswerCard";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

export default function QuestionDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const answerId = searchParams.get('answerId');
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if ID exists
    if (!id) {
      setError('Question ID is required');
      setLoading(false);
      return;
    }
    
    fetchQuestionAndAnswers();
  }, [id]);

  useEffect(() => {
    if (answerId && answers.length > 0) {
      const answerElement = document.getElementById(`answer-${answerId}`);
      if (answerElement) {
        answerElement.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        answerElement.classList.add('bg-yellow-50', 'border-l-4', 'border-yellow-500');
        // Remove highlight after 3 seconds
        setTimeout(() => {
          answerElement.classList.remove('bg-yellow-50', 'border-l-4', 'border-yellow-500');
        }, 3000);
      }
    }
  }, [answerId, answers]);

  const fetchQuestionAndAnswers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch question details
      const questionResponse = await axios.get(`http://localhost:8080/api/questions/${id}`, {
        withCredentials: true
      });
      setQuestion(questionResponse.data);

      // Fetch answers
      const answersResponse = await axios.get(`http://localhost:8080/api/answers/question/${id}`, {
        withCredentials: true
      });
      setAnswers(answersResponse.data);
    } catch (error) {
      console.error('Error fetching question details:', error);
      setError(error.response?.data?.message || 'Failed to load question details');
      toast.error('Failed to load question details. Please try again.', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to post an answer", { duration: 3000 });
      return;
    }
    
    if (!newAnswer.trim()) {
      toast.error("Please enter your answer", { duration: 3000 });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:8080/api/answers', {
        content: newAnswer,
        questionId: id
      }, {
        withCredentials: true
      });

      setAnswers(prev => [response.data, ...prev]);
      setNewAnswer("");
      toast.success("Answer posted successfully!", { duration: 3000 });
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error(error.response?.data?.message || 'Failed to post answer', { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 px-4 md:px-6">
          <div className="container max-w-7xl mx-auto flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 px-4 md:px-6">
          <div className="container max-w-7xl mx-auto text-center">
            <p className="text-red-500 mb-4">{error || 'Question not found'}</p>
            <button
              onClick={fetchQuestionAndAnswers}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20 md:pt-24 pb-16 px-2 md:px-6 animate-fade-in">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-4 md:mb-6">
            <BackButton fallbackTo="/questions" label="Back" className="text-sm px-3 py-1.5" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-8">
          {/* Question */}
          <div className="animate-fade-in">
            <QuestionCard question={question} isDetailed />
          </div>
          
              {/* Answer Form */}
              {user ? (
                <div className="bg-card rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 border border-border animate-fade-in">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                    Your Answer
              </h2>
                  
                  <form onSubmit={handleSubmitAnswer}>
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      rows={4}
                      className="w-full px-3 md:px-4 py-2 text-sm md:text-base rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y mb-3 md:mb-4"
                    />
                    
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary text-primary-foreground px-4 py-2 text-sm md:text-base rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                      {submitting ? "Posting..." : "Post Answer"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-card rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 border border-border text-center animate-fade-in">
                  <p className="text-sm md:text-base text-muted-foreground">Please log in to post an answer</p>
            </div>
              )}
            
              {/* Answers List */}
              <div className="space-y-3 md:space-y-6 animate-fade-in">
                <h2 className="text-lg md:text-xl font-semibold">
                  {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </h2>
                
                {answers.map((answer) => (
                  <div key={answer._id} id={`answer-${answer._id}`}>
                    <AnswerCard 
                      answer={answer}
                      isQuestionAuthor={question.author._id === user?.id}
                      onAnswerUpdated={fetchQuestionAndAnswers}
                    />
                  </div>
                ))}
                
                {answers.length === 0 && (
                  <p className="text-center text-sm md:text-base text-muted-foreground py-6 md:py-8">
                    No answers yet. Be the first to answer!
                  </p>
                )}
              </div>
              </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              {/* Author Profile Card */}
              <div className="bg-card rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 border border-border animate-fade-in">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">About the Author</h3>
                
                <div className="flex flex-col items-center mb-4">
                  <img
                    src={question.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author?.name || 'User')}&background=random`}
                    alt={question.author?.name || 'User'}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary mb-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author?.name || 'User')}&background=random`;
                    }}
                  />
                  <h4 className="text-base md:text-lg font-semibold">{question.author?.name || 'Unknown User'}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground capitalize">{question.author?.role || 'user'}</p>
                </div>

                {/* Role-specific information */}
                {question.author?.email && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Email</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.email}</span>
                    </div>
                  </div>
                )}

                {question.author?.department && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Department</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.department}</span>
                    </div>
                  </div>
                )}

                {question.author?.year && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Year</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.year}</span>
                    </div>
                  </div>
                )}

                {question.author?.rollNumber && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Roll Number</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.rollNumber}</span>
                    </div>
                  </div>
                )}

                {question.author?.cgpa && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">CGPA</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.cgpa}</span>
                    </div>
                  </div>
                )}

                {question.author?.position && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Position</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.position}</span>
                    </div>
                  </div>
                )}

                {question.author?.qualification && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Qualification</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.qualification}</span>
                    </div>
                  </div>
                )}

                {question.author?.experience && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Experience</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.experience} years</span>
                    </div>
                  </div>
                )}

                {question.author?.specialization && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center p-2 bg-background rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">Specialization</span>
                      <span className="text-xs md:text-sm font-medium">{question.author.specialization}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => question.author?._id && navigate(`/profile/${question.author._id}`)}
                  className="w-full mt-4 bg-primary text-primary-foreground px-4 py-2 text-sm rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 