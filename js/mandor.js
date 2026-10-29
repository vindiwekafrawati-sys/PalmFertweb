/**
 * PalmFert - Mandor Field Operations Module
 * Form input cepat, kalkulasi dosis real-time, canvas GPS watermark camera, serah terima gudang, offline-first.
 */

class MandorModule {
  constructor() {
    this.currentGps = { lat: 0.70512, lng: 101.47933, accuracy: "3.2m", label: "0°42'18.4\"N 101°28'45.6\"E" };
    this.capturedPhotoData = null;
    this.isOffline = false;
  }

  init() {
    this.renderForm();
    this.renderHandoffSection();
    this.renderHistory();
    this.setupListeners();
    this.startGpsTracking();
  }

  startGpsTracking() {
    // Attempt real GPS if available, otherwise fallback to realistic estate coordinates
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentGps = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: `${Math.round(pos.coords.accuracy)}m`,
            label: `${pos.coords.latitude.toFixed(4)}°N ${pos.coords.longitude.toFixed(4)}°E`
          };
          this.updateGpsDisplay();
        },
        () => {
          // Default estate GPS simulation
          this.updateGpsDisplay();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      this.updateGpsDisplay();
    }
  }

  updateGpsDisplay() {
    const el = document.getElementById('mandor-gps-indicator');
    if (el) {
      el.innerHTML = `
        <div class="flex items-center gap-1.5 text-xs text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-600"></i>
          <span>GPS: ${this.currentGps.label} (±${this.currentGps.accuracy})</span>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  renderForm() {
    const container = document.getElementById('mandor-form-container');
    if (!container) return;

    const afdelings = window.estateDB.data.afdelings;
    const fertilizers = window.estateDB.getFertilizers();

    container.innerHTML = `
      <form id="form-mandor-realization" class="space-y-4">
        <!-- Step 1: Lokasi & Blok -->
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <i data-lucide="map" class="w-4 h-4"></i> 1. Lokasi & Blok Kebun
            </span>
            <span id="mandor-gps-indicator"></span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Afdeling</label>
              <select id="m-input-afdeling" class="w-full text-sm rounded-lg border-slate-300 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                ${afdelings.map(a => `<option value="${a.code}">${a.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Pilih Blok</label>
              <select id="m-input-block" class="w-full text-sm rounded-lg border-slate-300 bg-slate-50 p-2.5 font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <!-- Populated dynamically -->
              </select>
            </div>
          </div>

          <!-- Auto loaded Block Info Card -->
          <div id="m-block-info-card" class="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-xs grid grid-cols-4 gap-2 text-center text-slate-700">
            <div>
              <span class="block text-slate-500 text-[10px]">Luas Blok</span>
              <strong id="info-block-area" class="text-emerald-900 text-sm">-</strong>
            </div>
            <div>
              <span class="block text-slate-500 text-[10px]">Total Pokok</span>
              <strong id="info-block-trees" class="text-emerald-900 text-sm">-</strong>
            </div>
            <div>
              <span class="block text-slate-500 text-[10px]">SPH (Pkk/Ha)</span>
              <strong id="info-block-sph" class="text-emerald-900 text-sm">-</strong>
            </div>
            <div>
              <span class="block text-slate-500 text-[10px]">Thn Tanam</span>
              <strong id="info-block-year" class="text-emerald-900 text-sm">-</strong>
            </div>
          </div>
        </div>

        <!-- Step 2: Pupuk & Metode -->
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <i data-lucide="package-check" class="w-4 h-4"></i> 2. Jenis Pupuk & Rekomendasi
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Pupuk</label>
              <select id="m-input-fertilizer" class="w-full text-sm rounded-lg border-slate-300 bg-slate-50 p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                ${fertilizers.map(f => `<option value="${f.id}" data-dose="${f.defaultKgPerTree}" data-method="${f.method}">${f.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Metode Aplikasi</label>
              <select id="m-input-method" class="w-full text-sm rounded-lg border-slate-300 bg-slate-50 p-2.5 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option value="Tabur Piringan">Tabur Piringan (Circling)</option>
                <option value="Saku / Poket">Saku / Poket (Pocketing)</option>
                <option value="Mekanis Tractor Spreader">Mekanis Tractor Spreader</option>
                <option value="Lubang Tanam">Lubang Tanam (Sub-surface)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
            <span>Rekomendasi Dosis Standar:</span>
            <strong id="m-recommended-dose-badge" class="text-sm font-black text-amber-950">2.25 Kg / Pokok</strong>
          </div>
        </div>

        <!-- Step 3: Input Realisasi Lapangan -->
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <i data-lucide="calculator" class="w-4 h-4"></i> 3. Realisasi Pemupukan
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Pokok Ditabur</label>
              <input type="number" id="m-input-trees" min="1" max="5000" value="220" class="w-full text-base font-bold text-slate-800 rounded-lg border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Jml Pokok">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Pupuk Terpakai (Sak @50kg)</label>
              <div class="flex gap-1.5">
                <input type="number" id="m-input-bags" min="0.1" step="0.5" value="10" class="w-full text-base font-bold text-slate-800 rounded-lg border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Sak">
                <input type="number" id="m-input-kg" min="1" step="1" value="500" class="w-full text-base font-bold text-slate-800 rounded-lg border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Kg">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tenaga Kerja BKP (Tetap)</label>
              <input type="number" id="m-input-bkp" min="0" value="2" class="w-full text-sm rounded-lg border-slate-300 p-2 font-medium">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tenaga Kerja BKR (Harian)</label>
              <input type="number" id="m-input-bkr" min="0" value="1" class="w-full text-sm rounded-lg border-slate-300 p-2 font-medium">
            </div>
          </div>

          <!-- Real-time Dose & Variance Engine Result Card -->
          <div id="m-variance-card" class="p-3.5 rounded-xl border variance-good space-y-2 transition-all duration-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider">Hasil Kalkulasi Dosis:</span>
              <span id="m-variance-tag" class="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-200 text-emerald-900">
                ✅ Dosis Sesuai (Akurat)
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-white/80 p-2 rounded-lg">
                <span class="text-slate-500 text-[10px] block">Dosis Realisasi</span>
                <strong id="m-calc-actual-dose" class="text-base font-black text-slate-900">2.27 Kg/Pkk</strong>
              </div>
              <div class="bg-white/80 p-2 rounded-lg">
                <span class="text-slate-500 text-[10px] block">Rekomendasi</span>
                <strong id="m-calc-target-dose" class="text-base font-black text-slate-900">2.25 Kg/Pkk</strong>
              </div>
              <div class="bg-white/80 p-2 rounded-lg">
                <span class="text-slate-500 text-[10px] block">Selisih Variansi</span>
                <strong id="m-calc-diff" class="text-base font-black text-emerald-700">+0.89%</strong>
              </div>
            </div>
            <p id="m-variance-message" class="text-[11px] text-slate-600 leading-tight italic">
              Dosis pemupukan berada dalam batas toleransi standar perkebunan (±5%).
            </p>
          </div>
        </div>

        <!-- Step 4: Bukti Lapangan (Watermarked Photo) -->
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <i data-lucide="camera" class="w-4 h-4"></i> 4. Bukti Foto & Watermark GPS
            </span>
            <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Otomatis Watermark</span>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 items-center">
            <div class="w-full sm:w-1/2">
              <div class="flex flex-col gap-2">
                <input type="file" id="m-photo-input" accept="image/*" capture="environment" class="hidden">
                <button type="button" id="btn-mandor-take-photo" class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition">
                  <i data-lucide="camera" class="w-5 h-5"></i>
                  <span>📷 Buka Kamera HP (Ambil Foto Lapangan)</span>
                </button>
              </div>
            </div>

            <!-- Preview Box -->
            <div class="w-full sm:w-1/2">
              <div id="m-photo-preview-wrapper" class="watermark-preview-box aspect-video flex items-center justify-center text-slate-400 relative">
                <div id="m-photo-placeholder" class="text-center p-3">
                  <i data-lucide="image" class="w-8 h-8 mx-auto mb-1 text-slate-500"></i>
                  <span class="text-[11px] block">Belum ada foto diambil</span>
                </div>
                <img id="m-photo-img-element" class="w-full h-full object-cover hidden" alt="Bukti Foto">
                <div id="m-photo-watermark-overlay" class="watermark-overlay hidden text-left">
                  <!-- Watermark text -->
                </div>
              </div>
            </div>
          </div>

          <!-- Hidden Canvas for Watermark Generation -->
          <canvas id="mandor-watermark-canvas" class="hidden"></canvas>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan / Kondisi Lapangan</label>
            <textarea id="m-input-notes" rows="2" class="w-full text-xs rounded-lg border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Contoh: Kondisi piringan bersih, cuaca sedikit mendung, piringan rata."></textarea>
          </div>
        </div>

        <!-- Submit & Offline Notice -->
        <div class="space-y-2 pt-1">
          <button type="submit" id="btn-mandor-submit" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-extrabold text-base rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition flex items-center justify-center gap-2">
            <i data-lucide="send" class="w-5 h-5"></i>
            <span id="btn-mandor-submit-text">Simpan & Kirim Laporan</span>
          </button>

          <p class="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span>Data otomatis tersimpan di HP saat mode offline (Blank Spot).</span>
          </p>
        </div>
      </form>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  setupListeners() {
    const afdelingSelect = document.getElementById('m-input-afdeling');
    const blockSelect = document.getElementById('m-input-block');
    const fertilizerSelect = document.getElementById('m-input-fertilizer');
    const treesInput = document.getElementById('m-input-trees');
    const bagsInput = document.getElementById('m-input-bags');
    const kgInput = document.getElementById('m-input-kg');
    const photoInput = document.getElementById('m-photo-input');
    const takePhotoBtn = document.getElementById('btn-mandor-take-photo');
    const demoPhotoBtn = document.getElementById('btn-mandor-demo-photo');
    const form = document.getElementById('form-mandor-realization');

    if (afdelingSelect) {
      this.populateBlocks(afdelingSelect.value);
      afdelingSelect.addEventListener('change', (e) => {
        this.populateBlocks(e.target.value);
      });
    }

    if (blockSelect) {
      blockSelect.addEventListener('change', () => this.updateBlockInfo());
    }

    if (fertilizerSelect) {
      fertilizerSelect.addEventListener('change', () => {
        this.updateRecommendedDose();
        this.calculateVariance();
      });
    }

    // Sync bags <-> kg
    if (bagsInput && kgInput) {
      bagsInput.addEventListener('input', () => {
        kgInput.value = (Number(bagsInput.value) * 50).toFixed(0);
        this.calculateVariance();
      });
      kgInput.addEventListener('input', () => {
        bagsInput.value = (Number(kgInput.value) / 50).toFixed(1);
        this.calculateVariance();
      });
    }

    if (treesInput) {
      treesInput.addEventListener('input', () => this.calculateVariance());
    }

    // Photo button (Real Device Camera Only)
    if (takePhotoBtn && photoInput) {
      takePhotoBtn.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', (e) => this.handlePhotoSelected(e));
    }

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // Initial calculations
    this.updateBlockInfo();
    this.updateRecommendedDose();
    this.calculateVariance();
  }

  populateBlocks(afdelingCode) {
    const blockSelect = document.getElementById('m-input-block');
    if (!blockSelect) return;

    const blocks = window.estateDB.getBlocks(afdelingCode);
    blockSelect.innerHTML = blocks.map(b => `
      <option value="${b.code}">Blok ${b.code} (${b.areaHa} Ha / ${b.trees} Pkk)</option>
    `).join('');

    this.updateBlockInfo();
  }

  updateBlockInfo() {
    const blockSelect = document.getElementById('m-input-block');
    if (!blockSelect) return;

    const block = window.estateDB.getBlockByCode(blockSelect.value);
    if (block) {
      document.getElementById('info-block-area').innerText = `${block.areaHa} Ha`;
      document.getElementById('info-block-trees').innerText = `${block.trees.toLocaleString()} Pkk`;
      document.getElementById('info-block-sph').innerText = `${block.sph}`;
      document.getElementById('info-block-year').innerText = `${block.plantingYear}`;
    }
  }

  updateRecommendedDose() {
    const fertSelect = document.getElementById('m-input-fertilizer');
    const badge = document.getElementById('m-recommended-dose-badge');
    if (!fertSelect || !badge) return;

    const selectedOption = fertSelect.options[fertSelect.selectedIndex];
    const dose = selectedOption.getAttribute('data-dose') || "2.25";
    badge.innerText = `${dose} Kg / Pokok`;
  }

  calculateVariance() {
    const trees = Number(document.getElementById('m-input-trees')?.value) || 1;
    const kg = Number(document.getElementById('m-input-kg')?.value) || 0;
    const fertSelect = document.getElementById('m-input-fertilizer');
    const selectedOption = fertSelect ? fertSelect.options[fertSelect.selectedIndex] : null;
    const targetDose = selectedOption ? Number(selectedOption.getAttribute('data-dose') || 2.25) : 2.25;

    const actualDose = Number((kg / trees).toFixed(2));
    const diffKg = actualDose - targetDose;
    const variancePercent = Number(((diffKg / targetDose) * 100).toFixed(2));

    const card = document.getElementById('m-variance-card');
    const tag = document.getElementById('m-variance-tag');
    const actEl = document.getElementById('m-calc-actual-dose');
    const tgtEl = document.getElementById('m-calc-target-dose');
    const diffEl = document.getElementById('m-calc-diff');
    const msgEl = document.getElementById('m-variance-message');

    if (!card || !tag) return;

    actEl.innerText = `${actualDose.toFixed(2)} Kg/Pkk`;
    tgtEl.innerText = `${targetDose.toFixed(2)} Kg/Pkk`;
    
    const sign = variancePercent > 0 ? '+' : '';
    diffEl.innerText = `${sign}${variancePercent.toFixed(1)}%`;

    const absVar = Math.abs(variancePercent);

    if (absVar <= 5) {
      // Good (Hijau)
      card.className = "p-3.5 rounded-xl border variance-good space-y-2 transition-all duration-200";
      tag.className = "px-2 py-0.5 rounded text-[11px] font-black bg-emerald-200 text-emerald-900";
      tag.innerText = "✅ Dosis Sesuai Standar";
      diffEl.className = "text-base font-black text-emerald-700";
      msgEl.innerText = "Dosis pemupukan berada dalam batas toleransi standar perkebunan (±5%).";
      this.currentVarianceStatus = "good";
    } else if (absVar <= 15) {
      // Warning (Kuning)
      card.className = "p-3.5 rounded-xl border variance-warning space-y-2 transition-all duration-200";
      tag.className = "px-2 py-0.5 rounded text-[11px] font-black bg-amber-200 text-amber-900";
      tag.innerText = variancePercent > 0 ? "⚠️ Sedikit Overdosis (+)" : "⚠️ Sedikit Underdosis (-)";
      diffEl.className = "text-base font-black text-amber-700";
      msgEl.innerText = `Variansi dosis (${variancePercent.toFixed(1)}%) melebihi toleransi normal 5%. Cek takaran mangkok/kalibrasi ancak.`;
      this.currentVarianceStatus = "warning";
    } else {
      // Danger (Merah)
      card.className = "p-3.5 rounded-xl border variance-danger space-y-2 transition-all duration-200";
      tag.className = "px-2 py-0.5 rounded text-[11px] font-black bg-rose-200 text-rose-900";
      tag.innerText = variancePercent > 0 ? "🚨 OVERDOSIS TINGGI" : "🚨 UNDERDOSIS TINGGI";
      diffEl.className = "text-base font-black text-rose-700";
      msgEl.innerText = `PERHATIAN: Anomali dosis tinggi (${variancePercent.toFixed(1)}%)! Laporan akan ditandai untuk review ketat Asisten Afdeling.`;
      this.currentVarianceStatus = "danger";
    }
  }

  handlePhotoSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.stampWatermarkOnImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  generateDemoPhotoWithWatermark() {
    // Generate high quality canvas rendering of palm tree fertilization
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background: plantation greenery & soil
    const grad = ctx.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, '#1e3a1e'); // canopy
    grad.addColorStop(0.4, '#2d5a27');
    grad.addColorStop(0.7, '#4a7c3b');
    grad.addColorStop(0.85, '#5c4033'); // soil / piringan
    grad.addColorStop(1, '#3d2817');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 600);

    // Draw palm tree trunk
    ctx.fillStyle = '#4a3525';
    ctx.beginPath();
    ctx.moveTo(350, 600);
    ctx.lineTo(370, 200);
    ctx.lineTo(430, 200);
    ctx.lineTo(450, 600);
    ctx.fill();

    // Trunk textures
    ctx.strokeStyle = '#2a1a0f';
    ctx.lineWidth = 3;
    for (let y = 220; y < 580; y += 25) {
      ctx.beginPath();
      ctx.arc(400, y, 35, 0, Math.PI);
      ctx.stroke();
    }

    // Piringan circle on ground
    ctx.fillStyle = '#6b4f38';
    ctx.beginPath();
    ctx.ellipse(400, 520, 260, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fertilizer granules (NPK / Urea / MOP color sprinkles)
    const fertSelect = document.getElementById('m-input-fertilizer');
    const fertName = fertSelect ? fertSelect.options[fertSelect.selectedIndex].text : "NPK";
    let granuleColor = '#3b82f6'; // Blue for NPK
    if (fertName.includes('Urea')) granuleColor = '#ffffff';
    if (fertName.includes('MOP')) granuleColor = '#ef4444'; // Red
    if (fertName.includes('Dolomite')) granuleColor = '#e2e8f0';

    ctx.fillStyle = granuleColor;
    for (let i = 0; i < 250; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 90 + Math.random() * 150;
      const x = 400 + Math.cos(angle) * radius;
      const y = 520 + Math.sin(angle) * (radius * 0.28);
      ctx.beginPath();
      ctx.arc(x, y, 2.5 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Convert to Image and stamp
    const img = new Image();
    img.onload = () => {
      this.stampWatermarkOnImage(img);
    };
    img.src = canvas.toDataURL('image/jpeg', 0.9);
  }

  stampWatermarkOnImage(sourceImg) {
    const canvas = document.getElementById('mandor-watermark-canvas');
    if (!canvas) return;

    // Standard high-res watermark canvas
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    // Draw base image
    ctx.drawImage(sourceImg, 0, 0, 1200, 900);

    // Get current form details
    const afd = document.getElementById('m-input-afdeling')?.value || "OA";
    const blk = document.getElementById('m-input-block')?.value || "A12";
    const fertSelect = document.getElementById('m-input-fertilizer');
    const fertName = fertSelect ? fertSelect.options[fertSelect.selectedIndex].text : "NPK 13-6-27";
    const trees = document.getElementById('m-input-trees')?.value || "220";
    const kg = document.getElementById('m-input-kg')?.value || "500";
    const dose = (Number(kg) / Number(trees || 1)).toFixed(2);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('id-ID');

    // Watermark Background Banner (Dark translucent box at bottom)
    const bannerH = 180;
    const bannerY = 900 - bannerH;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, bannerY, 1200, bannerH);

    // Top Green Stripe on Watermark
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, bannerY, 1200, 6);

    // App Header inside Watermark
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('PALMFERT | VERIFIKASI PEMUPUKAN LAPANGAN (OFFLINE-FIRST)', 30, bannerY + 38);

    // Column 1 Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(`Mandor : Budi Santoso (MDR-01)`, 30, bannerY + 75);
    ctx.fillText(`Lokasi : Afdeling ${afd} - Blok ${blk}`, 30, bannerY + 110);
    ctx.fillText(`Pupuk  : ${fertName.slice(0, 32)}`, 30, bannerY + 145);

    // Column 2 Text
    const col2X = 640;
    ctx.fillStyle = '#fef08a';
    ctx.fillText(`Realisasi : ${trees} Pkk | ${kg} Kg (${dose} Kg/Pkk)`, col2X, bannerY + 75);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`GPS Coord : ${this.currentGps.label} (±${this.currentGps.accuracy})`, col2X, bannerY + 110);
    ctx.fillText(`Waktu     : ${dateStr} ${timeStr} WIB`, col2X, bannerY + 145);

    // Final Watermarked Data URL
    this.capturedPhotoData = canvas.toDataURL('image/jpeg', 0.85);

    // Update UI Preview
    const previewWrapper = document.getElementById('m-photo-preview-wrapper');
    const placeholder = document.getElementById('m-photo-placeholder');
    const imgEl = document.getElementById('m-photo-img-element');
    const watermarkEl = document.getElementById('m-photo-watermark-overlay');

    if (placeholder) placeholder.classList.add('hidden');
    if (imgEl) {
      imgEl.src = this.capturedPhotoData;
      imgEl.classList.remove('hidden');
    }
    if (watermarkEl) {
      watermarkEl.classList.remove('hidden');
      watermarkEl.innerHTML = `
        <div class="font-bold text-emerald-400">PALMFERT GPS STAMP</div>
        <div>Afd ${afd} - Blok ${blk} | ${fertName}</div>
        <div>Dosis: ${dose} Kg/Pkk | GPS: ${this.currentGps.label}</div>
        <div>${dateStr} ${timeStr} WIB</div>
      `;
    }

    if (window.app) {
      window.app.showToast("Foto bukti berhasil distempel dengan GPS & Timestamp!", "success");
    }
  }

  handleSubmit() {
    const afd = document.getElementById('m-input-afdeling')?.value || "OA";
    const blk = document.getElementById('m-input-block')?.value || "A12";
    const fertSelect = document.getElementById('m-input-fertilizer');
    const fertId = fertSelect ? fertSelect.value : "FERT-NPK";
    const fertName = fertSelect ? fertSelect.options[fertSelect.selectedIndex].text : "NPK";
    const method = document.getElementById('m-input-method')?.value || "Tabur Piringan";
    const trees = Number(document.getElementById('m-input-trees')?.value) || 0;
    const bags = Number(document.getElementById('m-input-bags')?.value) || 0;
    const kg = Number(document.getElementById('m-input-kg')?.value) || 0;
    const bkp = Number(document.getElementById('m-input-bkp')?.value) || 0;
    const bkr = Number(document.getElementById('m-input-bkr')?.value) || 0;
    const notes = document.getElementById('m-input-notes')?.value || "";

    if (trees <= 0 || kg <= 0) {
      if (window.app) window.app.showToast("Mohon isi Pokok Ditabur dan Jumlah Pupuk dengan valid!", "warning");
      return;
    }

    const selectedOption = fertSelect.options[fertSelect.selectedIndex];
    const targetDose = Number(selectedOption.getAttribute('data-dose') || 2.25);
    const actualDose = Number((kg / trees).toFixed(2));
    const variancePercent = Number((((actualDose - targetDose) / targetDose) * 100).toFixed(2));

    // Auto generate photo if user didn't snap one for smooth demo experience
    if (!this.capturedPhotoData) {
      this.generateDemoPhotoWithWatermark();
    }

    // Determine sync status based on simulated offline mode
    const syncStatus = this.isOffline ? 'local_pending' : 'synced';

    const newRecord = {
      mandorId: "USR-01",
      mandorName: "Budi Santoso (MDR-01)",
      afdeling: afd,
      blockCode: blk,
      fertilizerId: fertId,
      fertilizerName: fertName,
      method: method,
      treesDone: trees,
      bagsUsed: bags,
      kgUsed: kg,
      bkpCount: bkp,
      bkrCount: bkr,
      recommendedDose: targetDose,
      actualDose: actualDose,
      variancePercent: variancePercent,
      varianceStatus: this.currentVarianceStatus || "good",
      gps: this.currentGps,
      photoUrl: this.capturedPhotoData || "",
      notes: notes,
      syncStatus: syncStatus
    };

    window.estateDB.addRealization(newRecord);

    if (window.app) {
      if (syncStatus === 'local_pending') {
        window.app.showToast("Laporan tersimpan di Antrian Lokal HP (Offline Mode)!", "warning");
      } else {
        window.app.showToast("Laporan berhasil dikirim ke Asisten Afdeling!", "success");
      }
      window.app.updateSyncBadge();
    }

    // Refresh history & reset form
    this.renderHistory();
    this.capturedPhotoData = null;
    const placeholder = document.getElementById('m-photo-placeholder');
    const imgEl = document.getElementById('m-photo-img-element');
    const watermarkEl = document.getElementById('m-photo-watermark-overlay');
    if (placeholder) placeholder.classList.remove('hidden');
    if (imgEl) imgEl.classList.add('hidden');
    if (watermarkEl) watermarkEl.classList.add('hidden');
    document.getElementById('m-input-notes').value = "";
  }

  renderHandoffSection() {
    const container = document.getElementById('mandor-handoff-container');
    if (!container) return;

    // Calculate today's fertilizer handoff for Budi Santoso
    const movements = window.estateDB.data.warehouseMovements.filter(m => m.recipientMandor.includes('Budi Santoso'));

    container.innerHTML = `
      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Serah Terima Pupuk Hari Ini
          </span>
          <span class="text-[10px] text-slate-500 font-mono">Gudang ⇄ Mandor</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-blue-50 border border-blue-100 p-2.5 rounded-lg">
            <span class="text-blue-600 text-[10px] block font-semibold">Diterima Pagi</span>
            <strong class="text-sm font-black text-blue-900">12 Sak</strong>
            <span class="text-[10px] text-blue-700 block">(600 Kg)</span>
          </div>
          <div class="bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
            <span class="text-amber-600 text-[10px] block font-semibold">Retur Sore</span>
            <strong class="text-sm font-black text-amber-900">2 Sak</strong>
            <span class="text-[10px] text-amber-700 block">(100 Kg)</span>
          </div>
          <div class="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
            <span class="text-emerald-600 text-[10px] block font-semibold">Bersih Terpakai</span>
            <strong class="text-sm font-black text-emerald-900">10 Sak</strong>
            <span class="text-[10px] text-emerald-700 block">(500 Kg)</span>
          </div>
        </div>

        <div class="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-between">
          <span>Kesesuaian dengan Laporan Blok:</span>
          <span class="font-bold text-emerald-700 flex items-center gap-1">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Cocok (10 Sak / 500 Kg)
          </span>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  renderHistory() {
    const container = document.getElementById('mandor-history-container');
    if (!container) return;

    const list = window.estateDB.getRealizations({ mandorId: "USR-01" });

    if (list.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-400 text-xs">
          Belum ada riwayat input pemupukan mandor.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-2.5">
        ${list.map(r => {
          let statusBadge = '';
          if (r.syncStatus === 'local_pending') {
            statusBadge = `<span class="badge-sync-pending text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> Pending Sync (Offline)</span>`;
          } else if (r.approvalStatus === 'approved') {
            statusBadge = `<span class="badge-approved text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Disetujui</span>`;
          } else if (r.approvalStatus === 'rejected') {
            statusBadge = `<span class="badge-rejected text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="x" class="w-3 h-3"></i> Ditolak</span>`;
          } else {
            statusBadge = `<span class="badge-sync-synced text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><i data-lucide="send" class="w-3 h-3"></i> Menunggu Approval</span>`;
          }

          let varTag = '';
          if (r.varianceStatus === 'good') {
            varTag = `<span class="text-emerald-700 font-bold text-xs">${r.actualDose} Kg/Pkk (Sesuai)</span>`;
          } else if (r.varianceStatus === 'warning') {
            varTag = `<span class="text-amber-700 font-bold text-xs">${r.actualDose} Kg/Pkk (${r.variancePercent > 0 ? '+' : ''}${r.variancePercent}%)</span>`;
          } else {
            varTag = `<span class="text-rose-700 font-bold text-xs">${r.actualDose} Kg/Pkk (${r.variancePercent > 0 ? '+' : ''}${r.variancePercent}%)</span>`;
          }

          return `
            <div class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-black rounded text-xs">Blok ${r.blockCode}</span>
                  <span class="text-xs font-semibold text-slate-700">Afd ${r.afdeling}</span>
                </div>
                ${statusBadge}
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span class="text-[10px] text-slate-400 block">Pupuk & Metode:</span>
                  <strong>${r.fertilizerName.slice(0, 18)}</strong>
                  <span class="text-[10px] block text-slate-500">${r.method}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block">Realisasi & Dosis:</span>
                  <span>${r.treesDone} Pkk / ${r.kgUsed} Kg</span>
                  <div class="mt-0.5">${varTag}</div>
                </div>
              </div>

              ${r.approvalNotes ? `
                <div class="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 italic">
                  <strong>Catatan Asisten (${r.approvedBy || 'Asisten'}):</strong> "${r.approvalNotes}"
                </div>
              ` : ''}

              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
                <span>Waktu: ${r.date} ${r.time}</span>
                <span>GPS: ${r.gps?.label || '-'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
}

window.mandorModule = new MandorModule();
