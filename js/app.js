/**
 * PalmFert - Application Controller, User Identity & Portal Router
 * Mengatur Halaman Sampul Resmi (Cover Page), Menu Utama Karyawan, Sesi Pengguna, dan Navigasi.
 */

class PalmFertApp {
  constructor() {
    this.currentView = 'cover'; // 'cover', 'home', 'mandor', 'gudang', 'asisten', 'manager'
    this.activeUser = null;
    this.isOffline = false;
    this.isHighContrast = false;
    this.isMobileFrame = false;
  }

  init() {
    this.setupClockAndGreeting();
    this.setupPortalNavigation();
    this.setupOfflineToggle();
    this.setupHighContrastToggle();
    this.setupMobileFrameToggle();
    this.setupDemoDataReset();
    this.setupMandorSubTabs();
    this.renderEmployeeIdCards();
    this.updateHomeStats();
    this.updateSyncBadge();

    // Check if there was a saved session or set default active user automatically
    const savedUserId = localStorage.getItem('PALMFERT_ACTIVE_USER');
    const defaultUser = window.estateDB ? window.estateDB.data.users[0] : null;
    if (savedUserId) {
      const user = window.estateDB.getUserById(savedUserId);
      if (user) {
        this.setActiveUser(user, false);
      } else if (defaultUser) {
        this.setActiveUser(defaultUser, false);
      }
    } else if (defaultUser) {
      this.setActiveUser(defaultUser, false);
    }

    // Initialize Submodules
    if (window.mandorModule) window.mandorModule.init();
    if (window.warehouseModule) window.warehouseModule.init();
    if (window.approvalModule) window.approvalModule.init();
    if (window.dashboardModule) window.dashboardModule.init();
    if (window.gisMapModule) window.gisMapModule.init();
    if (window.masterDataModule) window.masterDataModule.init();
    if (window.exportModule) window.exportModule.init();

    // Start at Cover Page initially
    this.navigateTo('cover');

    if (window.lucide) window.lucide.createIcons();
  }

  setupClockAndGreeting() {
    const clockEl = document.getElementById('portal-live-clock');
    const greetingEl = document.getElementById('portal-live-greeting');
    const coverClockEl = document.getElementById('cover-live-clock');

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      let greeting = "Selamat Datang";
      if (hours >= 4 && hours < 11) greeting = "Selamat Pagi 🌅";
      else if (hours >= 11 && hours < 15) greeting = "Selamat Siang ☀️";
      else if (hours >= 15 && hours < 18) greeting = "Selamat Sore 🌇";
      else greeting = "Selamat Malam 🌙";

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      const dateString = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

      if (clockEl) {
        clockEl.innerHTML = `
          <span class="font-mono font-bold text-amber-300 text-sm sm:text-base">${hours}:${minutes}:${seconds} WIB</span>
          <span class="text-xs text-slate-300 ml-2 hidden sm:inline">${dateString}</span>
        `;
      }
      if (coverClockEl) {
        coverClockEl.innerHTML = `
          <span class="font-mono font-bold text-amber-300 text-sm">${hours}:${minutes}:${seconds} WIB</span>
          <span class="text-xs text-emerald-200 ml-2">${dateString}</span>
        `;
      }
      if (greetingEl) {
        const userName = this.activeUser ? `, ${this.activeUser.name}` : '';
        greetingEl.innerText = `${greeting}${userName}`;
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  renderEmployeeIdCards() {
    const container = document.getElementById('portal-id-cards-grid');
    if (!container) return;

    const users = window.estateDB.data.users;

    // Sleek cards without avatar photos in the main menu
    container.innerHTML = users.map(u => {
      return `
        <div class="corporate-pass-card p-4 sm:p-5 flex flex-col justify-between space-y-3.5 cursor-pointer hover:border-emerald-600 shadow-sm transition" onclick="app.loginAsUser('${u.id}')">
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span class="text-[11px] font-bold text-slate-600 font-mono tracking-wider">${u.nik}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white ${u.badgeColor}">
                ${u.roleName.split(' ')[0]}
              </span>
            </div>

            <!-- Employee Info (No photo avatar on card) -->
            <div class="pt-3 space-y-1">
              <h4 class="font-black text-base text-slate-900 leading-tight">${u.name}</h4>
              <p class="text-xs font-bold text-emerald-800">${u.title}</p>
              <p class="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>${u.afdelingName}</span>
              </p>
            </div>
          </div>

          <!-- Bottom Actions & Quick Barcode Line -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span class="barcode-font text-slate-500">${u.barcode}</span>
              <span class="text-emerald-600 font-bold">AKSES TERBUKA</span>
            </div>

            <button type="button" class="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5">
              <span>Buka Modul ${u.title.split(' ')[0]} (Akses Penuh)</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  loginAsUser(userId) {
    const user = window.estateDB.getUserById(userId);
    if (!user) return;

    this.setActiveUser(user, true);
    this.navigateTo(user.role);
    this.showToast(`Selamat datang, ${user.name} (${user.title})!`, 'success');
  }

  setActiveUser(user, persist = true) {
    this.activeUser = user;
    if (persist) {
      localStorage.setItem('PALMFERT_ACTIVE_USER', user.id);
    }

    // Update Topbar User Badge with Photo Avatar & NIK
    const navUserPill = document.getElementById('navbar-user-pill');
    if (navUserPill) {
      navUserPill.classList.remove('hidden');
      navUserPill.innerHTML = `
        <div class="flex items-center gap-2 cursor-pointer" onclick="app.showIdCardModal('${user.id}')" title="Klik untuk lihat ID Card resmi">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center text-xs font-black shadow-inner">
            ${user.name.charAt(0)}
          </div>
          <div class="text-left leading-tight hidden sm:block">
            <strong class="text-xs font-bold text-white block">${user.name}</strong>
            <span class="text-[10px] text-emerald-300 font-mono">${user.nik} • ${user.title}</span>
          </div>
        </div>
        <button onclick="app.logoutUser()" title="Ganti Pengguna / Logout" class="text-slate-400 hover:text-rose-300 p-1 ml-1">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
        </button>
      `;
    }

    // Update Workspace Headers with Photo Avatar & Information
    this.updateWorkspaceHeaders(user);

    if (window.lucide) window.lucide.createIcons();
  }

  updateWorkspaceHeaders(user) {
    // Mandor Header
    const mandorAvatar = document.getElementById('mandor-header-avatar');
    const mandorName = document.getElementById('mandor-header-name');
    const mandorTitle = document.getElementById('mandor-header-title');
    const mandorNik = document.getElementById('mandor-header-nik');

    if (mandorAvatar) {
      mandorAvatar.className = `w-10 h-10 rounded-xl bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center text-base font-black shadow-md border-2 border-white`;
      mandorAvatar.innerText = user.name.charAt(0);
    }
    if (mandorName) mandorName.innerText = user.name;
    if (mandorTitle) mandorTitle.innerText = user.title;
    if (mandorNik) mandorNik.innerText = `${user.nik} • ${user.afdelingName}`;

    // Gudang Header
    const gudangAvatar = document.getElementById('gudang-header-avatar');
    const gudangName = document.getElementById('gudang-header-name');
    const gudangTitle = document.getElementById('gudang-header-title');
    const gudangNik = document.getElementById('gudang-header-nik');

    if (gudangAvatar) {
      gudangAvatar.className = `w-10 h-10 rounded-xl bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center text-base font-black shadow-md border-2 border-white`;
      gudangAvatar.innerText = user.name.charAt(0);
    }
    if (gudangName) gudangName.innerText = user.name;
    if (gudangTitle) gudangTitle.innerText = user.title;
    if (gudangNik) gudangNik.innerText = `${user.nik} • ${user.afdelingName}`;

    // Asisten Header
    const asistenAvatar = document.getElementById('asisten-header-avatar');
    const asistenName = document.getElementById('asisten-header-name');
    const asistenTitle = document.getElementById('asisten-header-title');
    const asistenNik = document.getElementById('asisten-header-nik');

    if (asistenAvatar) {
      asistenAvatar.className = `w-10 h-10 rounded-xl bg-gradient-to-tr ${user.avatarColor} text-white flex items-center justify-center text-base font-black shadow-md border-2 border-white`;
      asistenAvatar.innerText = user.name.charAt(0);
    }
    if (asistenName) asistenName.innerText = user.name;
    if (asistenTitle) asistenTitle.innerText = user.title;
    if (asistenNik) asistenNik.innerText = `${user.nik} • ${user.afdelingName}`;
  }

  logoutUser() {
    this.activeUser = null;
    localStorage.removeItem('PALMFERT_ACTIVE_USER');
    
    const navUserPill = document.getElementById('navbar-user-pill');
    if (navUserPill) navUserPill.classList.add('hidden');

    this.navigateTo('home');
    this.showToast("Anda telah keluar dari akun pengguna.", "info");
  }

  showIdCardModal(userId) {
    const user = window.estateDB.getUserById(userId) || this.activeUser || window.estateDB.data.users[0];
    const estate = window.estateDB.data.estateInfo;
    const modal = document.getElementById('modal-id-card');
    const content = document.getElementById('modal-id-card-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Physical Badge Mockup -->
        <div class="max-w-sm mx-auto bg-gradient-to-b from-white to-slate-50 border-2 border-slate-300 rounded-3xl p-6 shadow-2xl space-y-4 text-center relative overflow-hidden">
          
          <div class="h-2.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-green-600 rounded-full w-3/4 mx-auto mb-2"></div>

          <!-- Company Header -->
          <div class="border-b-2 border-emerald-700 pb-3 space-y-0.5">
            <h3 class="text-xs font-black tracking-widest text-emerald-950 uppercase">${estate.name}</h3>
            <p class="text-[10px] font-bold text-emerald-800">${estate.estateName} • ${estate.division}</p>
            <span class="inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-wider">
              KARTU TANDA PENGENAL RESMI
            </span>
          </div>

          <!-- Photo & Bio -->
          <div class="space-y-2">
            <div class="w-24 h-24 rounded-2xl bg-gradient-to-tr ${user.avatarColor} text-white mx-auto flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white">
              ${user.name.charAt(0)}
            </div>
            
            <div>
              <h4 class="text-lg font-black text-slate-900 leading-tight">${user.name}</h4>
              <p class="text-xs font-black text-emerald-800 uppercase tracking-wide">${user.title}</p>
              <p class="text-xs text-slate-500">${user.department}</p>
            </div>
          </div>

          <!-- Credentials Table -->
          <div class="bg-white p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 font-medium">
            <div class="flex justify-between">
              <span class="text-slate-400 text-[11px]">Nomor Induk (NIK):</span>
              <strong class="font-mono text-slate-900">${user.nik}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-[11px]">Kode Petugas:</span>
              <strong class="font-mono text-slate-900">${user.code}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-[11px]">Penugasan:</span>
              <strong class="text-slate-900">${user.afdelingName}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400 text-[11px]">Masa Berlaku:</span>
              <strong class="text-emerald-700">Aktif (s/d 2028)</strong>
            </div>
          </div>

          <!-- Barcode & Stamp -->
          <div class="pt-2 border-t border-slate-200 space-y-1">
            <div class="barcode-font text-base tracking-widest text-slate-800">${user.barcode}</div>
            <span class="text-[9px] text-slate-400 font-mono block">VERIFIED DIGITAL PASS ID • PALMFERT MOBILE</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="app.closeIdCardModal()" class="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition">
            Tutup
          </button>
          <button type="button" onclick="app.loginAsUser('${user.id}'); app.closeIdCardModal();" class="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition">
            Gunakan Akun Ini
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  closeIdCardModal() {
    const modal = document.getElementById('modal-id-card');
    if (modal) modal.classList.add('hidden');
  }

  navigateTo(viewId) {
    this.currentView = viewId;

    const allViews = document.querySelectorAll('.app-view-container');
    allViews.forEach(v => v.classList.add('hidden'));

    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.remove('hidden');

    const topHeader = document.getElementById('main-app-header');
    const backBtn = document.getElementById('navbar-back-home-btn');
    const quickRoleDropdown = document.getElementById('navbar-quick-role-select');

    if (viewId === 'cover') {
      if (topHeader) topHeader.classList.add('hidden');
    } else {
      if (topHeader) topHeader.classList.remove('hidden');
      
      if (viewId === 'home') {
        if (backBtn) backBtn.classList.add('hidden');
        if (quickRoleDropdown) quickRoleDropdown.value = 'home';
        this.updateHomeStats();
      } else {
        if (backBtn) backBtn.classList.remove('hidden');
        if (quickRoleDropdown) quickRoleDropdown.value = viewId;
      }
    }

    if (viewId === 'manager' && window.dashboardModule) window.dashboardModule.refresh();
    if (viewId === 'manager' && window.gisMapModule) window.gisMapModule.render();
    if (viewId === 'asisten' && window.approvalModule) window.approvalModule.renderApprovalTable();
    if (viewId === 'gudang' && window.warehouseModule) window.warehouseModule.renderStockCards();
    if (viewId === 'mandor' && window.mandorModule) window.mandorModule.renderHistory();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  updateHomeStats() {
    const blocks = window.estateDB.data.blocks;
    const inventory = window.estateDB.getInventory();
    const realizations = window.estateDB.getRealizations();
    const pendingApproval = realizations.filter(r => r.approvalStatus === 'pending').length;

    const totalHa = blocks.reduce((acc, b) => acc + b.areaHa, 0);
    const completedHa = blocks.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.areaHa, 0);
    const progressPercent = totalHa > 0 ? Math.round((completedHa / totalHa) * 100) : 0;

    const criticalStock = inventory.filter(i => i.stockSak <= i.minStockSak).length;

    const elMandorBadge = document.getElementById('home-stat-mandor');
    const elGudangBadge = document.getElementById('home-stat-gudang');
    const elAsistenBadge = document.getElementById('home-stat-asisten');
    const elManagerBadge = document.getElementById('home-stat-manager');

    if (elMandorBadge) elMandorBadge.innerText = `${realizations.length} Laporan Tercatat`;
    if (elGudangBadge) elGudangBadge.innerText = `${inventory.length} Pupuk (${criticalStock} Kritis)`;
    if (elAsistenBadge) elAsistenBadge.innerText = `${pendingApproval} Menunggu Approval`;
    if (elManagerBadge) elManagerBadge.innerText = `${completedHa.toFixed(0)} / ${totalHa.toFixed(0)} Ha (${progressPercent}%)`;
  }

  setupPortalNavigation() {
    const backBtn = document.getElementById('navbar-back-home-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.navigateTo('home'));
    }

    const roleSelect = document.getElementById('navbar-quick-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'home') {
          this.navigateTo('home');
        } else {
          const user = window.estateDB.getUserByRole(val);
          if (user) this.loginAsUser(user.id);
          else this.navigateTo(val);
        }
      });
    }

    const mgrTabs = document.querySelectorAll('.manager-subnav-btn');
    mgrTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSection = btn.getAttribute('data-target');
        
        mgrTabs.forEach(t => {
          t.className = "manager-subnav-btn py-2 px-3.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition";
        });
        btn.className = "manager-subnav-btn py-2 px-3.5 rounded-lg text-xs font-extrabold bg-emerald-600 text-white shadow transition";

        const sections = document.querySelectorAll('.manager-sub-pane');
        sections.forEach(s => s.classList.add('hidden'));

        const targetPane = document.getElementById(targetSection);
        if (targetPane) targetPane.classList.remove('hidden');

        if (targetSection === 'pane-gis-map' && window.gisMapModule) window.gisMapModule.render();
        if (targetSection === 'pane-master-data' && window.masterDataModule) window.masterDataModule.renderCurrentTab();
        if (targetSection === 'pane-reports' && window.exportModule) window.exportModule.renderReportsTable();
        if (targetSection === 'pane-analytics' && window.dashboardModule) window.dashboardModule.refresh();

        if (window.lucide) window.lucide.createIcons();
      });
    });
  }

  setupMandorSubTabs() {
    const tabInput = document.getElementById('mandor-tab-btn-input');
    const tabHandoff = document.getElementById('mandor-tab-btn-handoff');
    const tabHistory = document.getElementById('mandor-tab-btn-history');

    const paneInput = document.getElementById('mandor-pane-input');
    const paneHandoff = document.getElementById('mandor-pane-handoff');
    const paneHistory = document.getElementById('mandor-pane-history');

    const switchMandorTab = (activeTab, activePane) => {
      [tabInput, tabHandoff, tabHistory].forEach(t => {
        if (t) t.className = "flex-1 py-2.5 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition";
      });
      [paneInput, paneHandoff, paneHistory].forEach(p => {
        if (p) p.classList.add('hidden');
      });

      if (activeTab) activeTab.className = "flex-1 py-2.5 px-3 text-xs font-extrabold text-emerald-800 border-b-2 border-emerald-600 bg-white flex items-center justify-center gap-1.5 transition";
      if (activePane) activePane.classList.remove('hidden');

      if (window.lucide) window.lucide.createIcons();
    };

    if (tabInput) tabInput.addEventListener('click', () => switchMandorTab(tabInput, paneInput));
    if (tabHandoff) tabHandoff.addEventListener('click', () => switchMandorTab(tabHandoff, paneHandoff));
    if (tabHistory) tabHistory.addEventListener('click', () => switchMandorTab(tabHistory, paneHistory));
  }

  setupOfflineToggle() {
    const toggleBtn = document.getElementById('btn-toggle-offline');
    const statusPill = document.getElementById('offline-status-pill');
    const btnSyncAll = document.getElementById('btn-sync-all');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isOffline = !this.isOffline;
        if (window.mandorModule) window.mandorModule.isOffline = this.isOffline;

        if (this.isOffline) {
          statusPill.className = "flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm";
          statusPill.innerHTML = `<i data-lucide="wifi-off" class="w-3.5 h-3.5"></i><span>OFFLINE</span>`;
          toggleBtn.innerHTML = `<i data-lucide="wifi" class="w-3.5 h-3.5"></i><span>Hubungkan Online</span>`;
          this.showToast("Mode Offline Aktif: Laporan disimpan di memori HP.", "warning");
        } else {
          statusPill.className = "flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm";
          statusPill.innerHTML = `<i data-lucide="wifi" class="w-3.5 h-3.5"></i><span>ONLINE</span>`;
          toggleBtn.innerHTML = `<i data-lucide="wifi-off" class="w-3.5 h-3.5"></i><span>Tes Offline</span>`;
          this.showToast("Mode Online Aktif: Siap sinkronisasi ke server.", "success");
        }

        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (btnSyncAll) {
      btnSyncAll.addEventListener('click', () => {
        this.syncAllData();
      });
    }
  }

  syncAllData() {
    const count = window.estateDB.syncAllPending();
    if (count > 0) {
      this.showToast(`Berhasil menyinkronkan ${count} laporan pemupukan ke server kebun!`, 'success');
      this.updateSyncBadge();
      this.updateHomeStats();
      if (window.mandorModule) window.mandorModule.renderHistory();
      if (window.approvalModule) window.approvalModule.renderApprovalTable();
      if (window.dashboardModule) window.dashboardModule.refresh();
      if (window.gisMapModule) window.gisMapModule.render();
    } else {
      this.showToast("Semua data sudah tersinkronisasi sempurna!", "info");
    }
  }

  updateSyncBadge() {
    const count = window.estateDB.getPendingSyncCount();
    const badge = document.getElementById('badge-pending-sync');
    const syncBtn = document.getElementById('btn-sync-all');

    if (badge) {
      badge.innerText = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (syncBtn) {
      if (count > 0) {
        syncBtn.classList.remove('opacity-60', 'pointer-events-none');
        syncBtn.classList.add('animate-pulse');
      } else {
        syncBtn.classList.add('opacity-60');
        syncBtn.classList.remove('animate-pulse');
      }
    }
  }

  setupHighContrastToggle() {
    const btn = document.getElementById('btn-toggle-contrast');
    if (btn) {
      btn.addEventListener('click', () => {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast-mode', this.isHighContrast);
        this.showToast(this.isHighContrast ? "Mode Kontras Tinggi Lapangan Aktif" : "Mode Standar Aktif", "info");
      });
    }
  }

  setupMobileFrameToggle() {
    const btn = document.getElementById('btn-toggle-mobile-frame');
    const mandorContainer = document.getElementById('mandor-view-container');

    if (btn && mandorContainer) {
      btn.addEventListener('click', () => {
        this.isMobileFrame = !this.isMobileFrame;
        if (this.isMobileFrame) {
          mandorContainer.className = "mobile-sim-wrapper p-4 pb-8 space-y-4";
          btn.innerHTML = `<i data-lucide="maximize" class="w-3.5 h-3.5"></i><span>Layar Desktop</span>`;
        } else {
          mandorContainer.className = "max-w-3xl mx-auto space-y-4";
          btn.innerHTML = `<i data-lucide="smartphone" class="w-3.5 h-3.5"></i><span>Simulasi HP</span>`;
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }
  }

  setupDemoDataReset() {
    const btn = document.getElementById('btn-reset-demo-data');
    if (btn) {
      btn.addEventListener('click', () => {
        if (confirm("Reset seluruh data ke kondisi simulasi awal perkebunan sawit?")) {
          window.estateDB.resetDemoData();
          this.showToast("Data berhasil di-reset!", "success");
          setTimeout(() => window.location.reload(), 400);
        }
      });
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let bg = 'bg-slate-900';
    let icon = 'info';

    if (type === 'success') {
      bg = 'bg-emerald-600';
      icon = 'check-circle';
    } else if (type === 'warning') {
      bg = 'bg-amber-600';
      icon = 'alert-triangle';
    } else if (type === 'error') {
      bg = 'bg-rose-600';
      icon = 'alert-circle';
    }

    toast.className = `toast-item ${bg}`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0"></i>
      <span class="text-xs font-semibold leading-snug">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new PalmFertApp();
  window.app.init();
});
