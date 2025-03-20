import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import QuestionCard from "@/components/QuestionCard";
import AnswerCard from "@/components/AnswerCard";
import Navbar from "@/components/Navbar";

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuestionAndAnswers();
  }, [id]);

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
      toast.error('Failed to load question details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to post an answer");
      return;
    }
    
    if (!newAnswer.trim()) {
      toast.error("Please enter your answer");
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
      toast.success("Answer posted successfully!");
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error(error.response?.data?.message || 'Failed to post answer');
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
      
      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
          {/* Question */}
          <QuestionCard question={question} isDetailed />
          
              {/* Answer Form */}
              {user ? (
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                    Your Answer
              </h2>
                  
                  <form onSubmit={handleSubmitAnswer}>
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y mb-4"
                    />
                    
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Posting..." : "Post Answer"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border text-center">
                  <p className="text-muted-foreground">Please log in to post an answer</p>
            </div>
              )}
            
              {/* Answers List */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </h2>
                
                {answers.map((answer) => (
                  <AnswerCard 
                    key={answer._id} 
                    answer={answer}
                    isQuestionAuthor={question.author._id === user?.id}
                    onAnswerUpdated={fetchQuestionAndAnswers}
                  />
                ))}
                
                {answers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No answers yet. Be the first to answer!
                  </p>
                )}
              </div>
              </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* You can add related questions or other sidebar content here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 