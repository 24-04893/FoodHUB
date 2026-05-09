let _preorderStallId = null;
let _preorderStallName = '';
let _preorderItems = [];
let _preorderStep = 1;
function openPreorderModal(stallId, stallName, menuItems) {
  _preorderStallId = stallId;
  _preorderStallName = stallName;
  _preorderItems = [];
  _preorderStep = 1;
  const modal = document.getElementById('preorderModal');
  if (!modal) return;
  const pickupInput = document.getElementById('preorderPickupTime');
  if (pickupInput) {
    const now = new Date();
    const minTime = new Date(now.getTime() + 15 * 60 * 1000);
    const pad = n => String(n).padStart(2, '0');
    pickupInput.min = `${pad(minTime.getHours())}:${pad(minTime.getMinutes())}`;
    pickupInput.value = '';
  }
  renderPreorderItems(menuItems);
  goToPreorderStep(1);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closePreorderModal() {
  const modal = document.getElementById('preorderModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  _preorderItems = [];
}
function goToPreorderStep(step) {
  _preorderStep = step;
  document.querySelectorAll('.preorder-step').forEach(el => el.classList.remove('active'));
  const s = document.getElementById(`preorderStep${step}`);
  if (s) s.classList.add('active');
  document.querySelectorAll('.preorder-step-indicator').forEach((el, i) => {
    el.classList.toggle('active-step', i + 1 === step);
    el.classList.toggle('done-step', i + 1 < step);
  });
  if (step === 2) renderPreorderCart();
  if (step === 3) renderPreorderSummary();
}
function renderPreorderItems(menuItems) {
  const container = document.getElementById('preorderItemsGrid');
  if (!container) return;
  container.innerHTML = menuItems
    .map(m => {
      const isAvail = m.available !== false;
      return `
      <div class="preorder-item-card ${isAvail ? '' : 'opacity-50 grayscale cursor-not-allowed'}" id="pic-${m.id}" ${isAvail ? `onclick="togglePreorderItem(${m.id}, '${escHtml(m.name)}', ${m.price})"` : ''}>
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${m.image || 'public/images/default-menu.png'}"
               onerror="this.src='public/images/default-menu.png'"
               style="width:52px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0;">
          <div style="flex:1;min-width:0;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" class="${isAvail ? '' : 'line-through'}">${escHtml(m.name)}</p>
            <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
              <p style="margin:0;font-size:12px;color:#DC2626;font-weight:700;">₱${m.price.toFixed(2)}</p>
              ${!isAvail ? '<span style="font-size:9px;font-weight:800;background:#E5E7EB;color:#4B5563;padding:2px 6px;border-radius:4px;">SOLD OUT</span>' : ''}
            </div>
          </div>
          ${isAvail ? `
          <div class="preorder-qty-ctrl" id="pqc-${m.id}" style="display:none;align-items:center;gap:6px;">
            <button onclick="event.stopPropagation();changePreorderQty(${m.id}, -1)"
                    style="width:24px;height:24px;border-radius:6px;background:#F3F4F6;border:none;display:flex;align-items:center;justify-content:center;font-size:14px;color:#4B5563;cursor:pointer;">-</button>
            <span id="pqty-${m.id}" style="font-size:13px;font-weight:600;min-width:16px;text-align:center;">1</span>
            <button onclick="event.stopPropagation();changePreorderQty(${m.id}, 1)"
                    style="width:24px;height:24px;border-radius:6px;background:#FEF2F2;color:#DC2626;border:none;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;">+</button>
          </div>
          ` : ''}
          </div>
        </div>`;
    }).join('');
}
function togglePreorderItem(id, name, price) {
  const card = document.getElementById(`pic-${id}`);
  const qtyCtrl = document.getElementById(`pqc-${id}`);
  const existing = _preorderItems.find(i => i.menuItemId === id);
  if (existing) {
    _preorderItems = _preorderItems.filter(i => i.menuItemId !== id);
    card.classList.remove('selected');
    if (qtyCtrl) qtyCtrl.style.display = 'none';
  } else {
    _preorderItems.push({ menuItemId: id, name, price, quantity: 1 });
    card.classList.add('selected');
    if (qtyCtrl) qtyCtrl.style.display = 'flex';
  }
  updatePreorderBadge();
}
function changePreorderQty(id, delta) {
  const item = _preorderItems.find(i => i.menuItemId === id);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(10, item.quantity + delta));
  const el = document.getElementById(`pqty-${id}`);
  if (el) el.textContent = item.quantity;
  updatePreorderBadge();
}
function updatePreorderBadge() {
  const total = _preorderItems.reduce((s, i) => s + i.quantity, 0);
  const badge = document.getElementById('preorderCartBadge');
  if (badge) badge.textContent = total > 0 ? total : '';
}
function renderPreorderCart() {
  const container = document.getElementById('preorderCartItems');
  if (!container) return;
  if (_preorderItems.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:24px 0;">No items selected.</p>';
    return;
  }
  const total = _preorderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${_preorderItems.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f9fafb;border-radius:10px;">
          <div>
            <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">${escHtml(item.name)}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">₱${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <span style="font-weight:700;color:#DC2626;">₱${(item.price * item.quantity).toFixed(2)}</span>
        </div>`).join('')}
      <div style="border-top:2px dashed #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:700;font-size:15px;color:#111827;">Total</span>
        <span style="font-weight:800;font-size:18px;color:#DC2626;">₱${total.toFixed(2)}</span>
      </div>
    </div>`;
  const student = JSON.parse(localStorage.getItem('fh_student') || 'null');
  if (student) {
    const nameEl = document.querySelector('[data-preorder-name]');
    const srEl = document.querySelector('[data-preorder-sr]');
    if (nameEl) nameEl.textContent = student.name;
    if (srEl) srEl.textContent = student.srCode;
  }
}
function renderPreorderSummary() {
  const el = document.getElementById('preorderSummaryText');
  if (!el) return;
  const total = _preorderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const pickup = document.getElementById('preorderPickupTime')?.value || 'Not set';
  const student = JSON.parse(localStorage.getItem('fh_student') || 'null');
  el.innerHTML = `
    <div style="background:#f9fafb;border-radius:12px;padding:16px;">
      <p style="margin:0;font-size:14px;"><b>Stall:</b> ${escHtml(_preorderStallName)}</p>
      <p style="margin:6px 0 0;font-size:14px;"><b>Items:</b> ${_preorderItems.length} item(s)</p>
      <p style="margin:6px 0 0;font-size:14px;"><b>Total:</b> <span style="color:#DC2626;font-weight:700;">₱${total.toFixed(2)}</span></p>
      <p style="margin:6px 0 0;font-size:14px;"><b>Pickup:</b> ${pickup}</p>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#6b7280;"><b>Student SR:</b> ${student ? student.srCode : 'N/A'}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;"><b>Student Name:</b> ${student ? student.name : 'N/A'}</p>
      </div>
    </div>`;
}
async function submitPreorder() {
  if (_preorderItems.length === 0) {
    FHToast.show('Please select at least one item.', 'error'); return;
  }
  const pickupTime = document.getElementById('preorderPickupTime')?.value;
  if (!pickupTime) {
    FHToast.show('Please choose a pickup time.', 'error'); return;
  }
  const note = document.getElementById('preorderNote')?.value || '';
  const student = JSON.parse(localStorage.getItem('fh_student') || '{}');
  const payload = {
    stallId: _preorderStallId,
    stallName: _preorderStallName,
    items: _preorderItems,
    pickupTime,
    studentNote: note,
    studentSrCode: student.srCode,
    studentName: student.name,
    studentProgram: student.program || 'Student'
  };
  const btn = document.getElementById('preorderSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Placing order...'; }
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const order = await res.json();
    showPreorderCode(order.code, order.id);
    NotificationManager.add('Order Placed!', `Code: ${order.code}`, 'success');
  } catch (e) {
    FHToast.show('Failed to place order.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirm Order'; }
  }
}
function showPreorderCode(code, orderId) {
  goToPreorderStep(4);
  const codeEl = document.getElementById('preorderCodeDisplay');
  if (codeEl) codeEl.textContent = code;
  const myOrders = JSON.parse(localStorage.getItem('fh_my_orders') || '[]');
  const total = _preorderItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const itemsSummary = _preorderItems.map(i => i.quantity + 'x ' + i.name).join(', ');
  myOrders.unshift({
    code,
    orderId,
    stall: _preorderStallName,
    time: new Date().toISOString(),
    status: 'pending',
    total: total,
    itemsSummary: itemsSummary
  });
  localStorage.setItem('fh_my_orders', JSON.stringify(myOrders.slice(0, 20)));
  if (typeof window.renderMyOrders === 'function') {
    window.renderMyOrders();
  }
}
async function loadAdminOrders() {
  const stallId = localStorage.getItem('currentStallId');
  const token = localStorage.getItem('sessionToken');
  if (!stallId || !token) return;
  try {
    const res = await fetch(`/api/orders/stall/${stallId}`, {
      headers: { 'X-Session-Token': token }
    });
    if (!res.ok) return;
    const orders = await res.json();
    renderAdminOrders(orders);
  } catch (err) { }
  if (!window._orderRefreshInterval) {
    window._orderRefreshInterval = setInterval(() => {
      const panel = document.getElementById('adminPanel_orders');
      if (panel && panel.classList.contains('active')) loadAdminOrders();
      else { clearInterval(window._orderRefreshInterval); window._orderRefreshInterval = null; }
    }, 30000);
  }
}
function renderAdminOrders(orders) {
  const container = document.getElementById('adminOrdersContainer');
  if (!container) return;
  if (orders.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:48px 16px;color:#9ca3af;"><p>No orders yet.</p></div>`;
    return;
  }
  const pending = orders.filter(o => o.status === 'pending');
  const ready = orders.filter(o => o.status === 'ready');
  const done = orders.filter(o => o.status === 'completed' || o.status === 'cancelled').slice(0, 10);
  const renderOrder = (o) => {
    const total = (o.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
    return `
      <div class="admin-order-card" id="aoc-${o.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;font-family:monospace;font-weight:800;color:#DC2626;">${o.code}</span>
              <span class="order-badge-${o.status}" style="font-size:11px;">${o.status.toUpperCase()}</span>
            </div>
            <p style="margin:4px 0 0;font-size:13px;color:#374151;font-weight:600;">₱${total.toFixed(2)} · <span style="color:#6b7280;font-weight:400;">Pickup: ${o.pickupTime || 'ASAP'}</span></p>
          </div>
          <div style="display:flex;gap:6px;">
            ${o.status === 'pending' ? `<button onclick="updateOrderStatus('${o.id}', 'ready')" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Ready</button>` : ''}
            ${o.status === 'ready' ? `<button onclick="verifyOrderCode()" class="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Verify</button>` : ''}
          </div>
        </div>
        <div style="background:#f9fafb;border-radius:10px;padding:10px;margin-bottom:12px;border:1px solid #f3f4f6;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <i class="ri-user-heart-line text-primary text-xs"></i>
            <span style="font-size:12px;font-weight:700;color:#111827;">${escHtml(o.studentName || 'Guest Student')}</span>
          </div>
          <div style="display:flex;gap:12px;padding-left:20px;">
            <span style="font-size:11px;color:#6b7280;font-family:monospace;">${o.studentSrCode || 'N/A'}</span>
            <span style="font-size:11px;color:#6b7280;">${escHtml(o.studentProgram || 'N/A')}</span>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${(o.items || []).map(i => `<span class="bg-white border border-gray-100 shadow-sm px-2 py-1 rounded text-xs font-medium text-gray-700">${escHtml(i.name)} ×${i.quantity}</span>`).join('')}
        </div>
        ${o.studentNote ? `<p style="margin:8px 0 0;font-size:11px;color:#6b7280;font-style:italic;">"${escHtml(o.studentNote)}"</p>` : ''}
      </div>`;
  };
  container.innerHTML = `
    ${pending.length ? `<h4>Pending (${pending.length})</h4>${pending.map(renderOrder).join('')}` : ''}
    ${ready.length ? `<h4>Ready (${ready.length})</h4>${ready.map(renderOrder).join('')}` : ''}
    ${done.length ? `<h4>History</h4>${done.map(renderOrder).join('')}` : ''}`;
}
async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('sessionToken') || '';
  try {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
      body: JSON.stringify({ status: newStatus }),
    });
    loadAdminOrders();
  } catch (e) { }
}
async function verifyOrderCode() {
  const code = prompt('Enter code:');
  if (!code) return;
  const stallId = parseInt(localStorage.getItem('currentStallId') || '0');
  const token = localStorage.getItem('sessionToken') || '';
  try {
    const res = await fetch('/api/orders/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
      body: JSON.stringify({ stallId, code: code.trim().toUpperCase() }),
    });
    if (res.ok) { FHToast.show('Verified!', 'success'); loadAdminOrders(); }
    else FHToast.show('Invalid code', 'error');
  } catch (e) { }
}
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.openPreorderModal = openPreorderModal;
window.closePreorderModal = closePreorderModal;
window.goToPreorderStep = goToPreorderStep;
window.togglePreorderItem = togglePreorderItem;
window.changePreorderQty = changePreorderQty;
window.submitPreorder = submitPreorder;
window.loadAdminOrders = loadAdminOrders;
window.renderAdminOrders = renderAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.verifyOrderCode = verifyOrderCode;
window.escHtml = escHtml;
window.getPreorderItemCount = function () { return _preorderItems.length; };
