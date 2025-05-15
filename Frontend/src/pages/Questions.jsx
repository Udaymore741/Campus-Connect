import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuestionCard from "../components/QuestionCard";
import CategorySelector from "../components/CategorySelector";
import { Filter, SortAsc, SortDesc, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useContentModeration } from "@/hooks/useContentModeration";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [questions, setQuestions] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const collegeId = searchParams.get("college");
  const [questionForm, setQuestionForm] = useState({
    title: "",
    description: "",
    category: "",
  });
  const { moderateContent, isChecking } = useContentModeration();
  
  // Debounced search
  const debouncedSearch = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchQuestions();
      } else {
        fetchQuestions();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortOrder]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (collegeId) {
      fetchCollegeName();
      fetchQuestions();
    }
  }, [collegeId]);

  const fetchCollegeName = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/colleges/${collegeId}`, {
        withCredentials: true
      });
      setCollegeName(response.data.name);
    } catch (error) {
      console.error('Error fetching college name:', error);
      setCollegeName("");
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!collegeId) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      let url = `http://localhost:8080/api/questions/college/${collegeId}`;
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      switch (sortOrder) {
        case 'oldest':
          params.append('sort', 'oldest');
          break;
        case 'most-answered':
          params.append('sort', 'most-answered');
          break;
        case 'most-viewed':
          params.append('sort', 'most-viewed');
          break;
        default:
          params.append('sort', 'newest');
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        withCredentials: true
      });

      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.message || 'Failed to fetch questions');
      toast.error(error.response?.data?.message || 'Failed to load questions. Please try again.', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category } = questionForm;
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!collegeId) {
      toast.error("No college selected. Please select a college before posting.");
      return;
    }
    await moderateContent(description, async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/questions",
          { title, content: description, category, college: collegeId },
          { withCredentials: true }
        );
        if (response.data) {
          toast.success("Question posted successfully!", { duration: 3000 });
          setQuestionForm({ title: "", description: "", category: "" });
          fetchQuestions();
        }
      } catch (error) {
        const flagged = error.response?.data?.flaggedWords;
        if (flagged && flagged.length) {
          toast.error(
            `Inappropriate words detected: ${flagged.join(', ')}`,
            { duration: 3000 }
          );
        } else {
          toast.error(
            error.response?.data?.message ||
            error.message ||
            "Error creating question",
            { duration: 3000 }
          );
        }
      }
    });
  };

  const handleAnswerAdded = (updatedQuestion) => {
    setQuestions(questions.map(q => 
      q._id === updatedQuestion._id ? updatedQuestion : q
    ));
  };

  if (!collegeId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 px-4 md:px-6">
          <div className="container max-w-7xl mx-auto text-center">
            <p className="text-muted-foreground">Please select a college to view questions.</p>
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
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-6">
                {collegeName ? `${collegeName} / Questions` : 'Questions'}
              </h1>
              
              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSortOrder('newest')}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                        sortOrder === 'newest'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <SortDesc className="h-4 w-4" />
                      Newest
                    </button>
                    
                    <button
                      onClick={() => setSortOrder('most-answered')}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                        sortOrder === 'most-answered'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <SortAsc className="h-4 w-4" />
                      Most Answered
                    </button>

                    <button
                      onClick={() => setSortOrder('most-viewed')}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                        sortOrder === 'most-viewed'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <SortAsc className="h-4 w-4" />
                      Most Viewed
                    </button>
                  </div>
                </div>
                
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
              
              {/* Questions List */}
              <div className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                      onClick={fetchQuestions}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : questions.length > 0 ? (
                  questions.map((question) => (
                    <QuestionCard 
                      key={question._id} 
                      question={question}
                      onAnswerAdded={handleAnswerAdded}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? `No questions found matching "${searchQuery}"`
                        : "No questions found for this category."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-background border border-border rounded-2xl shadow-lg p-8">
                  <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Ask a Question</h1>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="question-title" className="block text-sm font-medium text-foreground mb-1">Title</label>
                      <input
                        id="question-title"
                        type="text"
                        value={questionForm.title}
                        onChange={e => setQuestionForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Enter a short, clear title"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        disabled={isChecking}
                        maxLength={120}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="question-description" className="block text-sm font-medium text-foreground mb-1">Description</label>
                      <Textarea
                        id="question-description"
                        value={questionForm.description}
                        onChange={e => setQuestionForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Describe your question in detail..."
                        className="w-full min-h-[120px] px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-y"
                        disabled={isChecking}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="question-category" className="block text-sm font-medium text-foreground mb-1">Category</label>
                      <select
                        id="question-category"
                        value={questionForm.category}
                        onChange={e => setQuestionForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        disabled={isChecking}
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="academic">Academic</option>
                        <option value="campus-life">Campus Life</option>
                        <option value="admissions">Admissions</option>
                        <option value="careers">Careers</option>
                        <option value="general">General</option>
                        <option value="exams-results">Exams & Results</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="fresher-queries">Fresher Queries</option>
                        <option value="alumni-network">Alumni Network</option>
                        <option value="academic-projects">Academic Projects</option>
                      </select>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow hover:bg-primary/90 transition disabled:opacity-60"
                      disabled={isChecking}
                    >
                      {isChecking ? "Checking content..." : "Post Question"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}