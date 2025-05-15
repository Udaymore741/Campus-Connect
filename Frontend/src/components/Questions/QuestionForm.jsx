import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { 
    id: 'academic', 
    name: 'Academic', 
    description: 'Questions about courses, majors, and academic programs'
  },
  { 
    id: 'campus-life', 
    name: 'Campus Life', 
    description: 'Questions about campus facilities, events, and student life'
  },
  { 
    id: 'admissions', 
    name: 'Admissions', 
    description: 'Questions about college admissions process and requirements'
  },
  { 
    id: 'careers', 
    name: 'Careers', 
    description: 'Questions about job placements, internships, and career guidance'
  },
  { 
    id: 'general', 
    name: 'General', 
    description: 'General questions about college and student life'
  },
  { 
    id: 'exams-results', 
    name: 'Exams & Results', 
    description: 'Questions about examinations, grading, and academic results'
  },
  { 
    id: 'scholarship', 
    name: 'Scholarship', 
    description: 'Questions about scholarships and financial aid'
  },
  { 
    id: 'fresher-queries', 
    name: 'Fresher Queries', 
    description: 'Questions specifically for new students and freshers'
  },
  { 
    id: 'alumni-network', 
    name: 'Alumni Network', 
    description: 'Questions and discussions with college alumni'
  },
  { 
    id: 'academic-projects', 
    name: 'Academic Projects', 
    description: 'Questions about academic and research projects'
  }
];

export default function QuestionForm({ collegeId, onQuestionAdded }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to post a question");
      return;
    }
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!collegeId) {
      toast.error("College ID is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:8080/api/questions', {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        college: collegeId,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }, {
        withCredentials: true
      });

      toast.success("Question posted successfully!");
      setFormData({
        title: "",
        content: "",
        category: "",
        tags: ""
      });
      
      if (onQuestionAdded) {
        onQuestionAdded(response.data);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to post question. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Ask a Question</h2>
        <p className="text-gray-600 text-center">
          Please log in to post a question
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Ask a Question</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700">
            Question Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="What's your question about?"
            className="w-full px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={120}
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {formData.title.length}/120
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label htmlFor="content" className="block text-sm font-medium mb-2 text-gray-700">
            Question Details *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Provide more details about your question..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label htmlFor="category" className="block text-sm font-medium mb-2 text-gray-700">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {formData.category && (
            <p className="mt-1 text-sm text-gray-500">
              {categories.find(cat => cat.id === formData.category)?.description}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label htmlFor="tags" className="block text-sm font-medium mb-2 text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., programming, math, study-tips"
            className="w-full px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-lg transition-colors",
            "bg-blue-600 text-white hover:bg-blue-700 font-medium",
            isSubmitting && "opacity-70 cursor-not-allowed"
          )}
        >
          <PlusCircle className="h-5 w-5" />
          <span>{isSubmitting ? "Posting..." : "Post Question"}</span>
        </button>
      </form>
    </div>
  );
} 