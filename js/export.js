/**
 * PalmFert - Reports & Data Export Module (PDF & Excel/CSV)
 * Rekapitulasi pemupukan kebun sawit, laporan variansi dosis, mutasi stok, dan print-ready formal estate report.
 */

class ExportModule {
  constructor() {}

  init() {
    this.renderReportsTable();
    this.setupListeners();
  }

  renderReportsTable() {
    const container = document.getElementById('reports-table-container');
    if (!container) return;

    const list = window.estateDB.getRealizations();

    container.innerHTML = `
      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th class="p-3">Tanggal</th>
              <th class="p-3">Lokasi (Afd/Blok)</th>
              <th class="p-3">Mandor</th>
              <th class="p-3">Jenis Pupuk</th>
              <th class="p-3">Pokok</th>
              <th class="p-3">Sak / Kg</th>
              <th class="p-3">Dosis Realisasi</th>
              <th class="p-3">Target Dosis</th>
              <th class="p-3">Variansi (%)</th>
              <th class="p-3">Status Verifikasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${list.map(r => `
              <tr class="hover:bg-slate-50/80 transition">
                <td class="p-3 font-mono">${r.date}</td>
                <td class="p-3 font-bold text-emerald-800">Afd ${r.afdeling} - ${r.blockCode}</td>
                <td class="p-3 text-slate-800">${r.mandorName}</td>
                <td class="p-3 font-semibold">${r.fertilizerName}</td>
                <td class="p-3 font-bold">${r.treesDone} Pkk</td>
                <td class="p-3">${r.bagsUsed} Sak (${r.kgUsed} Kg)</td>
                <td class="p-3 font-bold ${r.varianceStatus === 'good' ? 'text-emerald-700' : 'text-rose-700'}">${r.actualDose} Kg/Pkk</td>
                <td class="p-3 text-slate-500">${r.recommendedDose} Kg/Pkk</td>
                <td class="p-3 font-bold">${r.variancePercent > 0 ? '+' : ''}${r.variancePercent}%</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : (r.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}">
                    ${r.approvalStatus.toUpperCase()}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  exportToExcel() {
    const realizations = window.estateDB.getRealizations();

    if (typeof XLSX !== 'undefined') {
      const exportData = realizations.map((r, idx) => ({
        "No": idx + 1,
        "ID Laporan": r.id,
        "Tanggal": r.date,
        "Waktu": r.time,
        "Afdeling": r.afdeling,
        "Blok": r.blockCode,
        "Mandor": r.mandorName,
        "Jenis Pupuk": r.fertilizerName,
        "Metode": r.method,
        "Pokok Ditabur": r.treesDone,
        "Sak Terpakai": r.bagsUsed,
        "Kg Terpakai": r.kgUsed,
        "Tenaga Kerja BKP": r.bkpCount,
        "Tenaga Kerja BKR": r.bkrCount,
        "Target Dosis (Kg/Pkk)": r.recommendedDose,
        "Realisasi Dosis (Kg/Pkk)": r.actualDose,
        "Variansi (%)": r.variancePercent,
        "Status Dosis": r.varianceStatus,
        "GPS Koordinat": r.gps?.label || "-",
        "Status Verifikasi": r.approvalStatus,
        "Disetujui Oleh": r.approvedBy || "-",
        "Tanggal Approval": r.approvalDate || "-",
        "Catatan Approval": r.approvalNotes || ""
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Realisasi Pemupukan");
      XLSX.writeFile(wb, `Laporan_Realisasi_Pemupukan_PalmFert_${new Date().toISOString().slice(0,10)}.xlsx`);

      if (window.app) window.app.showToast("File Excel (.xlsx) berhasil diunduh!", "success");
    } else {
      // Fallback to CSV Download
      this.exportToCSV(realizations);
    }
  }

  exportToCSV(realizations) {
    const headers = ["No,ID Laporan,Tanggal,Afdeling,Blok,Mandor,Pupuk,Pokok,Sak,Kg,Target Dosis,Realisasi Dosis,Variansi (%),Status Approval"];
    const rows = realizations.map((r, idx) => 
      `"${idx + 1}","${r.id}","${r.date}","${r.afdeling}","${r.blockCode}","${r.mandorName}","${r.fertilizerName}","${r.treesDone}","${r.bagsUsed}","${r.kgUsed}","${r.recommendedDose}","${r.actualDose}","${r.variancePercent}%","${r.approvalStatus}"`
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Pemupukan_PalmFert_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.app) window.app.showToast("File CSV berhasil diunduh!", "success");
  }

  exportToPDF() {
    const estate = window.estateDB.data.estateInfo;
    const realizations = window.estateDB.getRealizations();
    const now = new Date();

    const printSection = document.getElementById('print-section');
    if (!printSection) return;

    printSection.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827; background: #ffffff;">
        <!-- Kop Surat Resmi Perkebunan -->
        <div style="border-bottom: 3px double #15803d; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #15803d; text-transform: uppercase;">${estate.name}</h1>
            <p style="font-size: 12px; margin: 2px 0; color: #4b5563;">Divisi Agronomi & Pemupukan Kelapa Sawit (PalmFert App)</p>
            <p style="font-size: 11px; margin: 2px 0; color: #6b7280;">Lokasi: ${estate.location}</p>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <p style="margin: 0; font-weight: bold;">DOKUMEN RESMI ESTATE</p>
            <p style="margin: 2px 0;">Tanggal Cetak: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')} WIB</p>
            <p style="margin: 2px 0; font-family: monospace;">No Dok: EST/FERT/REP/${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}</p>
          </div>
        </div>

        <h2 style="font-size: 15px; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 16px;">
          Laporan Rekapitulasi Realisasi Pemupukan Kebun Sawit
        </h2>

        <!-- Tabel Ringkasan -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f3f4f6; border-top: 1px solid #9ca3af; border-bottom: 1px solid #9ca3af;">
              <th style="padding: 6px; text-align: left; border: 1px solid #d1d5db;">No</th>
              <th style="padding: 6px; text-align: left; border: 1px solid #d1d5db;">Tanggal</th>
              <th style="padding: 6px; text-align: left; border: 1px solid #d1d5db;">Lokasi</th>
              <th style="padding: 6px; text-align: left; border: 1px solid #d1d5db;">Mandor</th>
              <th style="padding: 6px; text-align: left; border: 1px solid #d1d5db;">Jenis Pupuk</th>
              <th style="padding: 6px; text-align: right; border: 1px solid #d1d5db;">Pokok</th>
              <th style="padding: 6px; text-align: right; border: 1px solid #d1d5db;">Kg Terpakai</th>
              <th style="padding: 6px; text-align: right; border: 1px solid #d1d5db;">Realisasi Dosis</th>
              <th style="padding: 6px; text-align: right; border: 1px solid #d1d5db;">Target</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #d1d5db;">Variansi</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #d1d5db;">Status Approval</th>
            </tr>
          </thead>
          <tbody>
            ${realizations.map((r, i) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 5px; text-align: center; border: 1px solid #d1d5db;">${i+1}</td>
                <td style="padding: 5px; border: 1px solid #d1d5db;">${r.date}</td>
                <td style="padding: 5px; font-weight: bold; border: 1px solid #d1d5db;">Afd ${r.afdeling} - Blok ${r.blockCode}</td>
                <td style="padding: 5px; border: 1px solid #d1d5db;">${r.mandorName}</td>
                <td style="padding: 5px; border: 1px solid #d1d5db;">${r.fertilizerName}</td>
                <td style="padding: 5px; text-align: right; border: 1px solid #d1d5db;">${r.treesDone} Pkk</td>
                <td style="padding: 5px; text-align: right; font-weight: bold; border: 1px solid #d1d5db;">${r.kgUsed} Kg</td>
                <td style="padding: 5px; text-align: right; font-weight: bold; border: 1px solid #d1d5db;">${r.actualDose} Kg/Pkk</td>
                <td style="padding: 5px; text-align: right; border: 1px solid #d1d5db;">${r.recommendedDose} Kg/Pkk</td>
                <td style="padding: 5px; text-align: center; font-weight: bold; color: ${r.varianceStatus === 'good' ? '#15803d' : '#b91c1c'}; border: 1px solid #d1d5db;">
                  ${r.variancePercent > 0 ? '+' : ''}${r.variancePercent}%
                </td>
                <td style="padding: 5px; text-align: center; font-weight: bold; border: 1px solid #d1d5db;">
                  ${r.approvalStatus === 'approved' ? 'DISETUJUI' : (r.approvalStatus === 'rejected' ? 'DITOLAK' : 'PENDING')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Kolom Tanda Tangan Resmi Perkebunan -->
        <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; font-size: 11px;">
          <div>
            <p style="margin-bottom: 60px;">Dibuat Oleh,<br><strong>Mandor Pemupukan</strong></p>
            <p style="text-decoration: underline; font-weight: bold; margin: 0;">( Budi Santoso )</p>
            <p style="margin: 2px 0; color: #6b7280;">ID: MDR-01</p>
          </div>
          <div>
            <p style="margin-bottom: 60px;">Diperiksa & Disetujui,<br><strong>Asisten Afdeling</strong></p>
            <p style="text-decoration: underline; font-weight: bold; margin: 0;">( Ir. Hendra Wijaya )</p>
            <p style="margin: 2px 0; color: #6b7280;">ID: AST-OA</p>
          </div>
          <div>
            <p style="margin-bottom: 60px;">Mengetahui,<br><strong>Estate Manager</strong></p>
            <p style="text-decoration: underline; font-weight: bold; margin: 0;">( Drs. M. Taufik )</p>
            <p style="margin: 2px 0; color: #6b7280;">ID: MGR-01</p>
          </div>
        </div>
      </div>
    `;

    // Trigger native browser print which renders perfectly formatted PDF
    window.print();
  }

  setupListeners() {
    const btnExcel = document.getElementById('btn-export-excel');
    const btnPdf = document.getElementById('btn-export-pdf');

    if (btnExcel) btnExcel.addEventListener('click', () => this.exportToExcel());
    if (btnPdf) btnPdf.addEventListener('click', () => this.exportToPDF());
  }
}

window.exportModule = new ExportModule();
