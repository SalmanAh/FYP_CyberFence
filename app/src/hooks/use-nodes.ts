import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface NodeRow {
  id: string;
  device_id: string;
  wallet_address: string;
  is_validator: boolean;
  validator_url?: string | null;
  status: 'online' | 'offline' | 'syncing';
  trust_score: number;
  registered_at: string;
  last_sync: string;
}

interface UseNodesReturn {
  nodes: NodeRow[];
  loading: boolean;
  error: string | null;
  toggleValidator: (id: string, current: boolean, deviceId: string) => Promise<void>;
  updateValidatorUrl: (id: string, url: string) => Promise<void>;
  refresh: () => void;
}

export function useNodes(): UseNodesReturn {
  const [nodes,   setNodes]   = useState<NodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('nodes')
      .select('*')
      .order('registered_at', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setNodes((data as NodeRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleValidator = useCallback(async (
    id: string,
    current: boolean,
    _deviceId: string
  ) => {
    // Optimistic update
    setNodes((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_validator: !current } : n)
    );

    const { error: err } = await supabase
      .from('nodes')
      .update({ is_validator: !current })
      .eq('id', id);

    if (err) {
      // Revert on failure
      setNodes((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_validator: current } : n)
      );
      throw new Error(err.message);
    }
  }, []);

  const updateValidatorUrl = useCallback(async (id: string, url: string) => {
    // Optimistic update
    const trimmedUrl = url.trim();
    setNodes((prev) =>
      prev.map((n) => n.id === id ? { ...n, validator_url: trimmedUrl || null } : n)
    );

    const { error: err } = await supabase
      .from('nodes')
      .update({ validator_url: trimmedUrl || null })
      .eq('id', id);

    if (err) {
      // Revert on failure
      await load();
      throw new Error(err.message);
    }
  }, [load]);

  return { nodes, loading, error, toggleValidator, updateValidatorUrl, refresh: load };
}
