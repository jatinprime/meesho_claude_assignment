import Header from '@/components/Header';
import MetricCards from '@/components/MetricCards';
import IncidentFeed from '@/components/IncidentFeed';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCards />
      </div>
      <div className="mt-8 border border-slate-800 rounded-xl bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Live Incident Feed
          </h2>
          <span className="text-xs text-slate-500 font-mono">auto-polling</span>
        </div>
        <IncidentFeed />
      </div>
    </main>
  );
}
