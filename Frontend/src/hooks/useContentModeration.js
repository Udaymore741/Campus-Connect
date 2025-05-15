import { useState } from 'react';
import { toast } from 'sonner';
import { checkContent } from '@/services/contentModeration';

export const useContentModeration = () => {
  const [isChecking, setIsChecking] = useState(false);

  const moderateContent = async (content, onSuccess) => {
    if (!content.trim()) {
      toast.error('Content cannot be empty', { duration: 3000 });
      return;
    }

    setIsChecking(true);
    try {
      const isClean = await checkContent(content);
      
      if (isClean) {
        onSuccess();
      } else {
        toast.error('Your content contains inappropriate language. Please revise and try again.', { duration: 3000 });
      }
    } catch (error) {
      console.error('Content moderation error:', error);
      toast.error('Error checking content. Please try again.', { duration: 3000 });
    } finally {
      setIsChecking(false);
    }
  };

  return {
    moderateContent,
    isChecking
  };
}; 