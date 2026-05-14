import { type ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

// ── Icons ────────────────────────────────────────────────────────────────────

function ShieldIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#0090ff' : '#4a4a4a'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={active ? { filter: 'drop-shadow(0 0 4px #0090ff)' } : {}}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function NetworkIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#0090ff' : '#4a4a4a'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={active ? { filter: 'drop-shadow(0 0 4px #0090ff)' } : {}}>
      <circle cx="5" cy="6" r="3" />
      <circle cx="19" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <line x1="5" y1="9" x2="12" y2="15" />
      <line x1="19" y1="9" x2="12" y2="15" />
    </svg>
  );
}

function AlertIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#0090ff' : '#4a4a4a'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={active ? { filter: 'drop-shadow(0 0 4px #0090ff)' } : {}}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#4a4a4a" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Nav items config ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (active: boolean) => <ShieldIcon active={active} />,
    badge: null,
  },
  {
    path: '/nodes',
    label: 'Node Registry',
    icon: (active: boolean) => <NetworkIcon active={active} />,
    badge: '1,284',
  },
  {
    path: '/anomalies',
    label: 'Anomalies',
    icon: (active: boolean) => <AlertIcon active={active} />,
    badge: '14',
    badgeDanger: true,
  },
] as const;

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/nodes': 'NODE REGISTRY',
  '/anomalies': 'NETWORK ANOMALIES',
};

// ── AppShell ──────────────────────────────────────────────────────────────────

const SIDEBAR_COLLAPSED = 68;
const SIDEBAR_EXPANDED  = 220;

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="as-root">
      {/* ── Sidebar ── */}
      <aside
        className="as-sidebar"
        style={{ width: expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Top: logo */}
        <div className="as-sidebar-top">
          {/* Logo — C/F collapsed, CyberFence expanded */}
          <button
            className="as-logo"
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
          >
            <span className={`as-logo-cf ${expanded ? 'as-logo-cf--hidden' : ''}`}>
              C/F
            </span>
            <span className={`as-logo-full ${expanded ? 'as-logo-full--visible' : ''}`}>
              CyberFence
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="as-divider" />

        {/* Section label */}
        {expanded && (
          <span className="as-section-label">Navigation</span>
        )}

        {/* Nav items */}
        <nav className="as-nav">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`as-nav-item ${active ? 'as-nav-item--active' : ''}`}
                title={!expanded ? item.label : undefined}
              >
                {/* Active indicator bar */}
                <span className="as-nav-indicator" style={{ opacity: active ? 1 : 0 }} />

                {/* Icon */}
                <span className="as-nav-icon">
                  {item.icon(active)}
                </span>

                {/* Label + badge — only when expanded */}
                <span
                  className="as-nav-label-wrap"
                  style={{
                    opacity: expanded ? 1 : 0,
                    width: expanded ? 'auto' : 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s ease, width 0.3s ease',
                  }}
                >
                  <span className="as-nav-label">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span
                      className="as-nav-badge"
                      style={{
                        background: 'badgeDanger' in item && item.badgeDanger
                          ? 'rgba(184,0,43,0.15)'
                          : 'rgba(0,144,255,0.1)',
                        color: 'badgeDanger' in item && item.badgeDanger ? '#ff4466' : '#0090ff',
                        border: `1px solid ${'badgeDanger' in item && item.badgeDanger ? 'rgba(184,0,43,0.3)' : 'rgba(0,144,255,0.2)'}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Divider */}
        <div className="as-divider" />

        {/* Bottom: version info when expanded */}
        {expanded && (
          <div className="as-sidebar-meta">
            <span className="as-meta-label">Optimism L2</span>
            <span className="as-meta-value">v2.4.1</span>
          </div>
        )}

        {/* Logout */}
        <button
          className="as-nav-item as-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="as-nav-indicator" style={{ opacity: 0 }} />
          <span className="as-nav-icon">
            <LogoutIcon />
          </span>
          <span
            className="as-nav-label-wrap"
            style={{
              opacity: expanded ? 1 : 0,
              width: expanded ? 'auto' : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s ease, width 0.3s ease',
            }}
          >
            <span className="as-nav-label" style={{ color: '#4a4a4a' }}>Logout</span>
          </span>
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="as-main">
        {/* Top header */}
        <header className="as-header">
          <div className="as-header-left">
            {/* Breadcrumb-style path */}
            <span className="as-breadcrumb-prefix">CyberFence /</span>
            <h1 className="as-page-title">
              {PAGE_TITLES[location.pathname] ?? ''}
            </h1>
          </div>

          <div className="as-header-right">
            {/* System status pill */}
            <div className="as-status-pill">
              <span className="as-status-dot" />
              <span>SYSTEM SECURE</span>
            </div>

            {/* Blockchain height */}
            <div className="as-chain-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-4 0v2" />
              </svg>
              <span>8,492,110</span>
            </div>

            {/* Profile */}
            <div className="as-profile">
              <div className="as-avatar">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="as-profile-info">
                <span className="as-profile-name">{profile?.full_name ?? 'Admin'}</span>
                <span className="as-profile-role">{profile?.device_id ?? 'Validator Node'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="as-content scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
