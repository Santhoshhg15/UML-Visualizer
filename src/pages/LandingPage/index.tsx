/**
 * LandingPage/index.tsx
 * ─────────────────────────────────────────────────────────────
 * Redesigned per spec: Premium AI-powered architecture workspace.
 * "Describe software architecture → AI generates UML diagrams"
 */

import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Layers, Lock } from 'lucide-react';

/* ─── Tokens ─────────────────────────────────────────────── */
const T = {
  bg:       '#0B1020',
  surface:  'rgba(15, 23, 42, 0.72)',
  primary:  '#4F7CFF',
  accent:   '#38BDF8',
  text:     '#F8FAFC',
  muted:    '#94A3B8',
  border:   'rgba(148, 163, 184, 0.08)',
};

function AnimationStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; }
      
      @keyframes float-slow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-12px); }
      }
      @keyframes float-medium {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(56,189,248, 0.1); }
        50% { opacity: 1; box-shadow: 0 0 40px rgba(56,189,248, 0.3); }
      }
      @keyframes dash-flow {
        to { stroke-dashoffset: -20; }
      }

      .float-slow { animation: float-slow 6s ease-in-out infinite; }
      .float-medium { animation: float-medium 4s ease-in-out infinite; }
      .float-delay-1 { animation-delay: -2s; }
      .float-delay-2 { animation-delay: -4s; }
      
      .reveal {
        opacity: 0;
        transform: translateY(20px);
        animation: reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes reveal-up {
        to { opacity: 1; transform: translateY(0); }
      }
      .delay-1 { animation-delay: 0.1s; }
      .delay-2 { animation-delay: 0.2s; }
      .delay-3 { animation-delay: 0.3s; }
      
      @media (max-width: 1024px) {
        .hero-split { flex-direction: column !important; padding-top: 120px !important; }
        .hero-copy { text-align: center; align-items: center; max-width: 100% !important; margin-bottom: 64px; }
        .hero-preview { position: relative !important; right: auto !important; width: 100% !important; height: 500px !important; transform: none !important; margin-left: 0 !important; border-radius: 16px !important; }
        .nav-links { display: none !important; }
        .showcase-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        .flow-line { display: none; }
      }
    `}</style>
  );
}

function Nav() {
  const navigate = useNavigate();
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 72,
      display: 'flex', alignItems: 'center',
      background: 'rgba(11, 16, 32, 0.6)', backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
          }}>AS</div>
          <span style={{ color: T.text, fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>ArchSpace</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
            <span style={{ color: T.text, fontSize: 14, cursor: 'pointer' }}>Product</span>
            <span style={{ color: T.muted, fontSize: 14, cursor: 'pointer' }}>Documentation</span>
            <span style={{ color: T.muted, fontSize: 14, cursor: 'pointer' }}>Changelog</span>
          </div>
          <button
            onClick={() => navigate('/editor')}
            style={{
              color: T.text, background: 'transparent', padding: '8px 16px',
              borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${T.border}`, transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.muted; e.currentTarget.style.background = T.surface; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}

function WorkspacePreview() {
  return (
    <div className="hero-preview float-slow" style={{
      position: 'absolute', top: '50%', right: -80, transform: 'translateY(-50%)',
      width: '60vw', maxWidth: 900, height: '80vh', maxHeight: 800,
      background: '#0B1020', borderRadius: '32px 0 0 32px',
      border: `1px solid ${T.border}`, borderRight: 'none',
      boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      overflow: 'hidden', display: 'flex',
    }}>
      {/* Grid Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* SVG Connecting Lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <path d="M 280 240 Q 380 240 380 340 T 480 340" fill="none" stroke={T.primary} strokeWidth="2" opacity="0.6" style={{ strokeDasharray: '4 4', animation: 'dash-flow 1s linear infinite' }} />
        <path d="M 280 240 Q 380 240 380 140 T 480 140" fill="none" stroke={T.muted} strokeWidth="1.5" opacity="0.3" />
        <circle cx="280" cy="240" r="4" fill={T.primary} />
        <circle cx="480" cy="340" r="4" fill={T.primary} />
        <circle cx="480" cy="140" r="4" fill={T.muted} />
      </svg>

      {/* Node 1: API Gateway */}
      <div className="float-medium float-delay-1" style={{
        position: 'absolute', left: 80, top: 160, width: 200,
        background: '#111827', borderRadius: 12, border: `1px solid ${T.border}`, borderTop: `3px solid ${T.primary}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 9, color: T.accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>«Service»</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 14 }}>
            <Layers size={16} /> API Gateway
          </div>
        </div>
        <div style={{ padding: '12px 20px', fontSize: 12, color: T.muted, fontFamily: 'monospace' }}>
          <div>+ routeReq(req)</div>
          <div>+ authCheck()</div>
        </div>
      </div>

      {/* Node 2: Auth Service */}
      <div className="float-medium float-delay-2" style={{
        position: 'absolute', left: 480, top: 280, width: 220,
        background: '#111827', borderRadius: 12, border: `1px solid ${T.primary}`, borderTop: `3px solid ${T.primary}`,
        boxShadow: `0 0 0 1px ${T.primary}, 0 12px 40px rgba(79,124,255,0.15)`,
      }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 9, color: T.accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>«Microservice»</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 14 }}>
            <Lock size={16} /> Auth Service
          </div>
        </div>
        <div style={{ padding: '12px 20px', fontSize: 12, color: T.muted, fontFamily: 'monospace' }}>
          <div style={{ color: '#10B981' }}>+ validateToken()</div>
          <div>- issueJWT()</div>
        </div>
      </div>

      {/* AI Console Overlay */}
      <div className="float-slow" style={{
        position: 'absolute', bottom: 60, left: 60, right: 120,
        background: T.surface, backdropFilter: 'blur(24px)',
        borderRadius: 16, border: `1px solid ${T.border}`,
        padding: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>"Extract an Auth Microservice from the Gateway..."</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.primary, display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            Generating architecture...
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="hero-split" style={{
        maxWidth: 1400, margin: '0 auto', padding: '0 40px', width: '100%',
        display: 'flex', alignItems: 'center', position: 'relative', zIndex: 10,
      }}>
        {/* Left Copy */}
        <div className="hero-copy" style={{ flex: '0 0 50%', maxWidth: 600, display: 'flex', flexDirection: 'column', zIndex: 20 }}>
          
          <div className="reveal" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, boxShadow: `0 0 12px ${T.accent}` }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent }}>ArchSpace AI is Live</span>
          </div>

          <h1 className="reveal delay-1" style={{
            fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 600, lineHeight: 1.1,
            color: T.text, letterSpacing: '-0.03em', margin: '0 0 24px',
          }}>
            Describe systems.<br />
            <span style={{ color: T.muted }}>Generate architecture.</span>
          </h1>

          <p className="reveal delay-2" style={{
            fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 48, maxWidth: 500,
          }}>
            The intelligent workspace that turns ideas into UML instantly. Design, refactor, and visualize domain-driven systems with AI.
          </p>

          <div className="reveal delay-3" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/editor')}
              style={{
                background: T.text, color: T.bg, padding: '14px 32px', borderRadius: 8,
                fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
                transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.text; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Open Workspace
            </button>
            
            <button
              style={{
                background: 'transparent', color: T.text, padding: '14px 32px', borderRadius: 8,
                fontWeight: 500, fontSize: 15, border: `1px solid ${T.border}`, cursor: 'pointer',
                transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.muted; e.currentTarget.style.background = T.surface; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'transparent'; }}
            >
              <Play size={16} fill="currentColor" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <WorkspacePreview />
      </div>
    </section>
  );
}

function InteractiveShowcase() {
  return (
    <section style={{
      padding: '160px 40px',
      position: 'relative',
      background: T.bg,
      borderTop: `1px solid ${T.border}`,
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, color: T.text,
            letterSpacing: '-0.02em', margin: '0 0 16px',
          }}>
            From description to architecture in seconds.
          </h2>
          <p style={{ fontSize: 18, color: T.muted, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Type your requirements in natural language. Our AI engine instantly interprets your domain and generates precise UML.
          </p>
        </div>

        {/* Workflow Container */}
        <div className="showcase-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 200px 1fr',
          gap: 24,
          alignItems: 'center',
          position: 'relative',
        }}>
          
          {/* 1. Input Panel */}
          <div className="reveal delay-1" style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
            padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            position: 'relative', zIndex: 10, backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>1. Natural Language Input</div>
            
            <div style={{
              background: '#0B1020', border: `1px solid ${T.primary}`, borderRadius: 12, padding: '16px 20px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              boxShadow: `0 0 0 1px ${T.primary}, 0 12px 32px rgba(79,124,255,0.15)`,
            }}>
              <div style={{ color: T.primary, marginTop: 2 }}>
                <Sparkles size={18} />
              </div>
              <div style={{ fontSize: 15, color: T.text, lineHeight: 1.5, fontWeight: 500 }}>
                "Create an <span style={{color: T.accent}}>Animal</span> class with a String name attribute. <span style={{color: T.accent}}>Tiger</span> extends Animal."
              </div>
            </div>
          </div>

          {/* 2. Processing Flow */}
          <div className="reveal delay-2" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            position: 'relative',
          }}>
            {/* SVG Connecting Line Background */}
            <svg className="flow-line" style={{ position: 'absolute', top: '50%', left: -50, right: -50, height: 2, transform: 'translateY(-50%)', zIndex: 0, width: 'calc(100% + 100px)' }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke={T.primary} strokeWidth="2" opacity="0.4" strokeDasharray="6 6" style={{ animation: 'dash-flow 1s linear infinite' }} />
            </svg>
            
            <div style={{
              background: '#0B1020', border: `1px solid ${T.border}`, borderRadius: '50%',
              width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.primary, zIndex: 10, position: 'relative',
              animation: 'pulse-glow 2s infinite',
            }}>
              <Layers size={24} />
            </div>
            
            <div style={{ background: T.bg, padding: '0 8px', fontSize: 13, color: T.muted, fontWeight: 500, zIndex: 10 }}>
              AI Interpretation
            </div>
          </div>

          {/* 3. UML Output Preview */}
          <div className="reveal delay-3" style={{
            position: 'relative', height: 320,
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, transparent 70%)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', fontSize: 11, color: T.accent, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>3. Generated UML</div>
            
            {/* Class: Animal */}
            <div className="float-medium" style={{
              position: 'absolute', top: 40, left: '10%', width: 180,
              background: '#111827', borderRadius: 12, border: `1px solid ${T.border}`, borderTop: `3px solid ${T.primary}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Animal</div>
              </div>
              <div style={{ padding: '10px 16px', fontSize: 12, color: T.muted, fontFamily: 'monospace' }}>
                <div style={{ color: T.accent }}>+ name: String</div>
              </div>
            </div>

            {/* Connecting SVG Arrow */}
            <svg style={{ position: 'absolute', top: 110, left: '10%', width: 180, height: 100, pointerEvents: 'none' }}>
              <path d="M 90 20 L 90 80" fill="none" stroke={T.muted} strokeWidth="1.5" />
              <polygon points="85,25 90,15 95,25" fill={T.bg} stroke={T.muted} strokeWidth="1.5" />
            </svg>

            {/* Class: Tiger */}
            <div className="float-medium float-delay-1" style={{
              position: 'absolute', top: 190, left: '10%', width: 180,
              background: '#111827', borderRadius: 12, border: `1px solid ${T.primary}`, borderTop: `3px solid ${T.primary}`,
              boxShadow: `0 0 0 1px ${T.primary}, 0 12px 40px rgba(79,124,255,0.15)`,
            }}>
              <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Tiger</div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${T.border}`, padding: '32px 40px', background: T.bg,
      position: 'relative', zIndex: 20,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.muted, fontSize: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: T.primary }} />
          ArchSpace © 2026
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Twitter', 'GitHub', 'Terms'].map(l => (
            <span key={l} style={{ color: T.muted, fontSize: 13, cursor: 'pointer', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
            >{l}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <AnimationStyles />
      <Nav />
      <Hero />
      <InteractiveShowcase />
      <Footer />
    </div>
  );
}
