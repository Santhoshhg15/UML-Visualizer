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

export function EditorPage() {
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
