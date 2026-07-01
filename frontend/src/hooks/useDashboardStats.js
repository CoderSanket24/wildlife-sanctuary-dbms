import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const DEFAULT_STATS = {
  active_zones:    null,
  animals_tracked: null,
  my_bookings:     null,
  health_alerts:   null,
};

/**
 * Fetches dashboard summary stats from GET /api/dashboard/stats.
 * Returns { stats, loading, error }.
 * Values are `null` while loading (so cards can show a skeleton shimmer).
 */
const useDashboardStats = () => {
  const [stats, setStats]     = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        if (!cancelled) setStats(res.data.stats);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error ?? "Failed to load stats.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
};

export default useDashboardStats;
