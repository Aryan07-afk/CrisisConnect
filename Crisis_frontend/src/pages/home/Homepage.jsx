import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/* ── data ──────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🆘',
    title: 'Structured Help Requests',
    desc: 'Volunteers raise prioritised requests on behalf of victims — food, water, shelter, medical, rescue — with precise location tagging.',
    color: '#2f88ff',
  },
  {
    icon: '👥',
    title: 'Smart Volunteer Assignment',
    desc: 'Coordinators instantly match available volunteers by skill set and location to open requests, eliminating coordination chaos.',
    color: '#3b82f6',
  },
  {
    icon: '⬡',
    title: 'Centralised Monitoring',
    desc: 'Real-time dashboard gives authorities a bird\'s-eye view of all ongoing operations, resource allocation and response timelines.',
    color: '#10b981',
  },
  {
    icon: '⚡',
    title: 'Bandwidth Efficient',
    desc: 'Built lightweight — no heavy media, minimal payloads — so the platform works reliably even in low-connectivity disaster zones.',
    color: '#f59e0b',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    desc: 'Four distinct roles — Admin, Coordinator, Volunteer, Victim — each with tailored permissions and views suited to their responsibilities.',
    color: '#8b5cf6',
  },
  {
    icon: '📋',
    title: 'Live Activity Feed',
    desc: 'Every status change, note and assignment update is logged and visible — full transparency across the entire relief operation.',
    color: '#f43f5e',
  },
  {
    icon: '🆘',
    title: 'Victim Self-Registration',
    desc: 'Victims can register directly, submit SOS requests with urgency levels, track their request status live and receive updates from the response team.',
    color: '#2f88ff',
  }
];

const ROLES = [
  {
    role: 'Admin',
    icon: '🛡️',
    color: '#2f88ff',
    bg: 'rgba(47,136,255,.08)',
    border: 'rgba(47,136,255,.25)',
    powers: [
      'Full platform access',
      'Manage all users & roles',
      'Override any assignment',
      'View complete analytics',
      'Activate / deactivate accounts',
    ],
  },
  {
    role: 'Coordinator',
    icon: '🎯',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,.08)',
    border: 'rgba(59,130,246,.25)',
    powers: [
      'Assign volunteers to requests',
      'Review & prioritise requests',
      'Monitor field operations',
      'View all volunteers',
      'Access dashboard stats',
    ],
  },
  {
    role: 'Volunteer',
    icon: '🦺',
    color: '#10b981',
    bg: 'rgba(16,185,129,.08)',
    border: 'rgba(16,185,129,.25)',
    powers: [
      'Raise help requests for victims',
      'Accept / reject assignments',
      'Update assignment progress',
      'Add field notes to requests',
      'Toggle own availability',
    ],
  },
  {
    role: 'Victim',
    icon: '🆘',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,.08)',
    border: 'rgba(244,63,94,.25)',
    powers: [
      'Submit direct SOS requests',
      'Choose type of help needed',
      'Track request status live',
      'Receive messages from team',
      'Update or cancel requests',
    ],
  },
];

const TEAM = [
  { name: 'Aryan Dhoundiyal',  email: 'aryandhoundiyal96@gmail.com', role: 'Developer' },
  { name: 'Vaibhav Rawat',     email: 'vaibhavrawat3182@gmail.com', role: 'Developer' },
  { name: 'Harshit Negi',      email: 'negiharshit89@gmail.com', role: 'Developer' },
];

const STATS = [
  { value: '4',    label: 'User Roles' },
  { value: '7+',   label: 'Relief Categories' },
  { value: '24/7', label: 'Availability' },
  { value: '100%', label: 'Free to Use' },
];

/* ── animated counter ───────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const num = parseInt(target);
    if (isNaN(num) || target.toString().includes('/')) {
      setCount(target); return;
    }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * num));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);
  return count;
}

/* ── intersection observer hook ─────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ── components ─────────────────────────────────────── */
function StatCard({ value, label }) {
  const count = useCountUp(value);
  return (
    <div className="hp-stat-card">
      <div className="hp-stat-val">{typeof count === 'number' ? count + (value.includes('+') ? '+' : value.includes('%') ? '%' : '') : value}</div>
      <div className="hp-stat-label">{label}</div>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`hp-feature-card ${inView ? 'hp-in' : ''}`}
      style={{ '--delay': `${index * 80}ms`, '--accent': feature.color }}>
      <div className="hp-feature-icon">{feature.icon}</div>
      <h3 className="hp-feature-title">{feature.title}</h3>
      <p className="hp-feature-desc">{feature.desc}</p>
    </div>
  );
}

function RoleCard({ role, index }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`hp-role-card ${inView ? 'hp-in' : ''}`}
      style={{
        '--delay': `${index * 120}ms`,
        '--rc': role.color, '--rbg': role.bg, '--rborder': role.border
      }}>
      <div className="hp-role-top">
        <span className="hp-role-icon">{role.icon}</span>
        <span className="hp-role-name">{role.role}</span>
      </div>
      <ul className="hp-role-list">
        {role.powers.map((p, i) => (
          <li key={i}><span className="hp-role-check">✓</span>{p}</li>
        ))}
      </ul>
    </div>
  );
}

/* ── main page ───────────────────────────────────────── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="hp">

      {/* ── NAV ── */}
      <nav className={`hp-nav ${scrolled ? 'hp-nav-scrolled' : ''}`}>
        <div className="hp-nav-inner">
          <div className="hp-nav-logo">
            <span className="hp-nav-logo-icon">🚨</span>
            <span className="hp-nav-logo-text">CrisisConnect</span>
          </div>
          <div className={`hp-nav-links ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('roles')}>Roles</button>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('team')}>Team</button>
          </div>
          <div className="hp-nav-actions">
            <Link to="/login" className="hp-btn-ghost">Sign In</Link>
            <Link to="/register" className="hp-btn-primary">Get Started →</Link>
          </div>
          <button className="hp-hamburger" onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-grid-bg" />
        <div className="hp-radial-glow hp-glow-1" />
        <div className="hp-radial-glow hp-glow-2" />
        <div className="hp-scanline" />

        <div className="hp-hero-inner">
          <div className="hp-hero-badge">
            <span className="hp-pulse-dot" />
            Disaster Relief Coordination Platform
          </div>

          <h1 className="hp-hero-title">
            <span className="hp-hero-title-line">Linking Help,</span>
            <span className="hp-hero-title-line hp-hero-accent">Saving Lives.</span>
          </h1>

          <p className="hp-hero-desc">
            Natural disasters scatter information and delay response. CrisisConnect brings
            volunteers, coordinators and administrators onto one structured platform —
            so relief reaches victims faster, smarter, and without chaos.
          </p>

          <div className="hp-hero-actions">
            <Link to="/register" className="hp-btn-primary hp-btn-lg">
              Join the Platform →
            </Link>
            <Link to="/login" className="hp-btn-outline hp-btn-lg">
              Sign In
            </Link>
            <Link to="/victim/register" className="hp-btn-ghost hp-btn-lg"
              style={{ borderColor: 'rgba(244,63,94,.4)', color: '#f43f5e' }}>
              🆘 I Need Help
            </Link>
            <button className="hp-btn-text" onClick={() => scrollTo('about')}>
              Learn More ↓
            </button>
          </div>

          <div className="hp-hero-stats">
            {STATS.map((s, i) => <StatCard key={i} {...s} />)}
          </div>
        </div>

        <div className="hp-hero-scroll-hint" onClick={() => scrollTo('features')}>
          <span>scroll</span>
          <div className="hp-scroll-arrow" />
        </div>
      </section>

    {/* ── MOTIVATION BAND ── */}
      <section className="hp-motivation">
        <div className="hp-container">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <blockquote style={{ fontSize: '1.6rem', marginBottom: 20 }}>
              Lives are often lost because critical information arrives too late.
              We built CrisisConnect so that never happens again.
            </blockquote>
            <div className="hp-quote-src" style={{ marginBottom: 28 }}>— CrisisCoders</div>
            <p style={{ fontSize: '1rem', color: 'var(--hp-text2)', lineHeight: 1.8 }}>
              CrisisConnect puts trained volunteers at the centre of disaster response —
              raising requests, coordinating resources, and getting help to victims
              faster than any unorganised effort ever could.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="hp-section">
        <div className="hp-container">
          <div className="hp-section-header">
            <div className="hp-section-tag">Platform Features</div>
            <h2 className="hp-section-title">Everything you need in a crisis</h2>
            <p className="hp-section-sub">
              Built for field conditions — fast, structured, and reliable even when connectivity is limited.
            </p>
          </div>
          <div className="hp-features-grid">
            {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="hp-section hp-how">
        <div className="hp-container">
          <div className="hp-section-header">
            <div className="hp-section-tag">How It Works</div>
            <h2 className="hp-section-title">From crisis to resolution</h2>
          </div>
          <div className="hp-steps">
            {[
              { n: '01', title: 'Volunteer raises a request', desc: 'An on-field volunteer logs a help request on behalf of victims — specifying type, priority, location and number of people affected.' },
              { n: '02', title: 'Coordinator reviews & assigns', desc: 'A coordinator reviews the request, sets priority, and assigns an available volunteer with the right skills to handle it.' },
              { n: '03', title: 'Volunteer accepts & responds', desc: 'The assigned volunteer accepts the task, begins the operation and updates the status in real-time as work progresses.' },
              { n: '04', title: 'Request resolved & logged', desc: 'Once complete, the request is marked resolved. All activity is logged for accountability and future analysis.' },
            ].map((step, i) => (
              <div key={i} className="hp-step">
                <div className="hp-step-num">{step.n}</div>
                <div className="hp-step-connector" />
                <div className="hp-step-body">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="hp-section">
        <div className="hp-container">
          <div className="hp-section-header">
            <div className="hp-section-tag">User Roles</div>
            <h2 className="hp-section-title">Who uses CrisisConnect?</h2>
            <p className="hp-section-sub">
              Three distinct roles — each with tailored access, responsibilities and views.
            </p>
          </div>
          <div className="hp-roles-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {ROLES.map((r, i) => <RoleCard key={i} role={r} index={i} />)}
          </div>
          <div className="hp-roles-cta" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" className="hp-btn-primary hp-btn-lg">
              Join as Volunteer / Admin →
            </Link>
            <Link to="/victim/register"
              style={{ borderColor: 'rgba(244,63,94,.5)', color: '#f43f5e' }}
              className="hp-btn-outline hp-btn-lg">
              🆘 Register as Victim
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="hp-section hp-about">
        <div className="hp-container">
          <div className="hp-about-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="hp-about-left" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
              <div className="hp-section-tag">About the Project</div>
              <h2 className="hp-section-title" style={{ textAlign: 'center', maxWidth: '100%' }}>
                Built for the field, not the boardroom.
              </h2>
              <p>
                CrisisConnect is developed by Team CrisisCoders. It is a fully functional
                MERN stack web application designed as a prototype for disaster
                management coordination.
              </p>
              <p>
                The platform prioritises practicality — it is lightweight, structured,
                and designed so that relief operations can be coordinated even in
                areas with poor internet connectivity.
              </p>
              <div className="hp-about-tags" style={{ justifyContent: 'center' }}>
                {['MERN Stack','JWT Auth','Role-Based Access','MongoDB','RESTful API','React + Vite'].map(t => (
                  <span key={t} className="hp-tag">{t}</span>
                ))}
              </div>
            </div>
              </div>
            </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="hp-section">
        <div className="hp-container">
          <div className="hp-section-header">
            <div className="hp-section-tag">The Team</div>
            <h2 className="hp-section-title">Built by CrisisCoders</h2>
            <p className="hp-section-sub">
             One mission. Zero disasters left uncoordinated.
            </p>
          </div>
          <div className="hp-team-grid">
            {TEAM.map((m, i) => (
              <div key={i} className="hp-team-card">
                <div className="hp-team-avatar">
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hp-team-name">{m.name}</div>
                <div className="hp-team-role">{m.role}</div>
                <div className="hp-team-id">#{m.id}</div>
                <a href={`mailto:${m.email}`} className="hp-team-email">{m.email}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="hp-cta-band">
        <div className="hp-container">
          <div className="hp-cta-inner">
            <h2>Ready to coordinate relief operations?</h2>
            <p>Join CrisisConnect and help make disaster response faster, smarter and more organised.</p>
            <div className="hp-hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/register" className="hp-btn-primary hp-btn-lg">Create Account →</Link>
              <Link to="/login" className="hp-btn-outline hp-btn-lg">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hp-footer">
        <div className="hp-container">
          <div className="hp-footer-grid">
            <div className="hp-footer-brand">
              <div className="hp-nav-logo" style={{ marginBottom: 12 }}>
                <span className="hp-nav-logo-icon">🚨</span>
                <span className="hp-nav-logo-text">CrisisConnect</span>
              </div>
              <p>Linking help, saving lives. A disaster management coordination platform built on the MERN stack.</p>
            </div>
            <div className="hp-footer-col">
              <div className="hp-footer-heading">Platform</div>
              <button onClick={() => scrollTo('features')}>Features</button>
              <button onClick={() => scrollTo('roles')}>User Roles</button>
              <button onClick={() => scrollTo('about')}>About</button>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
            <div className="hp-footer-col">
              <div className="hp-footer-heading">Roles</div>
              <span>Admin</span>
              <span>Coordinator</span>
              <span>Volunteer</span>
              <span>Victim</span>
            </div>
            <div className="hp-footer-col">
              <div className="hp-footer-heading">Team</div>
              {TEAM.map((m, i) => (
                <a key={i} href={`mailto:${m.email}`}>{m.name}</a>
              ))}
              <span style={{ marginTop: 4, fontSize: '.75rem', color: 'var(--hp-text3)' }}></span>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <span>© 2026 CrisisConnect · Team CrisisCoders</span>
            <span>Built with MERN Stack </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
