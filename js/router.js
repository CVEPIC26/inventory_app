/* ============================================
   CV EPIC Warehouse V3 - SPA Router
   Single Page Application Routing
   ============================================ */

class Router {
  constructor() {
    this.routes = {
      '/dashboard': 'Dashboard',
      '/users': 'Users',
      '/settings': 'Settings',
      '/sales': 'Sales',
      '/inventory': 'Inventory',
      '/forecast': 'Forecast',
      '/stock-opname': 'StockOpname'
    };
    this.currentRoute = null;
    this.init();
  }

  init() {
    // Listen for navigation
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Handle click on links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        this.navigate(link.dataset.route);
      }
    });

    // Handle initial route
    this.handleRoute();
  }

  navigate(path) {
    if (path === this.currentRoute) return;
    
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const route = this.routes[path] || 'Dashboard';
    
    // Update active menu in sidebar
    this.updateSidebarActive(path);
    
    // Update page title
    document.title = `${route} - CV EPIC Warehouse`;
    
    // Load the page component
    this.loadPage(route);
    
    this.currentRoute = path;
  }

  updateSidebarActive(path) {
    document.querySelectorAll('.sidebar li').forEach(li => {
      li.classList.remove('active');
      if (li.dataset.route === path) {
        li.classList.add('active');
      }
    });
  }

  async loadPage(pageName) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Show loading state
    mainContent.innerHTML = this.getLoadingTemplate();

    try {
      // Load page-specific JS and render
      const pageHTML = await this.getPageHTML(pageName);
      mainContent.innerHTML = pageHTML;
      
      // Initialize page scripts
      this.initPageScripts(pageName);
    } catch (error) {
      console.error('Page load error:', error);
      mainContent.innerHTML = this.getErrorTemplate(error.message);
    }
  }

  getLoadingTemplate() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Memuat...</p>
      </div>
      <style>
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--line);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  getErrorTemplate(message) {
    return `
      <div class="error-container">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Terjadi Kesalahan</h3>
        <p>${message}</p>
        <button class="btn btn-secondary" onclick="location.reload()">Coba Lagi</button>
      </div>
    `;
  }

  async getPageHTML(pageName) {
    const pages = {
      'Dashboard': this.getDashboardHTML(),
      'Users': this.getUsersHTML(),
      'Settings': this.getSettingsHTML(),
      'Sales': this.getSalesHTML(),
      'Inventory': this.getInventoryHTML(),
      'Forecast': this.getForecastHTML(),
      'StockOpname': this.getStockOpnameHTML()
    };
    
    return pages[pageName] || this.getNotFoundHTML();
  }

  initPageScripts(pageName) {
    // Re-initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
    
    // Call page-specific init function
    const initFn = window[`init${pageName}Page`];
    if (typeof initFn === 'function') {
      initFn();
    }
  }

  /* ============================================
     PAGE TEMPLATES
     ============================================ */

  getDashboardHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Monitoring operasional warehouse</p>
        </div>
        <div class="page-header__right">
          <div class="quick-actions">
            <button class="quick-action-btn" data-action="add-sale">
              <i data-lucide="plus-circle"></i>
              Input Penjualan
            </button>
            <button class="quick-action-btn" data-action="add-product">
              <i data-lucide="package-plus"></i>
              Tambah Produk
            </button>
            <button class="quick-action-btn" data-action="forecast">
              <i data-lucide="trending-up"></i>
              Forecast
            </button>
            <button class="quick-action-btn" data-action="stock-opname">
              <i data-lucide="clipboard-list"></i>
              Stok Opname
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Section -->
      <div class="kpi-grid" id="kpiGrid">
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon">
              <i data-lucide="shopping-cart"></i>
            </div>
            <div class="kpi-card__trend up">
              <i data-lucide="trending-up"></i>
              +12%
            </div>
          </div>
          <div class="kpi-card__value" id="kpiSales">0</div>
          <div class="kpi-card__label">Total Penjualan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon" style="background: var(--success-soft); color: var(--success);">
              <i data-lucide="package-check"></i>
            </div>
            <div class="kpi-card__trend up">
              <i data-lucide="trending-up"></i>
              +8%
            </div>
          </div>
          <div class="kpi-card__value" id="kpiSold">0</div>
          <div class="kpi-card__label">Produk Terjual</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon" style="background: var(--warning-soft); color: var(--warning);">
              <i data-lucide="package-x"></i>
            </div>
            <div class="kpi-card__trend down">
              <i data-lucide="trending-down"></i>
              -3%
            </div>
          </div>
          <div class="kpi-card__value" id="kpiUnsold">0</div>
          <div class="kpi-card__label">Produk Belum Terjual</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon" style="background: var(--info-soft); color: var(--info);">
              <i data-lucide="dollar-sign"></i>
            </div>
            <div class="kpi-card__trend up">
              <i data-lucide="trending-up"></i>
              +15%
            </div>
          </div>
          <div class="kpi-card__value" id="kpiProfit">0</div>
          <div class="kpi-card__label">Profit</div>
        </div>
      </div>

      <!-- Analytics Section -->
      <div class="analytics-grid">
        <div class="chart-card">
          <div class="chart-card__header">
            <h3 class="chart-card__title">Grafik Penjualan</h3>
            <select class="form-input form-select" style="width: auto; padding: 6px 32px 6px 12px; font-size: 12px;" id="chartPeriod">
              <option value="7d">7 Hari</option>
              <option value="30d">30 Hari</option>
              <option value="90d">90 Hari</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas id="salesChart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card__header">
            <h3 class="chart-card__title">Ringkasan Persediaan</h3>
          </div>
          <div class="chart-container">
            <canvas id="inventoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="activity-section">
        <div class="activity-section__header">
          <h3 class="activity-section__title">Aktivitas Terbaru</h3>
          <a href="#" class="btn btn-ghost btn-sm" data-route="/activity">Lihat Semua</a>
        </div>
        <table class="activity-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Aktivitas</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="activityTableBody">
            <tr>
              <td colspan="4" style="text-align: center; color: var(--text-muted);">Memuat...</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  getUsersHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Manajemen Pengguna</h1>
          <p class="page-subtitle">Kelola akun dan hak akses pengguna</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn-primary" onclick="openAddUserModal()">
            <i data-lucide="user-plus"></i>
            Tambah User
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Pengguna</h3>
          <div style="display: flex; gap: 8px;">
            <input type="text" class="form-input" placeholder="Cari pengguna..." id="userSearch" style="width: 200px;">
            <select class="form-input form-select" style="width: 140px;" id="roleFilter">
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted);">Memuat...</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--line); margin-top: 16px;">
          <span id="userCount" style="font-size: 12px; color: var(--text-muted);">0 pengguna</span>
          <div class="pagination" id="usersPagination"></div>
        </div>
      </div>
    `;
  }

  getSettingsHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Pengaturan</h1>
          <p class="page-subtitle">Kelola profil dan preferensi akun</p>
        </div>
      </div>

      <div class="settings-layout">
        <nav class="settings-nav">
          <button class="settings-nav__item active" data-section="profile">
            <i data-lucide="user"></i>
            Profil Akun
          </button>
          <button class="settings-nav__item" data-section="security">
            <i data-lucide="shield"></i>
            Keamanan
          </button>
          <button class="settings-nav__item" data-section="users">
            <i data-lucide="users"></i>
            Manajemen User
          </button>
        </nav>

        <div class="settings-content">
          <!-- Profil Akun Section -->
          <section class="settings-section" id="settingsProfile">
            <h2 class="settings-section__title">Profil Akun</h2>
            <form id="profileForm">
              <div class="form-group">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" class="form-input" id="profileName" placeholder="Masukkan nama lengkap">
              </div>
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" id="profileUsername" placeholder="Username" disabled>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="profileEmail" placeholder="Masukkan email">
              </div>
              <div class="form-group">
                <label class="form-label">Role</label>
                <input type="text" class="form-input" id="profileRole" placeholder="Role" disabled>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button type="button" class="btn btn-primary" onclick="saveProfile()">
                  <i data-lucide="save"></i>
                  Simpan Perubahan
                </button>
                <button type="button" class="btn btn-secondary" onclick="cancelProfile()">
                  Batal
                </button>
              </div>
            </form>
          </section>

          <!-- Keamanan Section -->
          <section class="settings-section" id="settingsSecurity" style="display: none;">
            <h2 class="settings-section__title">Keamanan</h2>
            
            <!-- Change Password -->
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 16px;">Ganti Password</h3>
              <form id="changePasswordForm">
                <div class="form-group">
                  <label class="form-label">Password Lama</label>
                  <input type="password" class="form-input" id="oldPassword" placeholder="Masukkan password lama">
                </div>
                <div class="form-group">
                  <label class="form-label">Password Baru</label>
                  <input type="password" class="form-input" id="newPassword" placeholder="Masukkan password baru (min. 6 karakter)">
                </div>
                <div class="form-group">
                  <label class="form-label">Konfirmasi Password</label>
                  <input type="password" class="form-input" id="confirmPassword" placeholder="Konfirmasi password baru">
                </div>
                <button type="button" class="btn btn-primary" onclick="changePassword()">
                  <i data-lucide="key"></i>
                  Update Password
                </button>
              </form>
            </div>

            <!-- Change Email -->
            <div>
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 16px;">Ganti Email</h3>
              <form id="changeEmailForm">
                <div class="form-group">
                  <label class="form-label">Email Baru</label>
                  <input type="email" class="form-input" id="newEmail" placeholder="Masukkan email baru">
                </div>
                <div class="form-group">
                  <label class="form-label">Password Konfirmasi</label>
                  <input type="password" class="form-input" id="emailConfirmPassword" placeholder="Masukkan password untuk konfirmasi">
                </div>
                <button type="button" class="btn btn-primary" onclick="changeEmail()">
                  <i data-lucide="mail"></i>
                  Update Email
                </button>
              </form>
            </div>
          </section>

          <!-- User Management Section -->
          <section class="settings-section" id="settingsUsers" style="display: none;">
            <h2 class="settings-section__title">Manajemen User</h2>
            <div style="overflow-x: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody id="settingsUsersTableBody">
                  <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted);">Memuat...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  getSalesHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Dashboard Penjualan</h1>
          <p class="page-subtitle">Monitoring penjualan warehouse per periode</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn-primary" onclick="openAddSaleModal()">
            <i data-lucide="plus-circle"></i>
            Input Penjualan
          </button>
          <button class="btn btn-secondary" onclick="openImportSales()">
            <i data-lucide="upload"></i>
            Import
          </button>
        </div>
      </div>

      <div class="filter-bar" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
        <select class="form-input form-select" id="salesBulan" style="width: 140px;">
          ${this.getMonthOptions()}
        </select>
        <select class="form-input form-select" id="salesTahun" style="width: 100px;">
          ${this.getYearOptions()}
        </select>
        <input type="text" class="form-input" id="salesSearch" placeholder="Cari produk..." style="width: 200px;">
        <button class="btn btn-secondary" onclick="applySalesFilters()">
          <i data-lucide="filter"></i>
          Filter
        </button>
        <button class="btn btn-ghost" onclick="resetSalesFilters()">Reset</button>
      </div>

      <div class="card">
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Outlet</th>
                <th>SKU</th>
                <th>Produk</th>
                <th>Qty</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="salesTableBody">
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted);">Memuat...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  getInventoryHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Persediaan Warehouse</h1>
          <p class="page-subtitle">Rolling stock dengan cutoff bulan database</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn-primary" onclick="openAddProductModal()">
            <i data-lucide="package-plus"></i>
            Tambah Produk
          </button>
          <button class="btn btn-secondary" onclick="openImportProducts()">
            <i data-lucide="upload"></i>
            Import
          </button>
        </div>
      </div>

      <div class="filter-bar" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
        <select class="form-input form-select" id="inventoryKategori" style="width: 160px;">
          <option value="">Semua Kategori</option>
        </select>
        <input type="text" class="form-input" id="inventorySearch" placeholder="Cari produk..." style="width: 200px;">
        <select class="form-input form-select" id="inventoryStatus" style="width: 140px;">
          <option value="">Semua Status</option>
          <option value="normal">Normal</option>
          <option value="minimum">Minimum</option>
          <option value="habis">Habis</option>
          <option value="overstock">Overstock</option>
        </select>
        <button class="btn btn-secondary" onclick="applyInventoryFilters()">
          <i data-lucide="filter"></i>
          Filter
        </button>
      </div>

      <div class="card">
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Stok Sistem</th>
                <th>Min Stok</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="inventoryTableBody">
              <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted);">Memuat...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  getForecastHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Forecast Penjualan</h1>
          <p class="page-subtitle">Prediksi menggunakan EMA 3 bulan + buffer 10%</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn-secondary" onclick="exportForecast()">
            <i data-lucide="download"></i>
            Export
          </button>
        </div>
      </div>

      <div class="filter-bar" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
        <select class="form-input form-select" id="forecastBulan" style="width: 140px;">
          ${this.getMonthOptions()}
        </select>
        <select class="form-input form-select" id="forecastTahun" style="width: 100px;">
          ${this.getYearOptions()}
        </select>
        <select class="form-input form-select" id="forecastKategori" style="width: 160px;">
          <option value="">Semua Kategori</option>
        </select>
        <button class="btn btn-secondary" onclick="applyForecastFilters()">
          <i data-lucide="filter"></i>
          Filter
        </button>
      </div>

      <div class="kpi-grid" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon">
              <i data-lucide="trending-up"></i>
            </div>
          </div>
          <div class="kpi-card__value" id="forecastTotal">0</div>
          <div class="kpi-card__label">Total Forecast</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon" style="background: var(--success-soft); color: var(--success);">
              <i data-lucide="package-check"></i>
            </div>
          </div>
          <div class="kpi-card__value" id="forecastProduk">0</div>
          <div class="kpi-card__label">Produk Diprediksi</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon" style="background: var(--warning-soft); color: var(--warning);">
              <i data-lucide="alert-triangle"></i>
            </div>
          </div>
          <div class="kpi-card__value" id="forecastWarning">0</div>
          <div class="kpi-card__label">Perlu Restock</div>
        </div>
      </div>

      <div class="card">
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Forecast (EMA)</th>
                <th>Buffer 10%</th>
                <th>Total Perlu</th>
                <th>Stok Saat Ini</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="forecastTableBody">
              <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted);">Memuat...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  getStockOpnameHTML() {
    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-title">Stok Opname Gudang</h1>
          <p class="page-subtitle">Input dan sesuaikan hasil Stock Opname</p>
        </div>
        <div class="page-header__right">
          <button class="btn btn-primary" onclick="openNewOpname()">
            <i data-lucide="plus-circle"></i>
            Mulai Opname
          </button>
        </div>
      </div>

      <div class="filter-bar" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
        <select class="form-input form-select" id="opnameBulan" style="width: 140px;">
          ${this.getMonthOptions()}
        </select>
        <select class="form-input form-select" id="opnameTahun" style="width: 100px;">
          ${this.getYearOptions()}
        </select>
        <select class="form-input form-select" id="opnameStatus" style="width: 140px;">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="in_progress">Sedang Berlangsung</option>
          <option value="completed">Selesai</option>
          <option value="approved">Disetujui</option>
        </select>
        <button class="btn btn-secondary" onclick="applyOpnameFilters()">
          <i data-lucide="filter"></i>
          Filter
        </button>
      </div>

      <div class="card">
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Kode SO</th>
                <th>Tanggal</th>
                <th>Lokasi</th>
                <th>Checker</th>
                <th>Total Item</th>
                <th>Selisih</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="opnameTableBody">
              <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted);">Memuat...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  getNotFoundHTML() {
    return `
      <div class="error-container" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted);">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <h2 style="margin-top: 24px; font-size: 24px;">Halaman Tidak Ditemukan</h2>
        <p style="color: var(--text-muted); margin-top: 8px;">Halaman yang Anda cari tidak tersedia.</p>
        <button class="btn btn-primary" onclick="navigate('/dashboard')" style="margin-top: 24px;">
          Kembali ke Dashboard
        </button>
      </div>
    `;
  }

  getMonthOptions() {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonth = new Date().getMonth() + 1;
    return months.map((m, i) => `<option value="${i + 1}" ${i + 1 === currentMonth ? 'selected' : ''}>${m}</option>`).join('');
  }

  getYearOptions() {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    return years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
  }
}

// Initialize router
window.router = new Router();

// Navigation helper
function navigate(path) {
  window.router.navigate(path);
}

// Update page title
function updatePageTitle(title) {
  document.title = `${title} - CV EPIC Warehouse`;
}

// Show toast notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  if (window.lucide) lucide.createIcons();
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}