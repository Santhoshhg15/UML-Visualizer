import OpenAI from 'openai';

/**
 * ── OPENAI CLIENT INITIALIZATION ───────────────────────
 * 
 * We use import.meta.env for Vite projects to securely 
 * access the API key from a .env file.
 */
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Only initialize if API key is present to prevent runtime crashes
export const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Required for client-side API calls
}) : null;

/**
 * ── AI COMPLETION WRAPPER ─────────────────────────────
 * 
 * Dedicated service to handle the OpenAI request-response cycle.
 */
export async function callOpenAI(userPrompt: string, systemPrompt: string) {
  if (!openai) {
    throw new Error('OpenAI API Key is missing. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Premium model for complex architectural reasoning
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // Force the model to output a JSON object for programmatic parsing
      response_format: { type: 'json_object' },
      temperature: 0.1, // High determinism for schema generation
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response.');
    }

    return JSON.parse(content);
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to communicate with OpenAI.';
    throw new Error(message, { cause: error });
  }
}
