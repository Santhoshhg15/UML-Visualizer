import type { UMLDiagramSchema, UMLClass } from '../schema';
import { UML_INTERPRETER_SYSTEM_PROMPT } from './prompts';
import { callGemini, genAI } from './gemini';

/**
 * ── AI UML INTERPRETER ────────────────────────────────────
 *
 * This layer transforms Natural Language descriptions into a 
 * valid UMLDiagramSchema. It uses Google Gemini if configured,
 * otherwise falls back to a robust heuristic NLP engine.
 */
export async function interpretNaturalLanguage(text: string): Promise<UMLDiagramSchema> {
  // Use Gemini interpretation if configured
  if (genAI) {
    try {
      console.log('AI Interpretation Layer: Requesting Gemini interpretation...');
      const schema = await callGemini(text, UML_INTERPRETER_SYSTEM_PROMPT);
      return schema as UMLDiagramSchema;
    } catch (error) {
      console.error('Gemini interpretation failed, falling back to heuristic engine...', error);
    }
  }

  /**
   * ── HEURISTIC NLP ENGINE (FALLBACK) ─────────────────
   */
  console.log('AI Interpretation Layer: Using Heuristic NLP Engine...');
  await new Promise(resolve => setTimeout(resolve, 800));

  const schema: UMLDiagramSchema = {
    classes: [],
    relationships: [],
  };

  const getClass = (name: string, defaultType: 'class' | 'interface' = 'class'): UMLClass => {
    let c = schema.classes.find((c) => c.id === name);
    if (!c) {
      c = { id: name, name, type: defaultType, attributes: [], methods: [] };
      schema.classes.push(c);
    }
    // Upgrade type if previously assumed class but now declared interface
    if (defaultType === 'interface' && c.type === 'class') {
      c.type = 'interface';
    }
    return c;
  };

  // Pre-process to normalize some phrasing
  const normalized = text
    .replace(/should depend on/gi, 'depends on')
    .replace(/returning/gi, 'returns');

  // Split into manageable clauses
  const tokens = normalized.split(/(?:\.|!|\?|\n|;|,| and )/).map(t => t.trim()).filter(Boolean);

  let currentContextNode: string | null = null;

  for (const token of tokens) {
    // 1. Extract explicitly declared nodes
    const nodeMatch = token.match(/(?:create|define|make|add|a|an)?\s*([A-Z][a-zA-Z0-9_]*)\s+(class|interface)/i) ||
                      token.match(/(?:create|define|make|add)\s+(?:a\s+|an\s+)?(?:class|interface)\s+([A-Z][a-zA-Z0-9_]*)/i);
    
    if (nodeMatch) {
      let name = nodeMatch[1];
      let typeStr = nodeMatch[2];
      
      // Handle the inverted match group from the second regex
      if (!typeStr) {
        const fullMatch = nodeMatch[0].toLowerCase();
        typeStr = fullMatch.includes('interface') ? 'interface' : 'class';
        name = nodeMatch[1]; // Wait, in the 2nd regex, group 1 is missing, it's group 3
        if (!name) name = token.match(/(?:class|interface)\s+([A-Z][a-zA-Z0-9_]*)/i)?.[1] || '';
      }

      if (name) {
        getClass(name, typeStr.toLowerCase() === 'interface' ? 'interface' : 'class');
        currentContextNode = name;
      }
    }

    // 2. Extract relationships
    const extendsMatch = token.match(/([A-Z][a-zA-Z0-9_]*)\s+(?:extends|inherits from|is an?|is a type of)\s+([A-Z][a-zA-Z0-9_]*)/i);
    if (extendsMatch) {
      const source = extendsMatch[1];
      const target = extendsMatch[2];
      schema.relationships.push({ type: 'extends', source, target });
      getClass(source); getClass(target);
      currentContextNode = source;
    }

    const implementsMatch = token.match(/([A-Z][a-zA-Z0-9_]*)\s+(?:implements|realizes|behaves like)\s+([A-Z][a-zA-Z0-9_]*)/i);
    if (implementsMatch) {
      const source = implementsMatch[1];
      const target = implementsMatch[2];
      schema.relationships.push({ type: 'implements', source, target });
      getClass(source); getClass(target, 'interface');
      currentContextNode = source;
    }

    const dependsMatch = token.match(/([A-Z][a-zA-Z0-9_]*)\s+(?:depends on|uses|requires)\s+([A-Z][a-zA-Z0-9_]*)/i);
    if (dependsMatch) {
      const source = dependsMatch[1];
      const target = dependsMatch[2];
      schema.relationships.push({ type: 'dependency', source, target });
      getClass(source); getClass(target);
      currentContextNode = source;
    }

    // 3. Extract Attributes
    // E.g., "OrderService has an amount number attribute" or "with name string attribute"
    const attrMatch = token.match(/(?:with|has|contains)(?:\s+(?:a|an))?\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s+attribute/i) || 
                      token.match(/(?:with|has|contains)(?:\s+(?:a|an))?\s+attribute\s+([a-zA-Z0-9_]+)\s+(?:of type\s+)?([a-zA-Z0-9_]+)/i);
    if (attrMatch) {
      const name = attrMatch[1];
      const type = attrMatch[2];
      
      // Determine which class this belongs to. Look for a class name in the token, or use context.
      const subjectMatch = token.match(/^([A-Z][a-zA-Z0-9_]*)\s+(?:has|contains)/i);
      const targetNode = subjectMatch ? subjectMatch[1] : currentContextNode;

      if (targetNode) {
        const c = getClass(targetNode);
        c.attributes.push({ name, type });
      }
    }

    // 4. Extract Methods
    // E.g., "with a process method returning boolean" or "has calculate method"
    const methodMatch = token.match(/(?:with|has|contains)(?:\s+(?:a|an))?\s+([a-zA-Z0-9_]+)\s+method(?:\s+returns?\s+([a-zA-Z0-9_]+))?/i);
    if (methodMatch) {
      const name = methodMatch[1];
      const returnType = methodMatch[2] || 'void';

      const subjectMatch = token.match(/^([A-Z][a-zA-Z0-9_]*)\s+(?:has|contains)/i);
      const targetNode = subjectMatch ? subjectMatch[1] : currentContextNode;

      if (targetNode) {
        const c = getClass(targetNode);
        c.methods.push({ name, returnType });
      }
    }
  }

  return schema;
}
