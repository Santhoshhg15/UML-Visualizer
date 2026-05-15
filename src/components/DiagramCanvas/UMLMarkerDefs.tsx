/**
 * UMLMarkerDefs.tsx
 * ══════════════════════════════════════════════════════════════
 * Renders shared SVG <defs> markers into the document body
 * via a React portal. This ensures the markers are accessible
 * from within the React Flow SVG scope via url(#marker-id).
 *
 * WHY PORTAL?
 * ───────────
 * SVG markers defined in a separate <svg> element are NOT
 * accessible cross-SVG via url(#id) references in all browsers.
 * React Flow renders edges inside its own internal <svg>.
 * By portaling a hidden <svg> with <defs> into <body>, the
 * marker IDs become globally resolvable across all SVG contexts
 * on the page, which is standards-compliant behavior.
 *
 * WHY NOT INSIDE <ReactFlow>?
 * ────────────────────────────
 * Children of <ReactFlow> render in the DOM overlay layer (HTML),
 * not inside the internal <svg> element where edges live.
 * Only EdgeLabelRenderer children render in SVG-adjacent context.
 */

import { createPortal } from 'react-dom';

/**
 * UMLMarkerDefs renders the shared SVG marker definitions used by
 * all UML relationship edge types (Inheritance and Implements).
 *
 * Place this component ONCE near the root of the editor view.
 */
export function UMLMarkerDefs() {
  return createPortal(
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        {/*
         * UML Hollow Triangle — Inheritance (Generalization)
         *
         * Standard UML open arrowhead for Generalization (extends)
         * and Realization (implements). The "hollow" effect is achieved
         * by filling the triangle with the canvas background color.
         *
         * Geometry:
         *   viewBox: 0 0 12 12
         *   Triangle: tip at (11,6), base left-edge at x=0
         *   refX=11 places the tip exactly at the edge endpoint
         *   refY=6  centers vertically on the path axis
         *
         * orient="auto" rotates the marker to match the path direction.
         */}
        <marker
          id="uml-open-triangle"
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 11 6 L 0 12 Z"
            fill="#090c14"
            stroke="#64748b"
            strokeWidth="1"
            strokeLinejoin="miter"
          />
        </marker>
      </defs>
    </svg>,
    document.body
  );
}
