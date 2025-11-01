import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Professional BackButton component for consistent navigation throughout the platform
 * @param {Object} props
 * @param {string} props.fallbackTo - The route to navigate to if no history (default: "/")
 * @param {string} props.label - Custom label text (default: "Back to Home")
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Optional click handler
 */
export default function BackButton({ 
  fallbackTo = "/", 
  label = "Back", 
  className = "",
  onClick
}) {
  const navigate = useNavigate();
  
  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      // Go back in history
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // If no history, go to fallback route
        navigate(fallbackTo);
      }
    }
  };
  
  return (
    <button 
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-primary hover:text-primary/80 font-medium shadow-sm hover:shadow-md",
        className
      )}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}

