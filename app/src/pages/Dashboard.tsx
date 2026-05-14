import { useNavigate } from 'react-router';
import { useToast } from '@/context/ToastContext';
import BlockchainCanvas from '@/components/BlockchainCanvas';
import { dashboardStats, nodesData, anomaliesData } from '@/data/dummy';
import { useState } from 'react';

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8002b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [nodeList, setNodeList] = useState(nodesData);
  const [anomalies] = useState(anomaliesData);

  const stats = [
    { icon: <ShieldIcon />, label: 'Total Nodes', value: dashboardStats.totalNodes.toLocaleString() },
    { icon: <CheckCircleIcon />, label: 'Active Validators', value: dashboardStats.activeValidators.toLocaleString() },
    { icon: <AlertTriangleIcon />, label: 'Anomalies (24h)', value: dashboardStats.anomalies24h.toString(), red: true },
    { icon: <LinkIcon />, label: 'Blockchain Height', value: dashboardStats.blockchainHeight.toLocaleString() },
  ];

  const handleApproveValidator = (nodeId: string) => {
    setNodeList((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, validator: true } : n))
    );
    showToast(`Node ${nodeId} approved as validator`, 'success');
  };

  const pendingValidations = nodeList.filter((n) => !n.validator && n.status === 'online');

  const attackTypeDist = [
    { type: 'BENIGN', count: 4, color: '#00ff88' },
    { type: 'DDoS', count: 1, color: '#ff3366' },
    { type: 'DoS Hulk', count: 1, color: '#ff8844' },
    { type: 'DoS GoldenEye', count: 1, color: '#ff6644' },
    { type: 'DoS slowloris', count: 1, color: '#ffcc44' },
    { type: 'DoS Slowhttptest', count: 1, color: '#ffaa44' },
    { type: 'PortScan', count: 1, color: '#0090ff' },
    { type: 'FTP-Patator', count: 1, color: '#ff4499' },
    { type: 'SSH-Patator', count: 1, color: '#ff66cc' },
    { type: 'Heartbleed', count: 1, color: '#ff0044' },
    { type: 'Infiltration', count: 1, color: '#cc00ff' },
    { type: 'Bot', count: 1, color: '#ff4466' },
    { type: 'Web Attack SQL Injection', count: 1, color: '#ff2233' },
    { type: 'Web Attack Brute Force', count: 1, color: '#ff5588' },
    { type: 'Web Attack XSS', count: 1, color: '#ff4466' },
  ];

  const maxAttackCount = Math.max(...attackTypeDist.map((a) => a.count));

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="p-6"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '2px',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              {s.icon}
              <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                {s.label}
              </span>
            </div>
            <div className={`font-display text-4xl ${s.red ? 'text-[#b8002b]' : 'text-[#1a1a1a]'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Validator Distribution + Sidebar */}
      <div className="grid grid-cols-5 gap-6">
        {/* Topology Map */}
        <div
          className="col-span-3 relative overflow-hidden"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '2px',
            minHeight: '360px',
          }}
        >
          <BlockchainCanvas />
          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Validator Topology Map
            </h3>
          </div>
          <div className="absolute bottom-4 right-4 z-10 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#0090ff' }} />
              <span className="text-[#666666]">Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#b8002b' }} />
              <span className="text-[#666666]">Anomaly</span>
            </div>
          </div>
        </div>

        {/* Right Panel Stack */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Pending Validations */}
          <div
            className="p-5 flex-1"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '2px',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-4">
              Pending Validations
            </h3>
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto scrollbar-thin">
              {pendingValidations.length === 0 ? (
                <p className="text-[#999999] text-xs">No pending validations</p>
              ) : (
                pendingValidations.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between py-2 px-3"
                    style={{ background: '#f5f5f5', borderRadius: '2px' }}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-[#0090ff]">{node.deviceId}</span>
                      <span className="text-[10px] text-[#999999]">{node.walletAddress.slice(0, 18)}...</span>
                    </div>
                    <button
                      onClick={() => handleApproveValidator(node.id)}
                      className="px-3 py-1 text-[10px] font-bold uppercase bg-[#1a1a1a] text-white hover:bg-[#0090ff] hover:text-white transition-all"
                      style={{ borderRadius: '2px' }}
                    >
                      Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Block Hashes */}
          <div
            className="p-5 flex-1"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '2px',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-4">
              Recent Block Hashes
            </h3>
            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
              {dashboardStats.recentBlockHashes.map((hash, i) => (
                <div key={i} className="font-mono text-xs text-[#0090ff] truncate">
                  {hash.slice(0, 28)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attack Type Distribution */}
      <div
        className="p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '2px',
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-4">
          Attack Type Distribution (CICIDS2017)
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {attackTypeDist.map((at) => (
            <div
              key={at.type}
              className="flex flex-col gap-1 p-3"
              style={{ background: '#f5f5f5', borderRadius: '2px' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#666666] uppercase truncate">{at.type}</span>
                <span className="text-xs font-mono font-bold" style={{ color: at.color }}>{at.count}</span>
              </div>
              <div className="h-1 w-full" style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '1px' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(at.count / maxAttackCount) * 100}%`,
                    background: at.color,
                    borderRadius: '1px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Registry Table */}
      <div
        className="p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '2px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Node Registry
          </h3>
          <button
            onClick={() => navigate('/nodes')}
            className="text-xs font-bold text-[#0090ff] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Node ID</th>
                <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Status</th>
                <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Wallet Address</th>
                <th className="text-xs font-bold uppercase text-[#666666] pb-3 pr-4">Trust Score</th>
                <th className="text-xs font-bold uppercase text-[#666666] pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodeList.slice(0, 6).map((node) => (
                <tr
                  key={node.id}
                  className="transition-all duration-150 hover:translate-y-[-1px]"
                  style={{
                    height: '56px',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <td className="pr-4">
                    <span className="font-mono text-xs text-[#0090ff]">{node.deviceId}</span>
                  </td>
                  <td className="pr-4">
                    {node.validator ? (
                      <span className="status-pill-validator">Validator</span>
                    ) : node.status === 'online' ? (
                      <span className="status-pill-active">Online</span>
                    ) : (
                      <span className="status-pill-offline">Offline</span>
                    )}
                  </td>
                  <td className="pr-4">
                    <span className="font-mono text-xs text-[#666666]">
                      {node.walletAddress.slice(0, 16)}...{node.walletAddress.slice(-4)}
                    </span>
                  </td>
                  <td className="pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16" style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '1px' }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${node.trustScore}%`,
                            background: node.trustScore >= 90 ? '#0090ff' : node.trustScore >= 70 ? '#ffaa44' : '#b8002b',
                            borderRadius: '1px',
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#666666]">{node.trustScore}%</span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate('/nodes')}
                      className="text-xs font-bold text-[#1a1a1a] hover:text-[#0090ff] transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Anomalies */}
      <div
        className="p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '2px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Recent Anomalies
          </h3>
          <button
            onClick={() => navigate('/anomalies')}
            className="text-xs font-bold text-[#0090ff] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {anomalies.slice(0, 4).map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex items-center justify-between py-3 px-4 cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{
                background: '#f5f5f5',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '2px',
              }}
              onClick={() => navigate('/anomalies')}
            >
              <div className="flex items-center gap-4">
                <span
                  className="px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    background: anomaly.severity === 'CRITICAL' ? '#b8002b'
                      : anomaly.severity === 'HIGH' ? '#ff6644'
                      : anomaly.severity === 'MEDIUM' ? '#ffaa44'
                      : anomaly.severity === 'LOW' ? '#ffcc44'
                      : 'rgba(0,200,100,0.2)',
                    color: anomaly.severity === 'BENIGN' ? '#00aa55' : '#ffffff',
                    borderRadius: '2px',
                  }}
                >
                  {anomaly.severity}
                </span>
                <span className="text-sm font-bold text-[#1a1a1a]">{anomaly.attackType}</span>
                <span className="font-mono text-xs text-[#666666]">{anomaly.originNode}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#999999]">
                  Score: <span className="text-[#666666]">{anomaly.anomalyScore.toFixed(2)}</span>
                </span>
                <span className="font-mono text-xs text-[#0090ff]">
                  {(anomaly.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
