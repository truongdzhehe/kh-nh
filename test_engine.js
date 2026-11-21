// test_engine.js
const fs = require('fs');
const path = require('path');
const PhucAnAgentEngine = require('./src/agent_engine');

function parseCsv(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    // Basic CSV splitting with quotes
    const values = [];
    let insideQuotes = false;
    let currentVal = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentVal.trim().replace(/^"|"$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

console.log('Loading dataset files...');
const stores = parseCsv(fs.readFileSync(path.join(__dirname, 'data/stores.csv'), 'utf8'));
const products = parseCsv(fs.readFileSync(path.join(__dirname, 'data/products_cogs.csv'), 'utf8'));
const targets = parseCsv(fs.readFileSync(path.join(__dirname, 'data/targets.csv'), 'utf8'));
const transactions = parseCsv(fs.readFileSync(path.join(__dirname, 'data/transactions.csv'), 'utf8'));
const returns = parseCsv(fs.readFileSync(path.join(__dirname, 'data/returns.csv'), 'utf8'));

console.log(`Loaded ${stores.length} stores, ${products.length} products, ${targets.length} targets, ${transactions.length} tx, ${returns.length} returns`);

const engine = new PhucAnAgentEngine();
engine.loadDatasets({
  stores,
  products,
  targets,
  transactions,
  returns,
  reportPeriod: '2026-10',
  comparePeriod: '2026-09'
});

console.log('Executing AI Cleaning & Deduplication...');
const cleanLog = engine.cleanAndDeduplicate();
console.log('Clean Log:', cleanLog);

console.log('Executing Business KPI & Analytical Engine...');
const result = engine.computeKPIsAndAnalysis();

console.log('\n--- KẾT QUẢ PHÂN TÍCH VÀ ĐỀ XUẤT TOP 3 CỬA HÀNG CẦN HỖ TRỢ ---');
result.recommendedStores.forEach(s => {
  console.log(`[Hạng ${s.rank}] ${s.store_id} - ${s.store_name} (${s.city}) - Sức khỏe: ${s.healthScore}/100`);
  console.log(` -> Vấn đề cốt lõi: ${s.primaryIssue}`);
  console.log(` -> Chi tiết: ${s.detailReason}`);
  console.log(` -> Hành động khẩn cấp: ${s.immediateAction}`);
  console.log('---------------------------------------------------------');
});

console.log('\n--- TỔNG HỢP PRODUCT MIX ---');
result.productMix.forEach(c => {
  console.log(`${c.category}: Net Rev = ${(c.net_revenue / 1e6).toFixed(1)}M, Margin = ${c.gross_margin_pct.toFixed(1)}%, Return Rate = ${c.return_rate_pct.toFixed(2)}%`);
});

