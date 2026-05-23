'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, HeartPulse } from 'lucide-react';

export default function MetricCards() {
  const [metrics, setMetrics] = useState({ active: 0, resolved: 0, health: 'Loading...' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setMetrics({
          active: data.activeCount || 0,
          resolved: data.resolvedCount || 0,
          health: data.health || 'Unknown'
        });
      } catch (err) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertCircle className="w-16 h-16 text-rose-500" />
        </div>
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Active Incidents</h3>
        <div className="text-4xl font-bold text-rose-400">{metrics.active}</div>
        <div className="mt-4 text-xs text-slate-500 font-mono">Requires Resolution</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CheckCircle2 className="w-16 h-16 text-cyan-500" />
        </div>
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Resolved by Claude</h3>
        <div className="text-4xl font-bold text-cyan-400">{metrics.resolved}</div>
        <div className="mt-4 text-xs text-slate-500 font-mono">Autonomous Fixes</div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <HeartPulse className="w-16 h-16 text-emerald-500" />
        </div>
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">System Health</h3>
        <div className={`text-3xl font-bold ${metrics.health === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {metrics.health}
        </div>
        <div className="mt-4 text-xs text-slate-500 font-mono">MCP Polling Status</div>
      </div>
    </>
  );
}
