import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuestionCard from "../components/QuestionCard";
import CategorySelector from "../components/CategorySelector";
import QuestionForm from "../components/QuestionForm";
import { Filter, SortAsc, SortDesc, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [questions, setQuestions] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const collegeId = searchParams.get("college");
  
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
      debouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchQuestions();
  }, [selectedCategory, sortOrder, collegeId, searchQuery]);

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
      
      if (searchQuery) {
        params.append('search', searchQuery);
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
      toast.error(error.response?.data?.message || 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-3xl font-bold mb-6">Questions</h1>
              
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
                    <QuestionCard key={question._id} question={question} />
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
                <QuestionForm collegeId={collegeId} onQuestionAdded={fetchQuestions} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}