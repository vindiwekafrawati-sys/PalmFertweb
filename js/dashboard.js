/**
 * PalmFert - Management Dashboard & Analytics Module
 * KPI Metrics, Chart.js visualisasi progres pemupukan, proporsi pupuk, dan analitik produktivitas.
 */

class DashboardModule {
  constructor() {
    this.charts = {};
  }

  init() {
    this.renderKPIs();
    this.initCharts();
  }

  refresh() {
    this.renderKPIs();
    this.updateCharts();
  }

  renderKPIs() {
    const blocks = window.estateDB.data.blocks;
    const realizations = window.estateDB.getRealizations();
    const inventory = window.estateDB.getInventory();

    const totalHa = blocks.reduce((acc, b) => acc + b.areaHa, 0);
    const completedBlocks = blocks.filter(b => b.status === 'completed');
    const inProgressBlocks = blocks.filter(b => b.status === 'in_progress');
    const fertilizedHa = completedBlocks.reduce((acc, b) => acc + b.areaHa, 0) + (inProgressBlocks.reduce((acc, b) => acc + b.areaHa, 0) * 0.4);
    const percentHa = totalHa > 0 ? ((fertilizedHa / totalHa) * 100).toFixed(1) : 0;

    const totalKg = realizations.reduce((acc, r) => acc + (r.kgUsed || 0), 0);
    const totalTon = (totalKg / 1000).toFixed(1);

    const totalTrees = realizations.reduce((acc, r) => acc + (r.treesDone || 0), 0);
    const totalHK = realizations.reduce((acc, r) => acc + (r.bkpCount || 0) + (r.bkrCount || 0), 0);
    const productivity = totalHK > 0 ? Math.round(totalTrees / totalHK) : 0;

    const criticalStockCount = inventory.filter(i => i.stockSak <= i.minStockSak).length;

    // Update DOM elements
    const kpiHa = document.getElementById('kpi-ha-fertilized');
    const kpiHaTarget = document.getElementById('kpi-ha-target');
    const kpiTon = document.getElementById('kpi-ton-fertilizer');
    const kpiProd = document.getElementById('kpi-labor-productivity');
    const kpiStock = document.getElementById('kpi-critical-stock');

    if (kpiHa) kpiHa.innerText = `${fertilizedHa.toFixed(1)} Ha (${percentHa}%)`;
    if (kpiHaTarget) kpiHaTarget.innerText = `dari total target ${totalHa.toFixed(0)} Ha`;
    if (kpiTon) kpiTon.innerText = `${totalTon} Ton`;
    if (kpiProd) kpiProd.innerText = `${productivity} Pkk/HK`;
    if (kpiStock) {
      kpiStock.innerText = `${criticalStockCount} Jenis Pupuk`;
      kpiStock.className = criticalStockCount > 0 ? 'text-xl font-black text-rose-600' : 'text-xl font-black text-emerald-600';
    }
  }

  initCharts() {
    if (typeof Chart === 'undefined') return;

    this.initAfdelingProgressChart();
    this.initFertilizerPieChart();
    this.initTrendChart();
  }

  initAfdelingProgressChart() {
    const ctx = document.getElementById('chart-afdeling-progress')?.getContext('2d');
    if (!ctx) return;

    if (this.charts.afdeling) this.charts.afdeling.destroy();

    const afdelings = window.estateDB.data.afdelings;
    const blocks = window.estateDB.data.blocks;

    const labels = afdelings.map(a => `Afd ${a.code}`);
    const completedData = afdelings.map(a => {
      const bList = blocks.filter(b => b.afdeling === a.code);
      const done = bList.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.areaHa, 0);
      return Number(done.toFixed(1));
    });
    const remainingData = afdelings.map(a => {
      const bList = blocks.filter(b => b.afdeling === a.code);
      const total = bList.reduce((sum, b) => sum + b.areaHa, 0);
      const done = bList.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.areaHa, 0);
      return Number(Math.max(0, total - done).toFixed(1));
    });

    this.charts.afdeling = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Selesai Terpupuk (Ha)',
            data: completedData,
            backgroundColor: '#15803d',
            borderRadius: 6
          },
          {
            label: 'Sisa Target (Ha)',
            data: remainingData,
            backgroundColor: '#e2e8f0',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} Ha`
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: '#f1f5f9' }, title: { display: true, text: 'Luas (Ha)' } }
        }
      }
    });
  }

  initFertilizerPieChart() {
    const ctx = document.getElementById('chart-fertilizer-breakdown')?.getContext('2d');
    if (!ctx) return;

    if (this.charts.fertilizer) this.charts.fertilizer.destroy();

    const realizations = window.estateDB.getRealizations();
    const fertMap = {};

    realizations.forEach(r => {
      const name = r.fertilizerName.split(' ')[0]; // short name
      fertMap[name] = (fertMap[name] || 0) + (r.kgUsed || 0);
    });

    const labels = Object.keys(fertMap).length ? Object.keys(fertMap) : ['NPK', 'MOP', 'Urea', 'RP'];
    const data = Object.keys(fertMap).length ? Object.values(fertMap).map(kg => (kg / 1000).toFixed(1)) : [25.4, 18.2, 14.0, 9.5];

    this.charts.fertilizer = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw} Ton`
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  initTrendChart() {
    const ctx = document.getElementById('chart-daily-trend')?.getContext('2d');
    if (!ctx) return;

    if (this.charts.trend) this.charts.trend.destroy();

    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['13 Ags', '14 Ags', '15 Ags', '16 Ags', '17 Ags', '18 Ags'],
        datasets: [
          {
            label: 'Pokok Dipupuk (Pkk)',
            data: [1450, 1820, 2100, 1950, 2400, 2680],
            borderColor: '#15803d',
            backgroundColor: 'rgba(21, 128, 61, 0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#15803d'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#f1f5f9' }, title: { display: true, text: 'Pokok' } }
        }
      }
    });
  }

  updateCharts() {
    this.initAfdelingProgressChart();
    this.initFertilizerPieChart();
    this.initTrendChart();
  }
}

window.dashboardModule = new DashboardModule();
