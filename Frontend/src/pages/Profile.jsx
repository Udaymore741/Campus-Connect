import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, MessageSquare, BookOpen, Users, Link as LinkIcon, CheckCircle2, XCircle, Award, GraduationCap, Edit2, Github, Twitter, Linkedin, HelpCircle, MessageCircle, ThumbsUp, Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import axios from "axios";
import EditProfileModal from "@/components/EditProfileModal";
import EditSkillsModal from "@/components/EditSkillsModal";
import EditAchievementsModal from "@/components/EditAchievementsModal";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CompleteProfilePrompt from "@/components/CompleteProfilePrompt";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const fileInputRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    joinDate: new Date()
  });
  const [activity, setActivity] = useState({
    recentPosts: [],
    recentComments: [],
    recentLikes: []
  });
  const [enrollments, setEnrollments] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    twitter: "",
    linkedin: ""
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSkillsModalOpen, setIsEditSkillsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isLoading, setIsLoading] = useState({
    userData: true,
    stats: true,
    activity: true,
    additionalInfo: true
  });
  const [errors, setErrors] = useState({
    userData: null,
    stats: null,
    activity: null,
    additionalInfo: null
  });
  const [showCompleteProfilePrompt, setShowCompleteProfilePrompt] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditAchievementsModal, setShowEditAchievementsModal] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

  // Add timeout for API calls
  const API_TIMEOUT = 10000; // 10 seconds

  // Check if the current user is viewing their own profile or is an admin
  const isOwnProfile = !userId || userId === user?._id;
  const isAdminViewing = user?.role === 'admin' && userId && userId !== user?._id;

  useEffect(() => {
    if (!user && !userId) {
      navigate("/auth");
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(prev => ({ ...prev, userData: true }));
      try {
        const endpoint = userId ? `http://localhost:8080/api/profile/${userId}` : 'http://localhost:8080/api/profile';
        const response = await axios.get(endpoint, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        setUserData(response.data);
        const completionPercentage = calculateProfileCompletion(response.data);
        if (completionPercentage < 100 && !userId) {
          setShowCompleteProfilePrompt(true);
        }
        setProfileCompletion(completionPercentage);
        setErrors(prev => ({ ...prev, userData: null }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors(prev => ({ 
          ...prev, 
          userData: error.response?.data?.message || 'Failed to load profile data'
        }));
        toast.error(error.response?.data?.message || 'Failed to load profile data');
        if (error.response?.status === 401) {
          navigate('/auth');
        }
      } finally {
        setIsLoading(prev => ({ ...prev, userData: false }));
      }
    };

    const fetchStats = async () => {
      setIsLoading(prev => ({ ...prev, stats: true }));
      try {
        const response = await axios.get('http://localhost:8080/api/profile/stats', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setStats(response.data);
        setErrors(prev => ({ ...prev, stats: null }));
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          joinDate: new Date()
        });
        setErrors(prev => ({ 
          ...prev, 
          stats: error.response?.data?.message || 'Failed to load stats'
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, stats: false }));
      }
    };

    const fetchActivity = async () => {
      setIsLoading(prev => ({ ...prev, activity: true }));
      try {
        const response = await axios.get('http://localhost:8080/api/profile/activity', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setActivity(response.data);
        setErrors(prev => ({ ...prev, activity: null }));
      } catch (error) {
        console.error('Error fetching activity:', error);
        setActivity({
          recentPosts: [],
          recentComments: [],
          recentLikes: []
        });
        setErrors(prev => ({ 
          ...prev, 
          activity: error.response?.data?.message || 'Failed to load activity'
        }));
      } finally {
        setIsLoading(prev => ({ ...prev, activity: false }));
      }
    };

    const fetchAdditionalInfo = async () => {
      setIsLoading(prev => ({ ...prev, additionalInfo: true }));
      try {
        const endpoint = userId ? `http://localhost:8080/api/profile/${userId}/additional-info` : 'http://localhost:8080/api/profile/additional-info';
        const response = await axios.get(endpoint, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const { skills, achievements, education, socialLinks } = response.data;
        
        setSkills(skills || []);
        setEducation(education || []);
        setAchievements(achievements || []);
        setSocialLinks(socialLinks || {
          github: "",
          twitter: "",
          linkedin: ""
        });
        setErrors(prev => ({ ...prev, additionalInfo: null }));
      } catch (error) {
        console.error('Error fetching additional info:', error);
        setErrors(prev => ({ 
          ...prev, 
          additionalInfo: error.response?.data?.message || 'Failed to load additional information'
        }));
        toast.error(error.response?.data?.message || 'Failed to load additional information');
      } finally {
        setIsLoading(prev => ({ ...prev, additionalInfo: false }));
      }
    };

    fetchUserData();
    fetchStats();
    fetchActivity();
    fetchAdditionalInfo();

    // Only fetch enrollments for the current user
    if (!userId) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      fetch('http://localhost:8080/api/enrollment/my-colleges', {
        credentials: 'include',
        signal: controller.signal
      })
        .then(res => res.json())
        .then(data => setEnrollments(data))
        .catch(err => {
          if (err.name === 'AbortError') {
            console.error('Request timed out');
            toast.error('Request timed out. Please try again.');
          } else {
            console.error('Error fetching enrollments:', err);
          }
        })
        .finally(() => clearTimeout(timeoutId));
    }
  }, [user, navigate, userId]);

  const calculateProfileCompletion = (userData) => {
    if (!userData) return 0;
    
    const requiredFields = {
      name: userData.name,
      email: userData.email,
      profilePicture: userData.profilePicture,
      bio: userData.bio,
      rollNumber: userData.rollNumber,
      cgpa: userData.cgpa,
      dateOfBirth: userData.dateOfBirth,
      bloodGroup: userData.bloodGroup,
      github: userData.socialLinks?.github,
      linkedin: userData.socialLinks?.linkedin,
      skills: userData.skills?.length > 0,
      achievements: userData.achievements?.length > 0
    };

    const filledFields = Object.values(requiredFields).filter(value => {
      if (typeof value === 'boolean') return value;
      return value && value.toString().trim() !== '';
    }).length;

    const totalFields = Object.keys(requiredFields).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const getCompletionColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCompletionText = (percentage) => {
    if (percentage < 30) return 'Profile Incomplete';
    if (percentage < 70) return 'Profile Partially Complete';
    return 'Profile Complete';
  };

  useEffect(() => {
    if (userData) {
      const completion = calculateProfileCompletion(userData);
      setProfileCompletion(completion);
    }
  }, [userData]);

  if (!user || !userData) {
    return null;
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(
        'http://localhost:8080/api/profile/upload-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Update the profile picture in the state
        setUserData(prevData => ({
          ...prevData,
          profilePicture: response.data.profilePicture
        }));
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError('Failed to upload profile picture');
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
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
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Department</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.department || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Year</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.year || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Roll Number</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.rollNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">CGPA</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.cgpa || 'Not provided'}</span>
            </div>
          </div>
        );
      case "faculty":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Position</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.position || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Department</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.department || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Qualification</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.qualification || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Experience</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.experience ? `${userData.experience} years` : 'Not provided'}</span>
            </div>
          </div>
        );
      case "visitor":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Grade</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.grade || 'Not provided'}</span>
            </div>
          </div>
        );
      case "admin":
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Admin Role</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.adminRole || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
              <span className="text-blue-800 dark:text-blue-200">Permissions</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">{userData.permissions || 'Not provided'}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleProfileUpdate = (updatedData) => {
    // Update the userData state with the new data
    setUserData(prevData => ({
      ...prevData,
      ...updatedData
    }));

    // Update profile picture if it's included in the update
    if (updatedData.profilePicture) {
      setUserData(prevData => ({
        ...prevData,
        profilePicture: updatedData.profilePicture
      }));
    }

    // Update skills and achievements state if they are included in the update
    if (updatedData.skills) {
      setSkills(updatedData.skills);
    }
    if (updatedData.achievements) {
      setAchievements(updatedData.achievements);
    }

    // Update social links if they are included in the update
    if (updatedData.socialLinks) {
      setSocialLinks(updatedData.socialLinks);
    }

    // Recalculate profile completion
    const newProfileCompletion = calculateProfileCompletion({
      ...userData,
      ...updatedData
    });
    setProfileCompletion(newProfileCompletion);

    // Show success message
    toast.success("Profile updated successfully!");
  };

  const handleCompleteProfileContinue = () => {
    setShowCompleteProfilePrompt(false);
    setShowEditProfileModal(true);
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleUpdateUser = (updatedData) => {
    // Immediately update the local state
    setUserData(prev => ({
      ...prev,
      ...updatedData
    }));

    // Update skills if they are included in the update
    if (updatedData.skills) {
      setSkills(updatedData.skills);
    }

    // Update achievements if they are included in the update
    if (updatedData.achievements) {
      setAchievements(updatedData.achievements);
    }

    // Update social links if they are included in the update
    if (updatedData.socialLinks) {
      setSocialLinks(updatedData.socialLinks);
    }

    // Recalculate profile completion
    const newProfileCompletion = calculateProfileCompletion({
      ...userData,
      ...updatedData
    });
    setProfileCompletion(newProfileCompletion);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={userData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                  {isOwnProfile && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <h1 className="text-2xl font-bold mt-4">{userData.name}</h1>
                <p className="text-muted-foreground">{userData.email}</p>
                <Badge className="mt-2">{userData.role}</Badge>
              </div>
              
              {isOwnProfile && (
                <div className="mt-6 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleEditProfile}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
            
            {/* Profile Completion Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getCompletionText(profileCompletion)}
                </h3>
                <span className="text-sm font-medium text-primary dark:text-primary-light">
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`${getCompletionColor(profileCompletion)} h-2.5 rounded-full`}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Complete your profile to unlock all features
              </p>
            </motion.div>
          </div>

          {/* Right Column - Stats and Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-2xl font-semibold">
                      {new Date(stats.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Role-specific Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
            >
              {isLoading.userData ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Academic Information */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Academic Information
                    </h3>
                    {getRoleSpecificInfo()}
                  </motion.div>

                  {/* Personal Information */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
                        <span className="text-blue-800 dark:text-blue-200">Date of Birth</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            {new Date(userData.dateOfBirth).toLocaleDateString()}
                          </span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={new Date(userData.dateOfBirth)}
                                className="rounded-md border"
                                disabled
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
                        <span className="text-blue-800 dark:text-blue-200">Blood Group</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">{userData.bloodGroup || 'Not provided'}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Social Links */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Social Links
                    </h3>
                    <div className="flex gap-4">
                      {userData.socialLinks?.github && (
                        <a 
                          href={userData.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors border border-blue-100 dark:border-gray-600"
                        >
                          <Github className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </a>
                      )}
                      {userData.socialLinks?.linkedin && (
                        <a 
                          href={userData.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors border border-blue-100 dark:border-gray-600"
                        >
                          <Linkedin className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </a>
                      )}
                      {userData.socialLinks?.twitter && (
                        <a 
                          href={userData.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors border border-blue-100 dark:border-gray-600"
                        >
                          <Twitter className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Skills and Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
            >
              {isLoading.additionalInfo ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                    <div className="space-y-2">
                      {Array(3).fill(0).map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded w-full" />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Skills */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Skills
                      </h3>
                      {isOwnProfile && !isAdminViewing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSkillsModalOpen(true)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-3 py-1 bg-white/50 dark:bg-gray-700/50 text-blue-900 dark:text-blue-100 rounded-lg text-sm font-medium border border-blue-100 dark:border-gray-600"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-800 dark:text-blue-200">No skills added yet</p>
                    )}
                  </motion.div>

                  {/* Achievements */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Achievements
                      </h3>
                      {isOwnProfile && !isAdminViewing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAchievementsModalOpen(true)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {achievements.length > 0 ? (
                      <div className="space-y-3">
                        {achievements.map((achievement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600"
                          >
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-900 dark:text-blue-100">{achievement.title}</h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200">{achievement.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-800 dark:text-blue-200">No achievements added yet</p>
                    )}
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <CompleteProfilePrompt
        isOpen={showCompleteProfilePrompt}
        onClose={() => setShowCompleteProfilePrompt(false)}
        onContinue={handleCompleteProfileContinue}
      />
      
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        userData={userData}
        onUpdate={(updatedUser) => {
          setUserData(updatedUser);
          setShowEditProfileModal(false);
        }}
      />

      <EditSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        userData={userData}
        onUpdate={handleUpdateUser}
      />

      <EditAchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        userData={userData}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
} 