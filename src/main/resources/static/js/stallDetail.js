function showStallDetail(stallId) {
  const s = stalls.find(x => x.id === stallId);
  if (!s) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('stallDetailPage').classList.add('active');
  document.getElementById('stallDetailName').textContent = s.name;
  document.getElementById('stallDetailDescription').textContent = s.description;
  const isOpen = typeof isStallCurrentlyOpen === 'function' ? isStallCurrentlyOpen(s) : (s.status === 'open');
  document.getElementById('stallStatusBadge').textContent = isOpen ? 'Open' : 'Closed';
  document.getElementById('stallStatusBadge').className = `px-3 py-1 rounded-full text-sm font-medium ${isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
  document.getElementById('stallBanner').style.backgroundImage = `url('${s.image}')`;
  if (document.getElementById('stallPhone')) document.getElementById('stallPhone').textContent = s.phone || 'N/A';
  if (document.getElementById('stallLocation')) document.getElementById('stallLocation').textContent = s.location || 'Main Canteen';
  if (document.getElementById('stallRatingScore')) document.getElementById('stallRatingScore').textContent = (s.rating || 4.0).toFixed(1);
  const hoursContainer = document.getElementById('operatingHoursContainer');
  if (hoursContainer) {
    const day = new Date().getDay(); 
    const isMonFri = day >= 1 && day <= 5;
    const isSat = day === 6;
    const isSun = day === 0;
    hoursContainer.innerHTML = `
      <div class="flex justify-between items-center px-2 py-1.5 rounded-lg ${isMonFri ? 'bg-primary/10 border border-primary/20' : ''}">
        <span class="${isMonFri ? 'text-primary font-bold' : 'text-gray-500'}">Monday - Friday</span>
        <span class="font-bold ${isMonFri ? 'text-primary' : 'text-gray-900'}">7:00 AM - 5:00 PM</span>
      </div>
      <div class="flex justify-between items-center px-2 py-1.5 rounded-lg ${isSat ? 'bg-primary/10 border border-primary/20' : ''}">
        <span class="${isSat ? 'text-primary font-bold' : 'text-gray-500'}">Saturday</span>
        <span class="font-bold ${isSat ? 'text-primary' : 'text-gray-900'}">8:00 AM - 6:00 PM</span>
      </div>
      <div class="flex justify-between items-center px-2 py-1.5 rounded-lg ${isSun ? 'bg-red-50 border border-red-100' : ''}">
        <span class="${isSun ? 'text-red-600 font-bold' : 'text-gray-500'}">Sunday</span>
        <span class="font-bold ${isSun ? 'text-red-600' : 'text-gray-500'}">Closed</span>
      </div>
    `;
  }
  const aromatikoBtn = document.getElementById('aromatikoSeatingTriggerSidebar');
  if (aromatikoBtn) {
    if (stallId === 1) aromatikoBtn.classList.remove('hidden');
    else aromatikoBtn.classList.add('hidden');
  }
  window._currentStallId = stallId;
  const menu = typeof generateCurrentMenuItems === 'function' ? generateCurrentMenuItems(stallId) : generateMenuItems(stallId);
  window.currentMenuItems = menu;
  renderMenu(stallId, menu);
}
function groupMenuItems(items) {
  const grouped = {};
  items.forEach(it => {
    let base = it.name.includes(' - ') ? it.name.split(' - ')[0] : it.name.replace(/\b\d+\s*oz\b/i, '').trim();
    if (!grouped[base]) grouped[base] = { base, items: [], img: it.image, desc: it.description };
    grouped[base].items.push(it);
  });
  return Object.values(grouped);
}
function renderMenu(stallId, items) {
  const groups = groupMenuItems(items);
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  grid.innerHTML = '';
  groups.forEach((g, idx) => {
    const multi = g.items.length > 1;
    const prices = g.items.map(i => i.price);
    const priceText = multi ? `₱${Math.min(...prices)} - ₱${Math.max(...prices)}` : `₱${g.items[0].price}`;
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow overflow-hidden cursor-pointer';
    card.innerHTML = `
      <img src="${g.img}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h4 class="font-bold text-sm">${g.base}</h4>
        <p class="text-xs text-gray-500 mb-2 truncate">${g.desc}</p>
        <div class="flex justify-between items-center">
          <span class="font-bold text-red-600">${priceText}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full ${g.items[0].available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${g.items[0].available ? 'Available' : 'Sold Out'}</span>
        </div>
      </div>`;
    if (multi) card.onclick = () => showSizeOptions(g, idx);
    grid.appendChild(card);
  });
}
function showSizeOptions(g, idx) {
  const mid = `size-modal-${idx}`;
  let m = document.getElementById(mid);
  if (!m) { m = document.createElement('div'); m.id = mid; m.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100]'; document.body.appendChild(m); }
  m.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl relative flex flex-col max-h-[85vh]">
      <div class="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 class="text-xl font-black text-gray-900">${g.base}</h3>
        <button onclick="this.closest('#${mid}').remove()" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"><i class="ri-close-line text-lg"></i></button>
      </div>
      <div class="space-y-3 overflow-y-auto pr-2" style="scrollbar-width: thin;">
        ${g.items.map(it => {
          const isAvail = it.available !== false;
          return `
          <div class="flex items-center justify-between border border-gray-100 bg-gray-50/50 p-3 rounded-xl ${isAvail ? '' : 'opacity-60'}">
            <span class="text-sm font-medium ${isAvail ? 'text-gray-800' : 'text-gray-400 line-through'}">${it.name}</span>
            <div class="flex items-center gap-3">
              <span class="font-black ${isAvail ? 'text-red-600' : 'text-gray-400'}">₱${it.price}</span>
              ${!isAvail ? '<span class="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-md">SOLD OUT</span>' : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}
function generateMenuItems(stallId) {
  if (typeof window.generateCurrentMenuItems === 'function') return window.generateCurrentMenuItems(stallId);
  const s = stalls.find(x => x.id === stallId);
  const items = [];
  for (let i = 1; i <= s.menuCount; i++) {
    items.push({ id: i, name: getMenuItemName(s.name, i), description: getMenuItemDescription(s.name, i), price: getMenuItemPrice(s.name, i), available: true, image: getMenuItemImagePath(s.name, i, stallId) });
  }
  return items;
}
window.showStallDetail = showStallDetail;
window.showSizeOptions = showSizeOptions;
