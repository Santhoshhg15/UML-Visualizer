/**
 * HomePage.tsx
 * ──────────────────────────────────────────────────
 * Main page of the UML Diagram Visualizer.
 *
 * Renders the DiagramCanvas as a fullscreen responsive
 * canvas.  Uses `flex-1` + `flex flex-col` to propagate
 * the height chain from MainLayout down to React Flow.
 */

import { DiagramCanvas } from '@/components';
import { ReactFlowProvider } from '@xyflow/react';

export default function HomePage() {
  return (
    /*
     * React Flow REQUIRES its parent container to have
     * explicit dimensions.  This div participates in
     * MainLayout's flex column:
     *  • `flex-1`    → takes all remaining vertical space
     *  • `flex`      → becomes a flex container itself
     *  • `flex-col`  → children stack vertically
     *  • `min-h-0`   → allows flex children to shrink below
     *                   their content size (critical for
     *                   nested flex + overflow scenarios)
     */
    <div className="flex flex-1 flex-col min-h-0 w-full">
      <ReactFlowProvider>
        <DiagramCanvas />
      </ReactFlowProvider>
    </div>
  );
}
