/**
 * PalmFert - Data Management & LocalStorage Persistence
 * Master Data perkebunan sawit, stok pupuk, transaksi realisasi, approval, mutasi, dan profil kredensial pengguna resmi perusahaan.
 */

const STORAGE_KEY = 'PALMFERT_ESTATE_DATA_V1';

// Default Data Generator with Official Corporate Employee Profiles
const getDefaultData = () => {
  return {
    estateInfo: {
      name: "PT. Sawit Makmur Lestari",
      estateName: "Kebun Riau Mandiri",
      division: "Divisi Agronomi & Manajemen Pemupukan Kelapa Sawit",
      location: "Kec. Tapung Hilir, Kab. Kampar, Riau - Indonesia",
      totalAreaHa: 2450.5,
      totalBlocks: 34,
      totalTrees: 343070,
      activeMandorCount: 8
    },
    users: [
      {
        id: "USR-01",
        nik: "NIK-2026-MDR-01",
        name: "Budi Santoso",
        title: "Mandor Pemupukan Lapangan",
        role: "mandor",
        roleName: "Mandor Pemupukan",
        code: "MDR-01",
        afdeling: "OA",
        afdelingName: "Afdeling OA (Utara)",
        department: "Divisi Tanaman & Pemupukan",
        phone: "0812-7654-3210",
        email: "budi.santoso@sawitmakmur.co.id",
        joinedYear: "2019",
        pin: "1234",
        active: true,
        avatarColor: "from-emerald-600 to-green-700",
        badgeColor: "bg-emerald-600",
        barcode: "||| | |||| | || |||| | |||"
      },
      {
        id: "USR-04",
        nik: "NIK-2026-KRN-04",
        name: "Joko Prabowo",
        title: "Staf Kerani Gudang Sentral",
        role: "gudang",
        roleName: "Kerani Gudang Pupuk",
        code: "KRN-01",
        afdeling: "Sentral",
        afdelingName: "Gudang Sentral Kebun",
        department: "Logistik & Pergudangan",
        phone: "0852-1122-3344",
        email: "joko.prabowo@sawitmakmur.co.id",
        joinedYear: "2020",
        pin: "1234",
        active: true,
        avatarColor: "from-blue-600 to-indigo-700",
        badgeColor: "bg-blue-600",
        barcode: "|| ||| | ||| || ||| | || |"
      },
      {
        id: "USR-05",
        nik: "NIK-2026-AST-05",
        name: "Ir. Hendra Wijaya",
        title: "Asisten Kepala Afdeling OA",
        role: "asisten",
        roleName: "Asisten Afdeling (Supervisor)",
        code: "AST-OA",
        afdeling: "OA",
        afdelingName: "Afdeling OA (Utara)",
        department: "Pengawasan Agronomi Kebun",
        phone: "0811-9988-7766",
        email: "hendra.wijaya@sawitmakmur.co.id",
        joinedYear: "2016",
        pin: "1234",
        active: true,
        avatarColor: "from-amber-600 to-orange-700",
        badgeColor: "bg-amber-600",
        barcode: "| |||| || | |||| || | || |"
      },
      {
        id: "USR-07",
        nik: "NIK-2026-MGR-07",
        name: "Drs. M. Taufik, M.M.",
        title: "Estate General Manager",
        role: "manager",
        roleName: "Manajer Kebun / Administrator",
        code: "MGR-01",
        afdeling: "HQ",
        afdelingName: "Kantor Sentral Direksi Kebun",
        department: "Manajemen Eksekutif Perkebunan",
        phone: "0811-2233-4455",
        email: "m.taufik@sawitmakmur.co.id",
        joinedYear: "2012",
        pin: "1234",
        active: true,
        avatarColor: "from-purple-700 to-indigo-900",
        badgeColor: "bg-purple-700",
        barcode: "|||| | || |||| | ||| || ||"
      }
    ],
    afdelings: [
      { id: "AFD-OA", code: "OA", name: "Afdeling OA (Utara)", headAssistant: "Ir. Hendra Wijaya" },
      { id: "AFD-OB", code: "OB", name: "Afdeling OB (Tengah)", headAssistant: "Rahmat Hidayat, S.P." },
      { id: "AFD-OC", code: "OC", name: "Afdeling OC (Selatan)", headAssistant: "Agus Prasetyo, S.P." }
    ],
    blocks: [
      { id: "BLK-A01", afdeling: "OA", code: "A01", areaHa: 28.5, trees: 3990, sph: 140, plantingYear: 2017, topography: "Datar", status: "completed", lastFertilized: "2026-08-10" },
      { id: "BLK-A02", afdeling: "OA", code: "A02", areaHa: 30.0, trees: 4200, sph: 140, plantingYear: 2017, topography: "Datar", status: "completed", lastFertilized: "2026-08-12" },
      { id: "BLK-A03", afdeling: "OA", code: "A03", areaHa: 25.0, trees: 3500, sph: 140, plantingYear: 2018, topography: "Gelombang", status: "in_progress", lastFertilized: "2026-08-16" },
      { id: "BLK-A04", afdeling: "OA", code: "A04", areaHa: 32.0, trees: 4480, sph: 140, plantingYear: 2018, topography: "Gelombang", status: "planned", lastFertilized: "-" },
      { id: "BLK-A05", afdeling: "OA", code: "A05", areaHa: 27.5, trees: 3850, sph: 140, plantingYear: 2019, topography: "Datar", status: "planned", lastFertilized: "-" },
      { id: "BLK-A12", afdeling: "OA", code: "A12", areaHa: 26.0, trees: 3640, sph: 140, plantingYear: 2018, topography: "Datar", status: "in_progress", lastFertilized: "2026-08-18" },
      
      { id: "BLK-B01", afdeling: "OB", code: "B01", areaHa: 35.0, trees: 4900, sph: 140, plantingYear: 2016, topography: "Datar", status: "completed", lastFertilized: "2026-08-08" },
      { id: "BLK-B02", afdeling: "OB", code: "B02", areaHa: 31.5, trees: 4410, sph: 140, plantingYear: 2016, topography: "Gelombang", status: "completed", lastFertilized: "2026-08-14" },
      { id: "BLK-B03", afdeling: "OB", code: "B03", areaHa: 29.0, trees: 4060, sph: 140, plantingYear: 2017, topography: "Datar", status: "in_progress", lastFertilized: "2026-08-17" },
      { id: "BLK-B04", afdeling: "OB", code: "B04", areaHa: 33.0, trees: 4620, sph: 140, plantingYear: 2019, topography: "Berbukit", status: "planned", lastFertilized: "-" },
      { id: "BLK-B05", afdeling: "OB", code: "B05", areaHa: 28.0, trees: 3920, sph: 140, plantingYear: 2019, topography: "Gelombang", status: "warning", lastFertilized: "2026-08-15" },
      
      { id: "BLK-C01", afdeling: "OC", code: "C01", areaHa: 30.0, trees: 4200, sph: 140, plantingYear: 2015, topography: "Datar", status: "completed", lastFertilized: "2026-08-05" },
      { id: "BLK-C02", afdeling: "OC", code: "C02", areaHa: 34.0, trees: 4760, sph: 140, plantingYear: 2015, topography: "Gelombang", status: "completed", lastFertilized: "2026-08-11" },
      { id: "BLK-C03", afdeling: "OC", code: "C03", areaHa: 27.0, trees: 3780, sph: 140, plantingYear: 2020, topography: "Datar", status: "planned", lastFertilized: "-" },
      { id: "BLK-C04", afdeling: "OC", code: "C04", areaHa: 30.5, trees: 4270, sph: 140, plantingYear: 2020, topography: "Berbukit", status: "planned", lastFertilized: "-" }
    ],
    fertilizers: [
      { id: "FERT-NPK", name: "NPK 13-6-27-4+0.65B", category: "Majemuk", unit: "Sak (50 Kg)", defaultKgPerTree: 2.25, method: "Tabur Piringan", desc: "Pupuk majemuk untuk TM (Tanaman Menghasilkan)" },
      { id: "FERT-UREA", name: "Urea (Nitrogen 46%)", category: "Tunggal", unit: "Sak (50 Kg)", defaultKgPerTree: 1.50, method: "Tabur Piringan", desc: "Sumber unsur hara N untuk vegetatif" },
      { id: "FERT-MOP", name: "MOP / KCl (K2O 60%)", category: "Tunggal", unit: "Sak (50 Kg)", defaultKgPerTree: 2.00, method: "Tabur Piringan", desc: "Meningkatkan pembentukan tandan & rendemen CPO" },
      { id: "FERT-RP", name: "Rock Phosphate (P2O5 28%)", category: "Tunggal", unit: "Sak (50 Kg)", defaultKgPerTree: 1.75, method: "Tabur Piringan", desc: "Pemicu perakaran dan ketahanan pohon" },
      { id: "FERT-KIES", name: "Kieserite (MgO 27%)", category: "Tunggal", unit: "Sak (50 Kg)", defaultKgPerTree: 1.25, method: "Tabur Piringan", desc: "Pencegah defisiensi Magnesium & klorosis" },
      { id: "FERT-BOR", name: "Borate / HGFB (B2O3 48%)", category: "Mikro", unit: "Sak (25 Kg)", defaultKgPerTree: 0.10, method: "Saku / Poket", desc: "Unsur mikro esensial pencegah blind leaf" },
      { id: "FERT-DOL", name: "Dolomite (CaO+MgO)", category: "Pembenah", unit: "Sak (50 Kg)", defaultKgPerTree: 2.50, method: "Tabur Piringan / Pasar Pikul", desc: "Menaikkan pH tanah masam & suplai kalsium" }
    ],
    inventory: [
      { fertilizerId: "FERT-NPK", stockSak: 480, stockKg: 24000, minStockSak: 100, location: "Gudang Sentral - Rak A1" },
      { fertilizerId: "FERT-UREA", stockSak: 320, stockKg: 16000, minStockSak: 80, location: "Gudang Sentral - Rak A2" },
      { fertilizerId: "FERT-MOP", stockSak: 290, stockKg: 14500, minStockSak: 80, location: "Gudang Sentral - Rak A3" },
      { fertilizerId: "FERT-RP", stockSak: 195, stockKg: 9750, minStockSak: 50, location: "Gudang Sentral - Rak B1" },
      { fertilizerId: "FERT-KIES", stockSak: 140, stockKg: 7000, minStockSak: 40, location: "Gudang Sentral - Rak B2" },
      { fertilizerId: "FERT-BOR", stockSak: 18, stockKg: 450, minStockSak: 25, location: "Gudang Khusus Kimia Mikro" }, // Kritis
      { fertilizerId: "FERT-DOL", stockSak: 410, stockKg: 20500, minStockSak: 100, location: "Gudang Terbuka C" }
    ],
    realizations: [
      {
        id: "REAL-20260818-001",
        date: "2026-08-18",
        time: "11:45:00",
        mandorId: "USR-01",
        mandorName: "Budi Santoso (MDR-01)",
        afdeling: "OA",
        blockCode: "A12",
        fertilizerId: "FERT-NPK",
        fertilizerName: "NPK 13-6-27-4+0.65B",
        method: "Tabur Piringan",
        treesDone: 220,
        bagsUsed: 10,
        kgUsed: 500,
        bkpCount: 2,
        bkrCount: 1,
        recommendedDose: 2.25,
        actualDose: 2.27,
        variancePercent: 0.89,
        varianceStatus: "good",
        gps: { lat: 0.70512, lng: 101.47933, accuracy: "3.5m", label: "0°42'18.4\"N 101°28'45.6\"E" },
        photoUrl: "",
        notes: "Aplikasi lancar, piringan bersih, cuaca cerah.",
        syncStatus: "synced",
        approvalStatus: "pending",
        approvedBy: "",
        approvalDate: "",
        approvalNotes: ""
      },
      {
        id: "REAL-20260818-002",
        date: "2026-08-18",
        time: "09:30:00",
        mandorId: "USR-01",
        mandorName: "Budi Santoso (MDR-01)",
        afdeling: "OA",
        blockCode: "A03",
        fertilizerId: "FERT-MOP",
        fertilizerName: "MOP / KCl (K2O 60%)",
        method: "Tabur Piringan",
        treesDone: 300,
        bagsUsed: 12,
        kgUsed: 600,
        bkpCount: 3,
        bkrCount: 0,
        recommendedDose: 2.00,
        actualDose: 2.00,
        variancePercent: 0.0,
        varianceStatus: "good",
        gps: { lat: 0.69814, lng: 101.48201, accuracy: "4.1m", label: "0°41'53.3\"N 101°28'55.2\"E" },
        photoUrl: "",
        notes: "Kondisi tanah lembab pasca hujan kemarin sore.",
        syncStatus: "synced",
        approvalStatus: "approved",
        approvedBy: "Ir. Hendra Wijaya",
        approvalDate: "2026-08-18 13:15:00",
        approvalNotes: "Dosis sangat presisi, foto bukti tabur merata sesuai SOP."
      },
      {
        id: "REAL-20260817-003",
        date: "2026-08-17",
        time: "14:10:00",
        mandorId: "USR-01",
        mandorName: "Budi Santoso (MDR-01)",
        afdeling: "OA",
        blockCode: "A05",
        fertilizerId: "FERT-UREA",
        fertilizerName: "Urea (Nitrogen 46%)",
        method: "Tabur Piringan",
        treesDone: 180,
        bagsUsed: 8,
        kgUsed: 400,
        bkpCount: 2,
        bkrCount: 1,
        recommendedDose: 1.50,
        actualDose: 2.22,
        variancePercent: 48.0,
        varianceStatus: "danger",
        gps: { lat: 0.69123, lng: 101.47543, accuracy: "5.0m", label: "0°41'28.4\"N 101°28'31.5\"E" },
        photoUrl: "",
        notes: "Ada 1 karung bocor saat pemindahan di ancak.",
        syncStatus: "synced",
        approvalStatus: "rejected",
        approvedBy: "Ir. Hendra Wijaya",
        approvalDate: "2026-08-17 16:45:00",
        approvalNotes: "Dosis melebihi rekomendasi >40%. Mohon investigasi sisa karung dan verifikasi ulang ancak."
      }
    ],
    warehouseMovements: [
      {
        id: "WH-OUT-20260818-01",
        date: "2026-08-18 06:45:00",
        type: "OUT_TO_MANDOR",
        fertilizerId: "FERT-NPK",
        fertilizerName: "NPK 13-6-27-4+0.65B",
        bags: 12,
        kg: 600,
        recipientMandor: "Budi Santoso (MDR-01)",
        targetAfdeling: "OA",
        targetBlock: "A12",
        officer: "Joko Prabowo (KRN-01)",
        notes: "Pengeluaran pagi DO No: DO-20260818-01"
      },
      {
        id: "WH-RET-20260818-01",
        date: "2026-08-18 15:30:00",
        type: "RETURN_FROM_MANDOR",
        fertilizerId: "FERT-NPK",
        fertilizerName: "NPK 13-6-27-4+0.65B",
        bags: 2,
        kg: 100,
        recipientMandor: "Budi Santoso (MDR-01)",
        targetAfdeling: "OA",
        targetBlock: "A12",
        officer: "Joko Prabowo (KRN-01)",
        notes: "Retur sisa pemupukan blok A12 (Terpakai bersih 10 Sak / 500 Kg)"
      },
      {
        id: "WH-IN-20260816-01",
        date: "2026-08-16 10:00:00",
        type: "STOCK_IN",
        fertilizerId: "FERT-NPK",
        fertilizerName: "NPK 13-6-27-4+0.65B",
        bags: 200,
        kg: 10000,
        recipientMandor: "-",
        targetAfdeling: "Sentral",
        targetBlock: "-",
        officer: "Joko Prabowo (KRN-01)",
        notes: "Penerimaan PO Sentral No. PO-NPK-8812 PT Pupuk Indonesia"
      }
    ]
  };
};

class EstateDataManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultData();
      this.saveData(initial);
      return initial;
    }
    try {
      const parsed = JSON.parse(raw);
      // Ensure users have nik & titles
      if (!parsed.users || !parsed.users[0]?.nik) {
        parsed.users = getDefaultData().users;
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing local estate data:", e);
      const initial = getDefaultData();
      this.saveData(initial);
      return initial;
    }
  }

  saveData(data) {
    this.data = data || this.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    window.dispatchEvent(new CustomEvent('palmfert-data-changed', { detail: this.data }));
  }

  resetDemoData() {
    const initial = getDefaultData();
    this.saveData(initial);
    return initial;
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByRole(role) {
    return this.data.users.find(u => u.role === role);
  }

  getBlocks(afdeling = null) {
    if (!afdeling) return this.data.blocks;
    return this.data.blocks.filter(b => b.afdeling === afdeling);
  }

  getBlockByCode(code) {
    return this.data.blocks.find(b => b.code === code);
  }

  getFertilizers() {
    return this.data.fertilizers;
  }

  getFertilizerById(id) {
    return this.data.fertilizers.find(f => f.id === id);
  }

  getInventory() {
    return this.data.inventory.map(inv => {
      const fert = this.getFertilizerById(inv.fertilizerId) || {};
      return { ...inv, fertilizerName: fert.name, category: fert.category, unit: fert.unit };
    });
  }

  getRealizations(filter = {}) {
    let list = [...this.data.realizations];
    if (filter.afdeling) list = list.filter(r => r.afdeling === filter.afdeling);
    if (filter.mandorId) list = list.filter(r => r.mandorId === filter.mandorId);
    if (filter.approvalStatus) list = list.filter(r => r.approvalStatus === filter.approvalStatus);
    if (filter.syncStatus) list = list.filter(r => r.syncStatus === filter.syncStatus);
    return list.sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
  }

  getPendingSyncCount() {
    return this.data.realizations.filter(r => r.syncStatus === 'local_pending').length;
  }

  addRealization(record) {
    const newRecord = {
      id: record.id || `REAL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: record.date || new Date().toISOString().slice(0,10),
      time: record.time || new Date().toLocaleTimeString('id-ID'),
      mandorId: record.mandorId || "USR-01",
      mandorName: record.mandorName || "Budi Santoso (MDR-01)",
      afdeling: record.afdeling,
      blockCode: record.blockCode,
      fertilizerId: record.fertilizerId,
      fertilizerName: record.fertilizerName,
      method: record.method || "Tabur Piringan",
      treesDone: Number(record.treesDone) || 0,
      bagsUsed: Number(record.bagsUsed) || 0,
      kgUsed: Number(record.kgUsed) || 0,
      bkpCount: Number(record.bkpCount) || 0,
      bkrCount: Number(record.bkrCount) || 0,
      recommendedDose: Number(record.recommendedDose) || 0,
      actualDose: Number(record.actualDose) || 0,
      variancePercent: Number(record.variancePercent) || 0,
      varianceStatus: record.varianceStatus || "good",
      gps: record.gps || { lat: 0.70512, lng: 101.47933, accuracy: "3.5m", label: "0°42'18.4\"N 101°28'45.6\"E" },
      photoUrl: record.photoUrl || "",
      notes: record.notes || "",
      syncStatus: record.syncStatus || "local_pending",
      approvalStatus: "pending",
      approvedBy: "",
      approvalDate: "",
      approvalNotes: ""
    };

    this.data.realizations.unshift(newRecord);

    const block = this.data.blocks.find(b => b.code === newRecord.blockCode);
    if (block) {
      block.lastFertilized = newRecord.date;
      block.status = newRecord.varianceStatus === 'danger' ? 'warning' : 'in_progress';
    }

    this.saveData();
    return newRecord;
  }

  syncAllPending() {
    let count = 0;
    this.data.realizations.forEach(r => {
      if (r.syncStatus === 'local_pending') {
        r.syncStatus = 'synced';
        count++;
      }
    });
    if (count > 0) this.saveData();
    return count;
  }

  updateApproval(realizationId, status, notes = "", assistantName = "Ir. Hendra Wijaya") {
    const item = this.data.realizations.find(r => r.id === realizationId);
    if (!item) return false;

    item.approvalStatus = status;
    item.approvalNotes = notes;
    item.approvedBy = assistantName;
    item.approvalDate = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const block = this.data.blocks.find(b => b.code === item.blockCode);
    if (block) {
      block.status = status === 'approved' ? 'completed' : 'warning';
    }

    this.saveData();
    return true;
  }

  addWarehouseMovement(movement) {
    const item = {
      id: movement.id || `WH-${movement.type.slice(0,3)}-${Date.now()}`,
      date: movement.date || new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: movement.type,
      fertilizerId: movement.fertilizerId,
      fertilizerName: movement.fertilizerName,
      bags: Number(movement.bags) || 0,
      kg: Number(movement.kg) || 0,
      recipientMandor: movement.recipientMandor || "-",
      targetAfdeling: movement.targetAfdeling || "-",
      targetBlock: movement.targetBlock || "-",
      officer: movement.officer || "Joko Prabowo (KRN-01)",
      notes: movement.notes || ""
    };

    const inv = this.data.inventory.find(i => i.fertilizerId === item.fertilizerId);
    if (inv) {
      if (item.type === 'STOCK_IN' || item.type === 'RETURN_FROM_MANDOR') {
        inv.stockSak += item.bags;
        inv.stockKg += item.kg;
      } else if (item.type === 'OUT_TO_MANDOR') {
        inv.stockSak = Math.max(0, inv.stockSak - item.bags);
        inv.stockKg = Math.max(0, inv.stockKg - item.kg);
      }
    }

    this.data.warehouseMovements.unshift(item);
    this.saveData();
    return item;
  }

  addBlock(block) {
    this.data.blocks.push(block);
    this.saveData();
  }

  deleteBlock(blockCode) {
    this.data.blocks = this.data.blocks.filter(b => b.code !== blockCode);
    this.saveData();
  }

  addFertilizer(fert) {
    this.data.fertilizers.push(fert);
    this.data.inventory.push({
      fertilizerId: fert.id,
      stockSak: 0,
      stockKg: 0,
      minStockSak: 50,
      location: "Gudang Sentral"
    });
    this.saveData();
  }
}

window.estateDB = new EstateDataManager();
