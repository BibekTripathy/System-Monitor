/**
 * API Interface Layer
 * -------------------
 * This module acts as a decoupling layer between the React UI and the
 * Flask backend. Components never call fetch/axios directly — they
 * always go through this interface. If the backend shape changes, only
 * this file needs to be updated.
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json;
}

// ─── System Metrics ──────────────────────────────────────────────
export const systemAPI = {
  /** Returns { cpu, memory: {total,used,percent}, disk: {total,used,percent} } */
  getMetrics: () => request('/metrics/system').then(r => r.data),
};

// ─── Processes ───────────────────────────────────────────────────
export const processAPI = {
  /** Returns array of {pid, name, username, status, cpu_percent, memory_percent} */
  getProcesses: (limit = 50) =>
    request(`/processes/?limit=${limit}`).then(r => r.data),

  /** Kills a process by PID */
  killProcess: (pid) =>
    request(`/processes/${pid}/kill`, { method: 'POST' }),
};

// ─── Docker ──────────────────────────────────────────────────────
export const dockerAPI = {
  /** Returns array of {id, name, status, image, state} */
  getContainers: () => request('/docker/containers').then(r => r.data),

  /** action: start | stop | restart | remove */
  controlContainer: (id, action) =>
    request(`/docker/containers/${id}/control`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  /** Returns log string */
  getLogs: (id, tail = 100) =>
    request(`/docker/containers/${id}/logs?tail=${tail}`).then(r => r.logs),
};
