import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const checkContent = async (content) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are an AI content moderator. Given the following user-generated text, determine whether it contains abusive, hateful, or offensive language. Respond with 'Flagged' if the content is abusive or hateful, or 'Clean' if it is appropriate.\n\nExample:\nInput: 'You are stupid and worthless'\nOutput: Flagged\n\nInput: 'Can someone explain binary trees?'\nOutput: Clean\n\nNow evaluate this:\nInput: ${content}\nOutput:`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.candidates[0].content.parts[0].text.trim();
    return result === 'Clean';
  } catch (error) {
    console.error('Content moderation error:', error);
    // In case of API failure, we'll allow the content to be posted
    // but log the error for monitoring
    return true;
  }
}; 