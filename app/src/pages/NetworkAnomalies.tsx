import { useState, useMemo } from 'react';
import { useToast } from '@/context/ToastContext';
import type { PinataAnomaly, Severity } from '@/types';
import {
  getSeverity, getSeverityColor, getAttackColor,
  formatProto, formatBytes, formatDuration,
} from '@/lib/anomalyUtils';
import { useAnomalies, type AnomalyListItem } from '@/hooks/use-anomalies';

// ── Small reusable components ─────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity | string }) {
  const color = getSeverityColor(severity);
  return (
    <span className="na-severity-badge" style={{
      background: severity === 'BENIGN' ? 'rgba(0,255,136,0.15)' : `${color}22`,
      color,
      border: `1px solid ${color}44`,
    }}>
      {severity}
    </span>
  );
}

function MetaCell({ label, value, mono = false, color }: {
  label: string; value: string | number; mono?: boolean; color?: string;
}) {
  return (
    <div className="na-meta-cell">
      <span className="na-meta-label">{label}</span>
      <span className="na-meta-value" style={{
        fontFamily: mono ? 'Geist Mono, monospace' : undefined,
        color: color ?? '#1a1a1a',
      }}>
        {value}
      </span>
    </div>
  );
}

function StatBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="na-stat-bar">
      <div className="na-stat-bar-header">
        <span className="na-stat-bar-label">{label}</span>
        <span className="na-stat-bar-val" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="na-stat-bar-track">
        <div className="na-stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="na-section-title">{children}</h4>;
}

// ── Inspector content (shown after full data loads) ───────────────────────────

function InspectorContent({
  full,
  onQuarantine,
  onDismiss,
}: {
  full: PinataAnomaly;
  onQuarantine: () => void;
  onDismiss: () => void;
}) {
  const sev = getSeverity(full.attackType);
  const sevColor = getSeverityColor(sev);

  return (
    <div className="na-inspector-inner">
      {/* Header */}
      <div className="na-insp-header">
        <div>
          <p className="na-insp-eyebrow">Anomaly Signature</p>
          <h3 className="na-insp-title">{full.attackType}</h3>
          <p className="na-insp-ts">{new Date(full.timestamp).toLocaleString()}</p>
        </div>
        <div className="na-insp-icon" style={{ background: `${sevColor}18` }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={sevColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
      </div>

      {/* KPIs */}
      <div className="na-kpi-row">
        <div className="na-kpi">
          <span className="na-kpi-label">Confidence</span>
          <span className="na-kpi-value" style={{ color: '#0090ff' }}>
            {(full.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="na-kpi">
          <span className="na-kpi-label">Severity</span>
          <span className="na-kpi-value" style={{ color: sevColor }}>{sev}</span>
        </div>
        <div className="na-kpi">
          <span className="na-kpi-label">Duration</span>
          <span className="na-kpi-value">{formatDuration(full.flow.duration)}</span>
        </div>
        <div className="na-kpi">
          <span className="na-kpi-label">Protocol</span>
          <span className="na-kpi-value">{formatProto(full.flow.key.proto)}</span>
        </div>
      </div>

      {/* IPFS CID */}
      {full.cid && (
        <div className="na-cid-row">
          <span className="na-cid-label">IPFS CID</span>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${full.cid}`}
            target="_blank" rel="noopener noreferrer"
            className="na-cid-value"
          >
            {full.cid}
          </a>
        </div>
      )}

      <SectionTitle>Flow Identity</SectionTitle>
      <div className="na-meta-grid na-meta-grid--2">
        <MetaCell label="Source IP"        value={full.flow.key.src}      mono />
        <MetaCell label="Destination IP"   value={full.flow.key.dst}      mono />
        <MetaCell label="Source Port"      value={full.flow.key.src_port} mono />
        <MetaCell label="Destination Port" value={full.flow.key.dst_port} mono />
      </div>

      <SectionTitle>Traffic Volume</SectionTitle>
      <div className="na-meta-grid na-meta-grid--3">
        <MetaCell label="Total Packets" value={full.flow.total_packets} />
        <MetaCell label="Fwd Packets"   value={full.flow.total_fwd_packets} />
        <MetaCell label="Bwd Packets"   value={full.flow.total_bwd_packets} />
        <MetaCell label="Total Bytes"   value={formatBytes(full.flow.total_bytes)}   mono />
        <MetaCell label="Bytes/sec"     value={formatBytes(full.flow.bytes_per_sec)} mono color="#0090ff" />
        <MetaCell label="Pkts/sec"      value={full.flow.pkts_per_sec.toFixed(2)}    mono color="#0090ff" />
      </div>

      <SectionTitle>Packet Length</SectionTitle>
      <div className="na-bars">
        <StatBar label="Avg Packet Size" value={full.flow.avg_packet_size}        max={1500} color="#0090ff" />
        <StatBar label="Fwd Max Length"  value={full.flow.fwd_packet_length_max}  max={1500} color="#00ff88" />
        <StatBar label="Fwd Min Length"  value={full.flow.fwd_packet_length_min}  max={1500} color="#00ff88" />
        <StatBar label="Bwd Max Length"  value={full.flow.bwd_packet_length_max}  max={1500} color="#ffaa44" />
        <StatBar label="Pkt Length Var"  value={full.flow.packet_length_variance} max={500}  color="#ff6644" />
      </div>

      <SectionTitle>Flow Timing (IAT)</SectionTitle>
      <div className="na-meta-grid na-meta-grid--2">
        <MetaCell label="IAT Mean"      value={full.flow.flow_iat_mean.toFixed(5)} mono />
        <MetaCell label="IAT Std"       value={full.flow.flow_iat_std.toFixed(5)}  mono />
        <MetaCell label="IAT Max"       value={full.flow.flow_iat_max.toFixed(5)}  mono />
        <MetaCell label="IAT Min"       value={full.flow.flow_iat_min.toFixed(5)}  mono />
        <MetaCell label="Fwd IAT Total" value={full.flow.fwd_iat_total.toFixed(5)} mono />
        <MetaCell label="Bwd IAT Total" value={full.flow.bwd_iat_total.toFixed(5)} mono />
      </div>

      <SectionTitle>TCP Flags</SectionTitle>
      <div className="na-flags">
        {[
          { label: 'SYN', value: full.flow.syn_flag_count, color: '#ff3366' },
          { label: 'FIN', value: full.flow.fin_flag_count, color: '#ffaa44' },
          { label: 'RST', value: full.flow.rst_flag_count, color: '#ff6644' },
          { label: 'PSH', value: full.flow.fwd_psh_flags,  color: '#0090ff' },
          { label: 'URG', value: full.flow.urg_flag_count, color: '#cc00ff' },
          { label: 'ECE', value: full.flow.ece_flag_count, color: '#9a9a9a' },
        ].map((f) => (
          <div key={f.label} className="na-flag-chip"
            style={{ borderColor: f.value > 0 ? `${f.color}55` : 'rgba(0,0,0,0.08)' }}>
            <span className="na-flag-label">{f.label}</span>
            <span className="na-flag-val" style={{ color: f.value > 0 ? f.color : '#999999' }}>
              {f.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <SectionTitle>Window & Segment</SectionTitle>
      <div className="na-meta-grid na-meta-grid--2">
        <MetaCell label="Init Win Fwd"   value={full.flow.init_win_bytes_forward.toFixed(0)}  mono />
        <MetaCell label="Init Win Bwd"   value={full.flow.init_win_bytes_backward.toFixed(0)} mono />
        <MetaCell label="Min Seg Fwd"    value={full.flow.min_seg_size_forward.toFixed(2)}    mono />
        <MetaCell label="Fwd Header Len" value={full.flow.fwd_header_length.toFixed(2)}       mono />
      </div>

      <SectionTitle>Active / Idle</SectionTitle>
      <div className="na-meta-grid na-meta-grid--2">
        <MetaCell label="Active Mean" value={full.flow.active_mean.toFixed(4)} mono />
        <MetaCell label="Active Std"  value={full.flow.active_std.toFixed(4)}  mono />
        <MetaCell label="Active Max"  value={full.flow.active_max.toFixed(4)}  mono />
        <MetaCell label="Idle Std"    value={full.flow.idle_std.toFixed(4)}    mono />
      </div>

      <div className="na-actions">
        <button onClick={onQuarantine} className="na-btn-quarantine">Quarantine Source</button>
        <button onClick={onDismiss}    className="na-btn-dismiss">Dismiss</button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NetworkAnomalies() {
  const { showToast } = useToast();
  const {
    items, total, loading, error,
    page, totalPages, goToPage, refresh,
    fetchFull, fetchingCid,
  } = useAnomalies();

  const [selectedCid,    setSelectedCid]    = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter,     setTypeFilter]     = useState('All');
  const [searchTerm,     setSearchTerm]     = useState('');

  // Derive selected item from items array — always up to date when .full is cached
  const selectedItem = items.find((i) => i.cid === selectedCid) ?? null;
  const severities  = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BENIGN'];
  const attackTypes = ['All', ...Array.from(new Set(items.map((i) => i.attackType))).sort()];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const sev = getSeverity(item.attackType);
      if (severityFilter !== 'All' && sev !== severityFilter) return false;
      if (typeFilter !== 'All' && item.attackType !== typeFilter) return false;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        return item.attackType.toLowerCase().includes(t);
      }
      return true;
    });
  }, [items, severityFilter, typeFilter, searchTerm]);

  const attackDist = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((i) => { counts[i.attackType] = (counts[i.attackType] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, color: getAttackColor(type) }));
  }, [items]);

  const handleSelect = async (item: AnomalyListItem) => {
    setSelectedCid(item.cid);
    if (!item.full) await fetchFull(item);
  };

  const handleQuarantine = () => {
    if (!selectedItem?.full) return;
    showToast(`Node ${selectedItem.full.flow.key.src} quarantined. Firewall rules applied.`, 'error');
  };

  const handleDismiss = () => {
    showToast('Alert dismissed and logged.', 'info');
    setSelectedCid(null);
  };

  return (
    <div className="na-root">

      {/* ── Filter bar ── */}
      <div className="na-filter-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search attack type..."
          className="input-cyber na-search"
        />
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="na-select">
          {severities.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="na-select">
          {attackTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="na-count-pill">
          <span>{loading ? '…' : filtered.length}</span> / <span>{total}</span> total
        </div>
        <button onClick={refresh} className="na-refresh-btn" title="Refresh" disabled={loading}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: loading ? 'na-spin 0.8s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {/* ── Distribution strip ── */}
      {!loading && attackDist.length > 0 && (
        <div className="na-dist-strip">
          <span className="na-dist-label">Distribution</span>
          {attackDist.map((ad) => (
            <div key={ad.type} className="na-dist-item">
              <div className="na-dist-dot" style={{ background: ad.color }} />
              <span className="na-dist-type">{ad.type}</span>
              <span className="na-dist-count" style={{ color: ad.color }}>{ad.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="na-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b8002b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={refresh} className="na-error-retry">Retry</button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="na-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="na-skeleton" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      )}

      {/* ── Split pane ── */}
      {!loading && !error && (
        <div className="na-split">

          {/* Left — feed */}
          <div className="na-feed">
            {filtered.length === 0 ? (
              <div className="na-empty">No anomalies match your filters</div>
            ) : (
              filtered.map((item) => {
                const sev      = getSeverity(item.attackType);
                const sevColor = getSeverityColor(sev);
                const isActive = selectedCid === item.cid;
                return (
                  <button
                    key={item.cid}
                    onClick={() => handleSelect(item)}
                    className={`na-feed-card ${isActive ? 'na-feed-card--active' : ''}`}
                  >
                    <div className="na-feed-top">
                      <span className="na-feed-time">
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleTimeString()
                          : new Date(item.datePinned).toLocaleTimeString()}
                      </span>
                      <SeverityBadge severity={sev} />
                    </div>
                    <div className="na-feed-mid">
                      <span className="na-feed-attack" style={{ color: sevColor }}>
                        {item.attackType}
                      </span>
                      <span className="na-feed-flow">
                        {new Date(item.datePinned).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="na-feed-stats">
                      <span className="na-feed-stat">
                        <span className="na-feed-stat-label">CID</span>
                        <span className="na-feed-stat-val" style={{ color: '#999999' }}>
                          {item.cid.slice(0, 10)}…
                        </span>
                      </span>
                      {isActive && fetchingCid === item.cid && (
                        <span className="na-feed-stat">
                          <span className="na-feed-stat-val" style={{ color: '#0090ff' }}>
                            Loading…
                          </span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="na-pagination">
                <button className="na-page-btn" onClick={() => goToPage(page - 1)} disabled={page === 0}>
                  ← Prev
                </button>
                <span className="na-page-info">Page {page + 1} / {totalPages}</span>
                <button className="na-page-btn" onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1}>
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Right — forensic inspector */}
          <div className="na-inspector">
            {selectedItem ? (
              selectedItem.full ? (
                <InspectorContent
                  full={selectedItem.full}
                  onQuarantine={handleQuarantine}
                  onDismiss={handleDismiss}
                />
              ) : (
                /* Loading full content */
                <div className="na-inspector-empty">
                  <div className="na-insp-spinner" />
                  <p>Fetching anomaly data from IPFS…</p>
                </div>
              )
            ) : (
              <div className="na-inspector-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cccccc"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>Select an anomaly to inspect</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
