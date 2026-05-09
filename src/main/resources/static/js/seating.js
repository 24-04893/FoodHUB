let generalSeating = Array(160).fill().map((_, i) => ({
  id: i + 1,
  tableId: Math.floor(i / 8) + 1,
  seatNumber: (i % 8) + 1,
  occupied: Math.random() < 0.225
}));
let privateSeating = Array(48).fill().map((_, i) => ({
  id: i + 1,
  tableId: Math.floor(i / 8) + 1,
  seatNumber: (i % 8) + 1,
  occupied: Math.random() < 0.125
}));
function showSeatingMap() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('seatingMapPage').classList.add('active');
  renderGeneralSeating();
  updateSeatingStats();
}
function openSeatMapModal() {
  const m = document.getElementById('seatMapModal');
  if (m) m.classList.add('active');
  renderPrivateSeating();
  updatePrivateSeatingStats();
}
function closeSeatMapModal() {
  const m = document.getElementById('seatMapModal');
  if (m) m.classList.remove('active');
}
function renderGeneralSeating() {
  const grid = document.getElementById('generalSeatingGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let tid = 1; tid <= 20; tid++) {
    const seats = generalSeating.filter(s => s.tableId === tid);
    const occ = seats.filter(s => s.occupied).length;
    const avail = 8 - occ;
    const full = avail === 0;
    const card = document.createElement('div');
    card.className = `p-6 rounded-[24px] border-2 transition-all ${full ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full flex items-center justify-center ${full ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg">
            <i class="${full ? 'ri-close-line' : 'ri-check-line'}"></i>
          </div>
          <h3 class="font-black text-gray-900">Table ${tid}</h3>
        </div>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">${avail} / 8 FREE</p>
      </div>
      <div class="space-y-2">
        <button onclick="occupySeat(${tid})" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl text-[11px] font-black shadow-md transition-all disabled:opacity-30" ${full ? 'disabled' : ''}>
          <i class="ri-user-add-line mr-1"></i> OCCUPY SEAT
        </button>
        <button onclick="freeSeat(${tid})" class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-[11px] font-black shadow-md transition-all disabled:opacity-30" ${occ === 0 ? 'disabled' : ''}>
          <i class="ri-user-minus-line mr-1"></i> FREE SEAT
        </button>
      </div>`;
    grid.appendChild(card);
  }
}
function occupySeat(tid) {
  const seat = generalSeating.find(s => s.tableId === tid && !s.occupied);
  if (seat) { seat.occupied = true; renderGeneralSeating(); updateSeatingStats(); }
}
function freeSeat(tid) {
  const seat = generalSeating.find(s => s.tableId === tid && s.occupied);
  if (seat) { seat.occupied = false; renderGeneralSeating(); updateSeatingStats(); }
}
function updateSeatingStats() {
  const avail = generalSeating.filter(s => !s.occupied).length;
  const occ = generalSeating.filter(s => s.occupied).length;
  if (document.getElementById('generalAvailableSeats')) document.getElementById('generalAvailableSeats').textContent = avail;
  if (document.getElementById('generalOccupiedSeats')) document.getElementById('generalOccupiedSeats').textContent = occ;
  if (document.getElementById('availableSeatsCount')) document.getElementById('availableSeatsCount').textContent = avail;
}
function renderPrivateSeating() {
  const grid = document.getElementById('privateSeatingGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let tid = 1; tid <= 6; tid++) {
    const seats = privateSeating.filter(s => s.tableId === tid);
    const occ = seats.filter(s => s.occupied).length;
    const avail = 8 - occ;
    const full = avail === 0;
    const card = document.createElement('div');
    card.className = `p-6 rounded-[24px] border-2 transition-all ${full ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full flex items-center justify-center ${full ? 'bg-red-500' : 'bg-green-500'} text-white shadow-lg">
            <i class="${full ? 'ri-close-line' : 'ri-check-line'}"></i>
          </div>
          <h3 class="font-black text-gray-900">Table ${tid}</h3>
        </div>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">${avail} / 8 FREE</p>
      </div>
      <div class="space-y-2">
        <button onclick="occupyPrivateSeat(${tid})" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl text-[11px] font-black shadow-md transition-all disabled:opacity-30" ${full ? 'disabled' : ''}>
          <i class="ri-user-add-line mr-1"></i> OCCUPY SEAT
        </button>
        <button onclick="freePrivateSeat(${tid})" class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl text-[11px] font-black shadow-md transition-all disabled:opacity-30" ${occ === 0 ? 'disabled' : ''}>
          <i class="ri-user-minus-line mr-1"></i> FREE SEAT
        </button>
      </div>`;
    grid.appendChild(card);
  }
}
function occupyPrivateSeat(tid) {
  const seat = privateSeating.find(s => s.tableId === tid && !s.occupied);
  if (seat) { seat.occupied = true; renderPrivateSeating(); updatePrivateSeatingStats(); }
}
function freePrivateSeat(tid) {
  const seat = privateSeating.find(s => s.tableId === tid && s.occupied);
  if (seat) { seat.occupied = false; renderPrivateSeating(); updatePrivateSeatingStats(); }
}
function updatePrivateSeatingStats() {
  const avail = privateSeating.filter(s => !s.occupied).length;
  const occ = privateSeating.filter(s => s.occupied).length;
  if (document.getElementById('privateAvailableSeats')) document.getElementById('privateAvailableSeats').textContent = avail;
  if (document.getElementById('privateOccupiedSeats')) document.getElementById('privateOccupiedSeats').textContent = occ;
}
window.showSeatingMap = showSeatingMap;
window.occupySeat = occupySeat;
window.freeSeat = freeSeat;
window.openSeatMapModal = openSeatMapModal;
window.closeSeatMapModal = closeSeatMapModal;
window.occupyPrivateSeat = occupyPrivateSeat;
window.freePrivateSeat = freePrivateSeat;
