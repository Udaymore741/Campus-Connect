import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Fetch complete user data
    fetch('http://localhost:8080/api/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          toast.error(data.message);
        } else {
          setUserData(data);
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile data');
      });
  }, [user, navigate]);

  if (!user || !userData) {
    return null;
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    setIsUpdating(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update profile picture");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const getRoleSpecificInfo = () => {
    switch (userData.role) {
      case "student":
        return (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="font-medium">{userData.department}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Current Year</span>
              <span className="font-medium">{userData.currentYear}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Expected Passout Year</span>
              <span className="font-medium">{userData.passoutYear}</span>
            </div>
          </>
        );
      case "faculty":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Position</span>
            <span className="font-medium">{userData.position}</span>
          </div>
        );
      case "visitor":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Grade</span>
            <span className="font-medium">{userData.grade}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <div className="flex flex-col items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                {userData.profilePicture ? (
                  <img
                    src={`http://localhost:8080${userData.profilePicture}`}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-medium">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-muted-foreground">{userData.email}</p>
              <span className="inline-block px-3 py-1 mt-2 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
              </span>
            </div>

            {/* Role-specific Information */}
            <div className="w-full grid gap-4 mt-4">
              {getRoleSpecificInfo()}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 