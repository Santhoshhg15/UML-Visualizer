import type { UMLDiagramSchema } from '../schema';
import { UML_INTERPRETER_SYSTEM_PROMPT } from './prompts';
import { callGemini, genAI } from './gemini';

/**
 * ── AI UML INTERPRETER ────────────────────────────────────
 *
 * This layer transforms Natural Language descriptions into a 
 * valid UMLDiagramSchema using Google Gemini.
 */
export async function interpretNaturalLanguage(text: string): Promise<UMLDiagramSchema> {
  // Use Gemini interpretation if configured
  if (genAI) {
    try {
      console.log('AI Interpretation Layer: Requesting Gemini interpretation...');
      const schema = await callGemini(text, UML_INTERPRETER_SYSTEM_PROMPT);
      return schema as UMLDiagramSchema;
    } catch (error) {
      console.error('Gemini interpretation failed, falling back to mock...', error);
    }
  }

  /**
   * ── ARCHITECTURAL DEMO MOCK (FALLBACK) ─────────────────
   */
  console.log('AI Interpretation Layer: Using Mock Fallback...');
  await new Promise(resolve => setTimeout(resolve, 800));

  const schema: UMLDiagramSchema = {
    classes: [],
    relationships: [],
  };

  const tokens = text.split(/[.!?\n,;]/).map(t => t.trim()).filter(Boolean);

  for (const token of tokens) {
    const classMatch = token.match(/(?:create|add|define)\s+(?:a\s+)?class\s+([a-zA-Z0-9_]+)/i);
    if (classMatch) {
      const name = classMatch[1];
      if (!schema.classes.find(c => c.id === name)) {
        schema.classes.push({ id: name, name, type: 'class', attributes: [], methods: [] });
      }
    }

    const interfaceMatch = token.match(/(?:create|add|define)\s+(?:an\s+)?interface\s+([a-zA-Z0-9_]+)/i);
    if (interfaceMatch) {
      const name = interfaceMatch[1];
      if (!schema.classes.find(c => c.id === name)) {
        schema.classes.push({ id: name, name, type: 'interface', attributes: [], methods: [] });
      }
    }

    const extendsMatch = token.match(/([a-zA-Z0-9_]+)\s+(?:extends|inherits from|is an?|is a type of)\s+([a-zA-Z0-9_]+)/i);
    if (extendsMatch) {
      const source = extendsMatch[1];
      const target = extendsMatch[2];
      schema.relationships.push({ type: 'extends', source, target });
      if (!schema.classes.find(c => c.id === source)) schema.classes.push({ id: source, name: source, type: 'class', attributes: [], methods: [] });
      if (!schema.classes.find(c => c.id === target)) schema.classes.push({ id: target, name: target, type: 'class', attributes: [], methods: [] });
    }

    const implementsMatch = token.match(/([a-zA-Z0-9_]+)\s+(?:implements|realizes)\s+([a-zA-Z0-9_]+)/i);
    if (implementsMatch) {
      const source = implementsMatch[1];
      const target = implementsMatch[2];
      schema.relationships.push({ type: 'implements', source, target });
      if (!schema.classes.find(c => c.id === source)) schema.classes.push({ id: source, name: source, type: 'class', attributes: [], methods: [] });
      if (!schema.classes.find(c => c.id === target)) schema.classes.push({ id: target, name: target, type: 'interface', attributes: [], methods: [] });
    }
  }

  return schema;
}
