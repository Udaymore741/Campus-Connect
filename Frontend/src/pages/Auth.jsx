import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
  "Business Administration",
];

const degrees = [
  "B.Tech",
  "M.Tech",
  "MCA",
  "MBA",
  "B.Sc",
  "M.Sc",
  "BBA",
  "B.Com",
  "M.Com"
];

const facultyPositions = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Research Associate",
  "Teaching Assistant",
];

const grades = Array.from({ length: 5 }, (_, i) => `${i + 8}th`);

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(searchParams.get('mode') || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [position, setPosition] = useState("");
  const [grade, setGrade] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [aictcNumber, setAictcNumber] = useState("");
  const [studentIdCard, setStudentIdCard] = useState(null);
  const [facultyIdCard, setFacultyIdCard] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to clear all form fields
  const clearFormFields = () => {
    setEmail("");
    setPassword("");
    setName("");
    setRole("student");
    setDepartment("");
    setDegree("");
    setYear("");
    setPassoutYear("");
    setPosition("");
    setGrade("");
    setLinkedinProfile("");
    setAictcNumber("");
    setStudentIdCard(null);
    setFacultyIdCard(null);
    setShowPassword(false);
  };

  // Clear form fields when component mounts
  useEffect(() => {
    clearFormFields();
  }, []);

  // Update mode and clear form fields when URL parameter changes
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode && (urlMode === 'login' || urlMode === 'signup')) {
      setMode(urlMode);
      clearFormFields();
    }
  }, [searchParams]);

  // Clear form fields when mode changes
  useEffect(() => {
    clearFormFields();
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (mode === "signup") {
      if (!name || !role) {
        toast.error("Name and role are required");
        return;
      }
      
      if (role === "student") {
        if (!department || !degree || !year || !passoutYear || !linkedinProfile || !studentIdCard) {
          toast.error("Please fill in all student details");
          return;
        }
      }
      
      if (role === "faculty" && (!position || !aictcNumber || !facultyIdCard)) {
        toast.error("Please fill in all faculty details");
        return;
      }
      
      if (role === "visitor" && !grade) {
        toast.error("Please select your grade");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      let result;
      if (mode === "login") {
        result = await login(email, password);
      } else {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        formData.append('role', role);
        
        if (role === 'student') {
          formData.append('department', department);
          formData.append('degree', degree);
          formData.append('year', year);
          formData.append('passoutYear', passoutYear);
          formData.append('linkedinProfile', linkedinProfile);
          if (studentIdCard) {
            formData.append('studentIdCard', studentIdCard);
          }
        } else if (role === 'faculty') {
          formData.append('position', position);
          formData.append('aictcNumber', aictcNumber);
          if (facultyIdCard) {
            formData.append('facultyIdCard', facultyIdCard);
          }
        } else if (role === 'visitor') {
          formData.append('grade', grade);
        }

        result = await register(formData);
      }

      if (result.success) {
        toast.success(mode === "login" ? "Logged in successfully!" : "Account created successfully!");
        navigate("/profile");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error?.response?.data?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const passoutYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Calculate available years based on selected degree
  const getAvailableYears = () => {
    const maxYears = {
      'B.Tech': 4,
      'M.Tech': 2,
      'MCA': 3,
      'MBA': 2,
      'B.Sc': 3,
      'M.Sc': 2,
      'BBA': 3,
      'B.Com': 3,
      'M.Com': 2
    };
    return Array.from({ length: maxYears[degree] || 0 }, (_, i) => i + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
            <button
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-4 text-center transition-all duration-200",
                mode === "login"
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "bg-transparent hover:bg-primary/5 text-muted-foreground"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 py-4 text-center transition-all duration-200",
                mode === "signup"
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "bg-transparent hover:bg-primary/5 text-muted-foreground"
              )}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form */}
          <div className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-1">
                      Role <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>

                  {role === "student" && (
                    <>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium mb-1">
                          Department <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="department"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="degree" className="block text-sm font-medium mb-1">
                          Degree <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="degree"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select Degree</option>
                          {degrees.map((deg) => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="year" className="block text-sm font-medium mb-1">
                          Current Year <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="year"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select Year</option>
                          {getAvailableYears().map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="passoutYear" className="block text-sm font-medium mb-1">
                          Expected Passout Year <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="passoutYear"
                          value={passoutYear}
                          onChange={(e) => setPassoutYear(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select Passout Year</option>
                          {passoutYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="linkedinProfile" className="block text-sm font-medium mb-1">
                          LinkedIn Profile <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="linkedinProfile"
                          type="url"
                          value={linkedinProfile}
                          onChange={(e) => setLinkedinProfile(e.target.value)}
                          placeholder="https://linkedin.com/in/your-profile"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="studentIdCard" className="block text-sm font-medium mb-1">
                          Student ID Card <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="studentIdCard"
                          type="file"
                          onChange={(e) => setStudentIdCard(e.target.files[0])}
                          accept="image/*,.pdf"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                    </>
                  )}

                  {role === "faculty" && (
                    <>
                      <div>
                        <label htmlFor="position" className="block text-sm font-medium mb-1">
                          Position <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="position"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        >
                          <option value="">Select Position</option>
                          {facultyPositions.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="aictcNumber" className="block text-sm font-medium mb-1">
                          AICTC Number <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="aictcNumber"
                          type="text"
                          value={aictcNumber}
                          onChange={(e) => setAictcNumber(e.target.value)}
                          placeholder="Enter your AICTC number"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="facultyIdCard" className="block text-sm font-medium mb-1">
                          Faculty ID Card <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="facultyIdCard"
                          type="file"
                          onChange={(e) => setFacultyIdCard(e.target.files[0])}
                          accept="image/*,.pdf"
                          className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                    </>
                  )}

                  {role === "visitor" && (
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium mb-1">
                        Grade <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option value="">Select Grade</option>
                        {grades.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full py-2 px-4 rounded-lg font-medium transition-all duration-200",
                  "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
                  "hover:from-primary/90 hover:to-primary shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Processing..." : mode === "login" ? "Log In" : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 