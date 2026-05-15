/**
 * exportDiagram.ts
 * ══════════════════════════════════════════════════════════════
 * Utilities for exporting the React Flow diagram to images.
 *
 * ── WHY USE HTML-TO-IMAGE? ────────────────────────────────────
 * React Flow renders a complex mix of DOM nodes (HTML) and
 * SVG edges. Standard `<canvas>` capture fails to correctly
 * snapshot foreignObjects and nested SVGs. `html-to-image`
 * correctly processes this hybrid DOM structure.
 * ══════════════════════════════════════════════════════════════
 */

import { toPng, toSvg } from 'html-to-image';

/**
 * Filter function to explicitly exclude UI elements from the export.
 * We want to capture ONLY the nodes and edges, not the toolbars
 * or mini-maps.
 */
function filterUIElements(node: HTMLElement): boolean {
  // Exclude elements with specific classes
  const exclusionClasses = [
    'react-flow__minimap',
    'react-flow__controls',
    'react-flow__panel', // Excludes any floating UI panels
    // Exclude custom elements that shouldn't be in the export (like delete buttons)
    // Even if opacity is 0, we filter them completely to be safe.
    'opacity-0',
  ];

  if (node.classList) {
    for (const className of exclusionClasses) {
      if (node.classList.contains(className)) return false;
    }
  }

  // Also specifically exclude our custom EdgeLabelRenderer delete buttons
  // They are wrapped in a div with "nopan nodrag group"
  if (node.classList && node.classList.contains('group') && node.classList.contains('nopan')) {
    return false;
  }

  return true;
}

/**
 * Retrieves the core React Flow viewport element.
 * We capture the `.react-flow__viewport` instead of the root
 * to ensure we get the pure diagram without the surrounding layout.
 */
function getViewportElement(): HTMLElement | null {
  return document.querySelector('.react-flow__viewport') as HTMLElement | null;
}

/**
 * Triggers a browser download of a generated file.
 */
function downloadFile(dataUrl: string, extension: string) {
  const a = document.createElement('a');
  a.setAttribute('download', `uml-diagram-${new Date().toISOString().slice(0, 10)}.${extension}`);
  a.setAttribute('href', dataUrl);
  a.click();
}

/**
 * Exports the diagram as a high-quality PNG.
 */
export async function exportToPNG() {
  const element = getViewportElement();
  if (!element) throw new Error('Could not find React Flow viewport');

  // pixelRatio: 2 ensures high-DPI scaling so the image doesn't look blurry
  const dataUrl = await toPng(element, {
    filter: filterUIElements,
    pixelRatio: 2,
    backgroundColor: '#0a0a0a', // Use the dark surface-950 color
  });
  
  downloadFile(dataUrl, 'png');
}

/**
 * Exports the diagram as an infinitely scalable SVG.
 */
export async function exportToSVG() {
  const element = getViewportElement();
  if (!element) throw new Error('Could not find React Flow viewport');

  const dataUrl = await toSvg(element, {
    filter: filterUIElements,
    backgroundColor: '#0a0a0a',
  });
  
  downloadFile(dataUrl, 'svg');
}
