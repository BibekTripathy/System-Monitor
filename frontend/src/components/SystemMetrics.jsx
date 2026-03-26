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

function formatUptime(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
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

  // Handle new backend data shape
  const cpuVal = typeof data.cpu === 'object' ? data.cpu.total : data.cpu;
  const mainDisk = Array.isArray(data.disk) ? data.disk[0] : data.disk;

  const metrics = [
    {
      label: 'CPU',
      value: cpuVal,
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
      label: 'Disk' + (Array.isArray(data.disk) && data.disk.length > 1 ? ` (${mainDisk.mountpoint})` : ''),
      value: mainDisk.percent,
      sub: `${formatBytes(mainDisk.used)} / ${formatBytes(mainDisk.total)}`,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          System Resources
        </h2>
        {data.uptime && (
          <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            UPTIME: {formatUptime(data.uptime)}
          </span>
        )}
      </div>
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

