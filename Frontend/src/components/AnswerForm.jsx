import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

export default function AnswerForm({ questionId, onAnswerAdded }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/questions/${questionId}/answers`,
        { content },
        { withCredentials: true }
      );

      toast.success("Answer posted successfully!");
      setContent("");
      if (onAnswerAdded) {
        onAnswerAdded(response.data);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to post answer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Answer</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your answer here..."
          required
          className="min-h-[150px]"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post Answer"}
      </Button>
    </form>
  );
} 