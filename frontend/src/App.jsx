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
            <div className={`w-4 h-4 rounded-full ${pollingInterval ? 'bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
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
        {!darkMode ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        )}
      </button>
    </div>
  );
}

export default App;
