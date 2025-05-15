import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: path.join(__dirname, '..', '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required for content moderation');
}

export async function moderateContent(content) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are an AI content moderator. Given the following user-generated text, list any abusive, hateful, or offensive words found. If none, respond with 'Clean'.\n\nExample:\nInput: 'You are stupid and worthless'\nOutput: stupid, worthless\n\nInput: 'Can someone explain binary trees?'\nOutput: Clean\n\nNow evaluate this:\nInput: ${content}\nOutput:`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const result = response.data.candidates[0].content.parts[0].text.trim();
    if (result === 'Clean') {
      return { isClean: true, flaggedWords: [] };
    } else {
      // Split by comma and trim spaces
      const flaggedWords = result.split(',').map(w => w.trim()).filter(Boolean);
      return { isClean: false, flaggedWords };
    }
  } catch (error) {
    console.error('Error in content moderation:', error.response?.data || error.message);
    throw new Error('Failed to moderate content');
  }
} 