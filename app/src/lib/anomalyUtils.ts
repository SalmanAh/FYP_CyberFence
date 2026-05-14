import type { Severity, PinataAnomaly } from '@/types';

// ── Severity mapping ──────────────────────────────────────────────────────────

export const SEVERITY_MAP: Record<string, Severity> = {
  BENIGN:                    'BENIGN',
  Bot:                       'HIGH',
  DDoS:                      'CRITICAL',
  'DoS GoldenEye':           'HIGH',
  'DoS Hulk':                'CRITICAL',
  'DoS Slowhttptest':        'MEDIUM',
  'DoS slowloris':           'MEDIUM',
  'FTP-Patator':             'HIGH',
  Heartbleed:                'CRITICAL',
  Infiltration:              'CRITICAL',
  PortScan:                  'MEDIUM',
  'SSH-Patator':             'HIGH',
  'Web Attack Brute Force':  'HIGH',
  'Web Attack SQL Injection':'CRITICAL',
  'Web Attack XSS':          'HIGH',
};

export const ATTACK_COLORS: Record<string, string> = {
  BENIGN:                    '#00ff88',
  Bot:                       '#b8002b',
  DDoS:                      '#ff3366',
  'DoS GoldenEye':           '#ff6644',
  'DoS Hulk':                '#ff8844',
  'DoS Slowhttptest':        '#ffaa44',
  'DoS slowloris':           '#ffcc44',
  'FTP-Patator':             '#ff4499',
  Heartbleed:                '#ff0044',
  Infiltration:              '#cc00ff',
  PortScan:                  '#0090ff',
  'SSH-Patator':             '#ff66cc',
  'Web Attack Brute Force':  '#ff5588',
  'Web Attack SQL Injection':'#ff2233',
  'Web Attack XSS':          '#ff4466',
};

export function getSeverity(attackType: string): Severity {
  return SEVERITY_MAP[attackType] ?? 'MEDIUM';
}

export function getSeverityColor(severity: Severity | string): string {
  switch (severity) {
    case 'CRITICAL': return '#b8002b';
    case 'HIGH':     return '#ff6644';
    case 'MEDIUM':   return '#ffaa44';
    case 'LOW':      return '#ffcc44';
    case 'BENIGN':   return '#00ff88';
    default:         return '#4a4a4a';
  }
}

export function getAttackColor(attackType: string): string {
  return ATTACK_COLORS[attackType] ?? '#4a4a4a';
}

export function formatProto(proto: number): string {
  switch (proto) {
    case 6:   return 'TCP';
    case 17:  return 'UDP';
    case 1:   return 'ICMP';
    default:  return `PROTO:${proto}`;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(2)} KB`;
  return `${bytes.toFixed(0)} B`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  return `${seconds.toFixed(3)}s`;
}

// ── Sample record for UI preview (used until real Pinata data loads) ──────────

export const SAMPLE_ANOMALY: PinataAnomaly = {
  cid: 'bafybeisample000000000000000000000000000000000000000000000000',
  timestamp: 1778641423125,
  isMalicious: true,
  attackType: 'DDoS',
  confidence: 0.8999701186674594,
  flow: {
    key: { src: '192.168.1.109', dst: '8.8.8.8', src_port: 59628, dst_port: 443, proto: 6 },
    start_ts: 1778641423.123168,
    end_ts: 1778641424.8144813,
    duration: 1.691313322882862,
    total_fwd_packets: 92,
    total_bwd_packets: 1,
    total_packets: 93,
    total_len_fwd: 9633.64,
    total_len_bwd: 230.97,
    total_bytes: 9864.61,
    bytes_per_sec: 5832.51,
    pkts_per_sec: 54.99,
    avg_packet_size: 106.07,
    label: 'DDoS',
    confidence: 0.8999701186674594,
    is_attack: true,
    fwd_packet_length_max: 175.33,
    fwd_packet_length_min: 50.36,
    fwd_packet_length_mean: 104.71,
    bwd_packet_length_max: 438.45,
    bwd_packet_length_min: 110.81,
    bwd_packet_length_mean: 230.97,
    flow_iat_mean: 0.01819,
    flow_iat_std: 0.08542,
    flow_iat_max: 0.04118,
    flow_iat_min: 0.00186,
    fwd_iat_total: 1.10593,
    fwd_iat_mean: 0.01838,
    fwd_iat_std: 0.02893,
    fwd_iat_min: 0.00668,
    bwd_iat_total: 1.16614,
    bwd_iat_mean: 1.69131,
    bwd_iat_std: 0.01162,
    bwd_iat_max: 4.66646,
    bwd_iat_min: 0.34522,
    fwd_psh_flags: 0.32618,
    fwd_urg_flags: 0,
    fwd_header_length: 2922.93,
    bwd_header_length: 39.80,
    min_packet_length: 24.45,
    max_packet_length: 309.61,
    packet_length_mean: 106.07,
    packet_length_variance: 96.12,
    fin_flag_count: 0.99366,
    syn_flag_count: 1.29188,
    rst_flag_count: 0.85748,
    urg_flag_count: 0,
    ece_flag_count: 0,
    init_win_bytes_forward: 61199.36,
    init_win_bytes_backward: 60193.77,
    min_seg_size_forward: 38.93,
    active_mean: 0.33243,
    active_std: 0.11037,
    active_max: 1.35907,
    active_min: 0.18237,
    idle_std: 0.06392,
  },
};
