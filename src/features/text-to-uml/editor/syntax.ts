import { StreamLanguage } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * ── UML STREAM PARSER ─────────────────────────────────────
 * A lightweight, regex-based token stream parser for our UML DSL.
 * It assigns standard CM tokens which map to Lezer tags.
 */
export const umlLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;

    // Keywords
    if (stream.match(/^(Class|Interface|extends|implements)\b/i)) return 'keyword';
    
    // Section Headers
    if (stream.match(/^(Attributes|Methods):/i)) return 'meta';

    // Operators
    if (stream.match(/^[+\-:]/)) return 'operator';

    // Method calls
    if (stream.match(/^[a-zA-Z0-9_]+(?=\s*\()/)) return 'function';

    // Capitalized words (usually Classes/Types)
    if (stream.match(/^[A-Z][a-zA-Z0-9_]*/)) return 'typeName';

    // Lowercase words (usually attributes)
    if (stream.match(/^[a-z][a-zA-Z0-9_]*/)) return 'variable';

    // Catch-all
    stream.next();
    return null;
  }
});

/**
 * ── EDITOR THEME ──────────────────────────────────────────
 * Premium engineering workspace aesthetic.
 * Transparent background (relies on container), clean gutters,
 * custom selection and caret colors.
 */
export const umlEditorTheme = EditorView.theme({
  "&": {
    color: "#e2e8f0", // surface-200
    backgroundColor: "transparent",
    fontSize: "13px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  ".cm-content": {
    caretColor: "#38bdf8", // brand-400
  },
  "&.cm-focused": {
    outline: "none",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#38bdf8",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "#475569", // surface-600
    border: "none",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "#94a3b8", // surface-400
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: "4px",
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(56, 189, 248, 0.2) !important",
  },
  ".cm-lintRange": {
    backgroundImage: "none",
    borderBottom: "1.5px dashed #ef4444",
  },
  ".cm-lintRange-warning": {
    backgroundImage: "none",
    borderBottom: "1.5px dashed #f59e0b",
  }
}, { dark: true });

/**
 * ── SYNTAX HIGHLIGHTING ───────────────────────────────────
 * Maps the tags returned by the StreamParser to specific colors.
 */
const umlHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#38bdf8", fontWeight: "600" }, // brand-400
  { tag: t.meta, color: "#94a3b8", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }, // section headers
  { tag: t.typeName, color: "#f8fafc", fontWeight: "500" }, // Class names
  { tag: t.variableName, color: "#cbd5e1" }, // attribute names
  { tag: t.function(t.variableName), color: "#818cf8" }, // method names
  { tag: t.operator, color: "#64748b" },
  { tag: t.punctuation, color: "#64748b" },
]);

export const umlSyntaxHighlighting = syntaxHighlighting(umlHighlightStyle);
