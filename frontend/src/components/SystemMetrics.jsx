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

/* ── Line Chart ──────────────────────────────────────── */
function LineChart({ history }) {
  if (!history || history.length < 2) {
    return <div className="text-center text-xs theme-muted my-16">Collecting historical data...</div>;
  }
  
  const width = 300;
  const height = 150;
  const maxHistory = 20;
  const stepX = width / (maxHistory - 1);

  // Extract points
  const pointsCpu = history.map(h => typeof h.cpu === 'object' ? h.cpu.total : h.cpu);
  const pointsMem = history.map(h => h.memory.percent);
  const pointsDisk = history.map(h => Array.isArray(h.disk) ? h.disk[0].percent : h.disk.percent);
  
  const generatePath = (points) => {
    return points.map((p, i) => {
      // align to the right if history is less than max
      const offsetIdx = maxHistory - history.length + i;
      const x = offsetIdx * stepX;
      const y = height - (Math.min(p ?? 0, 100) / 100) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="flex flex-col items-center w-full mt-4">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="var(--border-card)" strokeDasharray="4 4" />
        <line x1="0" y1={0} x2={width} y2={0} stroke="var(--border-card)" strokeDasharray="4 4" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="var(--border-card)" />
        
        {/* Lines */}
        <path d={generatePath(pointsCpu)} fill="none" stroke="var(--chart-cpu)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-linear" />
        <path d={generatePath(pointsMem)} fill="none" stroke="var(--chart-mem)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-linear" />
        <path d={generatePath(pointsDisk)} fill="none" stroke="var(--chart-disk)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-linear" />
      </svg>
      
      {/* Legend */}
      <div className="flex gap-4 mt-8 text-xs drop-shadow-md">
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: 'var(--chart-cpu)', color: 'var(--chart-cpu)' }} /> <span style={{ color: 'var(--text-secondary)' }}>CPU</span></div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: 'var(--chart-mem)', color: 'var(--chart-mem)' }} /> <span style={{ color: 'var(--text-secondary)' }}>Memory</span></div>
         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: 'var(--chart-disk)', color: 'var(--chart-disk)' }} /> <span style={{ color: 'var(--text-secondary)' }}>Disk</span></div>
      </div>
    </div>
  );
}

/* ── SVG Gauge Chart (Radar-style) ────────────────────────────────────────────── */
function GaugeChart({ metrics }) {
  return (
    <div className="flex flex-col items-center justify-center relative mt-4">
      {/* Radar screen container */}
      <div className="relative w-48 h-48 rounded-full overflow-hidden" 
           style={{ backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--border-card)', boxShadow: '0 0 25px color-mix(in srgb, var(--accent-neon) 20%, transparent)' }}>
        
        {/* Radar grid markings */}
        <div className="absolute inset-0 rounded-full border opacity-30 m-6" style={{ borderColor: 'var(--accent-neon)' }} />
        <div className="absolute inset-0 rounded-full border opacity-20 m-12" style={{ borderColor: 'var(--accent-neon)' }} />
        <div className="absolute top-1/2 left-0 w-full h-px opacity-30" style={{ backgroundColor: 'var(--accent-neon)' }} />
        <div className="absolute left-1/2 top-0 w-px h-full opacity-30" style={{ backgroundColor: 'var(--accent-neon)' }} />

        {/* Concentric Data Rings */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
          {metrics.map((m, i) => {
            const r = 40 - i * 12; // Radius decreases for each metric: 40, 28, 16
            const c = 2 * Math.PI * r;
            const val = Math.min(m.value ?? 0, 100);
            const offset = c - (val / 100) * c;
            return (
              <circle
                key={m.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={m.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
                opacity="0.85"
                style={{ filter: `drop-shadow(0 0 4px ${m.color})` }}
              />
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-6 text-xs drop-shadow-md">
         {metrics.map((m) => (
           <div key={m.label} className="flex items-center gap-1">
             <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: m.color, color: m.color }} />
             <span style={{ color: 'var(--text-secondary)' }}>{m.label}: </span>
             <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{(m.value ?? 0).toFixed(0)}%</span>
           </div>
         ))}
      </div>
    </div>
  );
}

/* ── Bar Chart (original styled) ───────────────────────────────────────── */
function BarChart({ metrics }) {
  return (
    <div className="space-y-6 mt-4">
      {metrics.map((m) => (
        <div key={m.label}>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: m.color || 'var(--text-primary)' }}>{m.label}</span>
              {m.sub && <span className="text-xs ml-2 opacity-80" style={{ color: 'var(--text-muted)' }}>{m.sub}</span>}
            </div>
            <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {(m.value ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-card)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${Math.min(m.value ?? 0, 100)}%`, 
                backgroundColor: m.color || 'var(--accent-neon)',
                boxShadow: `0 0 10px color-mix(in srgb, ${m.color || 'var(--accent-neon)'} 50%, transparent)`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function SystemMetrics({ pollingInterval = 3000 }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const metrics = await systemAPI.getMetrics();
        if (active) { 
          setData(metrics);
          setHistory(prev => {
            const next = [...prev, metrics];
            // keep last 20 samples
            return next.length > 20 ? next.slice(next.length - 20) : next;
          });
          setError(null); 
        }
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    poll();
    
    let id;
    if (pollingInterval) {
      id = setInterval(poll, pollingInterval);
    }
    
    return () => { 
      active = false; 
      if (id) clearInterval(id); 
    };
  }, [pollingInterval]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-red-400 text-sm">
        Failed to load metrics: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl theme-card p-6 animate-pulse">
        <div className="h-4 rounded w-1/3 mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="space-y-5">
          <div className="h-12 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="h-12 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="h-12 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
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
      color: 'var(--chart-cpu)',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Memory',
      value: data.memory.percent,
      sub: `${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`,
      color: 'var(--chart-mem)',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Disk' + (Array.isArray(data.disk) && data.disk.length > 1 ? ` (${mainDisk.mountpoint})` : ''),
      value: mainDisk.percent,
      sub: `${formatBytes(mainDisk.used)} / ${formatBytes(mainDisk.total)}`,
      color: 'var(--chart-disk)',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="rounded-xl theme-card p-6">
      <div className="flex flex-col gap-3 mb-5 w-full">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          System Resources
        </h2>
        <div className="flex items-center gap-3 w-full justify-between sm:justify-start">
          {data.uptime && (
            <div className="text-[10px] font-mono px-2 py-1 rounded border flex flex-col items-start justify-center min-w-[100px]"
                  style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-card)' }}>
              <span className="opacity-70 text-[8px] leading-none mb-1 tracking-widest font-sans">UPTIME</span>
              <span className="leading-none text-xs">{formatUptime(data.uptime)}</span>
            </div>
          )}
          {/* Chart Type Dropdown */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="text-xs rounded px-2 py-1 border cursor-pointer outline-none transition-colors min-w-[100px]"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-card)',
            }}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="gauge">Gauge (Radar)</option>
          </select>
        </div>
      </div>

      {/* Render chosen chart */}
      {chartType === 'bar' && <BarChart metrics={metrics} />}
      {chartType === 'line' && <LineChart history={history} />}
      {chartType === 'gauge' && <GaugeChart metrics={metrics} />}
    </div>
  );
}
