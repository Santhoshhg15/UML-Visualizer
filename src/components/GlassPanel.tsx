/**
 * GlassPanel.tsx
 * ──────────────────────────────────────────────────
 * A reusable glassmorphism container component.
 */

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export default function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10 bg-surface-900/80 p-6 shadow-panel backdrop-blur-xl',
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
