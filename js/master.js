/**
 * PalmFert - Master Data Management Module
 * Manajemen Master Blok, Rekomendasi Pupuk, dan Data Pengguna/Pekerja Lapangan.
 */

class MasterDataModule {
  constructor() {
    this.currentTab = 'blocks'; // 'blocks', 'fertilizers', 'workers'
  }

  init() {
    this.renderTabs();
    this.renderCurrentTab();
    this.setupListeners();
  }

  setTab(tab) {
    this.currentTab = tab;
    this.renderTabs();
    this.renderCurrentTab();
  }

  renderTabs() {
    const container = document.getElementById('master-tabs-nav');
    if (!container) return;

    const tabs = [
      { id: 'blocks', label: '1. Master Blok & Afdeling', icon: 'map' },
      { id: 'fertilizers', label: '2. Master Pupuk & Dosis', icon: 'flask-conical' },
      { id: 'workers', label: '3. Data Pekerja & Mandor', icon: 'users' }
    ];

    container.innerHTML = tabs.map(t => {
      const isActive = this.currentTab === t.id;
      return `
        <button onclick="masterDataModule.setTab('${t.id}')" class="flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${isActive ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'}">
          <i data-lucide="${t.icon}" class="w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}"></i>
          <span>${t.label}</span>
        </button>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderCurrentTab() {
    const container = document.getElementById('master-tab-content');
    if (!container) return;

    if (this.currentTab === 'blocks') {
      this.renderBlocksTable(container);
    } else if (this.currentTab === 'fertilizers') {
      this.renderFertilizersTable(container);
    } else {
      this.renderWorkersTable(container);
    }
  }

  renderBlocksTable(container) {
    const blocks = window.estateDB.data.blocks;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-xs text-slate-500 font-semibold">Total: <strong>${blocks.length} Blok Kebun</strong></span>
          <button onclick="masterDataModule.openAddBlockModal()" class="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>+ Tambah Blok Baru</span>
          </button>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">Afdeling</th>
                <th class="p-3">Kode Blok</th>
                <th class="p-3">Luas (Ha)</th>
                <th class="p-3">Jumlah Pokok</th>
                <th class="p-3">SPH (Pkk/Ha)</th>
                <th class="p-3">Thn Tanam</th>
                <th class="p-3">Topografi</th>
                <th class="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${blocks.map(b => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3 font-bold text-emerald-800">Afd ${b.afdeling}</td>
                  <td class="p-3 font-black text-slate-900">Blok ${b.code}</td>
                  <td class="p-3 font-bold">${b.areaHa} Ha</td>
                  <td class="p-3 font-bold">${b.trees.toLocaleString()} Pkk</td>
                  <td class="p-3">${b.sph}</td>
                  <td class="p-3 font-mono">${b.plantingYear}</td>
                  <td class="p-3">${b.topography}</td>
                  <td class="p-3 text-right space-x-1">
                    <button onclick="masterDataModule.deleteBlock('${b.code}')" class="text-rose-600 hover:text-rose-800 font-bold text-xs p-1 hover:bg-rose-50 rounded">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderFertilizersTable(container) {
    const fertilizers = window.estateDB.getFertilizers();

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-xs text-slate-500 font-semibold">Total: <strong>${fertilizers.length} Jenis Pupuk Terdaftar</strong></span>
          <button onclick="masterDataModule.openAddFertilizerModal()" class="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>+ Tambah Jenis Pupuk</span>
          </button>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">Nama Pupuk</th>
                <th class="p-3">Kategori</th>
                <th class="p-3">Satuan</th>
                <th class="p-3">Rekomendasi Dosis</th>
                <th class="p-3">Metode Standar</th>
                <th class="p-3">Fungsi / Deskripsi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${fertilizers.map(f => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3 font-bold text-slate-900">${f.name}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${f.category}</span></td>
                  <td class="p-3 font-mono">${f.unit}</td>
                  <td class="p-3 font-black text-emerald-800">${f.defaultKgPerTree} Kg / Pokok</td>
                  <td class="p-3 text-slate-600">${f.method}</td>
                  <td class="p-3 text-slate-500 text-[11px] max-w-xs truncate">${f.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderWorkersTable(container) {
    const users = window.estateDB.data.users;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-xs text-slate-500 font-semibold">Total: <strong>${users.length} Tenaga Lapangan & Staf</strong></span>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">Kode / ID</th>
                <th class="p-3">Nama Pegawai</th>
                <th class="p-3">Jabatan / Role</th>
                <th class="p-3">Afdeling Penugasan</th>
                <th class="p-3">Nomor Kontak (HP)</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${users.map(u => {
                let roleTag = '';
                if (u.role === 'mandor') roleTag = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Mandor Pemupukan</span>';
                else if (u.role === 'gudang') roleTag = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Kerani Gudang</span>';
                else if (u.role === 'asisten') roleTag = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Asisten Afdeling</span>';
                else roleTag = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Estate Manager</span>';

                return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="p-3 font-mono font-bold">${u.code}</td>
                    <td class="p-3 font-bold text-slate-900">${u.name}</td>
                    <td class="p-3">${roleTag}</td>
                    <td class="p-3 font-semibold text-slate-700">Afd ${u.afdeling}</td>
                    <td class="p-3 font-mono text-slate-600">${u.phone}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Aktif</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  openAddBlockModal() {
    const modal = document.getElementById('modal-add-block');
    if (modal) modal.classList.remove('hidden');
  }

  closeAddBlockModal() {
    const modal = document.getElementById('modal-add-block');
    if (modal) modal.classList.add('hidden');
  }

  openAddFertilizerModal() {
    const modal = document.getElementById('modal-add-fert');
    if (modal) modal.classList.remove('hidden');
  }

  closeAddFertilizerModal() {
    const modal = document.getElementById('modal-add-fert');
    if (modal) modal.classList.add('hidden');
  }

  deleteBlock(code) {
    if (confirm(`Apakah Anda yakin ingin menghapus Blok ${code}?`)) {
      window.estateDB.deleteBlock(code);
      this.renderCurrentTab();
      if (window.gisMapModule) window.gisMapModule.render();
      if (window.app) window.app.showToast(`Blok ${code} berhasil dihapus.`, 'warning');
    }
  }

  setupListeners() {
    // Add Block Form
    const formBlock = document.getElementById('form-add-block');
    if (formBlock) {
      formBlock.addEventListener('submit', (e) => {
        e.preventDefault();
        const afd = document.getElementById('new-block-afdeling').value;
        const code = document.getElementById('new-block-code').value.toUpperCase().trim();
        const area = Number(document.getElementById('new-block-area').value) || 30;
        const sph = Number(document.getElementById('new-block-sph').value) || 140;
        const trees = Math.round(area * sph);
        const year = Number(document.getElementById('new-block-year').value) || 2018;
        const topo = document.getElementById('new-block-topo').value;

        if (!code) {
          alert('Kode Blok wajib diisi!');
          return;
        }

        window.estateDB.addBlock({
          id: `BLK-${code}`,
          afdeling: afd,
          code: code,
          areaHa: area,
          trees: trees,
          sph: sph,
          plantingYear: year,
          topography: topo,
          status: "planned",
          lastFertilized: "-"
        });

        this.closeAddBlockModal();
        this.renderCurrentTab();
        if (window.gisMapModule) window.gisMapModule.render();
        if (window.app) window.app.showToast(`Blok ${code} berhasil ditambahkan!`, 'success');
      });
    }

    // Add Fertilizer Form
    const formFert = document.getElementById('form-add-fert');
    if (formFert) {
      formFert.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-fert-name').value.trim();
        const cat = document.getElementById('new-fert-category').value;
        const dose = Number(document.getElementById('new-fert-dose').value) || 2.0;
        const method = document.getElementById('new-fert-method').value;

        if (!name) {
          alert('Nama Pupuk wajib diisi!');
          return;
        }

        const id = `FERT-${Date.now().toString().slice(-4)}`;
        window.estateDB.addFertilizer({
          id: id,
          name: name,
          category: cat,
          unit: "Sak (50 Kg)",
          defaultKgPerTree: dose,
          method: method,
          desc: "Pupuk tambahan kebun"
        });

        this.closeAddFertilizerModal();
        this.renderCurrentTab();
        if (window.warehouseModule) warehouseModule.renderStockCards();
        if (window.app) window.app.showToast(`Jenis pupuk ${name} berhasil ditambahkan!`, 'success');
      });
    }
  }
}

window.masterDataModule = new MasterDataModule();
