import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import LightPillar from '@/components/LightPillar';
import TrueFocus from '@/components/TrueFocus';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

// ── Ticker ────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'BLOCKCHAIN HEIGHT: 8,492,110',
  'ACTIVE VALIDATORS: 1,102',
  'NETWORK INTEGRITY: 99.8%',
  'ANOMALIES DETECTED (24H): 14',
  'CONSENSUS: OPTIMISM L2',
  'ENCRYPTION: AES-256-GCM',
  'NODES ONLINE: 1,284',
  'LAST BLOCK: 0x3f7a...d91c',
];

function StatusTicker() {
  return (
    <div className="lp-ticker-wrap">
      <div className="lp-ticker-inner">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="lp-ticker-item">
            <span className="lp-ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Hex grid ──────────────────────────────────────────────────────────────────

function HexGrid() {
  return (
    <svg className="lp-hexgrid" viewBox="0 0 400 400" fill="none" aria-hidden="true">
      {[
        [200, 80], [280, 126], [280, 218], [200, 264],
        [120, 218], [120, 126], [200, 172], [200, -12],
        [360, 80], [360, 264], [200, 356], [40, 264], [40, 80],
      ].map(([cx, cy], i) => (
        <polygon
          key={i}
          points={`${cx},${cy! - 40} ${cx! + 34.6},${cy! - 20} ${cx! + 34.6},${cy! + 20} ${cx},${cy! + 40} ${cx! - 34.6},${cy! + 20} ${cx! - 34.6},${cy! - 20}`}
          stroke="rgba(0,144,255,0.12)" strokeWidth="1" fill="none"
        />
      ))}
    </svg>
  );
}

// ── Nav popover ───────────────────────────────────────────────────────────────

const NAV_CONTENT = {
  About: {
    title: 'About CyberFence',
    body: 'CyberFence is a Final Year Project (FYP) that combines blockchain technology with machine learning to secure IoT and enterprise networks. Nodes register on Optimism L2, and an ML model trained on the CICIDS2017 dataset classifies network traffic into 15 attack categories in real time. Anomalies are logged immutably on-chain, giving administrators a tamper-proof audit trail.',
    tags: ['Blockchain IDS', 'Optimism L2', 'IoT Security', 'FYP 2025'],
  },
  Docs: {
    title: 'Documentation',
    body: 'The portal exposes three core modules — Dashboard (live stats, validator topology, block hashes), Node Registry (register, promote, revoke validators, trust scores), and Network Anomalies (forensic inspector with raw log details, quarantine actions). All data flows through a smart-contract layer; nodes authenticate via wallet address + secure key.',
    tags: ['Dashboard', 'Node Registry', 'Anomaly Inspector', 'Smart Contracts'],
  },
  Status: {
    title: 'System Status',
    body: null,
    tags: [],
  },
};

const STATUS_ROWS = [
  { label: 'Blockchain RPC',    value: 'Optimism L2',    ok: true  },
  { label: 'ML Inference API',  value: 'Operational',    ok: true  },
  { label: 'Node Registry',     value: '1,284 nodes',    ok: true  },
  { label: 'Active Validators', value: '1,102 / 1,284',  ok: true  },
  { label: 'Anomalies (24h)',   value: '14 detected',    ok: false },
  { label: 'Blockchain Height', value: '8,492,110',      ok: true  },
  { label: 'Last Block',        value: '0x3f7a…d91c',    ok: true  },
];

function NavPopover({ label, onClose }: { label: keyof typeof NAV_CONTENT; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const content = NAV_CONTENT[label];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="lp-popover">
      <div className="lp-popover-title">{content.title}</div>
      {label === 'Status' ? (
        <div className="lp-popover-status-list">
          {STATUS_ROWS.map((row) => (
            <div key={row.label} className="lp-popover-status-row">
              <span className="lp-popover-status-label">{row.label}</span>
              <span className={`lp-popover-status-val ${row.ok ? 'lp-popover-status-ok' : 'lp-popover-status-warn'}`}>
                <span className="lp-popover-status-dot" style={{ background: row.ok ? '#00ff88' : '#ffaa44' }} />
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="lp-popover-body">{content.body}</p>
      )}
      {content.tags.length > 0 && (
        <div className="lp-popover-tags">
          {content.tags.map((t) => <span key={t} className="lp-popover-tag">{t}</span>)}
        </div>
      )}
    </div>
  );
}

// ── Feature pill ──────────────────────────────────────────────────────────────

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="lp-feature-pill">
      <span className="lp-feature-pill-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ── Input row helper ──────────────────────────────────────────────────────────

function Field({
  id, label, type = 'text', value, onChange, placeholder, focused, onFocus, onBlur, autoComplete, icon,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  focused: string | null; onFocus: () => void; onBlur: () => void;
  autoComplete?: string; icon: React.ReactNode;
}) {
  return (
    <div className="lp-field">
      <label className="lp-label" htmlFor={id}>{label}</label>
      <div className={`lp-input-wrap ${focused === id ? 'lp-input-wrap--focused' : ''}`}>
        <span className="lp-input-prefix">{icon}</span>
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          placeholder={placeholder}
          className="lp-input"
          autoComplete={autoComplete}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const NodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="6" r="3" /><circle cx="19" cy="6" r="3" /><circle cx="12" cy="18" r="3" />
    <line x1="5" y1="9" x2="12" y2="15" /><line x1="19" y1="9" x2="12" y2="15" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { signIn, signUp, session } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupName,     setSignupName]     = useState('');
  const [signupDeviceId, setSignupDeviceId] = useState('');
  const [signupEmail,    setSignupEmail]    = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [focused,   setFocused]   = useState<string | null>(null);
  const [openNav,   setOpenNav]   = useState<keyof typeof NAV_CONTENT | null>(null);

  // TrueFocus: show for first 5 seconds
  const [showFocus, setShowFocus] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowFocus(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Enter email and password', 'error');
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    setIsLoading(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Session initialized. Welcome to CyberFence.', 'success');
    navigate('/dashboard');
  }, [loginEmail, loginPassword, signIn, navigate, showToast]);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !signupPassword.trim() || !signupName.trim() || !signupDeviceId.trim()) {
      showToast('All fields are required', 'error');
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail.trim(), signupPassword, signupName.trim(), signupDeviceId.trim());
    setIsLoading(false);
    if (error) { showToast(error, 'error'); return; }
    showToast('Account created. You can now sign in.', 'success');
    setTab('login');
    setLoginEmail(signupEmail.trim());
  }, [signupEmail, signupPassword, signupName, signupDeviceId, signUp, showToast]);

  return (
    <div className="lp-root">
      <div className="lp-bg-base" />
      <div className="lp-pillar-wrap">
        <LightPillar
          topColor="#0090ff" bottomColor="#001a33"
          intensity={1.15} rotationSpeed={0.22}
          glowAmount={0.006} pillarWidth={2.6}
          pillarHeight={0.38} noiseIntensity={0.35}
          pillarRotation={0} interactive={false}
          mixBlendMode="screen" quality="high"
        />
      </div>
      <div className="lp-vignette" />
      <HexGrid />

      {/* ── Header ── */}
      <header className="lp-header">
        <div className="lp-logo">
          {showFocus ? (
            <TrueFocus
              sentence="Cyber Fence" manualMode={false} blurAmount={6}
              borderColor="#0090ff" glowColor="rgba(0,144,255,0.6)"
              animationDuration={0.6} pauseBetweenAnimations={1.2}
            />
          ) : (
            <><span className="lp-logo-bracket">[</span>CyberFence<span className="lp-logo-bracket">]</span></>
          )}
        </div>
        <nav className="lp-nav">
          {(['About', 'Docs', 'Status'] as const).map((item) => (
            <div key={item} className="lp-nav-item">
              <button
                className={`lp-nav-link ${openNav === item ? 'lp-nav-link--active' : ''}`}
                onClick={() => setOpenNav(openNav === item ? null : item)}
              >
                {item}
              </button>
              {openNav === item && <NavPopover label={item} onClose={() => setOpenNav(null)} />}
            </div>
          ))}
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="lp-main">
        {/* Left */}
        <div className="lp-left">
          <div className="lp-badge"><span className="lp-badge-dot" />Optimism L2 · v2.4.1</div>
          <h1 className="lp-title">CYBER<br /><span className="lp-title-accent">FENCE</span></h1>
          <p className="lp-subtitle">
            Blockchain-secured network intrusion detection.<br />
            Real-time threat classification across distributed nodes.
          </p>
          <div className="lp-features">
            <FeaturePill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>} label="ML Threat Detection" />
            <FeaturePill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-4 0v2" /><line x1="12" y1="12" x2="12" y2="16" /></svg>} label="On-chain Audit Trail" />
            <FeaturePill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="6" r="3" /><circle cx="19" cy="6" r="3" /><circle cx="12" cy="18" r="3" /><line x1="5" y1="9" x2="12" y2="15" /><line x1="19" y1="9" x2="12" y2="15" /></svg>} label="Distributed Validators" />
            <FeaturePill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} label="CICIDS2017 Dataset" />
          </div>
          <div className="lp-stats">
            <div className="lp-stat"><span className="lp-stat-value">15</span><span className="lp-stat-label">Attack Classes</span></div>
            <div className="lp-stat-divider" />
            <div className="lp-stat"><span className="lp-stat-value">1,284</span><span className="lp-stat-label">Nodes</span></div>
            <div className="lp-stat-divider" />
            <div className="lp-stat"><span className="lp-stat-value">99.8%</span><span className="lp-stat-label">Uptime</span></div>
          </div>
        </div>

        {/* Right — auth card */}
        <div className="lp-right">
          <div className="lp-card">
            {/* Header */}
            <div className="lp-card-header">
              <div className="lp-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0090ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="lp-card-title">{tab === 'login' ? 'Initialize Session' : 'Register Account'}</p>
                <p className="lp-card-desc">{tab === 'login' ? 'Authenticate with your credentials' : 'Create your admin account'}</p>
              </div>
            </div>

            <div className="lp-card-divider" />

            {/* Tabs */}
            <div className="lp-tabs">
              <button type="button" className={`lp-tab ${tab === 'login'  ? 'lp-tab--active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
              <button type="button" className={`lp-tab ${tab === 'signup' ? 'lp-tab--active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
            </div>

            {/* Login form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} noValidate className="lp-form">
                <Field id="loginEmail"    label="Email"    type="email"    value={loginEmail}    onChange={setLoginEmail}    placeholder="admin@cyberfence.com" focused={focused} onFocus={() => setFocused('loginEmail')}    onBlur={() => setFocused(null)} autoComplete="email"            icon={<EmailIcon />} />
                <Field id="loginPassword" label="Password" type="password" value={loginPassword} onChange={setLoginPassword} placeholder="Your password"         focused={focused} onFocus={() => setFocused('loginPassword')} onBlur={() => setFocused(null)} autoComplete="current-password" icon={<LockIcon />} />
                <button type="submit" disabled={isLoading} className="lp-btn">
                  {isLoading ? (
                    <span className="lp-btn-loading"><span className="lp-spinner" />Authenticating...</span>
                  ) : (
                    <span className="lp-btn-content">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                      Access Command Center
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Signup form */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} noValidate className="lp-form">
                <Field id="signupName"     label="Full Name"  type="text"     value={signupName}     onChange={setSignupName}     placeholder="Admin"                focused={focused} onFocus={() => setFocused('signupName')}     onBlur={() => setFocused(null)} autoComplete="name"         icon={<UserIcon />} />
                <Field id="signupDeviceId" label="Device ID"  type="text"     value={signupDeviceId} onChange={setSignupDeviceId} placeholder="CF-DEV-001000"        focused={focused} onFocus={() => setFocused('signupDeviceId')} onBlur={() => setFocused(null)} autoComplete="off"          icon={<NodeIcon />} />
                <Field id="signupEmail"    label="Email"      type="email"    value={signupEmail}    onChange={setSignupEmail}    placeholder="admin@cyberfence.com" focused={focused} onFocus={() => setFocused('signupEmail')}    onBlur={() => setFocused(null)} autoComplete="email"        icon={<EmailIcon />} />
                <Field id="signupPassword" label="Password"   type="password" value={signupPassword} onChange={setSignupPassword} placeholder="Min. 6 characters"    focused={focused} onFocus={() => setFocused('signupPassword')} onBlur={() => setFocused(null)} autoComplete="new-password" icon={<LockIcon />} />
                <button type="submit" disabled={isLoading} className="lp-btn">
                  {isLoading ? (
                    <span className="lp-btn-loading"><span className="lp-spinner" />Creating account...</span>
                  ) : (
                    <span className="lp-btn-content">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                      Create Account
                    </span>
                  )}
                </button>
              </form>
            )}

            <p className="lp-card-footer">
              <span className="lp-card-footer-dot" />
              End-to-end encrypted · AES-256-GCM
            </p>
          </div>
        </div>
      </main>

      <StatusTicker />
    </div>
  );
}
