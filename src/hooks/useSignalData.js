import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { MOCK_REPORTS, MOCK_SNAPSHOTS, MOCK_SNAPSHOT_AT } from "../mockData";

// Single data source for the app.
// Live path:  reports (last 30 days) + latest_signal_snapshots view.
// Fallback:   mock data, flagged with isMock so the UI can label itself honestly.
export function useSignalData() {
  const [state, setState] = useState({
    loading: true,
    isMock: true,
    reports: MOCK_REPORTS,
    snapshots: MOCK_SNAPSHOTS,
    updatedAt: MOCK_SNAPSHOT_AT,
  });

  useEffect(() => {
    if (!supabase) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const [reportsRes, snapsRes] = await Promise.all([
          supabase
            .from("reports")
            .select("id, observed_at, city, state, lat, lng, event_type, source_name, source_class, signal_level, summary, url")
            .gte("observed_at", since)
            .order("observed_at", { ascending: false })
            .limit(100),
          supabase.from("latest_signal_snapshots").select("*"),
        ]);

        if (cancelled) return;
        if (reportsRes.error || snapsRes.error) throw reportsRes.error || snapsRes.error;

        const reports = reportsRes.data ?? [];
        const snapshots = snapsRes.data ?? [];
        if (reports.length === 0 && snapshots.length === 0) {
          // Tables exist but are empty -> stay on mock so the board never looks dead.
          setState((s) => ({ ...s, loading: false }));
          return;
        }

        const updatedAt =
          snapshots.length > 0
            ? snapshots.reduce((max, s) => (s.snapshot_at > max ? s.snapshot_at : max), snapshots[0].snapshot_at)
            : reports[0].observed_at;

        setState({ loading: false, isMock: false, reports, snapshots, updatedAt });
      } catch (err) {
        console.error("Vector51 data load failed, using mock data:", err);
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
