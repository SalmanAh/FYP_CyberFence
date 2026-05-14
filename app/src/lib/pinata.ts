import type { PinataAnomaly } from '@/types';

const JWT = import.meta.env.VITE_PINATA_JWT as string;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PinRow {
  ipfs_pin_hash: string;
  size: number;
  date_pinned: string;
  metadata: {
    name: string;
    keyvalues: {
      type?: string;
      timestamp?: string;
      attack_type?: string;
    };
  };
}

interface PinListResponse {
  count: number;
  rows: PinRow[];
}

// ── Fetch pin list (metadata only — no CORS issues, no content fetch) ─────────

export async function fetchPinList(
  pageLimit = 50,
  pageOffset = 0
): Promise<{ rows: PinRow[]; count: number }> {
  const params = new URLSearchParams({
    status:     'pinned',
    pageLimit:  String(pageLimit),
    pageOffset: String(pageOffset),
    'metadata[keyvalues][type][value]': 'malicious_traffic',
    'metadata[keyvalues][type][op]':    'eq',
  });

  const res = await fetch(
    `https://api.pinata.cloud/data/pinList?${params.toString()}`,
    { headers: { Authorization: `Bearer ${JWT}` } }
  );

  if (!res.ok) throw new Error(`Pinata pinList failed: ${res.status} ${res.statusText}`);

  const data: PinListResponse = await res.json();
  return { rows: data.rows, count: data.count };
}

// ── Fetch a single file's full JSON — no auth header, files are public IPFS ──

export async function fetchAnomalyByCid(cid: string): Promise<PinataAnomaly> {
  // Public IPFS gateway — do NOT send Authorization header (CORS blocks it)
  const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);

  if (!res.ok) throw new Error(`IPFS fetch failed for ${cid}: ${res.status}`);

  const data: PinataAnomaly = await res.json();
  return { ...data, cid };
}
