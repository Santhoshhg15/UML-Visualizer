import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ── GEMINI CLIENT INITIALIZATION ───────────────────────
 * 
 * Securely accessing the Gemini API key from Vite's env.
 */
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * ── GEMINI COMPLETION WRAPPER ──────────────────────────
 * 
 * Service to handle Gemini Pro model interactions for 
 * architectural interpretation.
 */
export async function callGemini(userPrompt: string, systemPrompt: string) {
  if (!genAI) {
    throw new Error('Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest', 
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    // Combine system instructions and user prompt
    const fullPrompt = `${systemPrompt}\n\nUSER INPUT: "${userPrompt}"`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    // Since we forced responseMimeType: application/json, 
    // Gemini should return a valid JSON string.
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to communicate with Gemini.');
  }
}
