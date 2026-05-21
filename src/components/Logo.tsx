/**
 * Logo.tsx
 * ──────────────────────────────────────────────────
 * Refined brand logo for ArchSpace.
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
      <img src="/logo.png" alt="ArchSpace Logo" className="h-64 shrink-0" style={{ objectFit: 'contain', margin: '-64px', transform: 'translate(24px, -16px) scale(1.4)' }} />
    </motion.div>
  );
}
