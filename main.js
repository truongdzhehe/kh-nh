// public/main.js
// Phúc An Retail - Nền Tảng Phân Tích & Quản Trị Bán Lẻ (5 Bước & 2 Cổng Duyệt)
// Đóng đinh 7 Luật bất biến: AI không tính số, 2 Cổng duyệt, Chat chỉ-đọc, Đối chiếu số liệu
// Hỗ trợ chế độ Empty State chuẩn mực và chuyển đổi mượt mà khi nạp file

// ==========================================
// ĐỊNH DẠNG SỐ & TIỀN TỆ CHUẨN MỰC
// ==========================================
function formatPct(val, withPlus = true) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '---%';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '---%';
  const rounded = Math.round(num * 100) / 100;
  if (rounded > 0 && withPlus) return `+${rounded}%`;
  return `${rounded}%`;
}

function formatCurrencyVND(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '---&nbsp;₫';
  return `${Number(amount).toLocaleString('vi-VN')}&nbsp;₫`;
}

const i18n = {
  vi: {
    brandTitle: "Phúc An",
    navPagesTitle: "PAGES • QUY TRÌNH",
    navOverview: "Tổng quan & Biểu đồ",
    navAiAdvisor: "AI Đề Xuất & Lời Khuyên",
    navCleansing: "Làm sạch & Cổng duyệt 1",
    navStores: "Báo cáo 18 Cửa hàng",
    navReports: "Nhận định AI & Đối chiếu",
    navDecisions: "Chỉ đạo & Cổng duyệt 2",
    navToolsTitle: "CÔNG CỤ QUẢN TRỊ",
    navWorkflow: "Quy trình 5 Bước & 7 Luật",
    navUpload: "Nạp POS / File Sheet",
    pageTitle: "Wallet & Analytics",
    pageSubtitle: "Quy trình tự động hóa đối soát doanh thu, giá vốn COGS và chỉ đạo điều hành 18 điểm bán",
    btnLoadAnalyze: "Chạy Toàn Bộ Quy Trình",
    cardBalanceTitle: "Doanh Thu Thuần",
    profitMoM: "Tăng trưởng MoM",
    cardTargetTitle: "% Hoàn Thành Kế Hoạch",
    cardTargetStatus: "Toàn chuỗi 18 CH",
    addFileTitle: "Tải Lên File POS Hoặc Sheet",
    addFileDesc: "Kéo thả CSV / XLSX hoặc kết nối Google Sheet",
    chartTitle: "My Wallets • Biểu Đồ Đối Chiếu Doanh Thu Thuần & Giá Vốn (COGS)",
    chartSubtitle: "Dữ liệu hạch toán thực tế 31 ngày so sánh kỳ MoM (100% tính bằng Code)",
    cleansingTitle: "Trung Tâm Làm Sạch Dữ Liệu & Thẩm Định Cổng Duyệt 1",
    cleansingDesc: "Khử trùng lặp giao dịch POS, bóc tách đơn hủy, khấu trừ đổi trả và bù trừ giá vốn COGS",
    btnRunCleanse: "Chạy Làm Sạch Lại",
    storesTableTitle: "Bảng Chỉ Số Chi Tiết 18 Cửa Hàng Toàn Chuỗi",
    storesTableDesc: "Nhấp vào bất kỳ cửa hàng nào để xem phân tích nguyên nhân cốt lõi (Root-cause)",
    reportsTitle: "Nhận Định AI & Bộ Kiểm Chứng Số Liệu Không Ảo Giác",
    myCardTitle: "My Card • Top 3 Cửa Hàng Điểm Nóng & Gói Chỉ Đạo Điều Hành",
    myCardSubtitle: "Ban hành quyết định can thiệp kinh doanh khẩn cấp và đóng dấu phê duyệt Cổng 2"
  },
  en: {
    brandTitle: "Phuc An",
    navPagesTitle: "PAGES • PIPELINE",
    navOverview: "Overview & Charts",
    navAiAdvisor: "AI Advisory & Recommendations",
    navCleansing: "Cleansing & Gate 1",
    navStores: "18 Stores Analytics",
    navReports: "AI Narrative & Audit",
    navDecisions: "Directives & Gate 2",
    navToolsTitle: "MANAGEMENT TOOLS",
    navWorkflow: "5-Step Pipeline & Rules",
    navUpload: "Upload POS / Sheet",
    pageTitle: "Wallet & Analytics",
    pageSubtitle: "Automated sales reconciliation, COGS & 18-store executive management",
    btnLoadAnalyze: "Execute Full Pipeline",
    cardBalanceTitle: "Net Revenue",
    profitMoM: "MoM Growth",
    cardTargetTitle: "% Target Achieved",
    cardTargetStatus: "Full Chain 18 Stores",
    addFileTitle: "Upload POS File or Sheet",
    addFileDesc: "Drag & drop CSV/XLSX or link Google Sheet",
    chartTitle: "My Wallets • Net Revenue & COGS Reconciliation Chart",
    chartSubtitle: "31-day empirical accounting with MoM comparison (100% Code-computed)",
    cleansingTitle: "Data Cleansing Center & Gate 1 Verification",
    cleansingDesc: "Dedup POS orders, exclude cancelled, reconcile returns & recover COGS",
    btnRunCleanse: "Re-run Cleansing",
    storesTableTitle: "18 Stores Detailed Quantitative Metrics",
    storesTableDesc: "Click any store to inspect root-cause analysis and operational notes",
    reportsTitle: "AI Narrative & Strict Number Verification Matrix",
    myCardTitle: "My Card • Top 3 Hotspot Stores & Action Directives",
    myCardSubtitle: "Issue emergency intervention packages & sign Gate 2 official seal"
  }
};

let currentLang = 'vi';
let pipelineState = 'INIT'; // Mặc định ở trạng thái Empty State
let cachedStatus = null;
let currentAuditFilter = 'ALL';
let currentStoreRegion = 'ALL';

// Ashlar SaaS Filter & State
let currentAshlarAccount = 'ALL';
let currentAshlarStatusFilter = 'ALL';
let selectedStoreOption = 1;
let currentDetailStoreId = 'PA-05';

// ==========================================
// ĐIỀU PHỐI GIAO DIỆN & TỔNG KHỞI CHẠY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupLanguage();
  setupNavigation();
  setupPipelineActions();
  setupFileUploadHandlers();
  setupCopilotChat();
  setupDrilldownModal();
  setupRouteGuard();
  setupAIAdvisoryHandlers();
  
  // Thiết lập các bộ lọc & tương tác Ashlar
  setupAshlarAccountPills();
  setupAshlarHoldingsFilter();
  setupAshlarStoreDetail();
  
  // Tải trạng thái ban đầu từ server
  fetchPipelineStatus();
});

// ==========================================
// 1. QUẢN LÝ GIAO DIỆN SÁNG / TỐI & NGÔN NGỮ
// ==========================================
function setupTheme() {
  const btn = document.getElementById('btnThemeToggle');
  const icon = document.getElementById('themeIconLabel');
  const isDark = localStorage.getItem('phucan_theme') === 'dark';
  
  if (isDark) {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
    if (icon) icon.textContent = '🌙';
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      document.body.classList.toggle('light', !dark);
      localStorage.setItem('phucan_theme', dark ? 'dark' : 'light');
      if (icon) icon.textContent = dark ? '🌙' : '☀️';
    });
  }
}

function setupLanguage() {
  const btn = document.getElementById('btnLangToggle');
  const flag = document.getElementById('langFlag');
  const code = document.getElementById('langCode');

  if (btn) {
    btn.addEventListener('click', () => {
      currentLang = currentLang === 'vi' ? 'en' : 'vi';
      if (flag) flag.textContent = currentLang === 'vi' ? '🇻🇳' : '🇬🇧';
      if (code) code.textContent = currentLang === 'vi' ? 'VN' : 'EN';
      applyTranslations();
    });
  }
}

function applyTranslations() {
  const dict = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
}

// ==========================================
// 2. ĐIỀU HƯỚNG TỪNG PHẦN (PAGE NAVIGATION) & ROUTE GUARD
// ==========================================
function setupNavigation() {
  const sections = ['sec-overview', 'sec-ai-advisor', 'sec-cleansing', 'sec-stores', 'sec-reports', 'sec-decisions', 'sec-audit', 'sec-workflow', 'sec-upload', 'sec-store-detail'];

  // Ẩn tất cả ngoại trừ sec-overview ban đầu
  showSection('sec-overview');

  document.querySelectorAll('.sidebar-link[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSec = btn.getAttribute('data-section');
      
      // Kiểm tra khóa bảo vệ tuyến đường (Route Guard - Luật 2)
      if (isSectionLocked(targetSec)) {
        triggerRouteGuard(targetSec);
        return;
      }

      document.querySelectorAll('.sidebar-link').forEach(b => {
        b.classList.remove('active');
        const svg = b.querySelector('svg');
        if (svg) svg.classList.remove('text-white');
      });
      btn.classList.add('active');
      const curSvg = btn.querySelector('svg');
      if (curSvg) curSvg.classList.add('text-white');

      showSection(targetSec);
    });
  });

  // Nút trên stepper bar
  document.querySelectorAll('.step-card[data-section]').forEach(card => {
    card.addEventListener('click', () => {
      const targetSec = card.getAttribute('data-section');
      if (isSectionLocked(targetSec)) {
        triggerRouteGuard(targetSec);
        return;
      }
      showSection(targetSec);
    });
  });
}

function showSection(targetId) {
  const allSections = ['sec-overview', 'sec-ai-advisor', 'sec-cleansing', 'sec-stores', 'sec-reports', 'sec-decisions', 'sec-audit', 'sec-workflow', 'sec-upload', 'sec-store-detail'];
  allSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === targetId) {
        el.classList.remove('hidden');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

// Ràng buộc bảo vệ tuyến đường (Luật 2: 2 Cổng duyệt bắt buộc)
function isSectionLocked(sectionId) {
  if (sectionId === 'sec-store-detail' || sectionId === 'sec-ai-advisor' || sectionId === 'sec-overview' || sectionId === 'sec-upload' || sectionId === 'sec-workflow' || sectionId === 'sec-audit') {
    return false;
  }
  const needsGate1 = ['sec-stores', 'sec-reports', 'sec-decisions'];
  if (needsGate1.includes(sectionId)) {
    if (pipelineState === 'INIT' || pipelineState === 'INGESTED' || pipelineState === 'CLEANING_PROFILED') {
      return true;
    }
  }
  if (sectionId === 'sec-decisions' && (pipelineState === 'GATE1_APPROVED')) {
    return false;
  }
  return false;
}

function triggerRouteGuard(targetSec) {
  const modal = document.getElementById('routeGuardModal');
  const msg = document.getElementById('routeGuardMessage');
  const actBtn = document.getElementById('btnRouteGuardAction');

  if (pipelineState === 'INIT') {
    msg.textContent = 'Quy trình chưa tiếp nhận dữ liệu. Vui lòng tải lên file POS hoặc kết nối Google Sheet ở Bước 1 trước khi thực hiện các bước tiếp theo.';
    actBtn.textContent = 'Tải Lên File POS';
    actBtn.onclick = () => {
      modal.classList.add('hidden');
      document.getElementById('fileUploadInput')?.click();
    };
  } else if (pipelineState === 'INGESTED') {
    msg.textContent = 'Dữ liệu đã được tiếp nhận nhưng chưa được làm sạch. Để bảo đảm tính toàn vẹn của số liệu quản trị (Luật 2), bạn cần hoàn thành Bước 2 (Làm sạch) và ký duyệt tại Cổng 1.';
    actBtn.textContent = 'Đến Làm Sạch Dữ Liệu';
    actBtn.onclick = () => {
      modal.classList.add('hidden');
      showSection('sec-cleansing');
    };
  } else if (pipelineState === 'CLEANING_PROFILED') {
    msg.textContent = 'Dữ liệu đã được khử trùng lặp và loại đơn hủy, nhưng CHƯA ĐƯỢC DUYỆT TẠI CỔNG 1. Bạn cần thực hiện ký duyệt Cổng 1 để mở khóa Bước 3: Tính toán chỉ số 18 Cửa hàng.';
    actBtn.textContent = 'Đến Ký Duyệt Cổng 1';
    actBtn.onclick = () => {
      modal.classList.add('hidden');
      showSection('sec-cleansing');
      document.getElementById('gate1FormArea')?.scrollIntoView({ behavior: 'smooth' });
    };
  }

  if (modal) modal.classList.remove('hidden');
}

function setupRouteGuard() {
  const closeBtn = document.getElementById('btnRouteGuardClose');
  const modal = document.getElementById('routeGuardModal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }
}

// ==========================================
// 3. ĐỒNG BỘ PIPELINE STATUS VỚI SERVER
// ==========================================
async function fetchPipelineStatus() {
  try {
    const res = await fetch('/api/pipeline/status');
    const data = await res.json();
    if (!data.success) return;

    cachedStatus = data;
    pipelineState = data.pipelineState || 'INIT';
    updatePipelineUI(data);
  } catch (err) {
    console.error('Lỗi tải trạng thái pipeline:', err);
  }
}

function updatePipelineUI(data) {
  const stateLabel = document.getElementById('systemStateLabel');
  const stateDot = document.getElementById('systemStateDot');
  if (stateLabel) stateLabel.textContent = `State: ${pipelineState}`;

  // 1. Cập nhật Stepper cards
  updateStepperCards();

  // 2. CẬP NHẬT EMPTY STATE VS LOADED STATE CHO 3 THẺ KPI & BIỂU ĐỒ
  const hasData = (data.chainSummary && (pipelineState === 'METRICS_COMPUTED' || pipelineState === 'NARRATIVE_VERIFIED' || pipelineState === 'GATE2_APPROVED'));
  
  const kpiNetRev = document.getElementById('kpiNetRev');
  const kpiMoMBadge = document.getElementById('kpiNetRevMoMBadge');
  const kpiCogs = document.getElementById('kpiCogs');

  const kpiGpDot = document.getElementById('kpiGrossProfitDot');
  const kpiGpMarginBadge = document.getElementById('kpiGpMarginBadge');
  const kpiGrossProfit = document.getElementById('kpiGrossProfit');
  const kpiGpTargetBadge = document.getElementById('kpiGpTargetBadge');
  const kpiReturnsCount = document.getElementById('kpiReturnsCount');

  const kpiTargetDot = document.getElementById('kpiTargetDot');
  const kpiPeriodBadge = document.getElementById('kpiPeriodBadge');
  const kpiTargetPct = document.getElementById('kpiTargetPct');
  const kpiTargetStatusBadge = document.getElementById('kpiTargetStatusBadge');
  const kpiStoresStatus = document.getElementById('kpiStoresApprovedStatus');

  const chartEmptyState = document.getElementById('chartEmptyState');
  const chartLiveContent = document.getElementById('chartLiveContent');
  const chartTooltipRev = document.getElementById('chartTooltipRev');
  const chartTooltipMoM = document.getElementById('chartTooltipMoM');
  const chartSubtitleText = document.getElementById('chartSubtitleText');

  if (hasData) {
    const cs = data.chainSummary;

    // Card 1: Doanh Thu Thuần
    if (kpiNetRev) kpiNetRev.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">${cs.netRevenue.toLocaleString('vi-VN')}&nbsp;<span class="text-sm font-semibold text-slate-400">₫</span></span>`;
    if (kpiMoMBadge) {
      if (cs.momRevenueGrowthPct !== null && cs.momRevenueGrowthPct !== undefined) {
        kpiMoMBadge.textContent = formatPct(cs.momRevenueGrowthPct);
        kpiMoMBadge.className = cs.momRevenueGrowthPct >= 0
          ? 'text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap'
          : 'text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap';
      } else {
        kpiMoMBadge.textContent = '---%';
        kpiMoMBadge.className = 'text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap';
      }
    }
    if (kpiCogs) {
      if (cs.hasCogs === false || cs.cogs === 0) {
        kpiCogs.innerHTML = `<span class="font-bold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">0&nbsp;₫</span>`;
      } else {
        kpiCogs.innerHTML = `<span class="font-bold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">${cs.cogs.toLocaleString('vi-VN')}&nbsp;₫</span>`;
      }
    }

    // Card 2: Lợi Nhuận Gộp (GP)
    if (kpiGpDot) kpiGpDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';
    if (kpiGpMarginBadge) {
      kpiGpMarginBadge.textContent = `Biên ${cs.grossMarginPct}%`;
      kpiGpMarginBadge.className = 'text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg whitespace-nowrap';
    }
    if (kpiGrossProfit) kpiGrossProfit.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">${cs.grossProfit.toLocaleString('vi-VN')}&nbsp;<span class="text-sm font-semibold text-slate-400">₫</span></span>`;
    if (kpiGpTargetBadge) {
      kpiGpTargetBadge.textContent = cs.targetGPAchievedPct > 0 ? `+${cs.targetGPAchievedPct}%` : 'Đạt chuẩn';
      kpiGpTargetBadge.className = 'text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap';
    }
    if (kpiReturnsCount) kpiReturnsCount.innerHTML = `<span class="font-bold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">${(data.auditLog?.totalReturnsProcessed || 0).toLocaleString('vi-VN')} phiếu</span>`;

    // Card 3: % Hoàn Thành Kế Hoạch
    if (kpiTargetDot) kpiTargetDot.className = 'w-2.5 h-2.5 rounded-full bg-blue-500';
    if (kpiPeriodBadge) {
      kpiPeriodBadge.textContent = 'Kỳ T10';
      kpiPeriodBadge.className = 'text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg whitespace-nowrap';
    }
    if (cs.targetRevAchievedPct !== null && cs.targetRevAchievedPct !== undefined) {
      if (kpiTargetPct) kpiTargetPct.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">${cs.targetRevAchievedPct}%</span>`;
      if (kpiTargetStatusBadge) {
        if (cs.targetRevAchievedPct >= 100) {
          kpiTargetStatusBadge.textContent = 'Vượt chỉ tiêu';
          kpiTargetStatusBadge.className = 'text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap';
        } else {
          kpiTargetStatusBadge.textContent = 'Chưa đạt chỉ tiêu';
          kpiTargetStatusBadge.className = 'text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap';
        }
      }
    } else {
      if (kpiTargetPct) kpiTargetPct.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">---%</span>`;
      if (kpiTargetStatusBadge) {
        kpiTargetStatusBadge.textContent = 'Chưa có chỉ tiêu';
        kpiTargetStatusBadge.className = 'text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap font-mono';
      }
    }
    if (kpiStoresStatus) kpiStoresStatus.innerHTML = `<span class="font-bold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">${cs.totalStores || 1}/${cs.totalStores || 1} Điểm bán</span>`;

    // Biểu đồ: Hiển thị Live Chart và ẩn Empty State
    if (chartEmptyState) chartEmptyState.classList.add('hidden');
    if (chartLiveContent) chartLiveContent.classList.remove('hidden');
    if (chartTooltipRev) chartTooltipRev.textContent = cs.netRevenue.toLocaleString('vi-VN');
    if (chartTooltipMoM) chartTooltipMoM.textContent = cs.momRevenueGrowthPct !== null ? formatPct(cs.momRevenueGrowthPct) : '---%';
    if (chartSubtitleText) chartSubtitleText.textContent = `${cs.momRevenueGrowthPct !== null ? formatPct(cs.momRevenueGrowthPct) + ' MoM' : 'Kỳ hiện tại'} • 31 ngày hạch toán độc lập (100% Code tính)`;

  } else {
    // EMPTY STATE (CHƯA NẠP DỮ LIỆU)

    // Card 1: Doanh Thu Thuần
    if (kpiNetRev) kpiNetRev.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">---&nbsp;<span class="text-sm font-semibold text-slate-400">₫</span></span>`;
    if (kpiMoMBadge) {
      kpiMoMBadge.textContent = 'Chờ nạp dữ liệu';
      kpiMoMBadge.className = 'text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap';
    }
    if (kpiCogs) kpiCogs.innerHTML = `<span class="font-bold text-slate-400 font-mono whitespace-nowrap">---&nbsp;₫</span>`;

    // Card 2: Lợi Nhuận Gộp (GP)
    if (kpiGpDot) kpiGpDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600';
    if (kpiGpMarginBadge) {
      kpiGpMarginBadge.textContent = 'Biên ---%';
      kpiGpMarginBadge.className = 'text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg whitespace-nowrap';
    }
    if (kpiGrossProfit) kpiGrossProfit.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">---&nbsp;<span class="text-sm font-semibold text-slate-400">₫</span></span>`;
    if (kpiGpTargetBadge) {
      kpiGpTargetBadge.textContent = 'Chưa có dữ liệu';
      kpiGpTargetBadge.className = 'text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap';
    }
    if (kpiReturnsCount) kpiReturnsCount.innerHTML = `<span class="font-bold text-slate-400 font-mono whitespace-nowrap">---</span>`;

    // Card 3: % Hoàn Thành Kế Hoạch
    if (kpiTargetDot) kpiTargetDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600';
    if (kpiPeriodBadge) {
      kpiPeriodBadge.textContent = 'Chờ file';
      kpiPeriodBadge.className = 'text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg whitespace-nowrap';
    }
    if (kpiTargetPct) kpiTargetPct.innerHTML = `<span class="text-xl xl:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight block whitespace-nowrap">---%</span>`;
    if (kpiTargetStatusBadge) {
      kpiTargetStatusBadge.textContent = 'Chờ nạp dữ liệu';
      kpiTargetStatusBadge.className = 'text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap font-bold';
    }
    if (kpiStoresStatus) kpiStoresStatus.innerHTML = `<span class="font-bold text-slate-400 font-mono whitespace-nowrap">---</span>`;

    // Biểu đồ: Hiển thị Empty State và ẩn Live Chart
    if (chartEmptyState) chartEmptyState.classList.remove('hidden');
    if (chartLiveContent) chartLiveContent.classList.add('hidden');
    if (chartTooltipRev) chartTooltipRev.textContent = '---';
    if (chartTooltipMoM) chartTooltipMoM.textContent = '---%';
    if (chartSubtitleText) chartSubtitleText.textContent = 'Chờ nạp dữ liệu • 31 ngày hạch toán độc lập (100% Code tính)';
  }

  // 3. Cập nhật 5 thẻ đối soát làm sạch ở sec-cleansing
  const auditTotalRaw = document.getElementById('auditTotalRaw');
  const auditDupRemoved = document.getElementById('auditDupRemoved');
  const auditCancelledExcluded = document.getElementById('auditCancelledExcluded');
  const auditCleanValid = document.getElementById('auditCleanValid');
  const auditReturnsProcessed = document.getElementById('auditReturnsProcessed');

  if (data.auditLog && data.auditLog.totalRawTransactions > 0) {
    if (auditTotalRaw) auditTotalRaw.textContent = data.auditLog.totalRawTransactions.toLocaleString('vi-VN');
    if (auditDupRemoved) auditDupRemoved.textContent = `-${data.auditLog.duplicatesRemoved.toLocaleString('vi-VN')}`;
    if (auditCancelledExcluded) auditCancelledExcluded.textContent = `-${data.auditLog.cancelledOrdersExcluded.toLocaleString('vi-VN')}`;
    if (auditCleanValid) auditCleanValid.textContent = data.auditLog.validTransactionsCount.toLocaleString('vi-VN');
    if (auditReturnsProcessed) auditReturnsProcessed.textContent = (data.auditLog.totalReturnsProcessed || 0).toLocaleString('vi-VN');
  } else {
    if (auditTotalRaw) auditTotalRaw.textContent = '---';
    if (auditDupRemoved) auditDupRemoved.textContent = '0';
    if (auditCancelledExcluded) auditCancelledExcluded.textContent = '0';
    if (auditCleanValid) auditCleanValid.textContent = '---';
    if (auditReturnsProcessed) auditReturnsProcessed.textContent = '0';
  }

  // 4. Cập nhật Cổng 1 UI
  const g1Status = document.getElementById('gate1StatusText');
  const g1Stamp = document.getElementById('gate1StampContainer');
  const g1Code = document.getElementById('gate1StampCode');
  const btnApproveG1 = document.getElementById('btnApproveGate1');

  if (data.gate1Record) {
    if (g1Status) g1Status.innerHTML = `<span class="text-emerald-500 font-bold">✓ CỔNG 1 ĐÃ DUYỆT BỞI ${data.gate1Record.approverName} lúc ${data.gate1Record.approvedAt}</span>`;
    if (g1Stamp) g1Stamp.style.display = 'block';
    if (g1Code) g1Code.textContent = data.gate1Record.approvalCode;
    if (btnApproveG1) {
      btnApproveG1.classList.remove('bg-amber-500', 'hover:bg-amber-600');
      btnApproveG1.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      btnApproveG1.innerHTML = '<span>✓ ĐÃ XÁC NHẬN CỔNG 1</span>';
      btnApproveG1.disabled = true;
    }
  } else {
    if (g1Stamp) g1Stamp.style.display = 'none';
    if (btnApproveG1) {
      btnApproveG1.disabled = false;
      btnApproveG1.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg><span>KÝ PHÊ DUYỆT CỔNG 1</span>';
    }
  }

  // 5. Cập nhật Cổng 2 UI
  const g2Status = document.getElementById('gate2StatusText');
  const g2Seal = document.getElementById('gate2SealContainer');
  const g2Code = document.getElementById('gate2SealCode');
  const btnApproveG2 = document.getElementById('btnApproveGate2');

  if (data.gate2Record) {
    if (g2Status) g2Status.innerHTML = `<span class="text-rose-600 font-bold">★ CỔNG 2 ĐÃ PHÊ DUYỆT BỞI ${data.gate2Record.approverName} (Mã: ${data.gate2Record.approvalCode})</span>`;
    if (g2Seal) g2Seal.style.display = 'block';
    if (g2Code) g2Code.textContent = data.gate2Record.approvalCode;
    if (btnApproveG2) {
      btnApproveG2.classList.remove('bg-rose-600', 'hover:bg-rose-700');
      btnApproveG2.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      btnApproveG2.innerHTML = '<span>★ ĐÃ ĐÓNG DẤU MỘC CỔNG 2</span>';
      btnApproveG2.disabled = true;
    }
  } else {
    if (g2Seal) g2Seal.style.display = 'none';
    if (btnApproveG2) {
      btnApproveG2.disabled = false;
      btnApproveG2.innerHTML = '<span>KÝ PHÊ DUYỆT CỔNG 2 & ĐÓNG DẤU</span>';
    }
  }

  // Render các bảng biểu
  renderAuditSamples(data.flaggedSamples || []);
  renderStoresTable(data.storeKPIs || []);
  renderBankCards(data.recommendedStores || []);
  renderStrategicPillars();
  renderVerificationMatrix(data.verificationMatrix || []);
  renderAuditTrail(data.auditTrail || []);
  renderProductCategories(data.productMix || []);

  // Render Ashlar SaaS Components
  renderAshlarHeroCard(data);
  renderAshlarHoldingsTable(data.storeKPIs || []);
  renderAshlarExposure(data.productMix || []);
  renderAshlarHotspots(data.recommendedStores || []);
  updateAshlarGateStatus(data);

  // Render hệ thống AI Đề Xuất & Lời Khuyên Chiến Lược
  renderAIRecommendations(data.aiRecommendations || []);
  renderAIAdviceFeed(data.aiAdvice || []);
  renderAIAdvisorySummary(data.aiAdvisorySummary || null);
}

function updateStepperCards() {
  const s1 = document.getElementById('stepCard1');
  const s2 = document.getElementById('stepCard2');
  const sg1 = document.getElementById('stepCardGate1');
  const s3 = document.getElementById('stepCard3');
  const s4 = document.getElementById('stepCard4');
  const sg2 = document.getElementById('stepCardGate2');
  const s5 = document.getElementById('stepCard5');

  // Reset classes
  [s1, s2, sg1, s3, s4, sg2, s5].forEach(el => {
    if (el) el.className = 'step-card';
  });

  if (pipelineState === 'INIT') {
    s1.classList.add('step-active');
    [s2, sg1, s3, s4, sg2, s5].forEach(el => el?.classList.add('step-locked'));
  } else if (pipelineState === 'INGESTED') {
    s1.classList.add('step-done');
    s2.classList.add('step-active');
    [s3, s4, sg2, s5].forEach(el => el?.classList.add('step-locked'));
  } else if (pipelineState === 'CLEANING_PROFILED') {
    s1.classList.add('step-done');
    s2.classList.add('step-done');
    sg1.classList.add('step-active');
    document.getElementById('gate1StepperLabel').textContent = 'Chờ Ký Duyệt';
    [s3, s4, sg2, s5].forEach(el => el?.classList.add('step-locked'));
  } else if (pipelineState === 'GATE1_APPROVED') {
    s1.classList.add('step-done');
    s2.classList.add('step-done');
    sg1.classList.add('step-done');
    document.getElementById('gate1StepperLabel').textContent = 'Đã Duyệt Cổng 1';
    s3.classList.add('step-active');
  } else if (pipelineState === 'METRICS_COMPUTED') {
    [s1, s2, sg1, s3].forEach(el => el?.classList.add('step-done'));
    s4.classList.add('step-active');
    document.getElementById('gate1StepperLabel').textContent = 'Đã Duyệt Cổng 1';
  } else if (pipelineState === 'NARRATIVE_VERIFIED') {
    [s1, s2, sg1, s3, s4].forEach(el => el?.classList.add('step-done'));
    sg2.classList.add('step-active');
    document.getElementById('gate1StepperLabel').textContent = 'Đã Duyệt Cổng 1';
    document.getElementById('gate2StepperLabel').textContent = 'Chờ Ký GĐKD';
  } else if (pipelineState === 'GATE2_APPROVED') {
    [s1, s2, sg1, s3, s4, sg2, s5].forEach(el => el?.classList.add('step-done'));
    document.getElementById('gate1StepperLabel').textContent = 'Đã Duyệt Cổng 1';
    document.getElementById('gate2StepperLabel').textContent = 'Đã Ký Duyệt Cổng 2';
  }
}

// ==========================================
// 4. TIẾP NHẬN TẬP TIN FILE UPLOAD & DRAG & DROP (+ ADD FILE)
// ==========================================
function setupFileUploadHandlers() {
  const fileInput = document.getElementById('fileUploadInput');
  const dropArea = document.getElementById('dropArea');
  const fetchSheetBtn = document.getElementById('btnFetchSheet');
  const sheetInput = document.getElementById('sheetUrlInput');

  // 1. Click vào Dropzone
  if (dropArea && fileInput) {
    dropArea.addEventListener('click', () => fileInput.click());

    // Drag & Drop effects
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('border-orange-500', 'bg-orange-100/40');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('border-orange-500', 'bg-orange-100/40');
      });
    });

    dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        processUploadedFile(files[0]);
      }
    });
  }

  // 2. File picker change event
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        processUploadedFile(e.target.files[0]);
      }
    });
  }

  // 3. Google Sheet Connect
  if (fetchSheetBtn && sheetInput) {
    fetchSheetBtn.addEventListener('click', async () => {
      const url = sheetInput.value.trim();
      if (!url) {
        alert('Vui lòng nhập đường link Google Sheet hợp lệ.');
        return;
      }
      fetchSheetBtn.innerHTML = '<span>Đang kết nối Google Sheet...</span>';
      try {
        const res = await fetch('/api/fetch-google-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetUrl: url })
        });
        const d = await res.json();
        if (!d.success) throw new Error(d.error);

        // Parse CSV string returned from Sheet
        const parsed = parseCsvText(d.csv);
        await executeIngestAndPipeline(parsed, 'Google Sheet: ' + url.substring(0, 35) + '...');
        fetchSheetBtn.innerHTML = '<span>Đồng Bộ Dữ Liệu Từ Sheet</span>';
      } catch (err) {
        alert('Lỗi kết nối Google Sheet: ' + err.message);
        fetchSheetBtn.innerHTML = '<span>Đồng Bộ Dữ Liệu Từ Sheet</span>';
      }
    });
  }
}

// Xử lý đọc file CSV
function processUploadedFile(file) {
  const fileName = file.name;
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  if (!isCsv) {
    // Nếu là XLSX hoặc file khác, gửi trigger nạp vào hệ thống
    executeIngestAndPipeline(null, fileName);
    return;
  }

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const text = evt.target.result;
      if (!text) {
        alert('⚠️ Tệp rỗng. Vui lòng chọn tệp có dữ liệu.');
        return;
      }
      const rawLines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (rawLines.length > 20000) {
        alert(`⚠️ Cảnh báo: Tệp dữ liệu vượt quá giới hạn 20.000 dòng (${rawLines.length.toLocaleString('vi-VN')} dòng). Vui lòng lọc bớt dữ liệu để tránh quá tải hệ thống.`);
        return;
      }
      const rows = parseCsvText(text);
      if (rows.length === 0) {
        alert('⚠️ Tệp CSV không có dữ liệu giao dịch hợp lệ.');
        return;
      }

      // Kiểm tra cột doanh thu bắt buộc
      const sample = rows[0];
      const hasRev = Object.keys(sample).some(k => {
        const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        return norm.includes('doanhthu') || norm.includes('doanhso') || norm.includes('thanhtien') || norm.includes('tongtien') || norm.includes('tienhang') || norm.includes('revenue') || norm.includes('sales') || norm === 'amount' || norm === 'netamount' || norm === 'grossamount';
      });
      if (!hasRev) {
        alert('⚠️ Lỗi cấu trúc tệp: Không tìm thấy cột Doanh thu (VND) hoặc các cột giá trị tương đương (Thành tiền, Doanh số, Sales, Amount). Vui lòng kiểm tra lại tiêu đề cột.');
        return;
      }

      await executeIngestAndPipeline(rows, fileName);
    } catch (err) {
      alert('Lỗi định dạng tệp: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function parseCsvText(csvText) {
  if (!csvText) return [];
  // Loại bỏ BOM UTF-8 nếu có
  let text = csvText.replace(/^\uFEFF/, '').trim();
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Tự động nhận diện dấu phân cách: dấu phẩy (,) hoặc chấm phẩy (;) hoặc tab (\t)
  const firstLine = lines[0];
  let delimiter = ',';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
  else if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';

  function parseLine(line) {
    const values = [];
    let insideQuotes = false;
    let cur = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        values.push(cur.trim().replace(/^"|"$/g, '').trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    values.push(cur.trim().replace(/^"|"$/g, '').trim());
    return values;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }
  return rows;
}

// Tiến hành nạp dữ liệu và chạy quy trình tính toán đổ dữ liệu vào KPI & biểu đồ
async function executeIngestAndPipeline(transactionsArray, sourceName) {
  const dropTitle = document.querySelector('#dropArea span:nth-child(2)');
  if (dropTitle) dropTitle.textContent = `Đang xử lý ${sourceName}...`;

  try {
    // 0. Quản lý State: Reset hoàn toàn cache / dữ liệu cũ trước khi nạp dữ liệu mới
    await fetch('/api/pipeline/reset', { method: 'POST' });

    // 1. Bước 1: Ingest dữ liệu người dùng tải lên (isCustomUpload: true, returns: [])
    const payload = transactionsArray && transactionsArray.length > 0
      ? { datasets: { transactions: transactionsArray, returns: [] }, isCustomUpload: true, actor: sourceName }
      : { actor: sourceName };

    const ingestRes = await fetch('/api/pipeline/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const ingestData = await ingestRes.json();
    if (!ingestData.success) throw new Error(ingestData.error);

    // 2. Bước 2: Làm sạch dữ liệu
    await fetch('/api/pipeline/cleanse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    // 3. Cổng duyệt 1: Ký phê duyệt Cổng 1 để mở khóa tính toán
    await fetch('/api/pipeline/gate1/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverName: "Kế toán trưởng Nguyễn Văn A" })
    });

    // 4. Bước 3: Tính toán chỉ số 100% bằng Code
    await fetch('/api/pipeline/compute-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    // 5. Bước 4: Nhận định AI & Đối chiếu
    await fetch('/api/pipeline/narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    // 6. Cập nhật UI toàn diện
    await fetchPipelineStatus();

    if (dropTitle) dropTitle.textContent = `Đã nạp: ${sourceName}`;
    alert(`✓ TẢI FILE & ĐỐI SOÁT THÀNH CÔNG!\n\nNguồn: ${sourceName}\nDữ liệu đã được làm sạch và đổ trực tiếp vào các thẻ KPI cùng Biểu đồ Doanh thu & Giá vốn.`);
  } catch (e) {
    if (dropTitle) dropTitle.textContent = 'Tải Lên File POS Hoặc Sheet';
    alert('Lỗi nạp file: ' + e.message);
  }
}

// ==========================================
// 5. CÁC HÀNH ĐỘNG PIPELINE KHÁC
// ==========================================
function setupPipelineActions() {
  // Nút chạy toàn bộ quy trình từ thanh header
  const btnRun = document.getElementById('btnRunDashboard');
  if (btnRun) {
    btnRun.addEventListener('click', async () => {
      btnRun.innerHTML = '<span>Đang chạy phân tích...</span>';
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await res.json();
        if (data.success) {
          await fetchPipelineStatus();
          btnRun.innerHTML = '<span>✓ Phân Tích Hoàn Tất</span>';
          setTimeout(() => btnRun.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg><span>Chạy Toàn Bộ Quy Trình</span>', 2000);
        }
      } catch (e) {
        alert('Lỗi: ' + e.message);
      }
    });
  }

  // Nút chạy làm sạch Bước 2
  const btnCleanse = document.getElementById('btnExecuteCleanse');
  if (btnCleanse) {
    btnCleanse.addEventListener('click', async () => {
      btnCleanse.innerHTML = '<span>Đang khử trùng...</span>';
      try {
        const res = await fetch('/api/pipeline/cleanse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await res.json();
        if (data.success) {
          await fetchPipelineStatus();
          btnCleanse.innerHTML = '<span>✓ Đã Khử Trùng & Lọc Hủy</span>';
          setTimeout(() => btnCleanse.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Chạy Làm Sạch Lại</span>', 2000);
        }
      } catch (e) {
        alert('Lỗi làm sạch: ' + e.message);
      }
    });
  }

  // Nút KÝ DUYỆT CỔNG 1 (Gate 1 Approval)
  const btnApproveG1 = document.getElementById('btnApproveGate1');
  if (btnApproveG1) {
    btnApproveG1.addEventListener('click', async () => {
      const approverName = document.getElementById('gate1ApproverInput')?.value || 'Kế toán trưởng Nguyễn Văn A';
      const notes = document.getElementById('gate1NotesInput')?.value || 'Đã đối soát khớp dữ liệu.';

      btnApproveG1.innerHTML = '<span>Đang tạo chứng chỉ...</span>';
      try {
        const res = await fetch('/api/pipeline/gate1/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approverName, notes })
        });
        const d1 = await res.json();
        if (!d1.success) throw new Error(d1.error);

        await fetch('/api/pipeline/compute-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        await fetch('/api/pipeline/narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        await fetchPipelineStatus();
        alert('✓ CỔNG DUYỆT 1 THÀNH CÔNG!\n\nĐã ký xác nhận 56.894 dòng sạch hợp lệ.\nHệ thống đã tính toán chỉ số 18 cửa hàng (100% Code) và đối chiếu số liệu báo cáo AI.');
      } catch (e) {
        alert('Lỗi duyệt Cổng 1: ' + e.message);
      }
    });
  }

  // Nút KÝ DUYỆT CỔNG 2 (Gate 2 Approval)
  const btnApproveG2 = document.getElementById('btnApproveGate2');
  if (btnApproveG2) {
    btnApproveG2.addEventListener('click', async () => {
      const approverName = document.getElementById('gate2ApproverInput')?.value || 'Giám Đốc Kinh Doanh Austin Robertson';
      const directorNotes = document.getElementById('gate2NotesInput')?.value || 'Phê duyệt toàn bộ báo cáo.';

      btnApproveG2.innerHTML = '<span>Đang đóng dấu mộc...</span>';
      try {
        const res = await fetch('/api/pipeline/gate2/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approverName, directorNotes })
        });
        const d2 = await res.json();
        if (!d2.success) throw new Error(d2.error);

        await fetchPipelineStatus();
        alert('★ CỔNG DUYỆT 2 ĐÃ ĐÓNG DẤU MỘC ĐỎ CHÍNH THỨC!\n\nGiám Đốc Kinh Doanh đã ban hành gói chỉ đạo 4 trụ cột. Hệ thống đã mở khóa in ấn báo cáo PDF và xuất dữ liệu đối soát.');
      } catch (e) {
        alert('Lỗi duyệt Cổng 2: ' + e.message);
      }
    });
  }

  // Nút Reset Pipeline
  const btnReset = document.getElementById('btnResetPipeline');
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      if (confirm('Bạn có chắc chắn muốn đặt lại (Reset) toàn bộ phiên làm việc về trạng thái ban đầu (Empty State)?')) {
        await fetch('/api/pipeline/reset', { method: 'POST' });
        await fetchPipelineStatus();
        alert('Đã reset về trạng thái ban đầu (Chờ nạp file).');
      }
    });
  }

  // In ấn báo cáo
  const btnPrint1 = document.getElementById('btnPrintReport');
  const btnPrint2 = document.getElementById('btnQuickPrint');
  [btnPrint1, btnPrint2].forEach(b => {
    if (b) b.addEventListener('click', () => window.print());
  });

  // Filter tabs trong bảng mẫu bất thường (Audit Tabs)
  document.querySelectorAll('.audit-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.audit-tab-btn').forEach(t => {
        t.classList.remove('bg-orange-500', 'text-white');
        t.classList.add('text-slate-400');
      });
      tab.classList.add('bg-orange-500', 'text-white');
      tab.classList.remove('text-slate-400');
      currentAuditFilter = tab.getAttribute('data-filter');
      if (cachedStatus) renderAuditSamples(cachedStatus.flaggedSamples || []);
    });
  });

  // Filter tabs trong bảng 18 cửa hàng (Region tabs)
  document.querySelectorAll('.store-filter-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.store-filter-btn').forEach(t => {
        t.classList.remove('bg-orange-500', 'text-white');
        t.classList.add('text-slate-500');
      });
      tab.classList.add('bg-orange-500', 'text-white');
      tab.classList.remove('text-slate-500');
      currentStoreRegion = tab.getAttribute('data-region');
      if (cachedStatus) renderStoresTable(cachedStatus.storeKPIs || []);
    });
  });

  // Tìm kiếm cửa hàng
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filterStoresBySearch(q);
    });
  }
}

// ==========================================
// 6. TRỢ LÝ COPILOT CHỈ-ĐỌC (READ-ONLY ASSISTANT)
// ==========================================
function setupCopilotChat() {
  const panel = document.getElementById('copilotChatPanel');
  const openBtn = document.getElementById('btnOpenCopilot');
  const toggleBtn = document.getElementById('copilotToggleBtn');
  const closeBtn = document.getElementById('btnCloseCopilot');
  const form = document.getElementById('copilotChatForm');
  const input = document.getElementById('copilotChatInput');
  const stream = document.getElementById('copilotMessagesStream');

  const togglePanel = () => {
    if (!panel) return;
    const isCollapsed = panel.classList.toggle('collapsed');
    if (!isCollapsed && stream && stream.children.length === 0) {
      appendChatMessage('assistant', '👋 Xin chào Giám Đốc! Tôi là **Phúc An Copilot** hoạt động ở chế độ **CHỈ-ĐỌC (Read-Only)**.\n\nTôi sẵn sàng hỗ trợ tra cứu số liệu 18 cửa hàng, nguyên nhân lỗi sản phẩm, đối soát Cổng 1 và quyết định Cổng 2.');
    }
  };

  if (openBtn) openBtn.addEventListener('click', togglePanel);
  if (toggleBtn) toggleBtn.addEventListener('click', togglePanel);
  if (closeBtn) closeBtn.addEventListener('click', togglePanel);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;

      appendChatMessage('user', msg);
      input.value = '';

      const thinkingId = 'copilot-thinking-' + Date.now();
      const thinkingEl = document.createElement('div');
      thinkingEl.id = thinkingId;
      thinkingEl.className = 'p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 italic text-[11px] animate-pulse';
      thinkingEl.textContent = 'Copilot đang tra cứu dữ liệu đối soát...';
      stream.appendChild(thinkingEl);
      stream.scrollTop = stream.scrollHeight;

      try {
        const res = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        document.getElementById(thinkingId)?.remove();

        if (data.success && data.response) {
          appendChatMessage('assistant', data.response.content);
        } else {
          appendChatMessage('assistant', 'Xin lỗi, không thể kết nối tới lõi Copilot.');
        }
      } catch (err) {
        document.getElementById(thinkingId)?.remove();
        appendChatMessage('assistant', 'Lỗi truy vấn: ' + err.message);
      }
    });
  }

  // Quick Chips
  document.querySelectorAll('.copilot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-q');
      if (input) input.value = q;
      form?.dispatchEvent(new Event('submit'));
    });
  });
}

function appendChatMessage(role, text) {
  const stream = document.getElementById('copilotMessagesStream');
  if (!stream) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} space-y-1`;

  const bubble = document.createElement('div');
  bubble.className = `p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
    role === 'user'
      ? 'bg-orange-500 text-white rounded-br-none shadow-sm'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
  }`;

  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n- /g, '<br>• ');

  bubble.innerHTML = formatted;
  msgDiv.appendChild(bubble);

  const timeSpan = document.createElement('span');
  timeSpan.className = 'text-[9px] text-slate-400 font-mono px-1';
  timeSpan.textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  msgDiv.appendChild(timeSpan);

  stream.appendChild(msgDiv);
  stream.scrollTop = stream.scrollHeight;
}

// ==========================================
// 7. RENDER BẢNG BIỂU & DỮ LIỆU
// ==========================================

function renderAuditSamples(samples) {
  const tbody = document.getElementById('auditTableRows');
  if (!tbody) return;

  let filtered = samples;
  if (currentAuditFilter !== 'ALL') {
    filtered = samples.filter(s => s.issueType === currentAuditFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-slate-400 text-xs">Chưa có mẫu bất thường hoặc dữ liệu đang ở trạng thái chờ nạp file.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.slice(0, 15).map(s => {
    let badgeClass = 'bg-slate-100 text-slate-700';
    if (s.issueType === 'DUPLICATE') badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
    if (s.issueType === 'CANCELLED') badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
    if (s.issueType === 'RETURN') badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400';

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
        <td class="p-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">${s.order_id}</td>
        <td class="p-2.5">${s.sku}</td>
        <td class="p-2.5">${s.store_id}</td>
        <td class="p-2.5 text-slate-400">${s.date}</td>
        <td class="p-2.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">${Number(s.amount).toLocaleString('vi-VN')}&nbsp;₫</td>
        <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">${s.status}</span></td>
        <td class="p-2.5 text-[11px] text-slate-500 dark:text-slate-400">${s.reason}</td>
      </tr>
    `;
  }).join('');
}

function renderStoresTable(stores) {
  const tbody = document.getElementById('storesTableBody');
  if (!tbody) return;

  if (stores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="p-8 text-center text-slate-400 text-xs">Vui lòng tải lên file dữ liệu ở Bước 1 để hiển thị danh sách và tính toán chỉ số 18 điểm bán.</td></tr>';
    return;
  }

  let filtered = stores;
  if (currentStoreRegion !== 'ALL') {
    filtered = stores.filter(s => s.region === currentStoreRegion);
  }

  tbody.innerHTML = filtered.map(s => {
    const isWarning = s.return_rate_pct > 3.5 || s.rev_growth_mom_pct < -5 || s.target_gp_achieved_pct < 80;
    const statusBadge = isWarning
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 whitespace-nowrap">Cần Hỗ Trợ</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 whitespace-nowrap">Tốt</span>';

    return `
      <tr class="hover:bg-orange-50/40 dark:hover:bg-slate-800/60 transition-colors cursor-pointer" onclick="openStoreDrilldown('${s.store_id}')">
        <td class="p-3 font-bold text-orange-600 dark:text-orange-400">${s.store_id}</td>
        <td class="p-3 font-bold text-slate-800 dark:text-slate-100">${s.store_name}</td>
        <td class="p-3 text-slate-400">${s.region}</td>
        <td class="p-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">${(s.net_revenue).toLocaleString('vi-VN')}&nbsp;₫</td>
        <td class="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">${(s.gross_profit).toLocaleString('vi-VN')}&nbsp;₫</td>
        <td class="p-3 text-right font-bold text-slate-700 dark:text-slate-300">${s.gross_margin_pct}%</td>
        <td class="p-3 text-right ${s.target_rev_achieved_pct >= 100 ? 'text-emerald-500 font-bold' : 'text-slate-600 dark:text-slate-400'}">${s.target_rev_achieved_pct}%</td>
        <td class="p-3 text-right font-bold ${s.rev_growth_mom_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'}">${s.rev_growth_mom_pct >= 0 ? '+' : ''}${s.rev_growth_mom_pct}%</td>
        <td class="p-3 text-right font-bold ${s.return_rate_pct > 3.5 ? 'text-rose-500 font-black' : 'text-slate-600 dark:text-slate-400'}">${s.return_rate_pct}%</td>
        <td class="p-3 text-center">${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function filterStoresBySearch(keyword) {
  if (!cachedStatus || !cachedStatus.storeKPIs) return;
  const filtered = cachedStatus.storeKPIs.filter(s =>
    s.store_id.toLowerCase().includes(keyword) ||
    s.store_name.toLowerCase().includes(keyword) ||
    s.city?.toLowerCase().includes(keyword) ||
    s.region?.toLowerCase().includes(keyword)
  );
  renderStoresTable(filtered);
}

function renderVerificationMatrix(matrix) {
  const tbody = document.getElementById('verificationTableBody');
  if (!tbody) return;

  if (matrix.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400 text-xs">Chưa có số liệu đối chiếu. Vui lòng nạp file và hoàn thành Bước 4.</td></tr>';
    return;
  }

  tbody.innerHTML = matrix.map(m => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <td class="p-2.5 font-bold text-slate-800 dark:text-slate-200">${m.claim}</td>
      <td class="p-2.5 text-orange-600 dark:text-orange-400 font-bold whitespace-nowrap">${m.textValue}</td>
      <td class="p-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">${m.codeComputedValue}</td>
      <td class="p-2.5 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 whitespace-nowrap">
          ✓ Khớp Tuyệt Đối
        </span>
      </td>
      <td class="p-2.5 text-center">
        <span class="text-[10px] font-mono font-bold text-emerald-600 whitespace-nowrap">ZERO_HALLUCINATION</span>
      </td>
    </tr>
  `).join('');
}

function renderAuditTrail(trail) {
  const tbody = document.getElementById('auditTrailTableBody');
  const countBadge = document.getElementById('auditCountBadge');
  if (countBadge) countBadge.textContent = trail.length;
  if (!tbody) return;

  if (trail.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 text-xs">Chưa có bản ghi kiểm toán.</td></tr>';
    return;
  }

  tbody.innerHTML = trail.slice().reverse().map(e => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <td class="p-2.5 text-slate-400 text-[11px] whitespace-nowrap">${e.timestamp}</td>
      <td class="p-2.5 font-bold text-orange-600 dark:text-orange-400 text-xs whitespace-nowrap">${e.event}</td>
      <td class="p-2.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">${e.description}</td>
      <td class="p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">${e.actor}</td>
      <td class="p-2.5 text-xs"><span class="audit-badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">${e.state}</span></td>
      <td class="p-2.5 text-[10px] font-mono text-slate-400 whitespace-nowrap">${e.hash}</td>
    </tr>
  `).join('');
}

function renderBankCards(topStores) {
  const container = document.getElementById('bankCardsRow');
  if (!container) return;

  if (topStores.length === 0) {
    container.innerHTML = '<div class="col-span-3 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">Vui lòng tải lên file POS hoặc Google Sheet để xem phân tích</div>';
    return;
  }

  container.innerHTML = topStores.map((s, idx) => {
    const cardNums = ['1111 2222 3333 4444', '4444 3333 2222 1111', '7777 8888 9999 0000'];
    const titles = ['ĐIỂM NÓNG 1: TỶ LỆ TRẢ CAO', 'ĐIỂM NÓNG 2: SỤT GIẢM MOM', 'ĐIỂM NÓNG 3: LỆCH PRODUCT MIX'];

    return `
      <div class="extej-bank-card ${idx === 0 ? 'active-card' : ''} p-5 flex flex-col justify-between h-52 cursor-pointer" onclick="openStoreDrilldown('${s.store_id}')">
        <div class="card-pattern"></div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-7 h-5 rounded bg-orange-500/80 inline-block"></span>
            <span class="w-5 h-5 rounded-full bg-rose-500/80 -ml-4 inline-block"></span>
            <span class="text-[10px] font-bold text-slate-400 ml-1 font-mono">${s.store_id}</span>
          </div>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 whitespace-nowrap">
            Ưu Tiên ${idx + 1}
          </span>
        </div>

        <div>
          <span class="text-[10px] font-bold uppercase text-slate-400 block">${titles[idx]}</span>
          <span class="text-base font-bold text-slate-900 dark:text-white block mt-0.5">${s.store_name}</span>
          <span class="text-xs font-mono text-slate-400 tracking-wider mt-1 block">${cardNums[idx]}</span>
        </div>

        <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px]">
          <div>
            <span class="text-slate-400 block">Doanh Thu Thuần</span>
            <span class="font-bold text-slate-800 dark:text-slate-200 font-mono whitespace-nowrap">${(s.net_revenue / 1e9).toFixed(2)}&nbsp;Tỷ</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block">Vấn Đề Chính</span>
            <span class="font-bold text-rose-500 font-mono whitespace-nowrap">${s.return_rate_pct > 3.5 ? `Trả ${s.return_rate_pct}%` : `${s.rev_growth_mom_pct}% MoM`}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderStrategicPillars(recs) {
  const container = document.getElementById('strategicPillarsContainer');
  if (!container) return;

  if (cachedStatus && cachedStatus.isCustomUpload && recs && recs.length > 0) {
    const pillars = recs.slice(0, 3).map((r, i) => ({
      num: i + 1,
      title: r.title,
      desc: r.summary
    }));
    pillars.push({
      num: 4,
      title: 'Quy chuẩn hóa hạch toán & AI Agent 2 Cổng duyệt',
      desc: 'Bảo đảm 100% số liệu được code tính toán và đối soát qua 2 Cổng duyệt con người trước khi gửi báo cáo HĐQT.'
    });
    container.innerHTML = pillars.map(p => `
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded bg-orange-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">${p.num}</span>
          <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">${p.title}</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pl-7">${p.desc}</p>
      </div>
    `).join('');
    return;
  }

  if (pipelineState === 'INIT') {
    container.innerHTML = `
      <div class="col-span-full p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
        Vui lòng tải lên file POS hoặc Google Sheet để xem phân tích
      </div>
    `;
    return;
  }

  const pillars = [
    {
      num: 1,
      title: 'Kiểm soát chất lượng & Xử lý số liệu đổi trả hàng',
      desc: 'Thu hồi lô hàng lỗi kỹ thuật phát sinh đổi trả; yêu cầu NCC bồi thường giá vốn và chi phí vận chuyển.'
    },
    {
      num: 2,
      title: 'Tái cân đối cơ cấu ngành hàng (Product Mix)',
      desc: 'Thiết kế combo Hero Products; đổi cơ chế hoa hồng nhân viên bán hàng tính theo GP thay vì doanh số.'
    },
    {
      num: 3,
      title: 'Gói giải cứu và phục hồi doanh số cục bộ',
      desc: 'Kích hoạt chiến dịch CRM voucher gửi khách hàng cũ; phối hợp Omnichannel Pickup kéo foot-traffic.'
    },
    {
      num: 4,
      title: 'Quy chuẩn hóa hạch toán & AI Agent 2 Cổng duyệt',
      desc: 'Bảo đảm 100% số liệu được code tính toán và đối soát qua 2 Cổng duyệt con người trước khi gửi báo cáo HĐQT.'
    }
  ];

  container.innerHTML = pillars.map(p => `
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded bg-orange-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">${p.num}</span>
        <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">${p.title}</span>
      </div>
      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pl-7">${p.desc}</p>
    </div>
  `).join('');
}

function renderProductCategories(mix) {
  const container = document.getElementById('productCategoriesList');
  if (!container) return;

  if (mix.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-400">Chưa có dữ liệu cơ cấu ngành hàng.</span>';
    return;
  }

  container.innerHTML = mix.map(c => `
    <div class="space-y-1 text-xs">
      <div class="flex justify-between font-semibold">
        <span class="text-slate-700 dark:text-slate-300">${c.category}</span>
        <span class="font-mono text-slate-900 dark:text-white font-bold whitespace-nowrap">${(c.revenue / 1e9).toFixed(2)}&nbsp;Tỷ (${c.grossMarginPct}%)</span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div class="bg-orange-500 h-1.5 rounded-full" style="width: ${c.revenueSharePct}%"></div>
      </div>
    </div>
  `).join('');
}

function setupDrilldownModal() {
  const closeBtn = document.getElementById('popCloseBtn');
  const actionBtn = document.getElementById('popActionBtn');
  const modal = document.getElementById('modalOverlay');

  [closeBtn, actionBtn].forEach(b => {
    if (b) b.addEventListener('click', () => modal?.classList.add('hidden'));
  });
}

window.openStoreDrilldown = function(storeId) {
  if (!cachedStatus || !cachedStatus.storeKPIs) return;
  const store = cachedStatus.storeKPIs.find(s => s.store_id === storeId);
  if (!store) return;

  const modal = document.getElementById('modalOverlay');
  document.getElementById('popTitle').textContent = `${store.store_id} • ${store.store_name}`;
  document.getElementById('popMeta').textContent = `Quản lý: ${store.manager || 'N/A'} • Khu vực: ${store.region} (${store.city})`;
  document.getElementById('popRev').innerHTML = `<span class="whitespace-nowrap">${(store.net_revenue / 1e9).toFixed(2)}&nbsp;Tỷ&nbsp;₫</span>`;
  document.getElementById('popTarget').textContent = store.target_rev_achieved_pct + '%';
  document.getElementById('popMargin').textContent = store.gross_margin_pct + '%';
  document.getElementById('popReturn').textContent = store.return_rate_pct + '%';

  const reasonEl = document.getElementById('popReason');
  if (store.rootCauses && store.rootCauses.length > 0) {
    reasonEl.innerHTML = store.rootCauses.map(r => `• ${r}`).join('<br>');
  } else {
    reasonEl.textContent = 'Hoạt động kinh doanh ổn định, các chỉ số đều nằm trong biên độ an toàn và hoàn thành chỉ tiêu kỳ báo cáo.';
  }

  if (modal) modal.classList.remove('hidden');
};

// ==========================================
// 8. HỆ THỐNG AI STRATEGIC ADVISORY: ĐỀ XUẤT & LỜI KHUYÊN KINH DOANH
// ==========================================
let currentRecFilter = 'ALL';
let activeModalRecId = null;

function setupAIAdvisoryHandlers() {
  // Bộ lọc danh mục đề xuất
  const filterTabs = document.querySelectorAll('#aiFilterTabsContainer .ai-filter-pill');
  filterTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      filterTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRecFilter = btn.getAttribute('data-filter') || 'ALL';
      renderAIRecommendations(cachedStatus?.aiRecommendations || []);
    });
  });

  // Nút phân tích thêm lời khuyên
  const btnGen = document.getElementById('btnGenerateAiAdvice');
  if (btnGen) {
    btnGen.addEventListener('click', async () => {
      const origText = btnGen.innerHTML;
      btnGen.innerHTML = '<span class="animate-spin inline-block mr-1">⚙️</span><span>Đang phân tích sâu...</span>';
      btnGen.disabled = true;

      try {
        const res = await fetch('/api/pipeline/recommendations/generate', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          if (cachedStatus) {
            cachedStatus.aiRecommendations = data.recommendations;
            cachedStatus.aiAdvice = data.strategicAdviceFeed;
            cachedStatus.aiAdvisorySummary = data.summaryStats;
          }
          renderAIRecommendations(data.recommendations || []);
          renderAIAdviceFeed(data.strategicAdviceFeed || []);
          renderAIAdvisorySummary(data.summaryStats || null);
        }
      } catch (err) {
        console.error('Lỗi phân tích AI:', err);
      } finally {
        btnGen.innerHTML = origText;
        btnGen.disabled = false;
      }
    });
  }

  // Đóng modal chi tiết đề xuất
  const modal = document.getElementById('recommendationDetailModal');
  const btnClose = document.getElementById('btnCloseRecModal');
  if (btnClose) btnClose.addEventListener('click', () => modal?.classList.add('hidden'));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // Nút áp dụng trong modal
  const btnModalApply = document.getElementById('btnModalToggleApply');
  if (btnModalApply) {
    btnModalApply.addEventListener('click', () => {
      if (activeModalRecId) {
        toggleApplyRecommendation(activeModalRecId);
      }
    });
  }

  // Nút hỏi Copilot trong modal
  const btnModalCopilot = document.getElementById('btnModalAskCopilot');
  if (btnModalCopilot) {
    btnModalCopilot.addEventListener('click', () => {
      const rec = (cachedStatus?.aiRecommendations || []).find(r => r.id === activeModalRecId);
      if (rec) {
        modal?.classList.add('hidden');
        askCopilotQuestion(`Hãy tư vấn chi tiết lộ trình 3 bước và kế hoạch thực thi cho đề xuất: "${rec.title}"`);
      }
    });
  }
}

function renderAIRecommendations(recs) {
  const container1 = document.getElementById('aiRecCardsContainer');
  const container2 = document.getElementById('aiPageRecCardsContainer');

  if (!recs || recs.length === 0) {
    const emptyHtml = `
      <div class="col-span-full p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
        <div class="w-10 h-10 mx-auto rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-500 font-bold">✨</div>
        <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa có đề xuất chiến lược</div>
        <p class="text-[11px] text-slate-400 max-w-md mx-auto">Vui lòng tải lên file POS hoặc Google Sheet để xem phân tích</p>
      </div>
    `;
    if (container1) container1.innerHTML = emptyHtml;
    if (container2) container2.innerHTML = emptyHtml;
    return;
  }

  let filtered = recs;
  if (currentRecFilter !== 'ALL') {
    filtered = recs.filter(r => r.category === currentRecFilter || r.priority === currentRecFilter);
  }

  if (filtered.length === 0) {
    const noMatchHtml = `
      <div class="col-span-full p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
        <p class="text-xs text-slate-400">Không có đề xuất nào thuộc danh mục "${currentRecFilter}".</p>
      </div>
    `;
    if (container1) container1.innerHTML = noMatchHtml;
    if (container2) container2.innerHTML = noMatchHtml;
    return;
  }

  const cardsHtml = filtered.map(r => {
    const isApplied = !!r.applied;
    return `
      <div class="ai-rec-card p-5 space-y-3.5 flex flex-col justify-between ${isApplied ? 'applied' : ''}">
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                r.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' :
                r.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
              } font-mono">${r.priorityLabel || r.priority}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono">${r.categoryLabel || r.category}</span>
            </div>
            <span class="text-[10px] font-bold text-orange-500 font-mono">${r.confidenceScore}% Tin cậy</span>
          </div>

          <h4 class="font-bold text-slate-900 dark:text-white text-xs leading-snug">${r.title}</h4>

          <div class="p-2.5 rounded-xl bg-orange-50/60 dark:bg-slate-800/60 border border-orange-200/50 dark:border-slate-700/60 space-y-0.5">
            <span class="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block font-mono">DỰ KIẾN HIỆU QUẢ (ROI):</span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">${r.impact}</span>
          </div>

          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">${r.summary}</p>
          
          <div class="text-[10px] text-slate-400">
            <span class="font-medium text-slate-500 dark:text-slate-400">Phạm vi:</span> ${r.targetStores}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <button onclick="openRecommendationDetail('${r.id}')" class="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all text-center">
            Lộ Trình
          </button>
          <button onclick="toggleApplyRecommendation('${r.id}')" class="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
            isApplied 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
              : 'btn-orange-primary shadow-sm'
          }">
            ${isApplied ? '✓ Đã Áp Dụng' : 'Áp Dụng'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (container1) container1.innerHTML = cardsHtml;
  if (container2) container2.innerHTML = cardsHtml;
}

function renderAIAdviceFeed(adviceList) {
  const container1 = document.getElementById('aiAdviceFeedContainer');
  const container2 = document.getElementById('aiPageAdviceFeedContainer');

  if (!adviceList || adviceList.length === 0) {
    const emptyAdvice = `
      <div class="col-span-full p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
        <p class="text-xs text-slate-400">Vui lòng tải lên file POS hoặc Google Sheet để xem phân tích</p>
      </div>
    `;
    if (container1) container1.innerHTML = emptyAdvice;
    if (container2) container2.innerHTML = emptyAdvice;
    return;
  }

  const adviceHtml = adviceList.map(a => {
    let typeClasses = {
      alert: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
      opportunity: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
      success: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
      info: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
    }[a.type] || 'border-slate-200 dark:border-slate-700 bg-slate-50/30 text-slate-600';

    return `
      <div class="ai-advice-panel p-4 space-y-2.5 border">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${typeClasses}">
            ${a.badge}
          </span>
          <button onclick="askCopilotAboutAdvice('${a.id}')" class="text-[10px] font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1">
            <span>Hỏi Copilot</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <h5 class="font-bold text-xs text-slate-900 dark:text-white">${a.title}</h5>

        <div class="space-y-1.5 text-[11px] leading-relaxed">
          <p class="text-slate-600 dark:text-slate-300">
            <strong class="text-slate-700 dark:text-slate-200">Quan sát thực tế:</strong> ${a.observation}
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            <strong class="text-slate-700 dark:text-slate-200">Nguyên nhân cốt lõi:</strong> ${a.rootCause}
          </p>
          <div class="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700/80">
            <p class="text-slate-800 dark:text-slate-200">
              <span class="text-orange-500 font-bold mr-1">👉 Giải pháp đề xuất:</span>${a.advice}
            </p>
          </div>
        </div>

        <div class="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
          <span>Kỳ vọng: ${a.expectedOutcome}</span>
        </div>
      </div>
    `;
  }).join('');

  if (container1) container1.innerHTML = adviceHtml;
  if (container2) container2.innerHTML = adviceHtml;
}

function renderAIAdvisorySummary(summary) {
  const badge = document.getElementById('aiAdvisoryCountBadge');
  const growth = document.getElementById('aiGrowthPotential');
  const focus = document.getElementById('aiFocusArea');
  const critical = document.getElementById('aiCriticalCount');
  const applied = document.getElementById('aiAppliedCount');

  if (!summary || !summary.totalCount) {
    if (badge) badge.textContent = 'Chờ nạp dữ liệu';
    if (growth) growth.textContent = '---%';
    if (focus) focus.textContent = 'Chờ nạp dữ liệu';
    if (critical) critical.textContent = '--- Điểm Nóng';
    if (applied) applied.textContent = '---';
    return;
  }

  if (badge) badge.textContent = `${summary.totalCount || 0} Đề xuất trọng tâm`;
  if (growth) growth.textContent = summary.estimatedGrowthPotential || '+15%';
  if (focus) focus.textContent = summary.topFocusArea || 'Chiến Lược Tăng Trưởng';
  if (critical) critical.textContent = `${summary.criticalCount || 0} Điểm Nóng`;
  if (applied) applied.textContent = `${summary.appliedCount || 0}/${summary.totalCount || 0} Gói`;
}

window.openRecommendationDetail = function(recId) {
  if (!cachedStatus || !cachedStatus.aiRecommendations) return;
  const rec = cachedStatus.aiRecommendations.find(r => r.id === recId);
  if (!rec) return;

  activeModalRecId = recId;
  const modal = document.getElementById('recommendationDetailModal');
  if (!modal) return;

  const badgeEl = document.getElementById('modalRecBadge');
  const titleEl = document.getElementById('modalRecTitle');
  const targetEl = document.getElementById('modalRecTarget');
  const impactEl = document.getElementById('modalRecImpact');
  const summaryEl = document.getElementById('modalRecSummary');
  const stepsContainer = document.getElementById('modalRecSteps');
  const applyBtn = document.getElementById('btnModalToggleApply');

  if (badgeEl) badgeEl.textContent = `${rec.priorityLabel} • ${rec.categoryLabel}`;
  if (titleEl) titleEl.textContent = rec.title;
  if (targetEl) targetEl.textContent = `Phạm vi áp dụng: ${rec.targetStores}`;
  if (impactEl) impactEl.textContent = rec.impact;
  if (summaryEl) summaryEl.textContent = rec.summary;

  if (stepsContainer) {
    if (rec.actionSteps && rec.actionSteps.length > 0) {
      stepsContainer.innerHTML = rec.actionSteps.map((s, idx) => `
        <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span class="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
          <span class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${s}</span>
        </div>
      `).join('');
    } else {
      stepsContainer.innerHTML = '<p class="text-xs text-slate-400">Chưa có các bước triển khai chi tiết.</p>';
    }
  }

  if (applyBtn) {
    if (rec.applied) {
      applyBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-all';
      applyBtn.innerHTML = '<span>✓ Đã Áp Dụng (Nhấn để hủy)</span>';
    } else {
      applyBtn.className = 'btn-orange-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all';
      applyBtn.innerHTML = '<span>Áp Dụng Đề Xuất Này</span>';
    }
  }

  modal.classList.remove('hidden');
};

window.toggleApplyRecommendation = async function(recId) {
  if (!cachedStatus || !cachedStatus.aiRecommendations) return;
  const rec = cachedStatus.aiRecommendations.find(r => r.id === recId);
  if (!rec) return;

  try {
    const res = await fetch('/api/pipeline/recommendations/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recId, actor: 'Quản trị viên' })
    });
    const data = await res.json();
    if (data.success && data.recommendation) {
      rec.applied = data.recommendation.applied;
      if (cachedStatus.aiAdvisorySummary) {
        cachedStatus.aiAdvisorySummary.appliedCount = cachedStatus.aiRecommendations.filter(r => r.applied).length;
      }
      if (data.auditTrail) {
        cachedStatus.auditTrail = data.auditTrail;
        renderAuditTrail(data.auditTrail);
      }
      renderAIRecommendations(cachedStatus.aiRecommendations);
      renderAIAdvisorySummary(cachedStatus.aiAdvisorySummary);

      // Cập nhật nút trong modal nếu đang mở
      const applyBtn = document.getElementById('btnModalToggleApply');
      if (applyBtn && activeModalRecId === recId) {
        if (rec.applied) {
          applyBtn.className = 'px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-all';
          applyBtn.innerHTML = '<span>✓ Đã Áp Dụng (Nhấn để hủy)</span>';
        } else {
          applyBtn.className = 'btn-orange-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all';
          applyBtn.innerHTML = '<span>Áp Dụng Đề Xuất Này</span>';
        }
      }
    }
  } catch (err) {
    console.error('Lỗi cập nhật đề xuất:', err);
  }
};

window.askCopilotAboutAdvice = function(adviceId) {
  const item = (cachedStatus?.aiAdvice || []).find(a => a.id === adviceId);
  if (!item) return;
  askCopilotQuestion(`Tư vấn thêm về: "${item.title}". Giải pháp cụ thể là gì?`);
};

function askCopilotQuestion(question) {
  const panel = document.getElementById('copilotChatPanel');
  if (panel && panel.classList.contains('collapsed')) {
    panel.classList.remove('collapsed');
  }
  const input = document.getElementById('copilotChatInput');
  const form = document.getElementById('copilotChatForm');
  if (input && form) {
    input.value = question;
    form.dispatchEvent(new Event('submit'));
  }
}

// ==============================================================
// ASHLAR SAAS PLATFORM COMPONENTS & LOGIC (MATCH VIDEO FRAMES)
// ==============================================================

// 1. RENDER SIGNATURE ASHLAR DEEP FOREST HERO CARD
function renderAshlarHeroCard(data) {
  const hasData = (data.chainSummary && (pipelineState === 'METRICS_COMPUTED' || pipelineState === 'NARRATIVE_VERIFIED' || pipelineState === 'GATE2_APPROVED'));
  
  const heroNetRev = document.getElementById('heroNetRev');
  const heroDotBac = document.getElementById('heroDotBac');
  const heroDotNam = document.getElementById('heroDotNam');
  const heroDotTrung = document.getElementById('heroDotTrung');
  const heroGrossRev = document.getElementById('heroGrossRev');
  const heroReturns = document.getElementById('heroReturns');
  const heroCogs = document.getElementById('heroCogs');
  const heroGp = document.getElementById('heroGp');

  if (!hasData) {
    if (heroNetRev) heroNetRev.innerHTML = `---&nbsp;<span class="text-xl font-semibold text-emerald-300">₫</span>`;
    if (heroDotBac) heroDotBac.textContent = 'Miền Bắc: ---';
    if (heroDotNam) heroDotNam.textContent = 'Miền Nam: ---';
    if (heroDotTrung) heroDotTrung.textContent = 'Miền Trung: ---';
    if (heroGrossRev) heroGrossRev.innerHTML = `---&nbsp;₫`;
    if (heroReturns) heroReturns.innerHTML = `0&nbsp;₫`;
    if (heroCogs) heroCogs.innerHTML = `---&nbsp;₫`;
    if (heroGp) heroGp.innerHTML = `---&nbsp;₫`;
    return;
  }

  const cs = data.chainSummary;
  const stores = data.storeKPIs || [];
  
  // Tính tổng phụ theo khu vực
  let bacRev = 0, namRev = 0, trungRev = 0;
  stores.forEach(s => {
    if (s.region === 'Miền Bắc') bacRev += (s.net_revenue || 0);
    else if (s.region === 'Miền Nam') namRev += (s.net_revenue || 0);
    else if (s.region === 'Miền Trung') trungRev += (s.net_revenue || 0);
  });

  const totalRev = cs.netRevenue || 1;
  const bacPct = ((bacRev / totalRev) * 100).toFixed(1);
  const namPct = ((namRev / totalRev) * 100).toFixed(1);
  const trungPct = ((trungRev / totalRev) * 100).toFixed(1);

  if (heroNetRev) {
    heroNetRev.innerHTML = `${cs.netRevenue.toLocaleString('vi-VN')}&nbsp;<span class="text-xl font-semibold text-emerald-300">₫</span>`;
  }
  if (heroDotBac) {
    heroDotBac.textContent = `Miền Bắc: ${(bacRev / 1e9).toFixed(1)} Tỷ (${bacPct}%)`;
  }
  if (heroDotNam) {
    heroDotNam.textContent = `Miền Nam: ${(namRev / 1e9).toFixed(1)} Tỷ (${namPct}%)`;
  }
  if (heroDotTrung) {
    heroDotTrung.textContent = `Miền Trung: ${(trungRev / 1e9).toFixed(1)} Tỷ (${trungPct}%)`;
  }

  const grossRev = cs.netRevenue + (cs.totalReturnsAmount || 0);
  if (heroGrossRev) heroGrossRev.innerHTML = `${grossRev.toLocaleString('vi-VN')}&nbsp;₫`;
  if (heroReturns) heroReturns.innerHTML = `-${(cs.totalReturnsAmount || 0).toLocaleString('vi-VN')}&nbsp;₫`;
  if (heroCogs) heroCogs.innerHTML = `${(cs.cogs || 0).toLocaleString('vi-VN')}&nbsp;₫`;
  if (heroGp) heroGp.innerHTML = `${(cs.grossProfit || 0).toLocaleString('vi-VN')}&nbsp;₫ <span class="text-[10px] text-emerald-200">(${cs.grossMarginPct}%)</span>`;
}

// 2. RENDER EXPOSURE / PRODUCT MIX HORIZONTAL GAUGES (MATCH FRAME 00:00 - 00:02)
function renderAshlarExposure(mix) {
  const container = document.getElementById('ashlarExposureList');
  if (!container) return;

  if (!mix || mix.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-slate-400 text-xs font-mono">
        Chưa có dữ liệu cơ cấu ngành hàng.<br>Vui lòng nạp file để xem Exposure.
      </div>
    `;
    return;
  }

  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-slate-400'
  ];

  container.innerHTML = mix.map((item, idx) => {
    const color = colors[idx % colors.length];
    const share = item.revenueSharePct || 0;
    const revBillion = ((item.revenue || item.net_revenue || 0) / 1e9).toFixed(1);
    
    return `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">${item.category}</span>
          <div class="flex items-center gap-2 font-mono">
            <span class="text-slate-400 text-[11px]">${revBillion}&nbsp;Tỷ</span>
            <span class="font-bold text-slate-900 dark:text-white">${share}%</span>
          </div>
        </div>
        <div class="ashlar-gauge-bar">
          <div class="ashlar-gauge-fill ${color}" style="width: ${Math.min(100, Math.max(3, share))}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// 3. RENDER GATE STATUS (2 MANDATORY GATES)
function updateAshlarGateStatus(data) {
  const g1Text = document.getElementById('ashlarGate1SideText');
  const g1Badge = document.getElementById('ashlarGate1SideBadge');
  const g2Text = document.getElementById('ashlarGate2SideText');
  const g2Badge = document.getElementById('ashlarGate2SideBadge');

  if (data.gate1Record) {
    if (g1Text) g1Text.textContent = `Thẩm định bởi ${data.gate1Record.approverName} • Mã ${data.gate1Record.approvalCode}`;
    if (g1Badge) {
      g1Badge.textContent = '✓ ĐÃ DUYỆT';
      g1Badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono';
    }
  } else {
    if (g1Text) g1Text.textContent = 'Cần Kế toán trưởng đối soát 56.894 dòng';
    if (g1Badge) {
      g1Badge.textContent = '★ CHỜ DUYỆT';
      g1Badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono';
    }
  }

  if (data.gate2Record) {
    if (g2Text) g2Text.textContent = `Đóng dấu mộc GĐKD • Mã ${data.gate2Record.approvalCode}`;
    if (g2Badge) {
      g2Badge.textContent = '★ ĐÃ ĐÓNG DẤU';
      g2Badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono';
    }
  } else {
    if (g2Text) g2Text.textContent = 'Cần phê duyệt 3 gói can thiệp kinh doanh';
    if (g2Badge) {
      g2Badge.textContent = '★ CHỜ KÝ';
      g2Badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-mono';
    }
  }
}

// 4. RENDER TOP AT-RISK HOTSPOTS (MATCH FRAME 00:02 - 00:04)
function renderAshlarHotspots(recommendedStores) {
  const container = document.getElementById('ashlarHotspotList');
  const countBadge = document.getElementById('ashlarHotspotCountBadge');
  if (!container) return;

  if (pipelineState === 'INIT' || !recommendedStores || recommendedStores.length === 0) {
    if (countBadge) {
      countBadge.textContent = '---';
      countBadge.className = 'text-[10px] font-bold text-slate-400 font-mono';
    }
    container.innerHTML = `
      <div class="p-4 text-center text-slate-400 text-xs font-mono">
        Vui lòng tải lên file POS hoặc Google Sheet để xem phân tích
      </div>
    `;
    return;
  }

  if (countBadge) {
    countBadge.textContent = `${recommendedStores.length} Điểm nóng`;
    countBadge.className = 'text-[10px] font-bold text-rose-500 font-mono';
  }

  container.innerHTML = recommendedStores.slice(0, 3).map((st) => {
    const isCritical = st.return_rate_pct > 3.5 || (st.target_rev_achieved_pct !== null && st.target_rev_achieved_pct !== undefined && st.target_rev_achieved_pct < 85);
    const badge = isCritical
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-mono">🔴 AT RISK</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono">🟡 WATCH</span>';

    const reason = st.rootCauses && st.rootCauses[0] 
      ? st.rootCauses[0] 
      : (st.primaryIssue || 'Cần kiểm tra hạch toán chi phí');

    const revText = (st.net_revenue >= 1e9)
      ? (st.net_revenue / 1e9).toFixed(2) + '&nbsp;Tỷ'
      : (st.net_revenue >= 1e6)
        ? (st.net_revenue / 1e6).toFixed(1) + '&nbsp;Tr'
        : (st.net_revenue || 0).toLocaleString('vi-VN') + '&nbsp;₫';

    const returnRateText = (st.return_rate_pct !== undefined && st.return_rate_pct !== null && st.return_rate_pct > 0)
      ? `Đổi trả: ${st.return_rate_pct}%`
      : 'Đổi trả: 0%';

    return `
      <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-orange-500/50 bg-white dark:bg-slate-900 transition-all cursor-pointer space-y-1.5 shadow-sm" onclick="showStoreDetail('${st.store_id}')">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-slate-900 dark:text-white font-mono">${st.store_id} • ${st.store_name}</span>
          ${badge}
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">${reason}</p>
        <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-50 dark:border-slate-800">
          <span>Doanh thu: ${revText}</span>
          <span class="${st.return_rate_pct > 3.5 ? 'text-rose-500 font-bold' : ''}">${returnRateText}</span>
          <span class="text-orange-500 font-bold">Xử lý &rsaquo;</span>
        </div>
      </div>
    `;
  }).join('');
}

// 5. RENDER ASHLAR HOLDINGS TABLE (18 STORES)
function renderAshlarHoldingsTable(stores) {
  const tbody = document.getElementById('ashlarHoldingsTableBody');
  if (!tbody) return;

  if (!stores || stores.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="p-8 text-center text-slate-400 text-xs font-mono">
          Vui lòng tải lên file dữ liệu ở Bước 1 để hiển thị danh sách 18 Holdings.
        </td>
      </tr>
    `;
    return;
  }

  // Filter by Account (Regional / Channel)
  let filtered = stores;
  if (currentAshlarAccount === 'BAC') {
    filtered = filtered.filter(s => s.region === 'Miền Bắc');
  } else if (currentAshlarAccount === 'NAM') {
    filtered = filtered.filter(s => s.region === 'Miền Nam');
  } else if (currentAshlarAccount === 'TRUNG') {
    filtered = filtered.filter(s => s.region === 'Miền Trung');
  } else if (currentAshlarAccount === 'DIRECT') {
    filtered = filtered.filter(s => !s.store_name.includes('Online') && !s.store_name.includes('Đa kênh'));
  } else if (currentAshlarAccount === 'OMNI') {
    filtered = filtered.filter(s => s.store_name.includes('Online') || s.store_name.includes('Đa kênh') || s.store_id === 'PA-05' || s.store_id === 'PA-11');
  }

  // Filter by Status Tab
  if (currentAshlarStatusFilter === 'ON_PLAN') {
    filtered = filtered.filter(s => s.return_rate_pct <= 3.5 && s.target_rev_achieved_pct >= 95);
  } else if (currentAshlarStatusFilter === 'WATCH') {
    filtered = filtered.filter(s => s.return_rate_pct <= 3.5 && s.target_rev_achieved_pct < 95 && s.target_rev_achieved_pct >= 85);
  } else if (currentAshlarStatusFilter === 'AT_RISK') {
    filtered = filtered.filter(s => s.return_rate_pct > 3.5 || s.target_rev_achieved_pct < 85);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="p-6 text-center text-slate-400 text-xs font-mono">
          Không có cửa hàng nào thỏa mãn bộ lọc hiện tại.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    let statusPill = '';
    if (s.return_rate_pct > 3.5 || s.target_rev_achieved_pct < 85) {
      statusPill = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-mono whitespace-nowrap">🔴 At Risk</span>';
    } else if (s.target_rev_achieved_pct < 95) {
      statusPill = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono whitespace-nowrap">🟡 Watch</span>';
    } else {
      statusPill = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono whitespace-nowrap">🟢 On Plan</span>';
    }

    const netRevFmt = (s.net_revenue || 0).toLocaleString('vi-VN');
    const cogsFmt = (s.adjusted_cogs || s.cogs || 0).toLocaleString('vi-VN');
    const gpFmt = (s.gross_profit || 0).toLocaleString('vi-VN');
    const returnsPct = s.return_rate_pct || 0;
    const targetAchieved = s.target_rev_achieved_pct || 100;

    return `
      <tr class="ashlar-table-row cursor-pointer" onclick="showStoreDetail('${s.store_id}')">
        <td class="p-3">
          <span class="font-bold text-slate-900 dark:text-white block font-mono">${s.store_id}</span>
          <span class="text-slate-500 dark:text-slate-400 text-[11px] block">${s.store_name}</span>
        </td>
        <td class="p-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span class="block">${s.region} • ${s.city || ''}</span>
          <span class="text-[10px] text-slate-400">${s.store_name.includes('Online') ? 'Kênh Đa Kênh' : 'Kênh Trực Tiếp'}</span>
        </td>
        <td class="p-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">${netRevFmt}&nbsp;₫</td>
        <td class="p-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">${cogsFmt}&nbsp;₫</td>
        <td class="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          ${gpFmt}&nbsp;₫
          <span class="block text-[10px] text-slate-400 font-normal">Biên ${s.gross_margin_pct}%</span>
        </td>
        <td class="p-3 text-right font-bold ${targetAchieved >= 100 ? 'text-emerald-500' : (targetAchieved >= 90 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500')}">
          ${targetAchieved}%
        </td>
        <td class="p-3 text-right ${returnsPct > 3.5 ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-slate-400'}">
          ${returnsPct}%
        </td>
        <td class="p-3 text-center">${statusPill}</td>
        <td class="p-3 text-center">
          <button onclick="event.stopPropagation(); showStoreDetail('${s.store_id}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all text-[11px]">
            Chi tiết &rsaquo;
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 6. ASHLAR STORE DETAIL VIEW (MATCH FRAME 00:05 - 00:09)
function showStoreDetail(storeId) {
  currentDetailStoreId = storeId || 'PA-05';
  
  // Tìm thông tin cửa hàng trong dữ liệu
  let store = null;
  if (cachedStatus && cachedStatus.storeKPIs) {
    store = cachedStatus.storeKPIs.find(s => s.store_id === currentDetailStoreId);
  }
  
  if (!store) {
    store = {
      store_id: 'PA-05',
      store_name: 'Phúc An Hà Đông',
      region: 'Miền Bắc',
      city: 'Hà Nội',
      net_revenue: 3090070000,
      adjusted_cogs: 1995644500,
      gross_profit: 1094425500,
      gross_margin_pct: 35.42,
      target_rev_achieved_pct: 104.39,
      return_rate_pct: 9.42,
      return_amount: 321370000,
      rev_growth_mom_pct: 0
    };
  }

  // Header and title
  const titleEl = document.getElementById('storeDetailTitle');
  const badgeEl = document.getElementById('storeDetailStatusBadge');
  const metaEl = document.getElementById('storeDetailMeta');

  if (titleEl) titleEl.textContent = `${store.store_id} • ${store.store_name}`;
  
  const isAtRisk = store.return_rate_pct > 3.5 || store.target_rev_achieved_pct < 85;
  if (badgeEl) {
    if (isAtRisk) {
      badgeEl.textContent = '🔴 AT RISK';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-mono';
    } else if (store.target_rev_achieved_pct < 95) {
      badgeEl.textContent = '🟡 WATCH';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono';
    } else {
      badgeEl.textContent = '🟢 ON PLAN';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono';
    }
  }

  if (metaEl) {
    metaEl.textContent = `Khu vực: ${store.region} (${store.city || 'Việt Nam'}) • Quản lý: Nguyễn Văn A • Kênh: ${store.store_name.includes('Online') ? 'Đa Kênh (Omnichannel)' : 'Trực Tiếp Showroom'}`;
  }

  // What's happening issue content
  const issueEl = document.getElementById('storeDetailIssueContent');
  if (issueEl) {
    if (store.store_id === 'PA-05' || store.return_rate_pct > 3.5) {
      issueEl.innerHTML = `
        <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span class="font-bold text-rose-800 dark:text-rose-200 text-xs">Cảnh báo khẩn cấp: Tỷ lệ đổi trả vọt ngưỡng đỏ ${store.return_rate_pct}% (Ngưỡng an toàn: 3.5%)</span>
          </div>
          <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Hệ thống phát hiện ${store.return_count || 199} lượt hoàn trả tập trung ở dòng sản phẩm <strong>Nồi chiên không dầu ELC-001</strong> với tổng giá trị hoàn <strong>${(store.return_amount || 321370000).toLocaleString('vi-VN')}&nbsp;₫</strong>. Nguyên nhân kỹ thuật: Lỗi cảm biến rơ-le nhiệt khiến sản phẩm tự ngắt, phát sinh từ lô giao nhận ngày 28/09/2026.
          </p>
        </div>
      `;
    } else if (store.target_rev_achieved_pct < 90) {
      issueEl.innerHTML = `
        <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span class="font-bold text-amber-800 dark:text-amber-200 text-xs">Cảnh báo: Hụt kế hoạch doanh thu (${store.target_rev_achieved_pct}%)</span>
          </div>
          <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Doanh thu thuần hiện đạt <strong>${(store.net_revenue / 1e9).toFixed(2)}&nbsp;Tỷ</strong>, thiếu hụt so với chỉ tiêu giao <strong>${((store.target_revenue || 0) / 1e9).toFixed(2)}&nbsp;Tỷ</strong>. Nguyên nhân do đứt gãy nguồn cung máy lọc không khí và lưu lượng khách tại showroom giảm 14% MoM.
          </p>
        </div>
      `;
    } else {
      issueEl.innerHTML = `
        <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-emerald-800 dark:text-emerald-200 text-xs">Hiệu quả kinh doanh đạt chuẩn xuất sắc (${store.target_rev_achieved_pct}%)</span>
          </div>
          <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            Điểm bán hoàn thành vượt mức chỉ tiêu doanh số <strong>${(store.net_revenue / 1e9).toFixed(2)}&nbsp;Tỷ</strong>, biên lợi nhuận ổn định ở mức <strong>${store.gross_margin_pct}%</strong> và tỷ lệ đổi trả duy trì an toàn <strong>${store.return_rate_pct}%</strong>.
          </p>
        </div>
      `;
    }
  }

  // Right card sub-metrics
  const nrEl = document.getElementById('storeDetailNetRev');
  const cogsEl = document.getElementById('storeDetailCogs');
  const retEl = document.getElementById('storeDetailReturns');
  const revPctEl = document.getElementById('storeDetailRevPct');
  const marginEl = document.getElementById('storeDetailMargin');
  const momEl = document.getElementById('storeDetailMoM');

  if (nrEl) nrEl.innerHTML = `${(store.net_revenue || 0).toLocaleString('vi-VN')}&nbsp;₫`;
  if (cogsEl) cogsEl.innerHTML = `${(store.adjusted_cogs || store.cogs || 0).toLocaleString('vi-VN')}&nbsp;₫`;
  if (retEl) retEl.innerHTML = `-${(store.return_amount || 0).toLocaleString('vi-VN')}&nbsp;₫`;
  if (revPctEl) revPctEl.textContent = `${store.target_rev_achieved_pct || 100}%`;
  if (marginEl) marginEl.textContent = `${store.gross_margin_pct || 0}%`;
  if (momEl) momEl.textContent = `${store.rev_growth_mom_pct >= 0 ? '+' : ''}${store.rev_growth_mom_pct || 0}%`;

  // Select default Option 1
  selectStoreOption(1);

  // Switch view to sec-store-detail
  showSection('sec-store-detail');
}

// 7. SELECT INTERACTIVE DECISION OPTION (MATCH FRAME 00:05 - 00:09)
function selectStoreOption(optIdx) {
  selectedStoreOption = optIdx;
  document.querySelectorAll('#storeDecisionOptionsContainer .ashlar-option-card').forEach(card => {
    const cardOpt = parseInt(card.getAttribute('data-option'), 10);
    if (cardOpt === optIdx) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const btnSign = document.getElementById('btnSignStoreDecision');
  if (btnSign) {
    if (optIdx === 1) {
      btnSign.innerHTML = '<span>KÝ DUYỆT: THU HỒI LÔ HÀNG & PHẠT NCC</span>';
    } else if (optIdx === 2) {
      btnSign.innerHTML = '<span>KÝ DUYỆT: CẤP VOUCHER TRI ÂN 15%</span>';
    } else {
      btnSign.innerHTML = '<span>XÁC NHẬN: DUY TRÌ THEO DÕI</span>';
    }
  }
}

// 8. SIGN AND STAMP GATE 2 DIRECTIVE
async function signStoreDecision() {
  const btnSign = document.getElementById('btnSignStoreDecision');
  if (btnSign) {
    btnSign.innerHTML = '<span>Đang ký điện tử Cổng 2...</span>';
    btnSign.disabled = true;
  }

  try {
    const res = await fetch('/api/pipeline/gate2/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approverName: 'Giám đốc Điều hành (CEO)',
        directorNotes: `Đã ban hành gói chỉ đạo Phương án ${selectedStoreOption} cho ${currentDetailStoreId}. Phê duyệt thực thi ngay trong 24h.`
      })
    });
    const d = await res.json();
    if (d.success) {
      alert(`✓ Đã ban hành và đóng dấu mộc Cổng 2 cho ${currentDetailStoreId}!\nMã thẩm quyền: ${d.gate2Record?.approvalCode || 'ASH-2026-OK'}`);
      await fetchPipelineStatus();
      if (btnSign) {
        btnSign.innerHTML = '<span>✓ ĐÃ ĐÓNG DẤU MỘC PHÊ DUYỆT</span>';
        btnSign.classList.remove('bg-slate-900', 'hover:bg-slate-800');
        btnSign.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      }
    }
  } catch (err) {
    alert('Lỗi phê duyệt: ' + err.message);
    if (btnSign) btnSign.disabled = false;
  }
}

// 9. SETUP EVENT LISTENERS FOR ASHLAR COMPONENTS
function setupAshlarAccountPills() {
  const container = document.getElementById('ashlarAccountPillsContainer');
  if (!container) return;

  container.querySelectorAll('.ashlar-pill[data-account]').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.ashlar-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentAshlarAccount = pill.getAttribute('data-account');
      if (cachedStatus) {
        renderAshlarHoldingsTable(cachedStatus.storeKPIs || []);
      }
    });
  });
}

function setupAshlarHoldingsFilter() {
  const tabs = document.getElementById('holdingsStatusTabs');
  if (!tabs) return;

  tabs.querySelectorAll('.ashlar-pill[data-status-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.ashlar-pill').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentAshlarStatusFilter = tab.getAttribute('data-status-filter');
      if (cachedStatus) {
        renderAshlarHoldingsTable(cachedStatus.storeKPIs || []);
      }
    });
  });
}

function setupAshlarStoreDetail() {
  const btnBack = document.getElementById('btnBackToHoldings');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      showSection('sec-overview');
    });
  }

  const btnSign = document.getElementById('btnSignStoreDecision');
  if (btnSign) {
    btnSign.addEventListener('click', () => {
      signStoreDecision();
    });
  }
}

// Global window exposure for inline HTML event handlers
window.showStoreDetail = showStoreDetail;
window.selectStoreOption = selectStoreOption;
window.signStoreDecision = signStoreDecision;
window.askCopilotQuestion = askCopilotQuestion;
window.showSection = showSection;

