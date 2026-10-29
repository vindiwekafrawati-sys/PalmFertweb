/**
 * PalmFert - Assistant Approval & Verification Module
 * Review harian mandor, verifikasi GPS foto watermark, kalkulasi variansi dosis, dan aksi approval.
 */

class ApprovalModule {
  constructor() {
    this.currentFilter = 'all'; // 'all', 'pending', 'approved', 'rejected'
    this.selectedRealizationId = null;
  }

  init() {
    this.renderApprovalTable();
    this.setupListeners();
  }

  setFilter(status) {
    this.currentFilter = status;
    this.renderApprovalTable();
  }

  renderApprovalTable() {
    const container = document.getElementById('approval-list-container');
    if (!container) return;

    let list = window.estateDB.getRealizations();
    if (this.currentFilter !== 'all') {
      list = list.filter(r => r.approvalStatus === this.currentFilter);
    }

    const countPending = window.estateDB.getRealizations().filter(r => r.approvalStatus === 'pending').length;
    const badgePending = document.getElementById('badge-approval-pending-count');
    if (badgePending) {
      badgePending.innerText = countPending;
      badgePending.style.display = countPending > 0 ? 'inline-flex' : 'none';
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-slate-400">
          <i data-lucide="check-check" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
          <p class="text-sm font-semibold">Tidak ada laporan pemupukan dalam kategori ini.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th class="p-3">Tanggal & ID</th>
              <th class="p-3">Mandor & Lokasi</th>
              <th class="p-3">Pupuk & Metode</th>
              <th class="p-3">Realisasi (Pkk / Kg)</th>
              <th class="p-3">Dosis & Variansi</th>
              <th class="p-3">Status Verifikasi</th>
              <th class="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${list.map(r => {
              let statusBadge = '';
              if (r.approvalStatus === 'approved') {
                statusBadge = `<span class="badge-approved text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Disetujui</span>`;
              } else if (r.approvalStatus === 'rejected') {
                statusBadge = `<span class="badge-rejected text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><i data-lucide="x" class="w-3 h-3"></i> Ditolak</span>`;
              } else {
                statusBadge = `<span class="badge-sync-pending text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> Menunggu Verifikasi</span>`;
              }

              let doseColor = 'text-emerald-700 font-bold';
              if (r.varianceStatus === 'warning') doseColor = 'text-amber-700 font-bold';
              if (r.varianceStatus === 'danger') doseColor = 'text-rose-700 font-black';

              return `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="p-3 font-mono">
                    <strong class="text-slate-900 block">${r.date}</strong>
                    <span class="text-[10px] text-slate-400">${r.id}</span>
                  </td>
                  <td class="p-3">
                    <strong class="text-slate-900 block">${r.mandorName}</strong>
                    <span class="text-[11px] text-emerald-800 font-bold">Afd ${r.afdeling} - Blok ${r.blockCode}</span>
                  </td>
                  <td class="p-3">
                    <strong class="text-slate-900 block">${r.fertilizerName}</strong>
                    <span class="text-[10px] text-slate-500">${r.method}</span>
                  </td>
                  <td class="p-3">
                    <strong class="text-slate-900">${r.treesDone.toLocaleString()} Pkk</strong>
                    <div class="text-[10px] text-slate-500">${r.bagsUsed} Sak (${r.kgUsed} Kg)</div>
                  </td>
                  <td class="p-3">
                    <div class="${doseColor}">${r.actualDose} Kg/Pkk</div>
                    <div class="text-[10px] text-slate-500">Target: ${r.recommendedDose} Kg (${r.variancePercent > 0 ? '+' : ''}${r.variancePercent}%)</div>
                  </td>
                  <td class="p-3">${statusBadge}</td>
                  <td class="p-3 text-right">
                    <button onclick="approvalModule.openReviewModal('${r.id}')" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow transition inline-flex items-center gap-1">
                      <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                      <span>Periksa</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  openReviewModal(realizationId) {
    this.selectedRealizationId = realizationId;
    const r = window.estateDB.data.realizations.find(item => item.id === realizationId);
    if (!r) return;

    const modal = document.getElementById('modal-approval-review');
    const content = document.getElementById('modal-approval-content');
    if (!modal || !content) return;

    let varianceBox = '';
    if (r.varianceStatus === 'good') {
      varianceBox = `<div class="p-3 rounded-lg variance-good text-xs font-bold flex items-center justify-between"><span>Kesesuaian Dosis: Presisi Sesuai Standar (±5%)</span><span>Selisih: ${r.variancePercent}%</span></div>`;
    } else if (r.varianceStatus === 'warning') {
      varianceBox = `<div class="p-3 rounded-lg variance-warning text-xs font-bold flex items-center justify-between"><span>Peringatan Variansi Dosis</span><span>Selisih: ${r.variancePercent}%</span></div>`;
    } else {
      varianceBox = `<div class="p-3 rounded-lg variance-danger text-xs font-bold flex items-center justify-between"><span>🚨 ANOMALI DOSIS TINGGI! Diperlukan Investigasi Lapangan</span><span>Selisih: ${r.variancePercent}%</span></div>`;
    }

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Header Info -->
        <div class="flex flex-wrap items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span class="text-xs text-slate-400 block font-mono">ID Laporan: ${r.id}</span>
            <h3 class="text-base font-extrabold text-slate-900">Afdeling ${r.afdeling} - Blok ${r.blockCode}</h3>
            <span class="text-xs text-slate-600">Mandor: <strong>${r.mandorName}</strong> | Tanggal: ${r.date} ${r.time} WIB</span>
          </div>
          <div class="mt-2 sm:mt-0 text-right">
            <span class="text-xs text-slate-500 block">Koordinat GPS Watermark:</span>
            <span class="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${r.gps?.label || 'GPS Terlampir'}</span>
          </div>
        </div>

        ${varianceBox}

        <!-- Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="p-3 bg-white border border-slate-200 rounded-xl">
            <span class="text-[10px] text-slate-400 block">Jenis Pupuk</span>
            <strong class="text-slate-900 text-sm block">${r.fertilizerName}</strong>
            <span class="text-[10px] text-slate-500">${r.method}</span>
          </div>
          <div class="p-3 bg-white border border-slate-200 rounded-xl">
            <span class="text-[10px] text-slate-400 block">Pokok Ditabur</span>
            <strong class="text-slate-900 text-sm block">${r.treesDone} Pokok</strong>
            <span class="text-[10px] text-slate-500">Tenaga: ${r.bkpCount} BKP, ${r.bkrCount} BKR</span>
          </div>
          <div class="p-3 bg-white border border-slate-200 rounded-xl">
            <span class="text-[10px] text-slate-400 block">Pupuk Terpakai</span>
            <strong class="text-slate-900 text-sm block">${r.kgUsed} Kg</strong>
            <span class="text-[10px] text-slate-500">${r.bagsUsed} Sak (@50kg)</span>
          </div>
          <div class="p-3 bg-white border border-slate-200 rounded-xl">
            <span class="text-[10px] text-slate-400 block">Dosis Realisasi</span>
            <strong class="text-slate-900 text-sm block text-emerald-700">${r.actualDose} Kg/Pkk</strong>
            <span class="text-[10px] text-slate-500">Target: ${r.recommendedDose} Kg/Pkk</span>
          </div>
        </div>

        <!-- Bukti Foto Watermark -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">Foto Bukti Lapangan Ber-Watermark GPS</label>
          <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-72">
            ${r.photoUrl ? `
              <img src="${r.photoUrl}" alt="Bukti Watermark" class="w-full h-full object-contain">
            ` : `
              <div class="p-8 text-center text-slate-400 text-xs">
                <i data-lucide="image" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
                <span>Foto bukti tersimpan di memori perangkat lapangan.</span>
              </div>
            `}
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Catatan Mandor Lapangan:</label>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 italic">
            "${r.notes || 'Tidak ada catatan khusus.'}"
          </div>
        </div>

        <!-- Assistant Action Input -->
        <div class="border-t border-slate-200 pt-3 space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-800 mb-1">Catatan / Alasan Asisten Afdeling (Opsional/Wajib bila Ditolak):</label>
            <input type="text" id="assistant-review-notes" value="${r.approvalNotes || ''}" class="w-full text-xs rounded-lg border-slate-300 p-2.5" placeholder="Contoh: Dosis sesuai SOP, piringan bersih, disetujui.">
          </div>

          <div class="flex flex-wrap gap-2 justify-end">
            <button type="button" onclick="approvalModule.submitDecision('rejected')" class="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5">
              <i data-lucide="x-circle" class="w-4 h-4"></i>
              <span>Tolak Laporan</span>
            </button>
            <button type="button" onclick="approvalModule.submitDecision('approved')" class="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Setujui (Approve)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeReviewModal() {
    const modal = document.getElementById('modal-approval-review');
    if (modal) modal.classList.add('hidden');
    this.selectedRealizationId = null;
  }

  submitDecision(status) {
    if (!this.selectedRealizationId) return;

    const notesInput = document.getElementById('assistant-review-notes');
    const notes = notesInput ? notesInput.value.trim() : "";

    if (status === 'rejected' && !notes) {
      if (window.app) window.app.showToast("Wajib mengisi alasan penolakan laporan!", "warning");
      return;
    }

    const success = window.estateDB.updateApproval(this.selectedRealizationId, status, notes, "Ir. Hendra Wijaya (Asisten OA)");

    if (success) {
      if (window.app) {
        if (status === 'approved') {
          window.app.showToast("Laporan pemupukan berhasil DISETUJUI!", "success");
        } else {
          window.app.showToast("Laporan pemupukan DITOLAK dengan catatan.", "warning");
        }
      }
      this.closeReviewModal();
      this.renderApprovalTable();
      if (window.dashboardModule) window.dashboardModule.refresh();
      if (window.gisMapModule) window.gisMapModule.render();
    }
  }

  setupListeners() {
    // Close modal on background click or Esc
    const modal = document.getElementById('modal-approval-review');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeReviewModal();
      });
    }
  }
}

window.approvalModule = new ApprovalModule();
