const ActivityLogger = (() => {
  const STORAGE_KEY = 'fh_activity_log';
  const MAX_ENTRIES = 500;
  const ACTION_TYPES = {
    login:       { label: 'Login',       color: '#3B82F6', icon: 'ri-login-box-line' },
    logout:      { label: 'Logout',      color: '#6B7280', icon: 'ri-logout-box-line' },
    order:       { label: 'Order',       color: '#10B981', icon: 'ri-shopping-bag-line' },
    menu_edit:   { label: 'Menu Edit',   color: '#F59E0B', icon: 'ri-edit-line' },
    status:      { label: 'Status',      color: '#DC2626', icon: 'ri-toggle-line' },
    other:       { label: 'Other',       color: '#9CA3AF', icon: 'ri-file-list-line' },
  };
  function getRole() { return localStorage.getItem('adminAuth') ? 'Admin' : 'Student'; }
  function getUser() {
    const aid = localStorage.getItem('currentStallId');
    if (localStorage.getItem('adminAuth') && aid) {
      const s = (window.stalls || []).find(x => String(x.id) === aid);
      return s ? `Admin:${s.name}` : `Admin:#${aid}`;
    }
    return 'Student';
  }
  function log(type, desc, extra = {}) {
    const logs = read();
    const n = { id: Date.now(), timestamp: new Date().toISOString(), role: getRole(), user: getUser(), actionType: type, description: desc, extra };
    logs.unshift(n);
    if (logs.length > MAX_ENTRIES) logs.length = MAX_ENTRIES;
    save(logs);
    return n;
  }
  function read() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
  function save(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }
  function getLogs(f = {}) {
    let l = read();
    if (f.search) {
      const q = f.search.toLowerCase();
      l = l.filter(x => x.description.toLowerCase().includes(q) || x.user.toLowerCase().includes(q));
    }
    return l;
  }
  return { log, getLogs, clearLogs: () => localStorage.removeItem(STORAGE_KEY), ACTION_TYPES };
})();
window.ActivityLogger = ActivityLogger;
function renderActivityLog() {
  const logs = ActivityLogger.getLogs({ search: document.getElementById('logFilterSearch')?.value });
  const tbody = document.getElementById('activityLogBody');
  if (!tbody) return;
  if (!logs.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;">No logs</td></tr>'; return; }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${new Date(l.timestamp).toLocaleString()}</td>
      <td>${l.role}</td>
      <td>${l.user}</td>
      <td>${l.actionType}</td>
      <td>${l.description}</td>
    </tr>`).join('');
}
window.renderActivityLog = renderActivityLog;
window.clearActivityLog = () => { if(confirm('Clear?')) { ActivityLogger.clearLogs(); renderActivityLog(); } };
