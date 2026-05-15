/**
 * LandingPage/index.tsx
 * ─────────────────────────────────────────────────────────────
 * Redesigned per spec:
 *   • Minimal fixed navbar (logo + links + outlined button)
 *   • Full-viewport centered hero (badge → headline → sub → CTA → preview)
 *   • Features section — 3 clean rows, no cards, divider lines
 *   • Closing CTA — dark surface, centered
 *   • One-line footer
 *
 * Animations: Intersection Observer only — no new packages.
 *
 * Design tokens
 *   bg:        #0a0a0f
 *   surface:   #111118
 *   border:    #1e1e2e
 *   text:      #ffffff / #888899
 *   accent:    #3b82f6
 *   container: max-width 1200px, padding 0 48px
 * ─────────────────────────────────────────────────────────────
 */

import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Zap, GitBranch, Download, ArrowRight } from 'lucide-react';

/* ─── Tokens (inline for self-contained isolation) ───────────── */
const T = {
  bg:       '#0a0a0f',
  gradient: 'linear-gradient(135deg, #4E3C73 0%, #2B5876 100%)',
  surface:  'rgba(17, 17, 24, 0.4)',
  border:   'rgba(255, 255, 255, 0.08)',
  text:     '#ffffff',
  muted:    '#d1d1e0',
  accent:   '#60a5fa',
  glow:     'rgba(96,165,250,0.15)',
} as const;

/* ─── Container ──────────────────────────────────────────────── */
const container: React.CSSProperties = {
  maxWidth: 1200,
  margin:   '0 auto',
  padding:  '0 48px',
};
const containerSm: React.CSSProperties = { ...container, padding: '0 24px' };

/* ─── Scroll-animation hook ──────────────────────────────────── */
/**
 * Adds `.is-visible` to every element matching `selector` inside
 * `rootRef` when it crosses into the viewport.
 * Elements should start with opacity:0 via their className.
 */
function useReveal(rootRef: React.RefObject<HTMLElement | null>, selector = '[data-reveal]') {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, selector]);
}

/* ─── Global animation CSS (injected once) ───────────────────── */
function AnimationStyles() {
  return (
    <style>{`
      /*
       * ── Smooth scroll ────────────────────────────────────────
       * scroll-behavior: smooth  → all anchor (#) clicks glide
       * scroll-padding-top       → offsets the 64px fixed navbar
       *   so sections don't hide behind it on arrival
       */
      html {
        scroll-behavior: smooth;
        scroll-padding-top: 72px;
      }

      /* Reveal base — elements start hidden */
      [data-reveal] {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 600ms ease-out, transform 600ms ease-out;
      }
      [data-reveal="scale"] {
        transform: scale(0.97) translateY(12px);
        transition: opacity 500ms ease-out, transform 500ms ease-out;
      }
      [data-reveal].is-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      /* Stagger delays */
      [data-delay="1"] { transition-delay: 100ms; }
      [data-delay="2"] { transition-delay: 200ms; }
      [data-delay="3"] { transition-delay: 300ms; }
      [data-delay="4"] { transition-delay: 500ms; }
      [data-delay="5"] { transition-delay: 600ms; }

      /* Hero — trigger immediately on load */
      [data-hero-reveal] {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 600ms ease-out, transform 600ms ease-out;
      }
      [data-hero-reveal].is-visible { opacity: 1; transform: translateY(0); }

      /* Float animation for canvas preview */
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-10px); }
      }
      .float-anim { animation: float 3s ease-in-out infinite; }

      /* Responsive */
      @media (max-width: 768px) {
        .nav-links   { display: none !important; }
        .hero-canvas { max-width: 100% !important; }
        .feat-row    { flex-direction: column !important; gap: 12px !important; }
        .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 24px !important; }
        .footer-copy  { text-align: center !important; }
      }
    `}</style>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────── */
function Nav() {
  const navigate = useNavigate();
  return (
    <nav style={{
      position:       'fixed',
      top:            0,
      left:           0,
      right:          0,
      zIndex:         100,
      height:         64,
      display:        'flex',
      alignItems:     'center',
      background:     'rgba(20, 20, 35, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom:   `1px solid rgba(255, 255, 255, 0.05)`,
    }}>
      <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 11,
          }}>UC</div>
          <span style={{ color: T.text, fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>UMLCanvas</span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
            {['Features', 'Workflow'].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`}
                style={{ color: T.muted, fontSize: 14, textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = T.text)}
                onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
              >{l}</a>
            ))}
          </div>
          <button
            onClick={() => navigate('/editor')}
            style={{
              border: `1px solid ${T.accent}`, color: T.accent,
              background: 'transparent', padding: '8px 20px',
              borderRadius: 6, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', transition: 'background 200ms ease, color 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.accent; }}
          >
            Launch Editor →
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */
function Hero() {
  const navigate  = useNavigate();
  const heroRef   = useRef<HTMLElement>(null);

  /* Trigger hero reveals after mount (not on scroll) */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-hero-reveal]');
    items.forEach((item, i) => {
      setTimeout(() => item.classList.add('is-visible'), i * 100);
    });
  }, []);

  return (
    <section ref={heroRef} style={{
      minHeight:      '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      textAlign:      'center',
      paddingTop:     120,
      paddingBottom:  100,
      background:     'transparent',
      position:       'relative',
      /* No overflow:hidden — clips large clamp() headlines */
    }}>
      {/* Ambient glow */}
      <div style={{
        position:   'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)`,
      }} />

      <div style={{ ...containerSm, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Version badge */}
        <div data-hero-reveal data-delay="0" style={{
          display: 'inline-block',
          fontSize: 11, letterSpacing: '0.15em', color: T.muted,
          border: `1px solid ${T.border}`, padding: '4px 14px',
          borderRadius: 100, marginBottom: 28,
        }}>✦ VERSION 2.0 IS LIVE</div>

        {/* Headline */}
        <h1 data-hero-reveal data-delay="1" style={{
          fontSize: 'clamp(52px, 8vw, 96px)',
          fontWeight: 800, lineHeight: 1.05,
          color: T.text, margin: '0 0 20px',
          letterSpacing: '-0.03em',
        }}>
          Model software<br />
          <span style={{ color: '#33334d' }}>architectures.</span>
        </h1>

        {/* Subtext */}
        <p data-hero-reveal data-delay="2" style={{
          fontSize: 18, color: T.muted,
          maxWidth: 480, margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          A precision-engineered UML visualizer.<br />No account needed.
        </p>

        {/* CTA buttons */}
        <div data-hero-reveal data-delay="3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <button
            onClick={() => navigate('/editor')}
            style={{
              background: T.accent, color: '#fff',
              padding: '12px 28px', borderRadius: 8,
              fontWeight: 600, fontSize: 15, border: 'none',
              cursor: 'pointer',
              transition: 'filter 200ms ease, transform 200ms ease, box-shadow 200ms ease',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = '';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            Start Building <ArrowRight size={16} />
          </button>

          <a href="#features"
            style={{
              background: 'transparent', color: T.text,
              padding: '12px 28px', borderRadius: 8,
              fontWeight: 500, fontSize: 15,
              border: `1px solid ${T.border}`,
              textDecoration: 'none',
              transition: 'border-color 200ms ease, color 200ms ease',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
          >
            Explore the engine ›
          </a>
        </div>

        {/* Canvas preview */}
        <div data-hero-reveal data-delay="4"
          className="float-anim hero-canvas"
          style={{
            maxWidth: 680, width: '100%',
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* Window chrome */}
          <div style={{
            background: T.surface, padding: '12px 16px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {['#3B3B3B', '#3B3B3B', '#3B3B3B'].map((c, i) => (
              <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
            ))}
            <div style={{ marginLeft: 10, height: 14, width: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
          </div>
          <EditorMockup />
        </div>
      </div>
    </section>
  );
}

/* ─── Static editor mockup ────────────────────────────────────── */
function EditorMockup() {
  const nodes = [
    { id: 'n1', label: 'Vehicle', stereotype: 'abstract', x: 50,  y: 28 },
    { id: 'n2', label: 'Car',     x: 18,  y: 160 },
    { id: 'n3', label: 'Truck',   x: 152, y: 160 },
  ];
  return (
    <div style={{ position: 'relative', background: '#090909', height: 280, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, #1e2030 1px, transparent 1px)',
        backgroundSize:  '24px 24px', opacity: 0.25,
      }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
        <line x1="115" y1="96"  x2="74"  y2="160" stroke="#4B5563" strokeWidth="1.5" />
        <line x1="140" y1="96"  x2="200" y2="160" stroke="#4B5563" strokeWidth="1.5" />
      </svg>
      {nodes.map(n => (
        <div key={n.id} style={{
          position: 'absolute', left: n.x * 1.4, top: n.y,
          minWidth: 112,
          border: `1px solid rgba(59,130,246,0.25)`,
          borderTop: '3px solid #6366f1',
          borderRadius: 6, background: '#111118',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '8px 12px', textAlign: 'center' }}>
            {'stereotype' in n && (
              <div style={{ fontSize: 8, color: '#818cf8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                «{(n as {stereotype:string}).stereotype}»
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{n.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Features ────────────────────────────────────────────────── */
function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef as React.RefObject<HTMLElement>);

  const rows = [
    {
      icon:  <Zap size={20} color={T.accent} />,
      title: 'Magic Auto Layout',
      body:  'ELK.js resolves complex hierarchies instantly. Clean diagrams at any scale.',
    },
    {
      icon:  <GitBranch size={20} color={T.accent} />,
      title: 'UML Compliance',
      body:  'Hollow triangles, dashed realization lines — pixel-perfect UML notation every time.',
    },
    {
      icon:  <Download size={20} color={T.accent} />,
      title: 'High-Fidelity Exports',
      body:  'Export clean SVG or high-res PNG. UI chrome filtered out automatically.',
    },
  ];

  return (
    <section ref={sectionRef} id="features" style={{
      background: 'transparent', padding: '120px 0',
      borderTop: `1px solid rgba(255, 255, 255, 0.05)`,
    }}>
      <div style={container}>
        {/* Label */}
        <p data-reveal style={{
          fontSize: 11, letterSpacing: '0.15em', color: T.accent,
          fontWeight: 600, textTransform: 'uppercase', marginBottom: 12,
        }}>WHY UMLCANVAS</p>

        {/* Heading */}
        <h2 data-reveal data-delay="1" style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700, color: T.text,
          maxWidth: 600, lineHeight: 1.15,
          letterSpacing: '-0.025em',
          marginBottom: 60,
        }}>
          Built for architects who<br />prioritize speed.
        </h2>

        {/* Rows */}
        {rows.map((row, i) => (
          <div key={row.title}>
            <div
              className="feat-row"
              data-reveal
              data-delay={String(i + 2) as '2' | '3' | '4'}
              style={{
                display: 'flex', alignItems: 'center',
                gap: 24, padding: '36px 0',
              }}
              onMouseEnter={e => { (e.currentTarget.querySelector('.feat-arrow') as HTMLElement | null)!.style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget.querySelector('.feat-arrow') as HTMLElement | null)!.style.opacity = '0.2'; }}
            >
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                width: 40, height: 40, borderRadius: 8,
                background: T.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${T.border}`,
              }}>
                {row.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 4 }}>{row.title}</div>
                <div style={{ fontSize: 15, color: T.muted, maxWidth: 520, lineHeight: 1.55 }}>{row.body}</div>
              </div>

              {/* Subtle arrow */}
              <div className="feat-arrow" style={{
                flexShrink: 0, color: T.accent, opacity: 0.2,
                transition: 'opacity 200ms ease', fontSize: 18,
              }}>→</div>
            </div>

            {/* Divider (not after last item) */}
            {i < rows.length - 1 && (
              <div style={{ height: 1, background: T.border }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Closing CTA ─────────────────────────────────────────────── */
function ClosingCTA() {
  const navigate   = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef as React.RefObject<HTMLElement>);

  return (
    <section ref={sectionRef} id="workflow" style={{
      background:  'rgba(255, 255, 255, 0.02)',
      borderTop:   `1px solid rgba(255, 255, 255, 0.05)`,
      padding:     '120px 48px',
      textAlign:   'center',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <p data-reveal style={{
          fontSize: 11, letterSpacing: '0.15em',
          color: T.accent, fontWeight: 600,
          textTransform: 'uppercase', marginBottom: 16,
        }}>OPEN SOURCE</p>

        <h2 data-reveal data-delay="1" style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 800, color: T.text,
          lineHeight: 1.1, letterSpacing: '-0.03em',
          marginBottom: 36,
        }}>
          Start building.<br />
          <span style={{ color: T.muted }}>No account needed.</span>
        </h2>

        <div data-reveal data-delay="2" data-reveal-mode="scale">
          <button
            onClick={() => navigate('/editor')}
            style={{
              background: T.text, color: T.bg,
              padding: '14px 36px', borderRadius: 8,
              fontWeight: 700, fontSize: 16,
              border: 'none', cursor: 'pointer',
              transition: 'background 200ms ease, transform 200ms ease',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.transform = ''; }}
          >
            Launch Editor Now →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
function Footer() {
  const links = ['Twitter', 'GitHub', 'Discord'];
  return (
    <footer style={{
      background: 'transparent',
      borderTop:  `1px solid rgba(255, 255, 255, 0.05)`,
      padding:    '32px 48px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Main row */}
        <div className="footer-inner" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, marginBottom: 20,
        }}>
          {/* Left */}
          <div>
            <div style={{ fontWeight: 600, color: T.text, fontSize: 14, marginBottom: 2 }}>UMLCanvas</div>
            <div style={{ color: T.muted, fontSize: 13 }}>The engineering visualizer for modern architects.</div>
          </div>

          {/* Right: links */}
          <div style={{ display: 'flex', gap: 24 }}>
            {links.map(l => (
              <a key={l} href="#"
                style={{ color: T.muted, fontSize: 13, textDecoration: 'none', transition: 'color 150ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = T.text)}
                onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
              >{l}</a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copy" style={{
          textAlign: 'right', fontSize: 12, color: '#555566',
        }}>
          © 2024 UMLCanvas Visual Engine.
        </div>
      </div>
    </footer>
  );
}

/* ─── Root ────────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div style={{ background: T.gradient, color: T.text, minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      {/* Subtle overlay to deepen the background */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }} />
      <AnimationStyles />
      <Nav />
      <Hero />
      <Features />
      <ClosingCTA />
      <Footer />
    </div>
  );
}
