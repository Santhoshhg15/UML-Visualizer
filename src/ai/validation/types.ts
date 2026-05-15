/**
 * validation/types.ts
 * ──────────────────────────────────────────────────
 * Type definitions for the UML validation system.
 *
 * These types are UI-agnostic — they describe validation
 * outcomes, not how they are rendered. The TextToUMLPanel
 * maps these into visual error messages.
 */

/**
 * Severity levels for validation issues.
 *
 *   error   → blocks diagram generation (broken edges, missing nodes)
 *   warning → diagram generates but may be semantically questionable
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Categorized error types for programmatic handling.
 *
 * Each type maps to a specific semantic violation that
 * the validator detects independently of the parser.
 */
export type ValidationErrorType =
  | 'UNKNOWN_PARENT'
  | 'UNKNOWN_INTERFACE'
  | 'DUPLICATE_CLASS'
  | 'SELF_INHERITANCE'
  | 'SELF_IMPLEMENTATION'
  | 'CIRCULAR_INHERITANCE';

/**
 * A single validation issue detected in the schema.
 */
export interface ValidationError {
  /** Programmatic error category */
  type: ValidationErrorType;
  /** Severity: errors block generation, warnings do not */
  severity: ValidationSeverity;
  /** Human-readable description of the issue */
  message: string;
  /** The class/interface name related to this error, if applicable */
  subject?: string;
}

/**
 * The output of a validation pass over a UMLDiagramSchema.
 */
export interface ValidationResult {
  /** true if no errors (warnings are allowed) */
  valid: boolean;
  /** All detected issues, ordered by severity (errors first) */
  errors: ValidationError[];
}
