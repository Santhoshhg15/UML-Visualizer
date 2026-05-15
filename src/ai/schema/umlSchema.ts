/**
 * umlSchema.ts
 * ──────────────────────────────────────────────────
 * Centralized abstract UML schema.
 * This is the single source of truth for the platform's UML representation.
 * All input systems (Text, Voice, AI, Code) compile INTO this schema.
 * All output systems (React Flow, Export, Code Gen) compile FROM this schema.
 * 
 * IMPORTANT: 
 * This schema is UI-agnostic and React Flow-agnostic.
 * It uses semantic IDs and names for relationships.
 */

export interface UMLAttribute {
  name: string;
  type: string;
  // Future extensions:
  // visibility?: 'public' | 'private' | 'protected';
  // isStatic?: boolean;
}

export interface UMLMethod {
  name: string;
  returnType?: string;
  // Future extensions:
  // visibility?: 'public' | 'private' | 'protected';
  // parameters?: { name: string; type: string }[];
  // isStatic?: boolean;
}

export interface UMLClass {
  id: string; // Semantic ID, e.g., the class name or a hash, NOT a React Flow node ID
  name: string;
  type: 'class' | 'interface';
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  // Future extensions:
  // annotations?: string[];
  // generics?: string[];
  // namespace?: string;
}

export interface UMLRelationship {
  type: 'extends' | 'implements'; // Future extensions: 'composition' | 'aggregation' | 'dependency'
  source: string; // Semantic ID of the source class/interface
  target: string; // Semantic ID of the target class/interface
}

export interface UMLDiagramSchema {
  classes: UMLClass[];
  relationships: UMLRelationship[];
  // Future extensions:
  // packages?: UMLPackage[];
}
