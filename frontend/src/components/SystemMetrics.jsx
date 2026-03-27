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

/* ── SVG Pie / Donut Chart ──────────────────────────────────────── */
function PieChart({ metrics }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 55;

  // Build pie slices
  const total = metrics.reduce((s, m) => s + (m.value ?? 0), 0) || 1;
  let cumAngle = -90; // start from top

  const colors = ['#22d3ee', '#10b981', '#8b5cf6'];

  const slices = metrics.map((m, i) => {
    const value = m.value ?? 0;
    const angle = (value / total) * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');

    return (
      <path key={m.label} d={d} fill={colors[i]}
        opacity={0.85} className="transition-all duration-500">
        <title>{m.label}: {value.toFixed(1)}%</title>
      </path>
    );
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
        <circle cx={cx} cy={cy} r={25} fill="var(--bg-primary)" />
      </svg>
      <div className="flex gap-4 text-xs">
        {metrics.map((m, i) => (
          <span key={m.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors[i] }} />
            <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── SVG Gauge Chart ────────────────────────────────────────────── */
function GaugeChart({ metrics }) {
  const colors = ['#22d3ee', '#10b981', '#8b5cf6'];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {metrics.map((m, i) => {
        const value = m.value ?? 0;
        const radius = 40;
        const circumference = Math.PI * radius; // semicircle
        const offset = circumference - (value / 100) * circumference;

        return (
          <div key={m.label} className="flex flex-col items-center">
            <svg width="100" height="60" viewBox="0 0 100 60">
              {/* Background arc */}
              <path
                d="M 10 55 A 40 40 0 0 1 90 55"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Value arc */}
              <path
                d="M 10 55 A 40 40 0 0 1 90 55"
                fill="none"
                stroke={colors[i]}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
              <text x="50" y="50" textAnchor="middle" fill={colors[i]}
                    fontSize="14" fontWeight="bold" fontFamily="monospace">
                {value.toFixed(0)}%
              </text>
            </svg>
            <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Bar Chart (original) ───────────────────────────────────────── */
function BarChart({ metrics }) {
  return (
    <div className="space-y-5">
      {metrics.map((m) => (
        <div key={m.label}>
          <div className="flex justify-between items-end mb-1.5">
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.label}</span>
              {m.sub && <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{m.sub}</span>}
            </div>
            <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {(m.value ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${m.gradient} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(m.value ?? 0, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function SystemMetrics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

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
    <div className="rounded-xl theme-card p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          System Resources
        </h2>
        <div className="flex items-center gap-2">
          {data.uptime && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-card)' }}>
              UPTIME: {formatUptime(data.uptime)}
            </span>
          )}
          {/* Chart Type Dropdown */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="text-xs rounded px-2 py-1 border cursor-pointer outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-card)',
            }}
          >
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
            <option value="gauge">Gauge</option>
          </select>
        </div>
      </div>

      {/* Render chosen chart */}
      {chartType === 'bar' && <BarChart metrics={metrics} />}
      {chartType === 'pie' && <PieChart metrics={metrics} />}
      {chartType === 'gauge' && <GaugeChart metrics={metrics} />}
    </div>
  );
}
