import { useState } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, MessageCircle, Check, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AnswerCard({ answer, isQuestionAuthor, onAnswerUpdated }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(answer.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(answer.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const hasLiked = user && likes.includes(user.id);
  const isAuthor = user && answer.author._id === user.id;

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to like answers");
      return;
    }

    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await axios.post(
        `http://localhost:8080/api/answers/${answer._id}/like`,
        {},
        { withCredentials: true }
      );
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Error liking answer:', error);
      toast.error(error.response?.data?.message || 'Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAccept = async () => {
    if (!isQuestionAuthor) return;
    if (isAccepting) return;

    try {
      setIsAccepting(true);
      await axios.post(
        `http://localhost:8080/api/answers/${answer._id}/accept`,
        {},
        { withCredentials: true }
      );
      toast.success("Answer marked as accepted");
      if (onAnswerUpdated) onAnswerUpdated();
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast.error(error.response?.data?.message || 'Failed to accept answer');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleEdit = async () => {
    if (!isAuthor) return;
    if (!editedContent.trim()) {
      toast.error("Answer content cannot be empty");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/answers/${answer._id}`,
        { content: editedContent },
        { withCredentials: true }
      );
      toast.success("Answer updated successfully");
      setIsEditing(false);
      if (onAnswerUpdated) onAnswerUpdated();
    } catch (error) {
      console.error('Error updating answer:', error);
      toast.error(error.response?.data?.message || 'Failed to update answer');
    }
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    if (!window.confirm("Are you sure you want to delete this answer?")) return;
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await axios.delete(
        `http://localhost:8080/api/answers/${answer._id}`,
        { withCredentials: true }
      );
      toast.success("Answer deleted successfully");
      if (onAnswerUpdated) onAnswerUpdated();
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error(error.response?.data?.message || 'Failed to delete answer');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      await axios.post(
        `http://localhost:8080/api/answers/${answer._id}/comments`,
        { content: newComment },
        { withCredentials: true }
      );
      toast.success("Comment added successfully");
      setNewComment("");
      setShowCommentForm(false);
      if (onAnswerUpdated) onAnswerUpdated();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
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

  return (
    <div className={cn(
      "bg-card rounded-xl shadow-sm p-6 border border-border animate-fade-in",
      answer.isAccepted && "ring-2 ring-primary"
    )}>
      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        <Link to={`/profile/${answer.author._id}`} className="shrink-0">
          {answer.author.profilePicture ? (
            <img 
              src={answer.author.profilePicture}
              alt={answer.author.name}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(answer.author.name)}&background=random`;
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {answer.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${answer.author._id}`} className="font-medium hover:text-primary transition-colors">
                {answer.author.name}
              </Link>
              <span className="text-sm text-muted-foreground">
                • {formatDate(answer.createdAt)}
              </span>
              {answer.isAccepted && (
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  <Check className="h-4 w-4" />
                  Accepted Answer
                </span>
              )}
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Answer Content */}
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(answer.content);
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-foreground/90 whitespace-pre-wrap">{answer.content}</p>
          )}

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
              <span>{likes.length}</span>
            </button>

            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{answer.comments?.length || 0} Comments</span>
            </button>

            {isQuestionAuthor && !answer.isAccepted && (
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-colors ml-auto",
                  isAccepting && "opacity-50 cursor-not-allowed",
                  "text-primary hover:text-primary/80"
                )}
              >
                <Check className="h-4 w-4" />
                Accept Answer
              </button>
            )}
          </div>

          {/* Comments */}
          {answer.comments && answer.comments.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-border">
              {answer.comments.map((comment, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile/${comment.author._id}`} className="font-medium hover:text-primary transition-colors">
                      {comment.author.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      • {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground/90 mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Form */}
          {showCommentForm && (
            <form onSubmit={handleSubmitComment} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment("");
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 