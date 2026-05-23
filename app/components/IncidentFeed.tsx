'use client';

import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

type Incident = {
  id: number;
  timestamp: string;
  service_name: string;
  error_message: string;
  status: string;
};

export default function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setIncidents(data.incidents || []);
      } catch (err) {}
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 2000);
    return () => clearInterval(interval);
  }, []);

  if (incidents.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-sm">
        No logs captured yet. Waiting for telemetry...
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-950 font-mono text-sm max-h-[500px] overflow-y-auto">
      {incidents.map((incident) => {
        let statusColor = 'text-slate-400';
        if (incident.status === 'Open') statusColor = 'text-rose-400';
        if (incident.status === 'Investigating') statusColor = 'text-amber-400 animate-pulse';
        if (incident.status === 'Resolved') statusColor = 'text-emerald-400';

        return (
          <div key={incident.id} className="mb-4 pb-4 border-b border-slate-800/50 last:border-0 last:mb-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Terminal className="w-3 h-3" />
                <span>{incident.timestamp}</span>
                <span className="text-slate-400 font-medium">[{incident.service_name}]</span>
              </div>
              <div className={`text-xs px-2 py-0.5 rounded border border-current ${statusColor}`}>
                {incident.status.toUpperCase()}
              </div>
            </div>
            <div className="text-slate-300 whitespace-pre-wrap pl-5 border-l-2 border-slate-800">
              {incident.error_message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
