'use client';

import { Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [timeString, setTimeString] = useState<string>('--:--:--');

  useEffect(() => {
    setTimeString(new Date().toLocaleTimeString('en-US', { hour12: false }));
    const interval = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400" />
          Project Sentinel
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Autonomous Incident Resolution Engine</p>
      </div>
      <div className="flex items-center gap-4 text-sm bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
        <div className="flex flex-col items-end">
          <span className="text-slate-500 font-mono text-xs uppercase tracking-wider">System Time</span>
          <span className="text-slate-200 font-mono">{timeString} UTC</span>
        </div>
        <div className="h-8 w-px bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-medium">Online</span>
        </div>
      </div>
    </header>
  );
}
