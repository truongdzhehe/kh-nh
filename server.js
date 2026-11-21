// server.js
// Máy chủ Web & API cho Hệ thống Phân tích Quản trị Phúc An Retail
// Triển khai Kiến trúc 5 Bước & 2 Cổng duyệt chuẩn mực (Inviolable Laws: AI không tính số, 2 Cổng duyệt, Chat chỉ-đọc, Đối chiếu số liệu)

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const PhucAnAgentEngine = require('./src/agent_engine');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

// Bộ nhớ động phiên làm việc hiện tại của máy chủ
const activeEngine = new PhucAnAgentEngine();

// Đọc dữ liệu mẫu đã sinh sẵn từ thư mục data/
function loadMockFiles() {
  const parseCsv = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const values = [];
      let insideQuotes = false;
      let cur = '';
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      values.push(cur.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, idx) => obj[h] = values[idx] || '');
      rows.push(obj);
    }
    return rows;
  };

  return {
    stores: parseCsv('stores.csv'),
    products: parseCsv('products_cogs.csv'),
    targets: parseCsv('targets.csv'),
    transactions: parseCsv('transactions.csv'),
    returns: parseCsv('returns.csv')
  };
}

// Khởi tạo engine ở trạng thái ban đầu (Empty State / INIT)
// Dữ liệu chỉ được nạp khi người dùng bấm + ADD FILE hoặc chạy quy trình Bước 1
activeEngine.reset();
console.log(`[INIT] Máy chủ khởi động ở trạng thái Empty State (Chờ nạp file).`);

const server = http.createServer(handleRequest);

function handleRequest(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);

  // Helper gửi JSON
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // Helper đọc Body
  const readJsonBody = (cb) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        cb(null, parsed);
      } catch (err) {
        cb(err, null);
      }
    });
  };

  // ==========================================
  // HỆ THỐNG API PIPELINE 5 BƯỚC & 2 CỔNG DUYỆT
  // ==========================================

  // 1. Trạng thái tổng quan của máy trạng thái
  if (url.pathname === '/api/pipeline/status' && req.method === 'GET') {
    return sendJson(200, {
      success: true,
      pipelineState: activeEngine.pipelineState,
      auditLog: activeEngine.auditLog,
      gate1Record: activeEngine.gate1Record,
      gate2Record: activeEngine.gate2Record,
      chainSummary: activeEngine.chainSummary,
      storeKPIs: activeEngine.storeKPIs,
      productMix: activeEngine.productMix,
      recommendedStores: activeEngine.recommendedStores,
      aiRecommendations: activeEngine.aiRecommendations || [],
      aiAdvice: activeEngine.aiAdvice || [],
      aiAdvisorySummary: activeEngine.aiAdvisorySummary || null,
      narrativeReport: activeEngine.narrativeReport,
      verificationMatrix: activeEngine.verificationMatrix,
      auditTrail: activeEngine.auditTrail
    });
  }

  // 2. Reset phiên làm việc về INIT
  if (url.pathname === '/api/pipeline/reset' && req.method === 'POST') {
    activeEngine.reset();
    return sendJson(200, { success: true, pipelineState: activeEngine.pipelineState, message: 'Đã đặt lại phiên làm việc.' });
  }

  // 3. Bước 1: Tiếp nhận dữ liệu (Nạp mẫu 60K dòng hoặc file gửi lên)
  if (url.pathname === '/api/pipeline/ingest' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      if (err) return sendJson(400, { success: false, error: 'JSON không hợp lệ' });
      try {
        const datasets = payload.datasets || {};
        const isCustom = Boolean(payload.isCustomUpload || (datasets.transactions && datasets.transactions.length > 0));

        let transactions, stores, products, targets, returns;
        if (isCustom) {
          // Tập tin do người dùng tải lên (+ ADD FILE):
          // TUYỆT ĐỐI KHÔNG nạp mặc định mock returns/products/targets tránh làm phát sinh số âm hoặc sai lệch doanh thu
          transactions = datasets.transactions || [];
          returns = datasets.returns || [];
          stores = datasets.stores || [];
          products = datasets.products || [];
          targets = datasets.targets || [];
        } else {
          // Chế độ dữ liệu mẫu 60.152 dòng mặc định của hệ thống
          const defaults = loadMockFiles();
          transactions = defaults.transactions;
          stores = defaults.stores;
          products = defaults.products;
          targets = defaults.targets;
          returns = defaults.returns;
        }

        const result = activeEngine.loadDatasets({
          stores,
          products,
          targets,
          transactions,
          returns,
          isCustomUpload: isCustom,
          reportPeriod: payload.reportPeriod || '2026-10',
          comparePeriod: payload.comparePeriod || '2026-09',
          actor: payload.actor || (isCustom ? 'Tập tin người dùng tải lên' : 'Quản trị viên POS')
        });
        return sendJson(200, { success: true, ...result, auditTrail: activeEngine.auditTrail });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 4. Bước 2: Chạy phân tích hồ sơ & Làm sạch dữ liệu
  if (url.pathname === '/api/pipeline/cleanse' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        if (activeEngine.pipelineState === 'INIT') {
          const datasets = loadMockFiles();
          activeEngine.loadDatasets(datasets);
        }
        const result = activeEngine.cleanAndDeduplicate(payload.actor || 'Chuyên viên Kiểm toán Dữ liệu');
        return sendJson(200, {
          success: true,
          ...result,
          auditTrail: activeEngine.auditTrail
        });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 5. CỔNG DUYỆT 1: Phê duyệt dữ liệu làm sạch
  if (url.pathname === '/api/pipeline/gate1/approve' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const result = activeEngine.approveGate1({
          approverName: payload.approverName || 'Kế toán trưởng Nguyễn Văn A',
          notes: payload.notes || 'Đã đối soát khớp dữ liệu bán hàng POS và kho đổi trả.'
        });
        return sendJson(200, {
          success: true,
          ...result,
          auditTrail: activeEngine.auditTrail
        });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 6. Bước 3: Tính toán chỉ số & Phân tích định lượng (100% bằng code - Luật 1)
  if (url.pathname === '/api/pipeline/compute-metrics' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const result = activeEngine.computeMetrics(payload.actor || 'Bộ tính toán Định lượng');
        return sendJson(200, {
          success: true,
          ...result,
          auditTrail: activeEngine.auditTrail
        });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 7. Bước 4: Nhận định AI & Đối chiếu số liệu nghiêm ngặt
  if (url.pathname === '/api/pipeline/narrative' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const result = activeEngine.generateAndVerifyNarrative(payload.actor || 'AI Narrative Verifier');
        return sendJson(200, {
          success: true,
          ...result,
          auditTrail: activeEngine.auditTrail
        });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 8. CỔNG DUYỆT 2: Phê duyệt Báo cáo & Chỉ đạo điều hành (Ban Giám Đốc)
  if (url.pathname === '/api/pipeline/gate2/approve' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const result = activeEngine.approveGate2({
          approverName: payload.approverName || 'Giám đốc Kinh doanh Trần Thị B',
          directorNotes: payload.directorNotes || 'Phê duyệt toàn bộ báo cáo và kích hoạt ngay 4 trụ cột hành động trong vòng 48 giờ.',
          modifiedActions: payload.modifiedActions || []
        });
        return sendJson(200, {
          success: true,
          ...result,
          auditTrail: activeEngine.auditTrail
        });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 8.5. AI Strategic Advisory: Kích hoạt & Phê duyệt Đề xuất
  if (url.pathname === '/api/pipeline/recommendations/apply' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      if (err || !payload.recId) return sendJson(400, { success: false, error: 'Thiếu mã đề xuất recId' });
      try {
        const result = activeEngine.applyRecommendation(payload.recId, payload.actor || 'Quản trị viên');
        return sendJson(200, { success: true, ...result, auditTrail: activeEngine.auditTrail });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  if (url.pathname === '/api/pipeline/recommendations/generate' && req.method === 'POST') {
    try {
      const result = activeEngine.generateAIRecommendationsAndAdvice();
      return sendJson(200, { success: true, ...result });
    } catch (e) {
      return sendJson(400, { success: false, error: e.message });
    }
  }

  // 9. Bước 5: Trợ lý Chat Copilot Chỉ-Đọc (Read-Only Assistant - Luật 3)
  if (url.pathname === '/api/copilot/chat' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const response = activeEngine.copilotChat(payload.message || '');
        return sendJson(200, { success: true, response });
      } catch (e) {
        return sendJson(400, { success: false, error: e.message });
      }
    });
    return;
  }

  // 10. Xuất file CSV dữ liệu sạch (Đã qua Cổng 1)
  if (url.pathname === '/api/export/clean-csv' && req.method === 'GET') {
    if (activeEngine.pipelineState === 'INIT' || activeEngine.pipelineState === 'INGESTED') {
      return sendJson(400, { success: false, error: 'Chưa có dữ liệu làm sạch được phê duyệt.' });
    }
    const headers = ['order_id', 'sku', 'date', 'store_id', 'quantity', 'unit_price', 'gross_amount', 'discount_amount', 'net_amount', 'cogs', 'order_status'];
    let csv = headers.join(',') + '\n';
    activeEngine.cleanedTransactions.forEach(tx => {
      csv += [tx.order_id, tx.sku, tx.date, tx.store_id, tx.quantity, tx.unit_price, tx.gross_amount, tx.discount_amount, tx.net_amount, tx.cogs, tx.order_status].join(',') + '\n';
    });
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="phuc_an_cleaned_transactions_gate1.csv"'
    });
    res.end(csv);
    return;
  }

  // ==========================================
  // CÁC ENDPOINT TƯƠNG THÍCH CŨ (BACKWARDS COMPATIBILITY)
  // ==========================================
  if (url.pathname === '/api/sample-data' && req.method === 'GET') {
    try {
      const data = loadMockFiles();
      return sendJson(200, {
        success: true,
        stats: {
          storesCount: data.stores.length,
          productsCount: data.products.length,
          targetsCount: data.targets.length,
          transactionsCount: data.transactions.length,
          returnsCount: data.returns.length
        },
        data
      });
    } catch (err) {
      return sendJson(500, { success: false, error: err.message });
    }
  }

  if (url.pathname === '/api/analyze' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const datasets = loadMockFiles();
        activeEngine.loadDatasets(datasets);
        activeEngine.cleanAndDeduplicate();
        activeEngine.approveGate1({ approverName: 'Hệ thống tự động phê duyệt nhanh' });
        activeEngine.computeMetrics();
        activeEngine.generateAndVerifyNarrative();

        return sendJson(200, {
          success: true,
          reportPeriod: activeEngine.reportPeriod,
          comparePeriod: activeEngine.comparePeriod,
          pipelineState: activeEngine.pipelineState,
          auditLog: activeEngine.auditLog,
          chainSummary: activeEngine.chainSummary,
          storeKPIs: activeEngine.storeKPIs,
          productMix: activeEngine.productMix,
          recommendedStores: activeEngine.recommendedStores,
          aiRecommendations: activeEngine.aiRecommendations || [],
          aiAdvice: activeEngine.aiAdvice || [],
          aiAdvisorySummary: activeEngine.aiAdvisorySummary || null,
          businessProposals: activeEngine.narrativeReport ? activeEngine.narrativeReport.fourStrategicPillars : [],
          verificationMatrix: activeEngine.verificationMatrix
        });
      } catch (err) {
        return sendJson(400, { success: false, error: err.message });
      }
    });
    return;
  }

  if (url.pathname === '/api/cleanse' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        if (activeEngine.pipelineState === 'INIT') {
          const datasets = loadMockFiles();
          activeEngine.loadDatasets(datasets);
        }
        const audit = activeEngine.cleanAndDeduplicate();
        return sendJson(200, {
          success: true,
          pipelineState: activeEngine.pipelineState,
          auditLog: audit,
          previewCleaned: activeEngine.cleanedTransactions.slice(0, 15),
          flaggedSamples: activeEngine.flaggedSamples || [],
          qualityScore: activeEngine.auditLog.qualityScorePct
        });
      } catch (err) {
        return sendJson(400, { success: false, error: err.message });
      }
    });
    return;
  }

  if (url.pathname === '/api/approve-plan' && req.method === 'POST') {
    readJsonBody((err, payload) => {
      try {
        const result = activeEngine.approveGate2({
          approverName: payload.approverName || 'Giám đốc Kinh doanh Phúc An Retail',
          directorNotes: payload.notes || 'Phê duyệt toàn bộ kế hoạch.',
          modifiedActions: payload.actions || []
        });
        return sendJson(200, { success: true, approval: result.gate2Record });
      } catch (err) {
        return sendJson(400, { success: false, error: err.message });
      }
    });
    return;
  }

  // Kết nối Google Sheet
  if (url.pathname === '/api/fetch-google-sheet' && req.method === 'POST') {
    readJsonBody((err, { sheetUrl }) => {
      try {
        if (!sheetUrl) throw new Error('Vui lòng cung cấp đường dẫn Google Sheet.');
        const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) throw new Error('Đường link Google Sheet không hợp lệ. Hãy kiểm tra lại URL.');

        const sheetId = match[1];
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

        https.get(exportUrl, (resp) => {
          if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
            https.get(resp.headers.location, (redResp) => {
              let csvData = '';
              redResp.on('data', c => csvData += c);
              redResp.on('end', () => sendJson(200, { success: true, csv: csvData }));
            }).on('error', err => sendJson(500, { success: false, error: err.message }));
            return;
          }
          let csvData = '';
          resp.on('data', c => csvData += c);
          resp.on('end', () => sendJson(200, { success: true, csv: csvData }));
        }).on('error', (e) => sendJson(500, { success: false, error: `Không thể kết nối Google Sheet: ${e.message}` }));
      } catch (err) {
        return sendJson(400, { success: false, error: err.message });
      }
    });
    return;
  }

  // Serve Static Files từ public/
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  });
}

if (require.main === module || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 PHÚC AN RETAIL - AI AGENT DASHBOARD SERVER ĐANG CHẠY`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = handleRequest;
module.exports.handleRequest = handleRequest;
module.exports.server = server;
