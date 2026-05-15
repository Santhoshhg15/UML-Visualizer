/**
 * cn.ts
 * ──────────────────────────────────────────────────
 * Tiny class‑name merge utility.
 *
 * Filters falsy values so you can conditionally
 * apply Tailwind classes:
 *
 *   cn('px-4', isActive && 'bg-brand-500', className)
 */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
