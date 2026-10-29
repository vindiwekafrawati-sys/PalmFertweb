/**
 * PalmFert - Warehouse & Fertilizer Inventory Module
 * Pencatatan DO pengeluaran ke mandor, penerimaan supplier, retur sisa pupuk, dan kartu stok real-time.
 */

class WarehouseModule {
  constructor() {}

  init() {
    this.renderStockCards();
    this.renderForms();
    this.renderMovementTable();
    this.setupListeners();
  }

  renderStockCards() {
    const container = document.getElementById('gudang-stock-cards');
    if (!container) return;

    const inventory = window.estateDB.getInventory();

    container.innerHTML = inventory.map(item => {
      const isCritical = item.stockSak <= item.minStockSak;
      const criticalBadge = isCritical
        ? `<span class="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full animate-pulse flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Stok Kritis (<${item.minStockSak} Sak)</span>`
        : `<span class="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">Stok Aman</span>`;

      return `
        <div class="p-4 bg-white rounded-xl border ${isCritical ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'} shadow-sm space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">${item.category}</span>
              <h4 class="font-bold text-slate-900 text-sm">${item.fertilizerName}</h4>
            </div>
            ${criticalBadge}
          </div>

          <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
            <div>
              <span class="text-[10px] text-slate-500 block">Sisa Stok Fisik</span>
              <strong class="text-base font-black ${isCritical ? 'text-rose-700' : 'text-slate-900'}">${item.stockSak.toLocaleString()} Sak</strong>
              <span class="text-[10px] text-slate-500 block">(${(item.stockKg / 1000).toFixed(1)} Ton)</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 block">Min. Buffer Stock</span>
              <strong class="text-sm font-bold text-slate-700">${item.minStockSak} Sak</strong>
              <span class="text-[10px] text-slate-500 block">(${((item.minStockSak * 50) / 1000).toFixed(1)} Ton)</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${item.location}</span>
            <button onclick="warehouseModule.quickIssueFertilizer('${item.fertilizerId}')" class="text-emerald-700 hover:text-emerald-900 font-bold hover:underline">
              + Buat DO
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderForms() {
    const container = document.getElementById('gudang-forms-container');
    if (!container) return;

    const fertilizers = window.estateDB.getFertilizers();
    const afdelings = window.estateDB.data.afdelings;

    container.innerHTML = `
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Tab Navigation -->
        <div class="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button type="button" id="tab-btn-issue" class="flex-1 py-3 px-4 text-emerald-800 border-b-2 border-emerald-600 bg-white flex items-center justify-center gap-2">
            <i data-lucide="package-minus" class="w-4 h-4 text-emerald-600"></i>
            <span>1. Pengeluaran ke Mandor (DO)</span>
          </button>
          <button type="button" id="tab-btn-return" class="flex-1 py-3 px-4 text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2">
            <i data-lucide="undo-2" class="w-4 h-4 text-amber-600"></i>
            <span>2. Terima Retur Sisa Lapangan</span>
          </button>
          <button type="button" id="tab-btn-stockin" class="flex-1 py-3 px-4 text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2">
            <i data-lucide="package-plus" class="w-4 h-4 text-blue-600"></i>
            <span>3. Penerimaan Masuk (Supplier)</span>
          </button>
        </div>

        <!-- Form Content Panes -->
        <div class="p-5">
          <!-- Pane 1: Issue DO -->
          <form id="form-warehouse-issue" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Mandor Penerima</label>
                <select id="wh-issue-mandor" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-medium">
                  <option value="Budi Santoso (MDR-01)">Budi Santoso (MDR-01 - Afd OA)</option>
                  <option value="Slamet Supriyadi (MDR-02)">Slamet Supriyadi (MDR-02 - Afd OB)</option>
                  <option value="Dedi Kurniawan (MDR-03)">Dedi Kurniawan (MDR-03 - Afd OC)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Afdeling Tujuan</label>
                <select id="wh-issue-afdeling" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-medium">
                  ${afdelings.map(a => `<option value="${a.code}">${a.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Blok Tujuan</label>
                <input type="text" id="wh-issue-block" value="A12" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-bold uppercase" placeholder="Contoh: A12">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Pupuk</label>
                <select id="wh-issue-fert" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-bold">
                  ${fertilizers.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jumlah Sak Dikeluarkan</label>
                <input type="number" id="wh-issue-bags" min="1" value="12" class="w-full text-sm font-bold rounded-lg border-slate-300 p-2.5">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Total Berat (Kg)</label>
                <input type="number" id="wh-issue-kg" value="600" readonly class="w-full text-sm font-bold bg-slate-100 rounded-lg border-slate-300 p-2.5 text-slate-600">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nomor DO / Surat Pengeluaran & Catatan</label>
              <input type="text" id="wh-issue-notes" value="DO Pagi Kebun No. DO-${Date.now().toString().slice(-6)}" class="w-full text-xs rounded-lg border-slate-300 p-2.5">
            </div>

            <button type="submit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              <span>Proses & Kurangi Stok Gudang</span>
            </button>
          </form>

          <!-- Pane 2: Return from Mandor -->
          <form id="form-warehouse-return" class="space-y-4 hidden">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Mandor Pengembali</label>
                <select id="wh-ret-mandor" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-medium">
                  <option value="Budi Santoso (MDR-01)">Budi Santoso (MDR-01 - Afd OA)</option>
                  <option value="Slamet Supriyadi (MDR-02)">Slamet Supriyadi (MDR-02 - Afd OB)</option>
                  <option value="Dedi Kurniawan (MDR-03)">Dedi Kurniawan (MDR-03 - Afd OC)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Pupuk Sisa</label>
                <select id="wh-ret-fert" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-bold">
                  ${fertilizers.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jumlah Sak Retur</label>
                <input type="number" id="wh-ret-bags" min="0.5" step="0.5" value="2" class="w-full text-sm font-bold rounded-lg border-slate-300 p-2.5">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Keterangan Retur Sisa Lapangan</label>
              <input type="text" id="wh-ret-notes" value="Retur sisa pemupukan ancak selesai" class="w-full text-xs rounded-lg border-slate-300 p-2.5">
            </div>

            <button type="submit" class="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Terima Retur & Tambah Kembali ke Stok</span>
            </button>
          </form>

          <!-- Pane 3: Stock In from Supplier -->
          <form id="form-warehouse-stockin" class="space-y-4 hidden">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Pupuk Masuk</label>
                <select id="wh-in-fert" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-bold">
                  ${fertilizers.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jumlah Sak Masuk</label>
                <input type="number" id="wh-in-bags" min="1" value="100" class="w-full text-sm font-bold rounded-lg border-slate-300 p-2.5">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">No. Surat Jalan / PO Supplier</label>
                <input type="text" id="wh-in-po" value="SJ-PI-2026-9921" class="w-full text-sm rounded-lg border-slate-300 p-2.5 font-semibold">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Supplier & Ekspedisi Pengirim</label>
              <input type="text" id="wh-in-notes" value="PT Pupuk Indonesia (Persero) - Truk BM 8821 TU" class="w-full text-xs rounded-lg border-slate-300 p-2.5">
            </div>

            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Konfirmasi Terima Barang & Tambah Stok</span>
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  setupListeners() {
    // Tabs switcher
    const tabIssue = document.getElementById('tab-btn-issue');
    const tabRet = document.getElementById('tab-btn-return');
    const tabStockIn = document.getElementById('tab-btn-stockin');

    const formIssue = document.getElementById('form-warehouse-issue');
    const formRet = document.getElementById('form-warehouse-return');
    const formStockIn = document.getElementById('form-warehouse-stockin');

    const setTab = (activeTab, activeForm) => {
      [tabIssue, tabRet, tabStockIn].forEach(t => {
        if (t) {
          t.className = "flex-1 py-3 px-4 text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2";
        }
      });
      [formIssue, formRet, formStockIn].forEach(f => {
        if (f) f.classList.add('hidden');
      });

      if (activeTab) activeTab.className = "flex-1 py-3 px-4 text-emerald-800 border-b-2 border-emerald-600 bg-white flex items-center justify-center gap-2 font-bold";
      if (activeForm) activeForm.classList.remove('hidden');
    };

    if (tabIssue) tabIssue.addEventListener('click', () => setTab(tabIssue, formIssue));
    if (tabRet) tabRet.addEventListener('click', () => setTab(tabRet, formRet));
    if (tabStockIn) tabStockIn.addEventListener('click', () => setTab(tabStockIn, formStockIn));

    // Auto-calculate Kg on bags change
    const issueBags = document.getElementById('wh-issue-bags');
    const issueKg = document.getElementById('wh-issue-kg');
    if (issueBags && issueKg) {
      issueBags.addEventListener('input', () => {
        issueKg.value = (Number(issueBags.value) * 50).toFixed(0);
      });
    }

    // Submit Issue
    if (formIssue) {
      formIssue.addEventListener('submit', (e) => {
        e.preventDefault();
        const fertSelect = document.getElementById('wh-issue-fert');
        const fertId = fertSelect.value;
        const fertName = fertSelect.options[fertSelect.selectedIndex].text;
        const bags = Number(document.getElementById('wh-issue-bags').value) || 0;
        const kg = bags * 50;
        const mandor = document.getElementById('wh-issue-mandor').value;
        const afd = document.getElementById('wh-issue-afdeling').value;
        const blk = document.getElementById('wh-issue-block').value;
        const notes = document.getElementById('wh-issue-notes').value;

        // Check stock
        const inv = window.estateDB.data.inventory.find(i => i.fertilizerId === fertId);
        if (!inv || inv.stockSak < bags) {
          if (window.app) window.app.showToast(`Stok gudang tidak mencukupi! Sisa stok hanya ${inv ? inv.stockSak : 0} Sak`, 'error');
          return;
        }

        window.estateDB.addWarehouseMovement({
          type: 'OUT_TO_MANDOR',
          fertilizerId: fertId,
          fertilizerName: fertName,
          bags: bags,
          kg: kg,
          recipientMandor: mandor,
          targetAfdeling: afd,
          targetBlock: blk,
          officer: "Joko Prabowo (KRN-01)",
          notes: notes
        });

        if (window.app) window.app.showToast(`DO Berhasil dibuat! ${bags} Sak (${kg} Kg) dikeluarkan ke ${mandor}`, 'success');
        this.renderStockCards();
        this.renderMovementTable();
      });
    }

    // Submit Return
    if (formRet) {
      formRet.addEventListener('submit', (e) => {
        e.preventDefault();
        const fertSelect = document.getElementById('wh-ret-fert');
        const fertId = fertSelect.value;
        const fertName = fertSelect.options[fertSelect.selectedIndex].text;
        const bags = Number(document.getElementById('wh-ret-bags').value) || 0;
        const kg = bags * 50;
        const mandor = document.getElementById('wh-ret-mandor').value;
        const notes = document.getElementById('wh-ret-notes').value;

        window.estateDB.addWarehouseMovement({
          type: 'RETURN_FROM_MANDOR',
          fertilizerId: fertId,
          fertilizerName: fertName,
          bags: bags,
          kg: kg,
          recipientMandor: mandor,
          targetAfdeling: "-",
          targetBlock: "-",
          officer: "Joko Prabowo (KRN-01)",
          notes: notes
        });

        if (window.app) window.app.showToast(`Retur ${bags} Sak diterima kembali ke gudang!`, 'success');
        this.renderStockCards();
        this.renderMovementTable();
      });
    }

    // Submit Stock In
    if (formStockIn) {
      formStockIn.addEventListener('submit', (e) => {
        e.preventDefault();
        const fertSelect = document.getElementById('wh-in-fert');
        const fertId = fertSelect.value;
        const fertName = fertSelect.options[fertSelect.selectedIndex].text;
        const bags = Number(document.getElementById('wh-in-bags').value) || 0;
        const kg = bags * 50;
        const po = document.getElementById('wh-in-po').value;
        const notes = document.getElementById('wh-in-notes').value;

        window.estateDB.addWarehouseMovement({
          type: 'STOCK_IN',
          fertilizerId: fertId,
          fertilizerName: fertName,
          bags: bags,
          kg: kg,
          recipientMandor: "-",
          targetAfdeling: "Sentral",
          targetBlock: "-",
          officer: "Joko Prabowo (KRN-01)",
          notes: `[PO: ${po}] ${notes}`
        });

        if (window.app) window.app.showToast(`Stok masuk berhasil dicatat! +${bags} Sak (${(kg/1000).toFixed(1)} Ton)`, 'success');
        this.renderStockCards();
        this.renderMovementTable();
      });
    }
  }

  quickIssueFertilizer(fertId) {
    const tabIssue = document.getElementById('tab-btn-issue');
    const fertSelect = document.getElementById('wh-issue-fert');
    if (tabIssue) tabIssue.click();
    if (fertSelect) fertSelect.value = fertId;
    window.scrollTo({ top: document.getElementById('gudang-forms-container')?.offsetTop - 80, behavior: 'smooth' });
  }

  renderMovementTable() {
    const container = document.getElementById('gudang-movements-table');
    if (!container) return;

    const list = window.estateDB.data.warehouseMovements;

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th class="p-3">Waktu & ID</th>
              <th class="p-3">Jenis Mutasi</th>
              <th class="p-3">Pupuk</th>
              <th class="p-3">Jumlah (Sak / Kg)</th>
              <th class="p-3">Mandor / Tujuan</th>
              <th class="p-3">Petugas Gudang</th>
              <th class="p-3">Keterangan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${list.map(m => {
              let typeBadge = '';
              if (m.type === 'OUT_TO_MANDOR') {
                typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Keluar (DO Mandor)</span>`;
              } else if (m.type === 'RETURN_FROM_MANDOR') {
                typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Retur Sisa</span>`;
              } else {
                typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Masuk Supplier</span>`;
              }

              return `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3 font-mono">
                    <span class="font-bold text-slate-900 block">${m.date.slice(0, 10)}</span>
                    <span class="text-[10px] text-slate-400">${m.date.slice(11, 19)}</span>
                  </td>
                  <td class="p-3">${typeBadge}</td>
                  <td class="p-3 font-bold text-slate-900">${m.fertilizerName}</td>
                  <td class="p-3 font-black text-slate-900">${m.bags} Sak <span class="text-[10px] text-slate-500 font-normal">(${m.kg} Kg)</span></td>
                  <td class="p-3">
                    <span class="font-semibold text-slate-800 block">${m.recipientMandor}</span>
                    ${m.targetBlock !== '-' ? `<span class="text-[10px] text-emerald-700 font-bold">Blok ${m.targetBlock} (Afd ${m.targetAfdeling})</span>` : ''}
                  </td>
                  <td class="p-3 text-slate-600">${m.officer}</td>
                  <td class="p-3 text-slate-500 text-[11px] max-w-xs truncate">${m.notes}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

window.warehouseModule = new WarehouseModule();
