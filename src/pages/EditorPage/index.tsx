/**
 * EditorPage/index.tsx
 * ──────────────────────────────────────────────────
 * The full-screen UML canvas editor page.
 * Wraps the existing MainLayout + DiagramCanvas.
 */

import { ReactFlowProvider } from '@xyflow/react';
import { MainLayout } from '@/layouts';
import { DiagramCanvas, Logo } from '@/components';
import { TextToUMLPanel } from '@/features/text-to-uml';
import { useEffect } from 'react';
import { useDiagramStore } from '@/store';

export function EditorPage() {
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <MainLayout>
      <div className="relative flex flex-1 flex-col h-full w-full overflow-hidden">
        {/* Floating Logo Badge */}
        <div className="absolute top-6 left-6 z-[50]">
          <Logo />
        </div>
        
        <ReactFlowProvider>
          <TextToUMLPanel />
          <DiagramCanvas />
        </ReactFlowProvider>
      </div>
    </MainLayout>
  );
}
