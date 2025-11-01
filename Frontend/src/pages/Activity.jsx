import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpCircle, MessageCircle, HelpCircle, MessageSquare } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";

export default function Activity() {
  const [activeTab, setActiveTab] = useState("questions");
  const [userActivity, setUserActivity] = useState({
    questions: [],
    answers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8080/api/user/activity', {
          withCredentials: true
        });
        setUserActivity(response.data);
      } catch (error) {
        console.error('Error fetching user activity:', error);
        toast.error('Failed to load activity data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserActivity();
  }, [user, navigate]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container max-w-7xl mx-auto px-4 pt-28 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "questions":
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {userActivity.questions.length === 0 ? (
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700">
                <p className="text-muted-foreground">You haven't asked any questions yet.</p>
              </Card>
            ) : (
              userActivity.questions.map((question) => (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/question/${question._id}`} className="block">
                    <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700 cursor-pointer">
                      <h3 className="text-xl font-semibold hover:text-primary transition-colors text-blue-900 dark:text-blue-100">
                        {question.title}
                      </h3>
                      <p className="text-muted-foreground mt-2">{question.content}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ArrowUpCircle className="w-4 h-4" />
                          {question.upvotes} upvotes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {question.answersCount} answers
                        </span>
                        <span>{formatDistanceToNow(new Date(question.createdAt))} ago</span>
                        <span className="text-primary">
                          {question.category}
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        );
      case "answers":
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {userActivity.answers.length === 0 ? (
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700">
                <p className="text-muted-foreground">You haven't answered any questions yet.</p>
              </Card>
            ) : (
              userActivity.answers.map((answer) => (
                <motion.div
                  key={answer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/question/${answer.questionId}`} className="block">
                    <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700 cursor-pointer">
                      <h3 className="text-lg font-medium hover:text-primary transition-colors text-blue-900 dark:text-blue-100">
                        {answer.questionTitle}
                      </h3>
                      <p className="text-muted-foreground mt-2">{answer.content}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ArrowUpCircle className="w-4 h-4" />
                          {answer.upvotes} upvotes
                        </span>
                        <span>{formatDistanceToNow(new Date(answer.createdAt))} ago</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container max-w-7xl mx-auto px-2 md:px-4 pt-20 md:pt-28 pb-16 animate-fade-in">
        <div className="mb-4 md:mb-6">
          <BackButton fallbackTo="/" label="Back" className="text-sm px-3 py-1.5" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Activity</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track your contributions and engagement</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("questions")}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                activeTab === "questions"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              <HelpCircle className="w-6 h-6" />
              <div className="text-left">
                <span className="block font-semibold text-lg">{userActivity.questions.length}</span>
                <span className="text-sm">My Questions</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("answers")}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 ${
                activeTab === "answers"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              <div className="text-left">
                <span className="block font-semibold text-lg">{userActivity.answers.length}</span>
                <span className="text-sm">My Answers</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {renderContent()}
      </main>
    </div>
  );
}
