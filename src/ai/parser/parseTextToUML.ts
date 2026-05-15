import type { UMLDiagramSchema, UMLClass, UMLRelationship } from '../schema';

type ParseSection = 'none' | 'attributes' | 'methods';

/**
 * Parses structured text into a UMLDiagramSchema.
 * This is a deterministic, rule-based parser.
 * It is fault-tolerant and ignores malformed lines.
 */
export function parseTextToUML(text: string): UMLDiagramSchema {
  const schema: UMLDiagramSchema = {
    classes: [],
    relationships: [],
  };

  const lines = text.split('\n');
  let currentClass: UMLClass | null = null;
  let currentSection: ParseSection = 'none';

  // Helper to find an existing class/interface or create a new one.
  // We merge explicit declarations so that users can define multiple
  // relationships on separate lines (e.g. Class A extends B \n Class A implements C).
  const getOrCreateNode = (name: string, type: 'class' | 'interface'): UMLClass => {
    let node = schema.classes.find((c) => c.name === name);
    if (!node) {
      node = {
        id: name,
        name,
        type,
        attributes: [],
        methods: [],
      };
      schema.classes.push(node);
    } else {
      // Allow re-declaration to update type if it was implied earlier
      if (node.type !== type && type === 'interface') {
         node.type = 'interface';
      }
    }
    return node;
  };

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // 1. Detect Classes
    const classMatch = line.match(/^Class\s+([a-zA-Z0-9_]+)/i);
    if (classMatch) {
      const className = classMatch[1];
      currentClass = getOrCreateNode(className, 'class');
      currentSection = 'none';

      const extendsMatch = line.match(/\bextends\s+([a-zA-Z0-9_]+)/i);
      if (extendsMatch) {
        schema.relationships.push({
          type: 'extends',
          source: className,
          target: extendsMatch[1],
        });
      }

      const implementsMatch = line.match(/\bimplements\s+([a-zA-Z0-9_]+)/i);
      if (implementsMatch) {
        schema.relationships.push({
          type: 'implements',
          source: className,
          target: implementsMatch[1],
        });
      }
      
      continue;
    }

    // 2. Detect Interfaces
    const interfaceMatch = line.match(/^Interface\s+([a-zA-Z0-9_]+)/i);
    if (interfaceMatch) {
      const interfaceName = interfaceMatch[1];
      currentClass = getOrCreateNode(interfaceName, 'interface');
      currentSection = 'none';

      const extendsMatch = line.match(/\bextends\s+([a-zA-Z0-9_]+)/i);
      if (extendsMatch) {
        schema.relationships.push({
          type: 'extends',
          source: interfaceName,
          target: extendsMatch[1],
        });
      }
      
      continue;
    }

    // 3. Detect Sections
    if (line.match(/^Attributes:/i)) {
      currentSection = 'attributes';
      continue;
    }
    if (line.match(/^Methods:/i)) {
      currentSection = 'methods';
      continue;
    }

    // 4. Parse Attributes & Methods based on current context
    if (currentClass) {
      if (currentSection === 'attributes') {
        // Matches "- name : String" or "bodyWeight: int"
        const attrMatch = line.match(/^-?\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>\[\]]+)/);
        if (attrMatch) {
          currentClass.attributes.push({
            name: attrMatch[1],
            type: attrMatch[2],
          });
        }
      } else if (currentSection === 'methods') {
        // Matches "- eat() : void" or "sleep()"
        const methodMatch = line.match(/^-?\s*([a-zA-Z0-9_]+)\s*\([^)]*\)(?:\s*:\s*([a-zA-Z0-9_<>\[\]]+))?/);
        if (methodMatch) {
          currentClass.methods.push({
            name: methodMatch[1],
            returnType: methodMatch[2], // Can be undefined if no return type is provided
          });
        }
      }
    }
  }

  // Optional Cleanup: remove duplicate relationships if any were declared multiple times
  const uniqueRels = new Map<string, UMLRelationship>();
  for (const rel of schema.relationships) {
    uniqueRels.set(`${rel.source}-${rel.type}-${rel.target}`, rel);
  }
  schema.relationships = Array.from(uniqueRels.values());

  return schema;
}
