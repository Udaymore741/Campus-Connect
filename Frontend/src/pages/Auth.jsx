import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [position, setPosition] = useState("");
  const [grade, setGrade] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
      if (role === "student" && (!department || !year || !passoutYear)) {
        toast.error("Please fill in all student details");
        return;
      }
      
      if (role === "faculty" && !position) {
        toast.error("Please select your position");
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
        result = await register({
          email,
          password,
          name,
          role,
          department: role === "student" ? department : undefined,
          currentYear: role === "student" ? parseInt(year) : undefined,
          passoutYear: role === "student" ? parseInt(passoutYear) : undefined,
          position: role === "faculty" ? position : undefined,
          grade: role === "visitor" ? grade : undefined
        });
      }

      if (result.success) {
        toast.success(mode === "login" ? "Logged in successfully!" : "Account created successfully!");
        navigate("/profile");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  const passoutYears = Array.from({ length: 6 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden glass animate-fade-in">
          {/* Header */}
          <div className="flex items-center">
            <button
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 py-4 text-center transition-colors",
                mode === "login"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 py-4 text-center transition-colors",
                mode === "signup"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form */}
          <div className="p-6">
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
                          {years.map((y) => (
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
                    </>
                  )}

                  {role === "faculty" && (
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
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  "Please wait..."
                ) : mode === "login" ? (
                  "Log In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 