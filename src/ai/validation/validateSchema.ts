/**
 * validateSchema.ts
 * ──────────────────────────────────────────────────
 * Semantic validator for UMLDiagramSchema.
 *
 * ── ARCHITECTURE BOUNDARY ─────────────────────────
 *
 * This module sits BETWEEN the parser and the generator:
 *
 *   Text → Parser → Schema → ★ Validator ★ → Generator → Diagram
 *
 * ── WHY VALIDATION IS SEPARATE FROM THE PARSER ────
 *
 * The parser's job is SYNTAX: extracting structure from text.
 * It doesn't know (and shouldn't know) whether the extracted
 * structure is semantically valid. For example:
 *
 *   "Class Tiger extends Animal"
 *
 * The parser correctly extracts { source: Tiger, target: Animal,
 * type: extends }. It has no way to know whether "Animal" was
 * ever declared — that's a cross-reference check that requires
 * the complete schema, not just the current line.
 *
 * Keeping these concerns separate means:
 *   • The parser can be reused for syntax highlighting, autocomplete
 *   • The validator can validate schemas from ANY source (AI, code, API)
 *   • Each module has a single responsibility and testable contract
 *
 * ── WHY VALIDATION IS CRITICAL BEFORE AI FEATURES ─
 *
 * When an LLM generates a UMLDiagramSchema, it may hallucinate
 * class names, create circular inheritance, or reference
 * non-existent interfaces. Without validation, these errors
 * would silently produce broken diagrams with dangling edges
 * and missing nodes — destroying user trust.
 *
 * Validation ensures that NO schema (human or AI) reaches the
 * generator unless it is semantically sound.
 *
 * ── HOW VALIDATION PROTECTS REACT FLOW ────────────
 *
 * React Flow crashes or renders incorrectly when:
 *   • An edge references a non-existent node ID
 *   • Duplicate node IDs exist in the nodes array
 *   • Circular dependencies cause infinite layout loops
 *
 * The validator catches all of these at the schema level,
 * before any React Flow objects are created.
 *
 * ── WHY PROFESSIONAL TOOLING REQUIRES THIS ────────
 *
 * StarUML, Visual Paradigm, and Enterprise Architect all
 * validate models before rendering. A tool that silently
 * renders broken UML loses engineering trust immediately.
 * Validation is what separates a toy from a tool.
 */

import type { UMLDiagramSchema } from '@/ai/schema';
import type { ValidationResult, ValidationError } from './types';

/**
 * Validates a UMLDiagramSchema for semantic correctness.
 *
 * @param schema — The parsed UML schema to validate.
 * @returns A ValidationResult with `valid` flag and error list.
 *
 * @example
 * ```ts
 * const schema = parseTextToUML(input);
 * const result = validateSchema(schema);
 * if (result.valid) {
 *   const diagram = generateReactFlowDiagram(schema);
 * } else {
 *   showErrors(result.errors);
 * }
 * ```
 */
export function validateSchema(schema: UMLDiagramSchema): ValidationResult {
  const errors: ValidationError[] = [];

  // Build lookup sets for fast cross-referencing
  const classIds = new Set<string>();
  const classTypes = new Map<string, 'class' | 'interface'>();

  // ── 1. Detect duplicate class/interface declarations ──────
  for (const cls of schema.classes) {
    if (classIds.has(cls.id)) {
      const label = cls.type === 'interface' ? 'interface' : 'class';
      errors.push({
        type: 'DUPLICATE_CLASS',
        severity: 'error',
        message: `Duplicate ${label} detected: ${cls.name}`,
        subject: cls.name,
      });
    } else {
      classIds.add(cls.id);
      classTypes.set(cls.id, cls.type);
    }
  }

  // ── 2. Validate relationships ─────────────────────────────
  for (const rel of schema.relationships) {
    // 2a. Self-inheritance: Class extends itself
    if (rel.type === 'extends' && rel.source === rel.target) {
      errors.push({
        type: 'SELF_INHERITANCE',
        severity: 'error',
        message: `Class cannot inherit from itself: ${rel.source}`,
        subject: rel.source,
      });
      continue;
    }

    // 2b. Self-implementation: Class implements itself
    if (rel.type === 'implements' && rel.source === rel.target) {
      errors.push({
        type: 'SELF_IMPLEMENTATION',
        severity: 'error',
        message: `Class cannot implement itself: ${rel.source}`,
        subject: rel.source,
      });
      continue;
    }

    // 2c. Unknown parent class (extends a class that doesn't exist)
    if (rel.type === 'extends' && !classIds.has(rel.target)) {
      errors.push({
        type: 'UNKNOWN_PARENT',
        severity: 'warning',
        message: `Unknown parent class: ${rel.target}`,
        subject: rel.target,
      });
    }

    // 2d. Unknown interface (implements an interface that doesn't exist)
    if (rel.type === 'implements' && !classIds.has(rel.target)) {
      errors.push({
        type: 'UNKNOWN_INTERFACE',
        severity: 'warning',
        message: `Unknown interface: ${rel.target}`,
        subject: rel.target,
      });
    }
  }

  // ── 3. Detect circular inheritance ────────────────────────
  // Build parent graph: child → [parents]
  const parentGraph = new Map<string, string[]>();
  for (const rel of schema.relationships) {
    if (rel.type === 'extends' && rel.source !== rel.target) {
      const parents = parentGraph.get(rel.source) ?? [];
      parents.push(rel.target);
      parentGraph.set(rel.source, parents);
    }
  }

  // DFS cycle detection
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    inStack.add(nodeId);

    for (const parent of parentGraph.get(nodeId) ?? []) {
      if (hasCycle(parent)) return true;
    }

    inStack.delete(nodeId);
    return false;
  }

  for (const classId of parentGraph.keys()) {
    if (hasCycle(classId)) {
      errors.push({
        type: 'CIRCULAR_INHERITANCE',
        severity: 'error',
        message: `Circular inheritance detected involving: ${classId}`,
        subject: classId,
      });
      break; // One circular error is enough; don't spam
    }
  }

  // Sort: errors first, then warnings
  errors.sort((a, b) => {
    if (a.severity === 'error' && b.severity !== 'error') return -1;
    if (a.severity !== 'error' && b.severity === 'error') return 1;
    return 0;
  });

  // Valid = no errors (warnings are allowed)
  const hasErrors = errors.some((e) => e.severity === 'error');

  return {
    valid: !hasErrors,
    errors,
  };
}
