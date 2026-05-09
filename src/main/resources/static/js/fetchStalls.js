(function () {
  async function load() {
    try {
      const [res, stateRes] = await Promise.all([fetch('/api/stalls'), fetch('/api/menu-states')]);
      if (!res.ok) return;
      const data = await res.json();
      const states = stateRes && stateRes.ok ? await stateRes.json() : {};
      window.stalls = data;
      window.menuStates = states || {};
      if (typeof loadStalls === 'function') loadStalls();
      if (typeof updateStallCounts === 'function') updateStallCounts();
    } catch (err) {}
  }
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(load, 100);
  });
})();
