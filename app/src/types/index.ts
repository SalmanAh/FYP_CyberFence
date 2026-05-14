export interface NodeRecord {
  id: string;
  deviceId: string;
  walletAddress: string;
  validator: boolean;
  validatorUrl?: string | null;  // Backend URL for validator nodes
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  trustScore: number;
  registeredAt: string;
}

// ── Pinata / real anomaly shape ───────────────────────────────────────────────

export interface FlowKey {
  src: string;
  dst: string;
  src_port: number;
  dst_port: number;
  proto: number;
}

export interface FlowRecord {
  key: FlowKey;
  start_ts: number;
  end_ts: number;
  duration: number;
  total_fwd_packets: number;
  total_bwd_packets: number;
  total_packets: number;
  total_len_fwd: number;
  total_len_bwd: number;
  total_bytes: number;
  bytes_per_sec: number;
  pkts_per_sec: number;
  avg_packet_size: number;
  label: string;
  confidence: number;
  is_attack: boolean;
  fwd_packet_length_max: number;
  fwd_packet_length_min: number;
  fwd_packet_length_mean: number;
  bwd_packet_length_max: number;
  bwd_packet_length_min: number;
  bwd_packet_length_mean: number;
  flow_iat_mean: number;
  flow_iat_std: number;
  flow_iat_max: number;
  flow_iat_min: number;
  fwd_iat_total: number;
  fwd_iat_mean: number;
  fwd_iat_std: number;
  fwd_iat_min: number;
  bwd_iat_total: number;
  bwd_iat_mean: number;
  bwd_iat_std: number;
  bwd_iat_max: number;
  bwd_iat_min: number;
  fwd_psh_flags: number;
  fwd_urg_flags: number;
  fwd_header_length: number;
  bwd_header_length: number;
  min_packet_length: number;
  max_packet_length: number;
  packet_length_mean: number;
  packet_length_variance: number;
  fin_flag_count: number;
  syn_flag_count: number;
  rst_flag_count: number;
  urg_flag_count: number;
  ece_flag_count: number;
  init_win_bytes_forward: number;
  init_win_bytes_backward: number;
  min_seg_size_forward: number;
  active_mean: number;
  active_std: number;
  active_max: number;
  active_min: number;
  idle_std: number;
}

export interface PinataAnomaly {
  // Pinata adds this as the CID when fetched from a list
  cid?: string;
  timestamp: number;           // epoch ms
  flow: FlowRecord;
  isMalicious: boolean;
  attackType: string;
  confidence: number;
}

// Derived severity from attackType
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BENIGN';

// ── Legacy shape (kept for Dashboard dummy data) ──────────────────────────────

export interface AnomalyLog {
  id: string;
  timestamp: string;
  severity: Severity;
  attackType: string;
  originNode: string;
  sourceIp: string;
  destinationIp: string;
  confidence: number;
  anomalyScore: number;
  alertType: string;
  details: Record<string, unknown>;
  logPreview: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export interface AttackTypeStat {
  type: string;
  count: number;
  severity: Severity;
  color: string;
}

export interface DashboardStats {
  totalNodes: number;
  activeValidators: number;
  anomalies24h: number;
  blockchainHeight: number;
  attackTypeDistribution: AttackTypeStat[];
  recentAnomalies: AnomalyLog[];
  validatorQueue: NodeRecord[];
  recentBlockHashes: string[];
}
