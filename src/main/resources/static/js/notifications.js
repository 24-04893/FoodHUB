const FHToast = (() => {
  let container = null;
  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'fh-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  function show(message, type = 'info', duration = 4000) {
    const c = getContainer();
    const icons = { success: 'ri-checkbox-circle-fill', warning: 'ri-alert-fill', error: 'ri-close-circle-fill', info: 'ri-information-fill' };
    const colors = { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' };
    const toast = document.createElement('div');
    toast.className = `fh-toast toast-${type}`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info}" style="color:${colors[type]};font-size:20px;"></i>
      <div style="flex:1;"><p style="margin:0;font-size:14px;font-weight:500;">${message}</p></div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;"><i class="ri-close-line"></i></button>`;
    c.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  }
  return { show };
})();
const NotificationManager = (() => {
  const STORAGE_KEY = 'fh_notifications';
  let notifications = [];
  function load() { try { notifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { notifications = []; } }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); }
  function add(title, body, type = 'info') {
    load();
    const n = { id: Date.now(), title, body, type, read: false, time: new Date().toISOString() };
    notifications.unshift(n);
    if (notifications.length > 50) notifications.length = 50;
    save(); renderBadge(); renderDrawer();
    FHToast.show(`${title}: ${body}`, type === 'alert' ? 'warning' : type);
  }
  function markRead(id) { load(); const n = notifications.find(i => i.id === id); if (n) n.read = true; save(); renderBadge(); renderDrawer(); }
  function clearAll() { notifications = []; save(); renderBadge(); renderDrawer(); }
  function unreadCount() { return notifications.filter(n => !n.read).length; }
  function renderBadge() {
    const b = document.getElementById('notificationBadge');
    if (!b) return;
    const c = unreadCount();
    b.textContent = c > 9 ? '9+' : c;
    b.style.display = c > 0 ? 'flex' : 'none';
  }
  function renderDrawer() {
    const body = document.getElementById('notifDrawerBody');
    if (!body) return;
    load();
    if (!notifications.length) { body.innerHTML = '<p style="text-align:center;padding:48px;color:#9ca3af;">No notifications</p>'; return; }
    body.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? 'read' : 'unread'}" onclick="NotificationManager.markRead(${n.id})">
        <p style="font-weight:600;font-size:13px;margin:0;">${n.title}</p>
        <p style="font-size:12px;margin:2px 0;color:#6b7280;">${n.body}</p>
      </div>`).join('');
  }
  return { add, markRead, clearAll, renderBadge, openDrawer: () => { document.getElementById('notificationDrawer').classList.add('open'); document.getElementById('notifOverlay').classList.add('open'); renderDrawer(); }, closeDrawer: () => { document.getElementById('notificationDrawer').classList.remove('open'); document.getElementById('notifOverlay').classList.remove('open'); }, init: () => { load(); renderBadge(); } };
})();
const FavoritesManager = (() => {
  const KEY = 'fh_favorites';
  let favs = new Set();
  function load() { try { favs = new Set(JSON.parse(localStorage.getItem(KEY) || '[]').map(String)); } catch { favs = new Set(); } }
  function save() { localStorage.setItem(KEY, JSON.stringify([...favs])); }
  function toggle(id, name) {
    load();
    const sid = String(id);
    const stalls = window.stalls || [];
    const displayName = name || stalls.find(s => String(s.id) === sid)?.name || 'Stall';
    if (favs.has(sid)) { 
      favs.delete(sid); 
      FHToast.show(`Removed ${displayName}`, 'info'); 
    } else { 
      favs.add(sid); 
      FHToast.show(`Added ${displayName}!`, 'success'); 
      NotificationManager.add('Favorited!', `You favorited ${displayName}.`, 'success'); 
    }
    save(); renderFavoritesStrip();
  }
  function renderFavoritesStrip() {
    const s = document.getElementById('favoritesStrip');
    if (!s) return;
    load();
    if (!favs.size) { s.style.display = 'none'; return; }
    s.style.display = 'block';
    const c = document.getElementById('favoritesChips');
    const all = window.stalls || [];
    if (c) c.innerHTML = [...favs].map(id => {
      const st = all.find(x => String(x.id) === id);
      return st ? `<span class="fav-stall-chip" onclick="showStallDetail(${st.id})">${st.name}</span>` : '';
    }).join('');
  }
  return { isFavorite: (id) => { load(); return favs.has(String(id)); }, toggle, getFavoriteIds: () => { load(); return [...favs]; }, renderFavoritesStrip, init: () => { load(); setTimeout(renderFavoritesStrip, 800); } };
})();
function pollStatus() {
  const my = JSON.parse(localStorage.getItem('fh_my_orders') || '[]');
  const active = my.filter(o => o && o.orderId && (!o.status || o.status === 'pending' || o.status === 'ready'));
  active.forEach(o => {
    fetch(`/api/orders/${o.orderId}`).then(r => {
      if (!r.ok) return null;
      return r.json();
    }).then(uo => {
      if (uo && uo.status && uo.status !== o.status) {
        if (uo.status === 'ready') NotificationManager.add('Order Ready!', `${o.stall || 'Your'} order ${o.code || uo.code} is ready.`, 'success');
        const all = JSON.parse(localStorage.getItem('fh_my_orders') || '[]');
        const idx = all.findIndex(x => x.orderId === o.orderId);
        if (idx >= 0) { all[idx].status = uo.status; localStorage.setItem('fh_my_orders', JSON.stringify(all)); if (typeof renderMyOrders === 'function') renderMyOrders(); }
      }
    }).catch(e => console.error('Poll error:', e));
  });
}
async function markOrderAsReceived(id) {
  try {
    await fetch(`/api/orders/${id}/received`, { method: 'PATCH' });
    const all = JSON.parse(localStorage.getItem('fh_my_orders') || '[]');
    const idx = all.findIndex(o => o.orderId === id);
    if (idx >= 0) { all[idx].status = 'completed'; localStorage.setItem('fh_my_orders', JSON.stringify(all)); NotificationManager.add('Enjoy!', 'Order received.', 'success'); if (typeof renderMyOrders === 'function') renderMyOrders(); }
  } catch (e) {}
}
document.addEventListener('DOMContentLoaded', () => {
  NotificationManager.init();
  FavoritesManager.init();
  setInterval(pollStatus, 10000);
  setInterval(() => { if (localStorage.getItem('adminAuth')) fetch(`/api/orders/stall/${localStorage.getItem('currentStallId')}`, { headers: { 'X-Session-Token': localStorage.getItem('sessionToken') } }).then(r => r.json()).then(os => { if (typeof renderAdminOrders === 'function') renderAdminOrders(os); }); }, 30000);
});
window.NotificationManager = NotificationManager;
window.FavoritesManager = FavoritesManager;
window.markOrderAsReceived = markOrderAsReceived;
