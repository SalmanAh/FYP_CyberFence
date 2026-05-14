import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { useNodes } from '@/hooks/use-nodes';

type Filter = 'all' | 'validator' | 'online' | 'offline';

export default function Nodes() {
  const { showToast } = useToast();
  const { nodes, loading, error, toggleValidator, updateValidatorUrl, refresh } = useNodes();
  const [filter, setFilter] = useState<Filter>('all');
  const [editingUrlNodeId, setEditingUrlNodeId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const filtered = nodes.filter((n) => {
    if (filter === 'validator') return n.is_validator;
    if (filter === 'online')    return n.status === 'online';
    if (filter === 'offline')   return n.status === 'offline';
    return true;
  });

  const counts = {
    all:       nodes.length,
    validator: nodes.filter((n) => n.is_validator).length,
    online:    nodes.filter((n) => n.status === 'online').length,
    offline:   nodes.filter((n) => n.status === 'offline').length,
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all',       label: 'All Nodes'  },
    { key: 'validator', label: 'Validators' },
    { key: 'online',    label: 'Online'     },
    { key: 'offline',   label: 'Offline'    },
  ];

  const handleToggle = async (id: string, current: boolean, deviceId: string) => {
    try {
      await toggleValidator(id, current, deviceId);
      showToast(
        `${deviceId} ${!current ? 'promoted to' : 'removed from'} validator`,
        !current ? 'success' : 'info'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const handleEditUrl = (nodeId: string, currentUrl: string | null | undefined) => {
    setEditingUrlNodeId(nodeId);
    setUrlInput(currentUrl || '');
  };

  const handleSaveUrl = async () => {
    if (!editingUrlNodeId) return;
    try {
      await updateValidatorUrl(editingUrlNodeId, urlInput);
      showToast('Validator URL updated successfully', 'success');
      setEditingUrlNodeId(null);
      setUrlInput('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          {filters.map((f) => (
            <div key={f.key} className="nodes-skeleton" style={{ width: 120, height: 36 }} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="nodes-skeleton" style={{ height: 88 }} />
          ))}
        </div>
        <div className="nodes-skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="nodes-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8002b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{error}</span>
        <button onClick={refresh} className="nodes-error-retry">Retry</button>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              filter === f.key
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white text-[#666666] hover:text-[#1a1a1a] border border-[rgba(0,0,0,0.1)]'
            }`}
            style={{ borderRadius: '2px' }}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}

        {/* Refresh */}
        <button
          onClick={refresh}
          className="ml-auto p-2 text-[#999999] hover:text-[#666666] transition-colors"
          title="Refresh"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="p-5" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}>
          <div className="text-xs font-bold uppercase text-[#666666] mb-2">Total Nodes</div>
          <div className="font-display text-3xl text-[#1a1a1a]">{counts.all}</div>
        </div>
        <div className="p-5" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}>
          <div className="text-xs font-bold uppercase text-[#666666] mb-2">Validators</div>
          <div className="font-display text-3xl text-[#0090ff]">{counts.validator}</div>
        </div>
        <div className="p-5" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}>
          <div className="text-xs font-bold uppercase text-[#666666] mb-2">Online</div>
          <div className="font-display text-3xl text-[#00aa55]">{counts.online}</div>
        </div>
        <div className="p-5" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}>
          <div className="text-xs font-bold uppercase text-[#666666] mb-2">Offline</div>
          <div className="font-display text-3xl text-[#b8002b]">{counts.offline}</div>
        </div>
      </div>

      {/* Nodes table */}
      <div
        className="p-6"
        style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Registered Nodes
          </h3>
          <span className="font-mono text-xs text-[#999999]">
            {filtered.length} / {nodes.length} shown
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-xs text-[#999999] py-8 text-center">No nodes match this filter</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Device ID</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Wallet Address</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Status</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Validator</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Validator URL</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Trust Score</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Last Sync</th>
                  <th className="text-xs font-bold uppercase text-[#666666] pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((node) => (
                  <tr
                    key={node.id}
                    className="transition-all duration-150 hover:translate-y-[-1px]"
                    style={{ height: '64px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                  >
                    {/* Device ID */}
                    <td className="pr-4">
                      <span className="font-mono text-xs text-[#0090ff]">{node.device_id}</span>
                    </td>

                    {/* Wallet */}
                    <td className="pr-4">
                      <span className="font-mono text-xs text-[#666666]">
                        {node.wallet_address.slice(0, 10)}…{node.wallet_address.slice(-6)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="pr-4">
                      {node.status === 'online' ? (
                        <span className="status-pill-active">Online</span>
                      ) : node.status === 'syncing' ? (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-sm"
                          style={{ background: 'rgba(255,170,68,0.15)', color: '#cc8800', border: '1px solid rgba(255,170,68,0.4)' }}>
                          Syncing
                        </span>
                      ) : (
                        <span className="status-pill-offline">Offline</span>
                      )}
                    </td>

                    {/* Validator */}
                    <td className="pr-4">
                      {node.is_validator
                        ? <span className="status-pill-validator">Yes</span>
                        : <span className="text-xs text-[#999999]">No</span>
                      }
                    </td>

                    {/* Validator URL */}
                    <td className="pr-4">
                      {node.is_validator ? (
                        <div className="flex items-center gap-2">
                          {node.validator_url ? (
                            <>
                              <a 
                                href={node.validator_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-[#0090ff] hover:underline"
                                title={node.validator_url}
                              >
                                {node.validator_url.length > 20 
                                  ? `${node.validator_url.slice(0, 20)}...` 
                                  : node.validator_url}
                              </a>
                              <button
                                onClick={() => handleEditUrl(node.id, node.validator_url)}
                                className="text-[#666666] hover:text-[#0090ff] transition-colors"
                                title="Edit URL"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditUrl(node.id, node.validator_url)}
                              className="text-xs text-[#0090ff] hover:underline font-medium"
                            >
                              + Add URL
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#cccccc]">—</span>
                      )}
                    </td>

                    {/* Trust score */}
                    <td className="pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20" style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '1px' }}>
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${node.trust_score}%`,
                              background: node.trust_score >= 90 ? '#0090ff' : node.trust_score >= 70 ? '#ffaa44' : '#b8002b',
                              borderRadius: '1px',
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#666666] font-mono">{node.trust_score}%</span>
                      </div>
                    </td>

                    {/* Last sync */}
                    <td className="pr-4">
                      <span className="text-xs text-[#666666]">
                        {new Date(node.last_sync).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        onClick={() => handleToggle(node.id, node.is_validator, node.device_id)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                          node.is_validator
                            ? 'bg-transparent border border-[#b8002b] text-[#b8002b] hover:bg-[#b8002b] hover:text-white'
                            : 'bg-[#1a1a1a] text-white hover:bg-[#0090ff] hover:text-white'
                        }`}
                        style={{ borderRadius: '2px' }}
                      >
                        {node.is_validator ? 'Revoke' : 'Make Validator'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* URL Edit Modal */}
      {editingUrlNodeId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingUrlNodeId(null)}
        >
          <div 
            className="bg-white p-6 rounded-sm border border-[rgba(0,0,0,0.1)] max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Edit Validator URL</h3>
            <p className="text-sm text-[#666666] mb-4">
              Enter the backend URL where this validator node can receive requests from the Python backend.
            </p>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://validator-node.example.com:8000"
              className="w-full px-4 py-2 border border-[rgba(0,0,0,0.1)] rounded-sm text-sm font-mono focus:outline-none focus:border-[#0090ff] focus:ring-1 focus:ring-[#0090ff]"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveUrl}
                className="flex-1 px-4 py-2 bg-[#0090ff] text-white text-sm font-bold uppercase rounded-sm hover:bg-[#0070cc] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingUrlNodeId(null);
                  setUrlInput('');
                }}
                className="flex-1 px-4 py-2 bg-[#f5f5f5] text-[#666666] text-sm font-bold uppercase rounded-sm hover:bg-[#e5e5e5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
