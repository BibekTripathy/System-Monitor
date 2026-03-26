import { useState } from 'react';
import SystemMetrics from './components/SystemMetrics';
import DockerStatus from './components/DockerStatus';
import ProcessList from './components/ProcessList';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            System Monitor
          </h1>
        </div>
        <p className="text-slate-500 text-sm ml-6">Real-time system & container telemetry</p>
      </header>

      {/* Tab Navigation */}
      <nav className="flex gap-1 mb-6 bg-slate-800/60 rounded-lg p-1 w-fit">
        {['overview', 'processes', 'docker'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
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
    </div>
  );
}

export default App;
