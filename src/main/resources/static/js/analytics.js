function generateSalesData(stallId, daysCount = 7) {
  const days = [];
  const labels = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const base = 800 + (stallId * 73 + i * 31) % 1800;
    days.push([0, 6].includes(d.getDay()) ? Math.round(base * 0.65) : base + Math.round(Math.random() * 400));
  }
  const peakHours = [];
  const hourLabels = [];
  for (let h = 7; h <= 19; h++) {
    hourLabels.push(`${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`);
    const isPeak = (h >= 11 && h <= 13) || (h >= 16 && h <= 18);
    peakHours.push(isPeak ? 15 + Math.round(Math.random() * 25) : 3 + Math.round(Math.random() * 12));
  }
  return { labels, days, peakHours, hourLabels };
}
function generateMenuBestsellerData(stallId, topN = 8) {
  let items = typeof generateCurrentMenuItems === 'function' ? generateCurrentMenuItems(stallId) : [];
  if (!items.length) return { names: [], counts: [], colors: [] };
  const ranked = items.filter(it => it.available !== false).map((it, idx) => ({
    name: it.name.length > 22 ? it.name.slice(0, 21) + '…' : it.name,
    count: 20 + Math.abs(Math.floor((Math.sin(stallId * 9301 + idx * 49297) * 233280) % 180))
  })).sort((a, b) => b.count - a.count).slice(0, topN);
  const colors = ranked.map((_, i) => `rgba(220,38,38,${0.9 - (i * 0.1)})`);
  return { names: ranked.map(r => r.name), counts: ranked.map(r => r.count), colors };
}
async function fetchAnalyticsKPIs(stallId, token) {
  try {
    const res = await fetch(`/api/orders/stall/${stallId}/analytics`, { headers: { 'X-Session-Token': token } });
    if (res.ok) return await res.json();
  } catch {}
  return { totalOrders: 12, completedOrders: 8, pendingOrders: 2, readyOrders: 1, totalRevenue: 1500, avgOrderValue: 125 };
}
let _salesChart = null, _peakChart = null, _bestsellerChart = null;
function destroyCharts() {
  [_salesChart, _peakChart, _bestsellerChart].forEach(c => { if (c) c.destroy(); });
}
async function renderAnalyticsDashboard() {
  const stallId = parseInt(localStorage.getItem('currentStallId') || '1');
  const token = localStorage.getItem('sessionToken') || '';
  const rangeInput = document.getElementById('analyticsTimeRange');
  const daysCount = rangeInput ? parseInt(rangeInput.value) : 7;
  const kpi = await fetchAnalyticsKPIs(stallId, token);
  const el = (id) => document.getElementById(id);
  if (el('kpiTodayOrders')) el('kpiTodayOrders').textContent = kpi.totalOrders || 0;
  if (el('kpiRevenue')) el('kpiRevenue').textContent = '₱' + Number(kpi.totalRevenue || 0).toLocaleString('en-PH', {minimumFractionDigits:2});
  if (el('kpiAvgValue')) el('kpiAvgValue').textContent = '₱' + Number(kpi.avgOrderValue || 0).toLocaleString('en-PH', {minimumFractionDigits:2});
  if (el('kpiCompletionRate')) {
    const rate = kpi.totalOrders > 0 ? Math.round((kpi.completedOrders / kpi.totalOrders) * 100) : 0;
    el('kpiCompletionRate').textContent = rate + '%';
  }
  const data = generateSalesData(stallId, daysCount);
  destroyCharts();
  const salesCtx = el('salesLineChart');
  if (salesCtx) {
    const ctx = salesCtx.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(220, 38, 38, 0.2)');
    gradient.addColorStop(1, 'rgba(220, 38, 38, 0.0)');
    _salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{ 
          label: 'Revenue', 
          data: data.days, 
          borderColor: '#DC2626', 
          borderWidth: 3,
          backgroundColor: gradient, 
          tension: 0.4, 
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#DC2626',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 13 },
            displayColors: false,
            callbacks: {
              label: (ctx) => `₱${ctx.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          y: { grid: { display: false }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }
  const peakCtx = el('peakHoursChart');
  if (peakCtx) {
    _peakChart = new Chart(peakCtx, {
      type: 'bar',
      data: {
        labels: data.hourLabels,
        datasets: [{ 
          label: 'Orders', 
          data: data.peakHours, 
          backgroundColor: '#3B82F6', 
          borderRadius: 8,
          hoverBackgroundColor: '#2563EB'
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            padding: 10
          }
        },
        scales: {
          y: { grid: { display: false }, ticks: { display: false } },
          x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  }
}
window.renderAnalyticsDashboard = renderAnalyticsDashboard;
window.refreshAnalytics = () => renderAnalyticsDashboard();
