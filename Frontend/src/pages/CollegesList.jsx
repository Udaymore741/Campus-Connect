import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, MessageSquare, School, CheckCircle2, UserPlus, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function CollegesList() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("http://localhost:8080/api/colleges", { headers });
      setColleges(response.data);
    } catch (error) {
      toast.error("Failed to fetch colleges");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async (collegeId, event) => {
    event.preventDefault(); // Prevent navigation
    if (!isAuthenticated) {
      toast.error("Please login to join a college");
      return;
    }

    try {
      const college = colleges.find(c => c._id === collegeId);
      const endpoint = college.isEnrolled ? 'unjoin' : 'join';
      const token = localStorage.getItem('token');

      await axios.post(
        `http://localhost:8080/api/colleges/${collegeId}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setColleges(prevColleges =>
        prevColleges.map(college =>
          college._id === collegeId
            ? { ...college, isEnrolled: !college.isEnrolled }
            : college
        )
      );

      // Show success toast with appropriate message
      if (!college.isEnrolled) {
        toast.success("Successfully joined the college!", {
          description: "You are now a member of this college community.",
          duration: 3000,
        });
      } else {
        toast.success("Successfully unjoined the college", {
          description: "You have left this college community.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update enrollment status");
    }
  };

  const handleCardClick = (college, event) => {
    // Only navigate if the click wasn't on the join button
    if (!event.defaultPrevented) {
      navigate(`/college/${college._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Colleges</h1>
        <p className="text-muted-foreground mb-8">Browse and connect with college communities</p>

        <div className="grid gap-6">
          {colleges.map((college) => (
            <div
              key={college._id}
              className="bg-card text-card-foreground rounded-lg shadow-md dark:shadow-primary/5 border border-border p-6 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-foreground">{college.name}</h2>
                  <p className="text-muted-foreground">
                    Founded in {college.establishedYear || "N/A"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                        <Users className="h-4 w-4" />
                        <span>{(college.members || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>{(college.questionsCount || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 font-semibold text-foreground">
                        <Users className="h-4 w-4" />
                        <span>{(college.activeUsers || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isAuthenticated && (
                      <button
                        onClick={(e) => handleJoinToggle(college._id, e)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          college.isEnrolled
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 font-semibold">
                          {college.isEnrolled ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Already Joined</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              <span>Join</span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                    <Link
                      to={`/college/${college._id}`}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
