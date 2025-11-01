import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "../data/mockData";
import axios from "axios";
import { School, Check } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

export default function CollegePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('questions');
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCollegeDetails();
    checkEnrollmentStatus();
  }, [id]);

  const fetchCollegeDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/colleges/${id}`);
      const collegeData = response.data;
      setCollege(collegeData);
      
      // Ensure the image URL is properly formatted
      if (collegeData.image && !collegeData.image.startsWith('http')) {
        setImageUrl(`http://localhost:8080${collegeData.image}`);
      } else {
        setImageUrl(collegeData.image);
      }
      
      setLoading(false);
    } catch (err) {
      setError("Failed to load college details");
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/enrollment/check/${id}`, {
        withCredentials: true
      });
      setIsEnrolled(response.data.isEnrolled);
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
    }
  };

  const handleEnrollment = async () => {
    if (isEnrolling) return; // Prevent multiple clicks
    
    try {
      setIsEnrolling(true);
      
      if (isEnrolled) {
        await axios.delete(`http://localhost:8080/api/enrollment/unenroll/${id}`, {
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
        toast.success("Successfully unenrolled from college");
      } else {
        await axios.post(`http://localhost:8080/api/enrollment/enroll/${id}`, {}, {
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
        toast.success("Successfully enrolled in college");
      }
      setIsEnrolled(!isEnrolled);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        toast.error("Request timed out. Please try again.");
      } else if (error.response?.status === 401) {
        toast.error("Please log in to enroll in colleges.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update enrollment status");
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!college) return null;

  return (
    <div className="min-h-screen bg-background">      
      <main className="container max-w-7xl mx-auto px-2 md:px-4 pt-16 md:pt-20 pb-16">
        <div className="mb-4 md:mb-6">
          <BackButton fallbackTo="/colleges" label="Back" className="text-sm px-3 py-1.5" />
        </div>
        {/* Large College Image */}
        <div className="w-full h-[400px] rounded-xl overflow-hidden mb-8 relative animate-fade-in">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={college.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-4xl font-medium text-primary">
                {college.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={handleEnrollment}
            disabled={isEnrolling}
            className={`absolute top-4 right-4 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isEnrolling
                ? "opacity-50 cursor-not-allowed"
                : isEnrolled
                ? "bg-primary/10 hover:bg-primary/20 text-primary"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {isEnrolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                <span>{isEnrolled ? "Unenrolling..." : "Enrolling..."}</span>
              </>
            ) : isEnrolled ? (
              <>
                <Check className="h-4 w-4" />
                <span>Enrolled</span>
              </>
            ) : (
              <>
                <School className="h-4 w-4" />
                <span>Enroll</span>
              </>
            )}
          </button>
        </div>

        {/* College Name */}
        <h1 className="text-4xl font-bold mb-6 text-foreground animate-fade-in">{college.name}</h1>

        {/* College Description */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8 animate-fade-in">
          <p className="text-xl text-muted-foreground">{college.description}</p>
        </div>

        {/* Questions & Categories Cards placed above details */}
        <div className="grid md:grid-cols-3 gap-6 mt-8 animate-fade-in">
          <button
            className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full"
            onClick={() => {
              setActiveSection('questions');
              navigate(`/questions?college=${college._id}`);
            }}
          >
            <h2 className="text-xl font-semibold mb-2">Questions</h2>
            <p className="text-3xl font-bold text-primary">
              {(college.questionsCount || 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total questions asked
            </p>
          </button>

          <button
            className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full"
            onClick={() => setActiveSection('categories')}
          >
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                +{categories.length - 3} more
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Click to explore all categories
            </p>
          </button>
        </div>

        {/* Other College Information - moved below cards */}
        <div className="grid gap-6 bg-card rounded-xl p-6 border border-border mt-8 animate-fade-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">College Details</h2>
            
            {college.location && (
              <div>
                <h3 className="font-medium text-muted-foreground">Location</h3>
                <p className="text-foreground">{college.location}</p>
              </div>
            )}

            {college.established && (
              <div>
                <h3 className="font-medium text-muted-foreground">Established</h3>
                <p className="text-foreground">{college.established}</p>
              </div>
            )}

            {college.contactInfo && (
              <div>
                <h3 className="font-medium text-muted-foreground">Contact Information</h3>
                <p className="text-foreground">{college.contactInfo}</p>
              </div>
            )}

            {college.courses && college.courses.length > 0 && (
              <div>
                <h3 className="font-medium text-muted-foreground">Available Courses</h3>
                <ul className="list-disc list-inside space-y-1">
                  {college.courses.map((course, index) => (
                    <li key={index} className="text-foreground">{course}</li>
                  ))}
                </ul>
              </div>
            )}

            {college.facilities && college.facilities.length > 0 && (
              <div>
                <h3 className="font-medium text-muted-foreground">Facilities</h3>
                <ul className="list-disc list-inside space-y-1">
                  {college.facilities.map((facility, index) => (
                    <li key={index} className="text-foreground">{facility}</li>
                  ))}
                </ul>
              </div>
            )}

            {college.achievements && (
              <div>
                <h3 className="font-medium text-muted-foreground">Achievements</h3>
                <p className="text-foreground">{college.achievements}</p>
              </div>
            )}
          </div>
        </div>

        {activeSection === 'categories' && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-6">Question Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`/questions?college=${id}&category=${category.slug}`)}
                  className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-left w-full"
                >
                  <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {category.description}
                  </p>
                  <div className="mt-4 text-sm text-primary">
                    View questions →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
