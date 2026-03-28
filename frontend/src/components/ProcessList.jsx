import { useEffect, useState, useMemo } from 'react';
import { processAPI } from '../services/api';

function SortArrow({ active, direction }) {
  return (
    <span className="inline-flex flex-col ml-1 text-[9px] leading-[9px] align-middle">
      <span style={{ color: active && direction === 'asc' ? 'var(--accent-neon)' : 'var(--text-muted)' }}>▲</span>
      <span style={{ color: active && direction === 'desc' ? 'var(--accent-neon)' : 'var(--text-muted)' }}>▼</span>
    </span>
  );
}

export default function ProcessList({ compact = false, pollingInterval = 5000 }) {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('cpu_percent');
  const [sortDir, setSortDir] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [processLimit, setProcessLimit] = useState(compact ? 15 : 50);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const data = await processAPI.getProcesses(processLimit);
        if (active) { setProcesses(data); setError(null); }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
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
  }, [processLimit, pollingInterval]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return processes;
    const term = searchTerm.toLowerCase();
    return processes.filter(p => 
      String(p.pid).includes(term) || 
      (p.name && p.name.toLowerCase().includes(term))
    );
  }, [processes, searchTerm]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      // Handle nulls
      if (aVal == null) aVal = typeof bVal === 'number' ? -Infinity : '';
      if (bVal == null) bVal = typeof aVal === 'number' ? -Infinity : '';
      // String comparison
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      }
      // Number comparison
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

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

  const sortableHeaders = [
    { key: 'name', label: 'Name', align: 'left', show: true },
    { key: 'username', label: 'User', align: 'left', show: !compact },
    { key: 'cpu_percent', label: 'CPU %', align: 'right', show: true },
    { key: 'memory_percent', label: 'Mem %', align: 'right', show: true },
  ];

  return (
    <div className="rounded-xl theme-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap md:flex-nowrap">
        <h2 className="text-sm font-semibold theme-muted uppercase tracking-wider shrink-0">
          {compact ? 'Top Processes' : 'All Processes'}
        </h2>
        
        <div className="flex items-center gap-3 flex-1 justify-end flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <input 
            type="text" 
            placeholder="Search PID/Name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="text-xs rounded px-3 py-1.5 outline-none transition-colors border w-full min-w-[140px] sm:max-w-[250px] md:max-w-[350px] flex-1"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-card)' }}
          />

          {!compact && (
            <div className="flex items-center gap-2">
              <span className="text-xs theme-muted">LIMIT:</span>
              <select
                value={processLimit.toString()}
                onChange={(e) => setProcessLimit(Number(e.target.value))}
                className="text-xs rounded px-2 py-1 border cursor-pointer outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-card)',
                }}
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
          )}
          <span className="text-xs theme-muted bg-slate-700/50 px-2 py-1 rounded">
            {filtered.length} shown
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border" style={{ borderColor: 'var(--border-card)' }}>
        {loading ? (
          <div className="p-8 text-center theme-muted animate-pulse">Loading…</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs theme-muted uppercase sticky top-0 z-10 backdrop-blur-md shadow-sm" style={{ backgroundColor: 'var(--table-header-bg)' }}>
              <tr>
                <th className="px-4 py-2.5">PID</th>
                {sortableHeaders.filter(h => h.show).map(h => (
                  <th
                    key={h.key}
                    className={`px-4 py-2.5 cursor-pointer select-none transition-colors hover:text-[var(--accent-neon)] ${h.align === 'right' ? 'text-right' : ''}`}
                    onClick={() => handleSort(h.key)}
                  >
                    {h.label}
                    <SortArrow active={sortKey === h.key} direction={sortDir} />
                  </th>
                ))}
                {!compact && <th className="px-4 py-2.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-card)' }}>
              {sorted.map((p) => (
                <tr key={p.pid} className="transition-colors group hover:bg-[var(--hover-row)]">
                  <td className={`px-4 py-2 font-mono text-xs theme-muted transition-opacity duration-300 ${sortKey && sortKey !== 'pid' ? 'opacity-40 group-hover:opacity-80' : ''}`}>
                    {p.pid}
                  </td>
                  <td className={`px-4 py-2 theme-text truncate max-w-[180px] transition-opacity duration-300 ${sortKey && sortKey !== 'name' ? 'opacity-40 group-hover:opacity-80' : ''}`} title={p.name}>
                    {p.name}
                  </td>
                  {!compact && (
                    <td className={`px-4 py-2 theme-muted transition-opacity duration-300 ${sortKey && sortKey !== 'username' ? 'opacity-40 group-hover:opacity-80' : ''}`}>
                      {p.username || '—'}
                    </td>
                  )}
                  <td className={`px-4 py-2 text-right font-mono transition-opacity duration-300 ${sortKey && sortKey !== 'cpu_percent' ? 'opacity-40 group-hover:opacity-80' : ''}`} style={{ color: 'var(--accent-neon)' }}>
                    {(p.cpu_percent ?? 0).toFixed(1)}
                  </td>
                  <td className={`px-4 py-2 text-right font-mono transition-opacity duration-300 ${sortKey && sortKey !== 'memory_percent' ? 'opacity-40 group-hover:opacity-80' : ''}`} style={{ color: 'var(--accent-neon)' }}>
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
