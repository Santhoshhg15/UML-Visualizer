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

    // Relationships (Arrows)
    if (stream.match(/^(->|--|>|extends|implements)/i)) return 'atom';
    
    // Keywords
    if (stream.match(/^(Class|Interface)\b/i)) return 'keyword';
    
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
    color: "#f8fafc",
    backgroundColor: "transparent",
    fontSize: "13px",
    fontFamily: "var(--font-mono)",
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
  { tag: t.keyword, color: "#38bdf8", fontWeight: "700" }, // brand-400 (Cyan)
  { tag: t.atom, color: "#fb7185", fontWeight: "600" }, // Relationships (Rose)
  { tag: t.meta, color: "#94a3b8", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }, // section headers
  { tag: t.typeName, color: "#ffffff", fontWeight: "600" }, // Class names (Pure White)
  { tag: t.variableName, color: "#94a3b8" }, // attribute names (Muted Gray)
  { tag: t.function(t.variableName), color: "#818cf8", fontWeight: "500" }, // method names (Indigo)
  { tag: t.operator, color: "#475569" },
  { tag: t.punctuation, color: "#475569" },
]);

export const umlSyntaxHighlighting = syntaxHighlighting(umlHighlightStyle);
