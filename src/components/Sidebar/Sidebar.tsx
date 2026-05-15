/**
 * Sidebar.tsx — Compact Engineering Rail
 * ──────────────────────────────────────────────────
 * High-precision vertical navigation rail. 
 * Replaces the heavy side panel with a slim, icon-driven sidebar.
 */

import { Menu, Layers, CodeXml, FileText, GitBranch, Download, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col items-center py-6 border-r shrink-0"
      style={{
        width:       'var(--sidebar-width)',
        background:  'var(--bg-primary)',
        borderColor: 'var(--subtle-border)',
        zIndex:      'var(--z-panel)',
      }}
    >
      {/* ── Menu / Toggle ── */}
      <button className="flex h-10 w-10 items-center justify-center rounded-xl text-surface-500 hover:text-surface-100 hover:bg-surface-800 transition-all mb-8">
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* ── Main Navigation ── */}
      <nav className="flex flex-col gap-4 flex-1">
        <RailIcon icon={<Layers size={20} />} active title="Diagram Canvas" />
        <RailIcon icon={<CodeXml size={20} />} title="Source Code" />
        <RailIcon icon={<FileText size={20} />} title="Documentation" />
        <RailIcon icon={<GitBranch size={20} />} title="Version Control" />
        <RailIcon icon={<Download size={20} />} title="Exports" />
      </nav>

      {/* ── Bottom Actions ── */}
      <div className="mt-auto">
        <RailIcon icon={<Settings size={20} />} title="Settings" />
      </div>
    </aside>
  );
}

function RailIcon({ icon, active, title }: { icon: React.ReactNode, active?: boolean, title?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      title={title}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all group",
        active 
          ? "bg-brand-500/10 text-brand-400" 
          : "text-surface-500 hover:text-surface-200 hover:bg-surface-900/50"
      )}
    >
      {active && (
        <motion.div 
          layoutId="activeRail"
          className="absolute left-0 w-1 h-5 bg-brand-500 rounded-r-full"
        />
      )}
      <div className="relative z-10">
        {icon}
      </div>
      
      {/* Tooltip hint on hover (Linear style) */}
      <span className="absolute left-full ml-4 px-2 py-1 bg-surface-900 text-[10px] font-bold text-surface-200 rounded border border-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {title}
      </span>
    </motion.button>
  );
}
