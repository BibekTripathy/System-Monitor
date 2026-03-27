import { useState } from 'react';
import SystemMetrics from './components/SystemMetrics';
import DockerStatus from './components/DockerStatus';
import ProcessList from './components/ProcessList';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(3000);

  const toggleTheme = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setDarkMode((d) => !d);
      });
    } else {
      setDarkMode((d) => !d);
    }
  };

  return (
    <div className={`app-container p-4 md:p-8 transition-colors duration-300 ${darkMode ? '' : 'light'}`}>
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-3 h-3 rounded-full ${pollingInterval ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-slate-500'}`} />
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              System Monitor
            </h1>
          </div>
          <p className="text-sm ml-6" style={{ color: 'var(--text-muted)' }}>Real-time system & container telemetry</p>
        </div>
        
        {/* Polling Interval Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>REFRESH:</span>
          <select
            value={pollingInterval === null ? 'paused' : pollingInterval.toString()}
            onChange={(e) => setPollingInterval(e.target.value === 'paused' ? null : parseInt(e.target.value))}
            className="text-xs rounded px-2 py-1 border cursor-pointer outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-card)',
            }}
          >
            <option value="1000">1s</option>
            <option value="3000">3s</option>
            <option value="5000">5s</option>
            <option value="10000">10s</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex gap-1 mb-6 rounded-lg p-1 w-fit" style={{ backgroundColor: 'var(--bg-card)' }}>
        {['overview', 'processes', 'docker'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                : 'hover:bg-slate-700/50'
            }`}
            style={{ color: activeTab === tab ? undefined : 'var(--text-secondary)' }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SystemMetrics pollingInterval={pollingInterval} />
            </div>
            <div className="lg:col-span-2">
              <ProcessList compact pollingInterval={pollingInterval} />
            </div>
          </div>
        )}
        {activeTab === 'processes' && <ProcessList pollingInterval={pollingInterval} />}
        {activeTab === 'docker' && <DockerStatus pollingInterval={pollingInterval} />}
      </main>

      {/* Theme Toggle Button — bottom-left */}
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

export default App;
