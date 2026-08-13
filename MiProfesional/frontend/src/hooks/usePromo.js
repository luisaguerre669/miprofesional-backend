import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

const POLL_INTERVAL = 10000; // 10 seconds

export function usePromo() {
  const [status, setStatus] = useState({ total: 700, used: 0, remaining: 700, active: true, loading: true });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/promo/status');
      if (res.data?.success && res.data?.data) {
        setStatus({ ...res.data.data, loading: false });
      }
    } catch {
      // Silently fail, keep last known state
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return status;
}
