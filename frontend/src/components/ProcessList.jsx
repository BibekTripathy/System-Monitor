import { useEffect, useState } from 'react';
import { processAPI } from '../services/api';

export default function ProcessList({ compact = false }) {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const data = await processAPI.getProcesses(compact ? 15 : 50);
        if (active) { setProcesses(data); setError(null); }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { active = false; clearInterval(id); };
  }, [compact]);

  const handleKill = async (pid) => {
    if (!window.confirm(`Kill process ${pid}?`)) return;
    try {
      await processAPI.killProcess(pid);
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-red-400 text-sm">
        Failed to load processes: {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {compact ? 'Top Processes' : 'All Processes'}
        </h2>
        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
          {processes.length} shown
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-700/40">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading…</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/60 sticky top-0">
              <tr>
                <th className="px-4 py-2.5">PID</th>
                <th className="px-4 py-2.5">Name</th>
                {!compact && <th className="px-4 py-2.5">User</th>}
                <th className="px-4 py-2.5 text-right">CPU %</th>
                <th className="px-4 py-2.5 text-right">Mem %</th>
                {!compact && <th className="px-4 py-2.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {processes.map((p) => (
                <tr key={p.pid} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="px-4 py-2 font-mono text-xs text-slate-400">{p.pid}</td>
                  <td className="px-4 py-2 text-slate-200 truncate max-w-[180px]" title={p.name}>
                    {p.name}
                  </td>
                  {!compact && <td className="px-4 py-2 text-slate-500">{p.username || '—'}</td>}
                  <td className="px-4 py-2 text-right font-mono text-cyan-400">
                    {(p.cpu_percent ?? 0).toFixed(1)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-400">
                    {(p.memory_percent ?? 0).toFixed(1)}
                  </td>
                  {!compact && (
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleKill(p.pid)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                      >
                        Kill
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
