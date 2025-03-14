import { useState } from "react";
import { Camera } from "lucide-react";
import Navbar from "../components/Navbar";

// Mock user data - in a real app, this would come from your backend
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  role: "student",
  department: "Computer Science",
  year: "2024",
  passoutYear: "2026",
  position: null,
  grade: null,
  avatar: "",
  bio: "Computer Science student passionate about web development and AI.",
  joinedDate: "2024-03-01",
};

export default function Profile() {
  const [user] = useState(mockUser);
  const [imagePreview, setImagePreview] = useState("");
  
  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20" />
          
          {/* Profile Section */}
          <div className="px-6 pb-6">
            <div className="relative -mt-20 mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted">
                  {(imagePreview || user.avatar) ? (
                    <img
                      src={imagePreview || user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-muted-foreground">
                      {user.name[0]}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            
            {/* User Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Role</h3>
                    <p className="text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  
                  {user.role === "student" && (
                    <>
                      <div>
                        <h3 className="font-medium mb-1">Department</h3>
                        <p className="text-muted-foreground">{user.department}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Current Year</h3>
                        <p className="text-muted-foreground">{user.year}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Expected Passout Year</h3>
                        <p className="text-muted-foreground">{user.passoutYear}</p>
                      </div>
                    </>
                  )}
                  
                  {user.role === "faculty" && (
                    <div>
                      <h3 className="font-medium mb-1">Position</h3>
                      <p className="text-muted-foreground">{user.position}</p>
                    </div>
                  )}
                  
                  {user.role === "visitor" && (
                    <div>
                      <h3 className="font-medium mb-1">Grade</h3>
                      <p className="text-muted-foreground">{user.grade}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Bio</h3>
                    <p className="text-muted-foreground">{user.bio}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Member Since</h3>
                    <p className="text-muted-foreground">
                      {new Date(user.joinedDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 