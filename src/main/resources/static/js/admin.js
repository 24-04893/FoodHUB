const ADMIN_SECTIONS = ['info','orders','analytics'];
function showAdminSection(section) {
  ADMIN_SECTIONS.forEach(s => {
    const panel = document.getElementById('adminPanel_' + s);
    const tab   = document.getElementById('adminTab_'   + s);
    if (panel) panel.classList.toggle('active', s === section);
    if (tab)   tab.classList.toggle('active',   s === section);
  });
  if (section === 'analytics' && typeof renderAnalyticsDashboard === 'function') renderAnalyticsDashboard();
  if (section === 'orders' && typeof loadAdminOrders === 'function') loadAdminOrders();
}
function showAdminTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.add('hidden'));
  if (tab === 'stalls') {
    document.getElementById('stallsTab').classList.add('active');
    document.getElementById('stallManagement').classList.remove('hidden');
    loadAdminStalls();
  } else {
    document.getElementById('seatingTab').classList.add('active');
    document.getElementById('seatingManagement').classList.remove('hidden');
    loadAdminSeating();
  }
}
function loadAdminData() {
  loadAdminStalls();
  loadAdminSeating();
}
function loadAdminStalls() {
  const tbody = document.getElementById('adminStallsList');
  const currentStallId = parseInt(localStorage.getItem('currentStallId'));
  tbody.innerHTML = '';
  const currentStall = stalls.find(s => s.id === currentStallId);
  const adminImg = document.getElementById('adminCurrentImage');
  if (adminImg) adminImg.src = currentStall ? (currentStall.image || 'public/images/default-menu.png') : 'public/images/default-menu.png';
  if (currentStall) {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';
    row.innerHTML = `
      <td class="py-3 px-4">
        <div class="flex items-center space-x-3">
          <img src="${currentStall.image}" alt="${currentStall.name}" class="w-10 h-10 rounded-lg object-cover object-top">
          <span class="font-medium text-gray-900">${currentStall.name}</span>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-1 rounded-full text-xs font-medium ${currentStall.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${currentStall.status === 'open' ? 'Open' : 'Closed'}
        </span>
      </td>
      <td class="py-3 px-4 text-gray-600">${currentStall.menuCount}</td>
      <td class="py-3 px-4">
        <div class="flex items-center space-x-1">
          <div class="flex text-yellow-400 text-sm">
            ${Array(5).fill().map((_, i) => `<i class="ri-star-${i < Math.floor(currentStall.rating) ? 'fill' : 'line'}"></i>`).join('')}
          </div>
          <span class="text-sm text-gray-600">${currentStall.rating}</span>
        </div>
      </td>
      <td class="py-3 px-4">
        <div class="flex items-center space-x-2">
          <button onclick="toggleStallStatus(${currentStall.id})" class="text-sm px-3 py-1 rounded-md ${currentStall.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} transition-colors whitespace-nowrap">
            ${currentStall.status === 'open' ? 'Close' : 'Open'}
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  }
}
function loadAdminSeating() {
  const gA = generalSeating.filter(s => !s.occupied).length;
  const gO = generalSeating.filter(s => s.occupied).length;
  const pA = privateSeating.filter(s => !s.occupied).length;
  const pO = privateSeating.filter(s => s.occupied).length;
  document.getElementById('adminGeneralAvailable').textContent = gA;
  document.getElementById('adminGeneralOccupied').textContent = gO;
  document.getElementById('adminPrivateAvailable').textContent = pA;
  document.getElementById('adminPrivateOccupied').textContent = pO;
}
async function toggleStallStatus(stallId) {
  const stall = window.stalls.find(s => s.id === stallId);
  const newStatus = stall.status === 'open' ? 'closed' : 'open';
  try {
    const res = await fetch(`/api/stalls/${stallId}/toggle-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': getAdminToken() },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      stall.status = newStatus;
      loadAdminStalls();
      updateStallCounts();
      showNotification('Status updated', 'success');
    }
  } catch (err) {
    console.error('Failed to update status', err);
  }
}
function editStall(stallId) {
  currentEditingStall = stallId;
  const stall = stalls.find(s => s.id === stallId);
  if (!stall) return;
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById('stallEditPage').classList.add('active');
  loadStallEditData(stall);
}
function showEditTab(tab) {
  document.querySelectorAll('.edit-tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.edit-tab-content').forEach(content => content.classList.add('hidden'));
  if (tab === 'basic') {
    document.getElementById('basicTab').classList.add('active');
    document.getElementById('basicInfoTab').classList.remove('hidden');
  } else if (tab === 'menu') {
    document.getElementById('menuTab').classList.add('active');
    document.getElementById('menuManagementTab').classList.remove('hidden');
    loadMenuItems();
  }
}
function loadStallEditData(stall) {
  document.getElementById('editStallName').value = stall.name;
  document.getElementById('editStallDescription').value = stall.description;
  document.getElementById('editStallPhone').value = stall.phone || '';
  document.getElementById('editStallLocation').value = stall.location || '';
  setStallStatus(stall.status);
}
function setStallStatus(status) {
  document.querySelectorAll('.status-button').forEach(btn => btn.classList.remove('active'));
  if (status === 'open') document.getElementById('statusOpen').classList.add('active');
  else document.getElementById('statusClosed').classList.add('active');
}
let menuItems = [];
let currentEditingStall = null;
function getAdminToken() {
  const stallToken = localStorage.getItem('sessionToken');
  if (stallToken) return stallToken;
  try { return JSON.parse(localStorage.getItem('fh_admin')).token; } catch(e) { return ''; }
}
async function loadMenuItems() {
  if (!currentEditingStall) return;
  try {
    const res = await fetch(`/api/stalls/${currentEditingStall}/menu`);
    if (res.ok) {
      menuItems = await res.json();
      renderMenuItemsList();
    }
  } catch (err) {
    console.error('Failed to load menu items', err);
  }
}
function renderMenuItemsList() {
  const container = document.getElementById('menuItemsList');
  container.innerHTML = '';
  menuItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-3';
    card.innerHTML = `
      <div class="flex items-start space-x-4">
        <img src="${item.image || 'public/images/default-menu.png'}" class="w-16 h-16 rounded-xl object-cover border border-gray-100" onerror="this.src='public/images/default-menu.png'">
        <div class="flex-1 space-y-2">
          <input type="text" id="menuItemName_${index}" value="${item.name}" placeholder="Item Name" class="w-full border border-gray-200 p-2 rounded-lg text-sm font-bold outline-none focus:border-primary">
          <input type="text" id="menuItemDesc_${index}" value="${item.description || ''}" placeholder="Description" class="w-full border border-gray-200 p-2 rounded-lg text-xs outline-none focus:border-primary">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="absolute left-3 top-2 text-gray-400 text-sm">₱</span>
              <input type="number" id="menuItemPrice_${index}" value="${item.price}" class="w-full pl-7 pr-3 border border-gray-200 py-2 rounded-lg text-sm font-bold outline-none focus:border-primary">
            </div>
            <button onclick="saveMenuItem(${index})" class="bg-green-500 text-white px-4 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">Save</button>
          </div>
        </div>
        <button onclick="removeMenuItem(${index})" class="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
          <i class="ri-delete-bin-line text-lg"></i>
        </button>
      </div>`;
    container.appendChild(card);
  });
}
async function saveMenuItem(index) {
  const item = menuItems[index];
  const payload = {
    name: document.getElementById(`menuItemName_${index}`).value,
    description: document.getElementById(`menuItemDesc_${index}`).value,
    price: parseFloat(document.getElementById(`menuItemPrice_${index}`).value) || 0,
    available: true,
    image: item.image || 'public/images/default-menu.png'
  };
  try {
    const res = await fetch(`/api/stalls/${currentEditingStall}/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': getAdminToken() },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showNotification('Item updated', 'success');
      loadMenuItems();
    } else {
      showNotification('Failed to update item', 'error');
    }
  } catch(err) {
    showNotification('Error updating item', 'error');
  }
}
async function addMenuItem() {
  const payload = {
    name: 'New Item',
    description: 'Item description',
    price: 50.0,
    available: true,
    image: 'public/images/default-menu.png'
  };
  try {
    const res = await fetch(`/api/stalls/${currentEditingStall}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': getAdminToken() },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showNotification('Item added', 'success');
      loadMenuItems();
    } else {
      showNotification('Failed to add item', 'error');
    }
  } catch(err) {
    showNotification('Error adding item', 'error');
  }
}
function removeMenuItem(index) { showDeleteConfirmation(index); }
function showDeleteConfirmation(index) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'deleteConfirmationModal';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 shadow-2xl max-w-md mx-4">
      <h3 class="font-bold mb-2">Delete Item?</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to completely remove this item?</p>
      <div class="flex gap-3">
        <button onclick="closeDeleteConfirmation()" class="flex-1 border p-2 rounded-lg">Cancel</button>
        <button onclick="confirmDeleteMenuItem(${index})" class="flex-1 bg-red-500 text-white p-2 rounded-lg font-bold">Delete</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}
function closeDeleteConfirmation() {
  const modal = document.getElementById('deleteConfirmationModal');
  if (modal) document.body.removeChild(modal);
}
async function confirmDeleteMenuItem(index) {
  const item = menuItems[index];
  try {
    const res = await fetch(`/api/stalls/${currentEditingStall}/menu/${item.id}`, {
      method: 'DELETE',
      headers: { 'X-Session-Token': getAdminToken() }
    });
    if (res.ok) {
      showNotification('Item deleted', 'success');
      closeDeleteConfirmation();
      loadMenuItems();
    } else {
      showNotification('Failed to delete item', 'error');
    }
  } catch(err) {
    showNotification('Error deleting item', 'error');
  }
}
async function saveAllChanges() {
  const stallIdStr = localStorage.getItem('currentStallId');
  if (!stallIdStr) return;
  const stallId = parseInt(stallIdStr);
  const stall = window.stalls.find(s => s.id === stallId);
  if (!stall) return;
  const statusEl = document.querySelector('input[name="stallStatus"]:checked');
  const locEl = document.getElementById('adminStallLocation');
  const payload = {
    name: document.getElementById('adminStallName').value,
    location: locEl ? locEl.value : stall.location,
    description: document.getElementById('adminStallDescription').value,
    status: statusEl ? statusEl.value : stall.status
  };
  try {
    const res = await fetch(`/api/stalls/${stallId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': getAdminToken() },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      Object.assign(stall, payload);
      showNotification('Changes saved successfully!', 'success');
      if (typeof updateStallCounts === 'function') updateStallCounts();
      if (typeof updateAdminDashboardHeader === 'function') updateAdminDashboardHeader();
    } else {
      showNotification('Failed to save changes.', 'error');
    }
  } catch (err) {
    console.error('Failed to save all changes', err);
    showNotification('Error saving changes.', 'error');
  }
}
async function saveStallChanges() {
  if (!currentEditingStall) return;
  const stall = window.stalls.find(s => s.id === currentEditingStall);
  if (!stall) return;
  const payload = {
    name: document.getElementById('editStallName').value,
    description: document.getElementById('editStallDescription').value,
    status: document.getElementById('statusOpen').classList.contains('active') ? 'open' : 'closed'
  };
  try {
    const res = await fetch(`/api/stalls/${currentEditingStall}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Session-Token': getAdminToken() },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      Object.assign(stall, payload);
      showNotification('Updated!', 'success');
      setTimeout(() => showAdminDashboard(), 1500);
    }
  } catch (err) {
    console.error('Failed to save stall changes', err);
  }
}
function showNotification(message, type) {
  if (typeof FHToast !== 'undefined') FHToast.show(message, type || 'info');
  else console.log(`[${type}] ${message}`);
}
function showAdminSection(section) {
  document.querySelectorAll('.admin-section-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-section-panel').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(`adminTab_${section}`);
  const p = document.getElementById(`adminPanel_${section}`);
  if (t) t.classList.add('active');
  if (p) p.classList.add('active');
  if (section === 'analytics' && typeof renderAnalyticsDashboard === 'function') renderAnalyticsDashboard();
  if (section === 'orders' && typeof loadAdminOrders === 'function') loadAdminOrders();
}
function checkLowStockItems() {
  const items = window.currentMenuItems || [];
  const low = items.filter(i => i.stock !== null && i.stock <= (i.lowStockThreshold || 5));
  if (low.length > 0 && typeof NotificationManager !== 'undefined') {
    low.forEach(i => NotificationManager.add('Low Stock', `"${i.name}" is running low!`, 'warning'));
  }
}
setInterval(checkLowStockItems, 30000);
window.showAdminTab = showAdminTab;
window.loadAdminData = loadAdminData;
window.showEditTab = showEditTab;
window.editStall = editStall;
window.toggleStallStatus = toggleStallStatus;
window.saveAllChanges = saveAllChanges;
window.showNotification = showNotification;
window.showAdminSection = showAdminSection;
