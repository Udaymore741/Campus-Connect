import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, Heart, Share2, Eye, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ReportDialog } from "./ReportDialog";
import ViewProfileDialog from "./ViewProfileDialog";

export default function QuestionCard({ question, isDetailed = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [viewCount, setViewCount] = useState(question.views || 0);

  useEffect(() => {
    // Initialize likes count and hasLiked state
    if (question.likes) {
      setLikesCount(Array.isArray(question.likes) ? question.likes.length : question.likes);
      setHasLiked(user && Array.isArray(question.likes) ? question.likes.includes(user.id) : false);
    }
  }, [question.likes, user]);

  const handleView = async () => {
    try {
      // Check if user has already viewed this question
      const viewedQuestions = JSON.parse(localStorage.getItem('viewedQuestions') || '{}');
      if (!viewedQuestions[question._id]) {
        // Mark question as viewed
        viewedQuestions[question._id] = true;
        localStorage.setItem('viewedQuestions', JSON.stringify(viewedQuestions));
        
        // Increment view count
        const response = await axios.post(
          `http://localhost:8080/api/questions/${question._id}/view`,
          {},
          { withCredentials: true }
        );
        setViewCount(response.data.views);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to like questions");
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await axios.post(
        `http://localhost:8080/api/questions/${question._id}/like`,
        {},
        { withCredentials: true }
      );
      setLikesCount(response.data.likes);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error liking question:', error);
      toast.error(error.response?.data?.message || 'Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReport = async (data) => {
    try {
      await axios.post('http://localhost:8080/api/reports', {
        reportedContent: question._id,
        contentType: 'question',
        category: data.category,
        description: data.description
      }, { withCredentials: true });
      toast.success('Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    handleView();
    navigate(`/question/${question._id}`);
  };

  const handleViewProfile = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUserId(userId);
    setIsViewProfileOpen(true);
  };

  const CardContent = () => (
    <div className="flex items-start gap-3 md:gap-4">
      {/* Avatar */}
      <div className="shrink-0">
        <button
          onClick={(e) => handleViewProfile(e, question.author._id)}
          className="block"
        >
          {question.author.profilePicture ? (
            <img 
              src={question.author.profilePicture}
              alt={question.author.name}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author.name)}&background=random`;
              }}
            />
          ) : (
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm md:text-lg font-medium text-primary">
                {question.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-1 md:space-y-1.5">
          <h3 className={cn(
            "font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2",
            isDetailed ? "text-lg md:text-2xl" : "text-base md:text-lg"
          )}>
            {question.title}
          </h3>
          <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-1 md:gap-1.5">
            <button
              onClick={(e) => handleViewProfile(e, question.author._id)}
              className="font-medium hover:text-primary transition-colors"
            >
              {question.author.name}
            </button>
            <span className="hidden md:inline">•</span>
            <span className="hover:text-primary transition-colors">
              {question.category}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="break-all">{formatDate(question.createdAt)}</span>
          </div>
        </div>

        {/* Question content */}
        <div className={cn(
          "mt-2 text-xs md:text-sm text-foreground/90",
          isDetailed ? "" : "line-clamp-3"
        )}>
          <p>{question.content}</p>
        </div>

        {/* Actions */}
        <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 md:gap-4 text-xs">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              "flex items-center gap-1 md:gap-1.5 font-medium transition-colors",
              isLiking && "opacity-50 cursor-not-allowed",
              hasLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsUp className={cn("h-3 w-3 md:h-4 md:w-4", hasLiked && "fill-primary")} />
            <span className="hidden sm:inline">{likesCount}</span>
          </button>
          
          <div className="flex items-center gap-1 md:gap-1.5 font-medium text-muted-foreground">
            <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{question.answers?.length || 0}</span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
            <Eye className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{viewCount}</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/question/${question._id}`);
              toast.success('Link copied to clipboard');
            }}
            className="flex items-center gap-1 md:gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsReportDialogOpen(true);
            }}
            className="flex items-center gap-1 md:gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isDetailed) {
    return (
      <div className="bg-card rounded-lg md:rounded-xl shadow-sm p-3 md:p-5 border border-border animate-fade-in">
        <CardContent />
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-card rounded-lg md:rounded-xl shadow-sm p-3 md:p-5 border border-border card-hover animate-fade-in cursor-pointer"
      >
        <CardContent />
      </div>

      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        onSubmit={handleReport}
      />

      <ViewProfileDialog
        isOpen={isViewProfileOpen}
        onClose={() => setIsViewProfileOpen(false)}
        userId={selectedUserId}
      />
    </>
  );
} 