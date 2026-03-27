import { useState } from 'react';
import SystemMetrics from './components/SystemMetrics';
import DockerStatus from './components/DockerStatus';
import ProcessList from './components/ProcessList';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${darkMode ? '' : 'light'}`}
         style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            System Monitor
          </h1>
        </div>
        <p className="text-sm ml-6" style={{ color: 'var(--text-muted)' }}>Real-time system & container telemetry</p>
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
              <SystemMetrics />
            </div>
            <div className="lg:col-span-2">
              <ProcessList compact />
            </div>
          </div>
        )}
        {activeTab === 'processes' && <ProcessList />}
        {activeTab === 'docker' && <DockerStatus />}
      </main>

      {/* Theme Toggle Button — bottom-left */}
      <button
        className="theme-toggle-btn"
        onClick={() => setDarkMode((d) => !d)}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

export default App;
