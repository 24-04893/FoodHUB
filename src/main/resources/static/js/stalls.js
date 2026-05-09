window.stalls = [
  { id: 1, name: 'Cafe Aromatiko', menuCount: 48, description: 'Offers frappes, coffee, and milk tea', status: 'open', rating: 4.8, phone: '0910-000-0002', email: 'aromatiko@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/Cafearomatiko/cafearomatikologo.jpg' },
  { id: 2, name: 'Chowking', menuCount: 4, description: 'Filipino-Chinese fast-food meals', status: 'open', rating: 4.2, phone: '0910-000-0003', email: 'chowking@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/chowking/chowking logo.jpg' },
  { id: 3, name: 'Fried Noodles Haus', menuCount: 8, description: 'Specializes in fried noodles', status: 'open', rating: 4.1, phone: '0910-000-0004', email: 'friednoodles@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/friednoodles/friednoodleslogo.jpg' },
  { id: 4, name: 'Happy Haus Donuts', menuCount: 8, description: 'Variety of delicious donuts', status: 'open', rating: 4.5, phone: '0910-000-0005', email: 'happyhaus@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/Happy Haus Donuts/Happy house logo.png' },
  { id: 6, name: 'Juice Bar', menuCount: 10, description: 'Juices and palamig drinks', status: 'open', rating: 4.3, phone: '0910-000-0007', email: 'juicebar@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/juicebar/juicebarlogo.png' },
  { id: 7, name: "Julie's Bakeshop", menuCount: 8, description: 'Fresh breads and pastries', status: 'open', rating: 4.2, phone: '0910-000-0008', email: 'julies@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/JuliesBakeshop/Julies Logo.jpg' },
  { id: 8, name: 'Little Tokyo Takoyaki', menuCount: 8, description: 'Japanese-style takoyaki', status: 'open', rating: 4.5, phone: '0910-000-0009', email: 'littletokyo@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/littletakoyako/LITTTLE TAKOYAKI LOGO.jpg' },
  { id: 9, name: 'Potato Corner', menuCount: 12, description: 'Flavored fries and snacks', status: 'open', rating: 4.0, phone: '0910-000-0010', email: 'potatocorner@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/potatocorner/potato corner logo.png' },
  { id: 10, name: 'RC Beef Shawarma', menuCount: 4, description: 'Shawarma rice and pita wraps', status: 'open', rating: 4.1, phone: '0910-000-0011', email: 'rcshawarma@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/rcbeefshawarma/rcbeefshawarmalogo.png' },
  { id: 11, name: "RR Sorella's", menuCount: 30, description: 'Pizza and Italian snacks', status: 'open', rating: 4.6, phone: '0910-000-0012', email: 'rrsorellas@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/RR Sorellas Homemade/RR SORELLAS HOMEMADE LOGO.jpg' },
  { id: 12, name: 'Spot-G Food Hub', menuCount: 24, description: 'Simple lutong-bahay meals.', status: 'open', rating: 4.0, phone: '0910-000-0013', email: 'spotg@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/spotg/spotglogo.png' },
  { id: 13, name: 'Tender Juicy Hotdogs', menuCount: 12, description: 'Hotdog sandwiches', status: 'open', rating: 4.1, phone: '0910-000-0014', email: 'tenderjuicy@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/tender juicy hotdogs/TENDER_JUICY_HOTDOG_logo.jpg'},
  { id: 14, name: 'Theatery', menuCount: 24, description: 'Filipino lutong-bahay meals', status: 'open', rating: 4.4, phone: '0910-000-0015', email: 'theatery@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/theatery/carinderia.jpg' },
  { id: 15, name: 'Waffle Time', menuCount: 11, description: 'Freshly cooked waffles', status: 'open', rating: 4.3, phone: '0910-000-0016', email: 'waffletime@foodhub.local', location: 'Ground Floor, Albert Einstein Building', image: 'public/images/WaffleTime/waffle time logo.png' }
];
let showOpenOnly = false;
let searchTerm = '';
function getFilteredStalls() {
  const term = searchTerm.trim().toLowerCase();
  let list = showOpenOnly ? window.stalls.filter(s => s.status === 'open') : [...window.stalls];
  if (term.length > 0) {
    list = list.filter(s => {
      if (s.name.toLowerCase().includes(term) || (s.description || '').toLowerCase().includes(term)) return true;
      return false;
    });
  }
  return list;
}
function isStallCurrentlyOpen(s) {
  if (!s || s.status !== 'open') return false;
  const now = new Date();
  const day = now.getDay(); 
  const hour = now.getHours();
  const min = now.getMinutes();
  const currentTime = hour + min / 60;
  if (day === 0) return false; 
  if (day === 6) return (currentTime >= 8 && currentTime < 18); 
  return (currentTime >= 7 && currentTime < 17); 
}
function loadStalls() {
  const grid = document.getElementById('stallsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  getFilteredStalls().forEach(s => {
    const isFav = typeof FavoritesManager !== 'undefined' && FavoritesManager.isFavorite(s.id);
    const isOpen = isStallCurrentlyOpen(s);
    const card = document.createElement('div');
    card.className = 'fh-card bg-white rounded-[24px] p-5 shadow-sm cursor-pointer relative group';
    card.onclick = (e) => {
      if (e.target.closest('.fh-heart-btn')) return;
      showStallDetail(s.id);
    };
    card.innerHTML = `
      <div class="h-44 w-full bg-gray-100 rounded-[20px] overflow-hidden mb-4 relative">
        <img src="${s.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
        <button class="fh-heart-btn ${isFav ? 'favorited' : ''}" onclick="event.stopPropagation(); FavoritesManager.toggle(${s.id}, '${escHtml(s.name)}'); loadStalls();">
          <i class="ri-heart-line"></i>
          <i class="ri-heart-fill"></i>
        </button>
        <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm flex items-center gap-1.5">
          <div class="stall-status-dot ${isOpen ? 'open' : 'closed'}"></div>
          ${isOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>
      <h3 class="text-lg font-black text-gray-900 leading-tight">${s.name}</h3>
      <p class="text-xs text-gray-400 mt-1 line-clamp-1">${s.description}</p>
      <div class="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
        <div class="flex items-center gap-1.5 text-xs font-bold text-gray-600">
          <i class="ri-restaurant-line text-primary"></i>
          ${s.menuCount} Items
        </div>
        <div class="flex items-center gap-1 text-xs font-black text-yellow-500">
          <i class="ri-star-fill"></i>
          ${s.rating || '4.0'}
        </div>
      </div>`;
    grid.appendChild(card);
  });
  updateStallCounts();
}
function toggleOpenOnly() {
  showOpenOnly = !showOpenOnly;
  loadStalls();
}
function updateStallCounts() {
  const openEl = document.getElementById('openStallsCount');
  if (openEl) openEl.textContent = window.stalls.filter(s => s.status === 'open').length;
  const totalEl = document.getElementById('totalStallsCount');
  if (totalEl) totalEl.textContent = window.stalls.length;
}
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('searchInput');
  if (inp) inp.addEventListener('input', e => { searchTerm = e.target.value; loadStalls(); });
  loadStalls();
});
window.loadStalls = loadStalls;
