import { useState, useEffect, useCallback } from 'react';
import type { PinataAnomaly } from '@/types';
import { fetchPinList, fetchAnomalyByCid, type PinRow } from '@/lib/pinata';
import { getSeverity } from '@/lib/anomalyUtils';

const PAGE_SIZE = 50;

// Lightweight list item derived from pin metadata — no content fetch needed
export interface AnomalyListItem {
  cid: string;
  timestamp: number;
  attackType: string;
  datePinned: string;
  // Full content loaded on demand
  full?: PinataAnomaly;
}

interface UseAnomaliesReturn {
  items: AnomalyListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  goToPage: (p: number) => void;
  refresh: () => void;
  // Fetch full content for a selected item
  fetchFull: (item: AnomalyListItem) => Promise<PinataAnomaly | null>;
  fetchingCid: string | null;
}

function rowToListItem(row: PinRow): AnomalyListItem {
  return {
    cid:        row.ipfs_pin_hash,
    timestamp:  Number(row.metadata.keyvalues.timestamp ?? 0),
    attackType: row.metadata.keyvalues.attack_type ?? 'Unknown',
    datePinned: row.date_pinned,
  };
}

export function useAnomalies(): UseAnomaliesReturn {
  const [items,       setItems]       = useState<AnomalyListItem[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [page,        setPage]        = useState(0);
  const [fetchingCid, setFetchingCid] = useState<string | null>(null);

  const load = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const { rows, count } = await fetchPinList(PAGE_SIZE, pageIndex * PAGE_SIZE);
      // Sort newest first by timestamp in metadata
      const sorted = rows
        .map(rowToListItem)
        .sort((a, b) => b.timestamp - a.timestamp);
      setItems(sorted);
      setTotal(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch anomaly list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    setItems([]);
  }, []);

  const refresh = useCallback(() => load(page), [load, page]);

  // Fetch full JSON only when user clicks a record
  const fetchFull = useCallback(async (item: AnomalyListItem): Promise<PinataAnomaly | null> => {
    // Return cached version if already fetched
    if (item.full) return item.full;

    setFetchingCid(item.cid);
    try {
      const full = await fetchAnomalyByCid(item.cid);
      // Cache it back into the list
      setItems((prev) =>
        prev.map((i) => i.cid === item.cid ? { ...i, full } : i)
      );
      return full;
    } catch (err) {
      console.error('Failed to fetch anomaly content:', err);
      return null;
    } finally {
      setFetchingCid(null);
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { items, total, loading, error, page, totalPages, goToPage, refresh, fetchFull, fetchingCid };
}

// Re-export getSeverity so the page can use it without extra imports
export { getSeverity };
