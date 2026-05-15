/**
 * MainLayout.tsx
 * ──────────────────────────────────────────────────
 * Root layout — header bar + sidebar + canvas.
 *
 * TOKEN COMPLIANCE:
 * • Header height: var(--header-height) = 52px
 * • Header padding: var(--space-4)
 * • Canvas is primary — header/sidebar are secondary surfaces
 */

import type { ReactNode } from 'react';
import { Logo } from '@/components';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', width: '100%', background: 'var(--color-surface-950)' }}
    >
      {/* Top Bar removed in Rail layout — Logo moved to Sidebar */}

      {/* ── Body: Canvas ── */}
      <div className="flex flex-1 overflow-hidden">
        <main
          className="relative flex flex-col flex-1 overflow-hidden"
          style={{ background: 'var(--bg-primary)', zIndex: 'var(--z-canvas)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
