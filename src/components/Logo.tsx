/**
 * Logo.tsx
 * ──────────────────────────────────────────────────
 * Refined brand logo for the UML Diagram Visualizer.
 */

import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      className="flex items-center gap-3 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="14"
          height="14"
          rx="4"
          style={{ fill: 'var(--brand-primary)' }}
        />
        <rect
          x="20"
          y="2"
          width="14"
          height="14"
          rx="4"
          style={{ fill: 'var(--brand-primary)', opacity: 0.4 }}
        />
        <rect
          x="11"
          y="20"
          width="14"
          height="14"
          rx="4"
          style={{ fill: 'var(--brand-primary)', opacity: 0.2 }}
        />
        {/* Connector lines */}
        <line x1="16" y1="9" x2="20" y2="9" className="stroke-white/20" strokeWidth="2" />
        <line x1="9" y1="16" x2="18" y2="20" className="stroke-white/20" strokeWidth="2" />
      </svg>

      <div className="flex flex-col -gap-1">
        <span className="text-[15px] font-black tracking-tight text-surface-50 leading-none">
          UML CANVAS
        </span>
        <span className="text-[9px] font-bold tracking-[0.2em] text-brand-400 uppercase leading-none opacity-80">
          Visual Engine
        </span>
      </div>
    </motion.div>
  );
}
