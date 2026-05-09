let stallMenuMap = {};
function initializeMenuMap() {
  stallMenuMap = {
    'Theatery': typeof theateryMenu !== 'undefined' ? theateryMenu : {},
    'Spot-G Food Hub': typeof spotgMenu !== 'undefined' ? spotgMenu : {},
    'Little Tokyo Takoyaki': typeof littletokyoMenu !== 'undefined' ? littletokyoMenu : {},
    'RC Beef Shawarma': typeof rcbeefMenu !== 'undefined' ? rcbeefMenu : {},
    'Juice Bar': typeof juicebarMenu !== 'undefined' ? juicebarMenu : {},
    'Chowking': typeof chowkingMenu !== 'undefined' ? chowkingMenu : {},
    'Fried Noodles Haus': typeof friednoodlesMenu !== 'undefined' ? friednoodlesMenu : {},
    "RR Sorella's": typeof rrsorelasMenu !== 'undefined' ? rrsorelasMenu : {},
    'Tender Juicy Hotdogs': typeof tenderjuicyMenu !== 'undefined' ? tenderjuicyMenu : {},
    'Potato Corner': typeof potatocornerMenu !== 'undefined' ? potatocornerMenu : {},
    "Julie's Bakeshop": typeof juliesbakeshopMenu !== 'undefined' ? juliesbakeshopMenu : {},
    'Waffle Time': typeof waffleTimeMenu !== 'undefined' ? waffleTimeMenu : {},
    'Cafe Aromatiko': typeof cafearmatikoMenu !== 'undefined' ? cafearmatikoMenu : {},
    'Happy Haus Donuts': typeof happyhausMenu !== 'undefined' ? happyhausMenu : {}
  };
}
function showLogin() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('loginPage').classList.add('active');
  showLoginRoleView();
}
function showAdminLogin() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('adminLoginPage').classList.add('active');
}
function showStudentLoginForm() {
  document.getElementById('loginRoleView').style.display = 'none';
  document.getElementById('studentLoginView').style.display = 'block';
  document.getElementById('srCodeError').style.display = 'none';
  const inp = document.getElementById('srCodeInput');
  inp.value = ''; inp.focus();
}
function showLoginRoleView() {
  document.getElementById('loginRoleView').style.display = 'block';
  document.getElementById('studentLoginView').style.display = 'none';
}
function formatSrCodeInput(input) {
  let raw = input.value.replace(/\D/g, '').slice(0, 7);
  if (raw.length > 2) input.value = raw.slice(0, 2) + '-' + raw.slice(2);
  else input.value = raw;
}
async function studentLogin() {
  const input = document.getElementById('srCodeInput');
  const errBox = document.getElementById('srCodeError');
  const errMsg = document.getElementById('srCodeErrorMsg');
  const btn = document.getElementById('studentLoginBtn');
  const srCode = (input ? input.value : '').trim();
  if (!srCode.match(/^\d{2}-\d{5}$/)) {
    errMsg.textContent = 'Format: YY-NNNNN';
    errBox.style.display = 'block';
    return;
  }
  btn.innerHTML = 'Verifying...';
  btn.disabled = true;
  errBox.style.display = 'none';
  try {
    const res = await fetch('/api/students/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ srCode })
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem('fh_student', JSON.stringify({ srCode: data.srCode, name: data.name }));
      document.getElementById('popupStudentName').textContent = data.name;
      document.getElementById('popupSrCode').textContent = data.srCode;
      document.getElementById('popupProgram').textContent = data.program || 'Student';
      document.getElementById('studentLoginView').style.display = 'none';
      try {
        const oRes = await fetch(`/api/orders/student/${data.srCode}`);
        if (oRes.ok) {
           const orders = await oRes.json();
           const myOrders = orders.map(o => ({
             code: o.code,
             orderId: o.id,
             stall: o.stallName,
             time: o.createdAt,
             status: o.status,
             total: o.total,
             itemsSummary: o.items ? o.items.map(i => i.quantity + 'x ' + i.name).join(', ') : ''
           }));
           localStorage.setItem('fh_my_orders', JSON.stringify(myOrders.slice(0, 20)));
        }
      } catch(e) {
          console.error('Failed to fetch orders on login', e);
      }
      document.getElementById('studentDetailsPopup').style.display = 'block';
      setTimeout(() => {
        document.getElementById('studentDetailsPopup').style.display = 'none';
        showStudentDashboard();
      }, 2500);
    } else {
      errMsg.textContent = data.error || 'Not found.';
      errBox.style.display = 'block';
    }
  } catch (e) {
    errMsg.textContent = 'Server error.';
    errBox.style.display = 'block';
  } finally {
    btn.innerHTML = 'Enter FoodHub';
    btn.disabled = false;
  }
}
function showStudentDashboard() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('studentDashboard').classList.add('active');
  loadStalls();
  const student = JSON.parse(localStorage.getItem('fh_student') || 'null');
  const greetEl = document.querySelector('#sPanel_home [data-student-greeting]');
  if (greetEl && student) greetEl.textContent = `Welcome, ${student.name.split(' ')[0]}!`;
  const nameShort = document.querySelector('[data-student-name-short]');
  const srShort = document.querySelector('[data-student-sr-short]');
  if (nameShort && student) nameShort.textContent = student.name.split(' ')[0];
  if (srShort && student) srShort.textContent = student.srCode;
}
async function adminLogin(event) {
  event.preventDefault();
  const stallId = document.getElementById('adminStallSelect').value;
  const password = document.getElementById('adminPassword').value;
  const btn = event.target.querySelector('[type="submit"]');
  if (!stallId) return;
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stallId: parseInt(stallId), password })
    });
    const data = await res.json();
    if (!res.ok) {
      showNotification(data.message || 'Invalid password.', 'error');
      return;
    }
    localStorage.setItem('adminAuth', stallId);
    localStorage.setItem('currentStallId', stallId);
    localStorage.setItem('sessionToken', data.token);
    showAdminDashboard();
  } catch (e) {
    showNotification('Server error.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
  }
}
function showAdminDashboard() {
  const sid = localStorage.getItem('adminAuth');
  if (!sid) { showAdminLogin(); return; }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('adminDashboard').classList.add('active');
  updateAdminDashboardHeader();
  loadAdminDashboardData();
}
function updateAdminDashboardHeader() {
  const sid = localStorage.getItem('currentStallId');
  if (sid) {
    const s = stalls.find(st => st.id === parseInt(sid));
    if (s) {
      const el = document.querySelector('#adminStallNameDisplay');
      if (el) el.textContent = s.name;
    }
  }
}
function loadAdminDashboardData() {
  const sid = localStorage.getItem('currentStallId');
  if (sid) {
    const s = stalls.find(st => st.id === parseInt(sid));
    if (s) {
      const img = document.getElementById('adminCurrentImage');
      if (img) img.src = s.image || 'public/images/default-menu.png';
      document.getElementById('adminStallName').value = s.name || '';
      document.getElementById('adminStallDescription').value = s.description || '';
      const status = document.querySelector(`input[name="stallStatus"][value="${s.status}"]`);
      if (status) status.checked = true;
      if (typeof loadAdminOrders === 'function') loadAdminOrders();
      if (typeof renderAnalyticsDashboard === 'function') renderAnalyticsDashboard();
    }
  }
}
function showMenuManagement() {
  if (!localStorage.getItem('currentStallId')) return;
  document.getElementById('menuManagementModal').classList.add('active');
  loadMenuManagementData();
}
function closeMenuManagement() {
  document.getElementById('menuManagementModal').classList.remove('active');
}
function loadMenuManagementData() {
  const sid = parseInt(localStorage.getItem('currentStallId'));
  currentMenuItems = generateCurrentMenuItems(sid);
  renderMenuManagement();
  updateMenuStats();
}
function getMenuItemImagePath(stallName, index, stallId) {
  const menu = stallMenuMap[stallName];
  if (menu && menu.images && menu.images[index - 1]) return menu.images[index - 1];
  return `public/images/menu${stallId}_${index}.jpg`;
}
function generateCurrentMenuItems(stallId) {
  const s = stalls.find(st => st.id === stallId);
  const states = window.menuStates || {};
  const saved = states[String(stallId)];
  if (saved && Array.isArray(saved) && saved.length > 0) {
    return saved.map((it, idx) => ({
      id: it.id ?? idx + 1,
      name: it.name || getMenuItemName(s.name, idx + 1),
      description: it.description || getMenuItemDescription(s.name, idx + 1),
      price: it.price ?? getMenuItemPrice(s.name, idx + 1),
      available: it.available ?? true,
      image: it.image || getMenuItemImagePath(s.name, idx + 1, stallId)
    }));
  }
  const items = [];
  for (let i = 1; i <= s.menuCount; i++) {
    items.push({
      id: i,
      name: getMenuItemName(s.name, i),
      description: getMenuItemDescription(s.name, i),
      price: getMenuItemPrice(s.name, i),
      available: true,
      image: getMenuItemImagePath(s.name, i, stallId)
    });
  }
  return items;
}
function getMenuItemName(stall, i) {
  const m = stallMenuMap[stall];
  return (m && m.names && m.names[i - 1]) ? m.names[i - 1] : `${stall} Item ${i}`;
}
function getMenuItemDescription(stall, i) {
  const m = stallMenuMap[stall];
  return (m && m.descriptions && m.descriptions[i - 1]) ? m.descriptions[i - 1] : 'Delicious menu item';
}
function getMenuItemPrice(stall, i) {
  const m = stallMenuMap[stall];
  return (m && m.prices && m.prices[i - 1] !== undefined) ? m.prices[i - 1] : 50;
}
function getMenuCategory(stall, i) {
  const m = stallMenuMap[stall];
  if (m && m.categories) {
    if (typeof m.categories === 'string') return m.categories;
    if (Array.isArray(m.categories) && m.categories[i - 1]) return m.categories[i - 1];
  }
  return 'Main Dish';
}
let currentMenuItems = [];
function renderMenuManagement() {
  const container = document.getElementById('menuItemsContainer');
  container.innerHTML = '';
  currentMenuItems.forEach((item, index) => {
    const isAvail = item.available !== false;
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-gray-100 mb-4 p-5 relative shadow-sm';
    card.innerHTML = `
      <div class="flex items-start gap-6">
        <div class="relative w-28 h-24 flex-shrink-0">
          <img src="${item.image || 'public/images/default-menu.png'}" class="w-full h-full object-cover rounded-xl border border-gray-100" onerror="this.src='public/images/default-menu.png'">
          <button onclick="removeMenuItem(${index})" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Item Name</label>
            <input type="text" value="${item.name || ''}" onchange="updateMenuItem(${index}, 'name', this.value)" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary">
          </div>
          <div class="row-span-2 col-start-2 row-start-1">
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
            <textarea onchange="updateMenuItem(${index}, 'description', this.value)" class="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-primary h-full min-h-[90px] resize-none">${item.description || ''}</textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Price (₱)</label>
            <input type="number" value="${item.price || 0}" onchange="updateMenuItem(${index}, 'price', parseFloat(this.value))" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary">
          </div>
          <div class="col-start-1">
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
            <div class="flex bg-gray-100 p-1 rounded-xl w-fit">
              <button onclick="updateMenuItem(${index}, 'available', true); renderMenuManagement();" class="px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${isAvail ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Available</button>
              <button onclick="updateMenuItem(${index}, 'available', false); renderMenuManagement();" class="px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${!isAvail ? 'bg-gray-300 text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Sold Out</button>
            </div>
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });
}
window.addNewMenuItem = function() {
  currentMenuItems.unshift({
    id: Date.now(),
    name: 'New Item',
    description: '',
    price: 50,
    available: true,
    image: 'public/images/default-menu.png'
  });
  renderMenuManagement();
  updateMenuStats();
};
function updateMenuItem(idx, field, val) {
  currentMenuItems[idx][field] = val;
  updateMenuStats();
}
function removeMenuItem(idx) {
  if (confirm('Are you sure you want to completely remove this item?')) {
    currentMenuItems.splice(idx, 1);
    renderMenuManagement();
    updateMenuStats();
  }
}
function updateMenuStats() {
  const total = currentMenuItems.length;
  const avail = currentMenuItems.filter(i => i.available !== false).length;
  const soldout = total - avail;
  let avgPrice = 0;
  if(total > 0) avgPrice = Math.round(currentMenuItems.reduce((sum, item) => sum + (item.price||0), 0) / total);
  if (document.getElementById('totalMenuItems')) document.getElementById('totalMenuItems').textContent = total;
  if (document.getElementById('availableMenuItems')) document.getElementById('availableMenuItems').textContent = avail;
  if (document.getElementById('soldOutMenuItems')) document.getElementById('soldOutMenuItems').textContent = soldout;
  if (document.getElementById('avgMenuPrice')) document.getElementById('avgMenuPrice').textContent = '₱' + avgPrice;
}
function saveMenuChanges() {
  const sid = parseInt(localStorage.getItem('currentStallId'));
  fetch(`/api/menu-states/${sid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentMenuItems)
  }).then(() => {
    showNotification('Saved!', 'success');
    closeMenuManagement();
  });
}
function logout() {
  localStorage.clear();
  showLogin();
}
function showAbout() {
  const m = document.getElementById('aboutModal');
  if (m) m.classList.add('active');
}
function closeAbout() {
  const m = document.getElementById('aboutModal');
  if (m) m.classList.remove('active');
}
window.showAbout = showAbout;
window.closeAbout = closeAbout;
window.showLogin = showLogin;
window.showAdminLogin = showAdminLogin;
window.showStudentDashboard = showStudentDashboard;
window.showAdminDashboard = showAdminDashboard;
window.adminLogin = adminLogin;
window.logout = logout;
window.generateCurrentMenuItems = generateCurrentMenuItems;
window.initializeMenuMap = initializeMenuMap;
window.showStudentLoginForm = showStudentLoginForm;
window.showLoginRoleView = showLoginRoleView;
window.formatSrCodeInput = formatSrCodeInput;
window.studentLogin = studentLogin;
