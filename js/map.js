/**
 * PalmFert - GIS Digital Estate Block Map Module
 * Visualisasi peta digital blok perkebunan kelapa sawit interaktif dengan indikator status pemupukan berkode warna.
 */

class GISMapModule {
  constructor() {
    this.currentAfdFilter = 'all';
    this.currentStatusFilter = 'all';
  }

  init() {
    this.render();
    this.setupListeners();
  }

  render() {
    const container = document.getElementById('gis-map-canvas-container');
    if (!container) return;

    const afdelings = window.estateDB.data.afdelings;
    const blocks = window.estateDB.data.blocks;

    let filteredAfdelings = afdelings;
    if (this.currentAfdFilter !== 'all') {
      filteredAfdelings = afdelings.filter(a => a.code === this.currentAfdFilter);
    }

    container.innerHTML = `
      <div class="space-y-6">
        ${filteredAfdelings.map(afd => {
          const afdBlocks = blocks.filter(b => b.afdeling === afd.code);
          let displayBlocks = afdBlocks;
          if (this.currentStatusFilter !== 'all') {
            displayBlocks = afdBlocks.filter(b => b.status === this.currentStatusFilter);
          }

          const doneCount = afdBlocks.filter(b => b.status === 'completed').length;
          const progPercent = afdBlocks.length > 0 ? Math.round((doneCount / afdBlocks.length) * 100) : 0;

          return `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-600"></div>
                  <h4 class="font-extrabold text-slate-900 text-sm">${afd.name}</h4>
                  <span class="text-xs text-slate-500 font-mono">(${afdBlocks.length} Blok)</span>
                </div>
                <div class="flex items-center gap-3 text-xs">
                  <span class="text-slate-600">Progres: <strong>${doneCount}/${afdBlocks.length} Blok (${progPercent}%)</strong></span>
                  <div class="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-600 rounded-full" style="width: ${progPercent}%"></div>
                  </div>
                </div>
              </div>

              <!-- Block Grid Matrix -->
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                ${displayBlocks.map(b => {
                  let statusBg = 'bg-slate-100 border-slate-300 text-slate-700';
                  let statusIcon = 'clock';
                  let statusLabel = 'Belum Dipupuk';

                  if (b.status === 'completed') {
                    statusBg = 'bg-emerald-600 border-emerald-700 text-white shadow-sm hover:bg-emerald-700';
                    statusIcon = 'check-circle-2';
                    statusLabel = 'Selesai 100%';
                  } else if (b.status === 'in_progress') {
                    statusBg = 'bg-amber-500 border-amber-600 text-white shadow-sm hover:bg-amber-600 animate-pulse-slow';
                    statusIcon = 'loader';
                    statusLabel = 'Sedang Berjalan';
                  } else if (b.status === 'warning') {
                    statusBg = 'bg-rose-600 border-rose-700 text-white shadow-sm hover:bg-rose-700';
                    statusIcon = 'alert-octagon';
                    statusLabel = 'Perlu Investigasi';
                  }

                  return `
                    <div onclick="gisMapModule.showBlockDetails('${b.code}')" class="p-2.5 rounded-xl border cursor-pointer transition transform hover:-translate-y-1 hover:shadow-md ${statusBg} flex flex-col justify-between min-h-[90px]">
                      <div class="flex items-center justify-between">
                        <span class="font-black text-sm tracking-wide">Blok ${b.code}</span>
                        <i data-lucide="${statusIcon}" class="w-3.5 h-3.5 opacity-90"></i>
                      </div>
                      
                      <div class="text-[10px] space-y-0.5 my-1 opacity-90">
                        <div>${b.areaHa} Ha | ${b.trees.toLocaleString()} Pkk</div>
                        <div>TT: ${b.plantingYear} (${b.topography})</div>
                      </div>

                      <div class="text-[9px] font-bold uppercase tracking-wider py-0.5 px-1 rounded bg-black/20 text-center truncate">
                        ${statusLabel}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  showBlockDetails(blockCode) {
    const block = window.estateDB.getBlockByCode(blockCode);
    if (!block) return;

    const modal = document.getElementById('modal-block-details');
    const content = document.getElementById('modal-block-content');
    if (!modal || !content) return;

    const realizations = window.estateDB.getRealizations().filter(r => r.blockCode === blockCode);

    let statusBadge = '';
    if (block.status === 'completed') {
      statusBadge = '<span class="badge-approved px-2.5 py-1 text-xs font-bold rounded-full">🟢 Pemupukan Selesai 100%</span>';
    } else if (block.status === 'in_progress') {
      statusBadge = '<span class="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 text-xs font-bold rounded-full">🟡 Sedang Berjalan (In Progress)</span>';
    } else if (block.status === 'warning') {
      statusBadge = '<span class="badge-rejected px-2.5 py-1 text-xs font-bold rounded-full">🔴 Perlu Perhatian / Variansi Anomali</span>';
    } else {
      statusBadge = '<span class="bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 text-xs font-bold rounded-full">⚪ Belum Dimulai (Planned)</span>';
    }

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 class="text-lg font-black text-slate-900">Blok ${block.code} - Afdeling ${block.afdeling}</h3>
            <span class="text-xs text-slate-500">Tahun Tanam: ${block.plantingYear} | Topografi: ${block.topography}</span>
          </div>
          ${statusBadge}
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Luas Blok</span>
            <strong class="text-base text-slate-900">${block.areaHa} Ha</strong>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Total Pokok</span>
            <strong class="text-base text-slate-900">${block.trees.toLocaleString()} Pkk</strong>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">SPH Kerapatan</span>
            <strong class="text-base text-slate-900">${block.sph} Pkk/Ha</strong>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Aplikasi Terakhir</span>
            <strong class="text-sm text-emerald-800">${block.lastFertilized}</strong>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-bold text-xs uppercase text-slate-700 tracking-wider">Riwayat Aplikasi Pemupukan di Blok Ini:</h4>
          ${realizations.length > 0 ? `
            <div class="space-y-2 max-h-48 overflow-y-auto">
              ${realizations.map(r => `
                <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <strong class="text-slate-900 block">${r.fertilizerName} (${r.actualDose} Kg/Pkk)</strong>
                    <span class="text-[10px] text-slate-500">${r.date} ${r.time} • Mandor: ${r.mandorName}</span>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded ${r.varianceStatus === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                    ${r.variancePercent > 0 ? '+' : ''}${r.variancePercent}%
                  </span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="p-4 bg-slate-50 text-center text-slate-400 text-xs rounded-lg border border-slate-200">
              Belum ada data aplikasi pemupukan tercatat untuk blok ini semester ini.
            </div>
          `}
        </div>

        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button onclick="gisMapModule.closeBlockModal()" class="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition">
            Tutup
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeBlockModal() {
    const modal = document.getElementById('modal-block-details');
    if (modal) modal.classList.add('hidden');
  }

  setupListeners() {
    const afdFilter = document.getElementById('gis-filter-afdeling');
    const statusFilter = document.getElementById('gis-filter-status');

    if (afdFilter) {
      afdFilter.addEventListener('change', (e) => {
        this.currentAfdFilter = e.target.value;
        this.render();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentStatusFilter = e.target.value;
        this.render();
      });
    }

    const modal = document.getElementById('modal-block-details');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeBlockModal();
      });
    }
  }
}

window.gisMapModule = new GISMapModule();
