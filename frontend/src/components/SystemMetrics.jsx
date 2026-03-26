import { useEffect, useState } from 'react';
import { systemAPI } from '../services/api';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

export default function SystemMetrics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const metrics = await systemAPI.getMetrics();
        if (active) { setData(metrics); setError(null); }
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => { active = false; clearInterval(id); };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-red-400 text-sm">
        Failed to load metrics: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-6" />
        <div className="space-y-5">
          <div className="h-12 bg-slate-700 rounded" />
          <div className="h-12 bg-slate-700 rounded" />
          <div className="h-12 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'CPU',
      value: data.cpu,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Memory',
      value: data.memory.percent,
      sub: `${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Disk',
      value: data.disk.percent,
      sub: `${formatBytes(data.disk.used)} / ${formatBytes(data.disk.total)}`,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-6">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
        System Resources
      </h2>
      <div className="space-y-5">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between items-end mb-1.5">
              <div>
                <span className="text-sm font-medium text-slate-200">{m.label}</span>
                {m.sub && <span className="text-xs text-slate-500 ml-2">{m.sub}</span>}
              </div>
              <span className="text-lg font-bold text-white tabular-nums">
                {m.value.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${m.gradient} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(m.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
