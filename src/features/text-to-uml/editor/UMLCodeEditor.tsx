import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { linter } from '@codemirror/lint';
import type { Diagnostic } from '@codemirror/lint';
import type { ValidationError } from '@/ai/validation';
import { umlLanguage, umlEditorTheme, umlSyntaxHighlighting } from './syntax';

interface UMLCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors: ValidationError[];
}

export function UMLCodeEditor({ value, onChange, errors }: UMLCodeEditorProps) {
  // Map our semantic validation errors to CodeMirror lint diagnostics
  const umlLinter = useMemo(() => {
    return linter((view) => {
      const diagnostics: Diagnostic[] = [];
      const doc = view.state.doc;

      for (const err of errors) {
        let from = 0;
        let to = 0;

        // Try to find the specific word causing the error to highlight it
        if (err.subject) {
          for (let i = 1; i <= doc.lines; i++) {
            const line = doc.line(i);
            const index = line.text.indexOf(err.subject);
            if (index !== -1) {
              from = line.from + index;
              to = from + err.subject.length;
              break;
            }
          }
        }

        // Fallback if subject not found (or no subject)
        if (to === 0) {
          // Find the first non-empty line
          for (let i = 1; i <= doc.lines; i++) {
            const line = doc.line(i);
            if (line.text.trim()) {
              from = line.from;
              to = line.to;
              break;
            }
          }
        }

        diagnostics.push({
          from,
          to: to || from + 1,
          severity: err.severity, // 'error' | 'warning' matches CM severity
          message: err.message,
        });
      }

      return diagnostics;
    });
  }, [errors]);

  const extensions = useMemo(
    () => [
      umlLanguage,
      umlEditorTheme,
      umlSyntaxHighlighting,
      umlLinter,
    ],
    [umlLinter]
  );

  return (
    <div className="uml-editor-wrapper">
      <CodeMirror
        value={value}
        height="100%"
        extensions={extensions}
        onChange={(val) => onChange(val)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: false,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false, // Disabled for now, as requested
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: false,
          completionKeymap: false,
          lintKeymap: true,
        }}
        theme="dark" // Fallback dark mode basics
        style={{
          width: '100%',
          minHeight: '300px',
        }}
      />
    </div>
  );
}
