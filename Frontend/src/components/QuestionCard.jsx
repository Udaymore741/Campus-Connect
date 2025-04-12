import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThumbsUp, MessageCircle, Heart, Share2, Eye, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ReportDialog } from "./ReportDialog";

export default function QuestionCard({ question, isDetailed = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    // Initialize likes count and hasLiked state
    if (question.likes) {
      setLikesCount(Array.isArray(question.likes) ? question.likes.length : question.likes);
      setHasLiked(user && Array.isArray(question.likes) ? question.likes.includes(user.id) : false);
    }
  }, [question.likes, user]);

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
    navigate(`/question/${question._id}`);
  };

  const CardContent = () => (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="shrink-0">
        <Link to={`/profile/${question.author._id}`} className="block">
          {question.author.profilePicture ? (
            <img 
              src={question.author.profilePicture}
              alt={question.author.name}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author.name)}&background=random`;
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {question.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-1.5">
          <h3 className={cn(
            "font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2",
            isDetailed ? "text-2xl" : "text-lg"
          )}>
            {question.title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <Link to={`/profile/${question.author._id}`} className="font-medium hover:text-primary transition-colors">
              {question.author.name}
            </Link>
            <span className="mx-1.5">•</span>
            <span className="hover:text-primary transition-colors">
              {question.category}
            </span>
            <span className="mx-1.5">•</span>
            <span>{formatDate(question.createdAt)}</span>
          </div>
        </div>

        {/* Question content */}
        <div className={cn(
          "mt-2 text-sm text-foreground/90",
          isDetailed ? "" : "line-clamp-3"
        )}>
          <p>{question.content}</p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              isLiking && "opacity-50 cursor-not-allowed",
              hasLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsUp className={cn("h-4 w-4", hasLiked && "fill-primary")} />
            <span>{likesCount}</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{question.answers?.length || 0} Answers</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{question.views || 0} views</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/question/${question._id}`);
              toast.success('Link copied to clipboard');
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsReportDialogOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="h-4 w-4" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isDetailed) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-5 border border-border animate-fade-in">
        <CardContent />
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-card rounded-xl shadow-sm p-5 border border-border card-hover animate-fade-in cursor-pointer"
      >
        <CardContent />
      </div>

      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        onSubmit={handleReport}
      />
    </>
  );
} 