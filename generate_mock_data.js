// generate_mock_data.js
// Sinh dữ liệu mẫu chân thực cho chuỗi 18 cửa hàng Phúc An Retail

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. STORES (18 cửa hàng)
const stores = [
  { store_id: 'PA-01', store_name: 'Phúc An Cầu Giấy', region: 'Miền Bắc', city: 'Hà Nội', manager: 'Nguyễn Văn A' },
  { store_id: 'PA-02', store_name: 'Phúc An Đống Đa', region: 'Miền Bắc', city: 'Hà Nội', manager: 'Trần Thị B' },
  { store_id: 'PA-03', store_name: 'Phúc An Hai Bà Trưng', region: 'Miền Bắc', city: 'Hà Nội', manager: 'Lê Văn C' },
  { store_id: 'PA-04', store_name: 'Phúc An Hoàn Kiếm', region: 'Miền Bắc', city: 'Hà Nội', manager: 'Phạm Minh D' },
  { store_id: 'PA-05', store_name: 'Phúc An Hà Đông', region: 'Miền Bắc', city: 'Hà Nội', manager: 'Hoàng Quốc E' },
  { store_id: 'PA-06', store_name: 'Phúc An Long Biên', region: 'Miền Bắc', city: 'Hà Nội', manager: 'Đỗ Thị F' },
  { store_id: 'PA-07', store_name: 'Phúc An Quận 1', region: 'Miền Nam', city: 'TP.HCM', manager: 'Vũ Đình G' },
  { store_id: 'PA-08', store_name: 'Phúc An Quận 3', region: 'Miền Nam', city: 'TP.HCM', manager: 'Bùi Lan H' },
  { store_id: 'PA-09', store_name: 'Phúc An Quận 7', region: 'Miền Nam', city: 'TP.HCM', manager: 'Đặng Quốc I' },
  { store_id: 'PA-10', store_name: 'Phúc An Bình Thạnh', region: 'Miền Nam', city: 'TP.HCM', manager: 'Ngô Thu K' },
  { store_id: 'PA-11', store_name: 'Phúc An Tân Bình', region: 'Miền Nam', city: 'TP.HCM', manager: 'Dương Văn L' },
  { store_id: 'PA-12', store_name: 'Phúc An Thủ Đức', region: 'Miền Nam', city: 'TP.HCM', manager: 'Hồ Bảo M' },
  { store_id: 'PA-13', store_name: 'Phúc An Hải Châu', region: 'Miền Trung', city: 'Đà Nẵng', manager: 'Phan Thị N' },
  { store_id: 'PA-14', store_name: 'Phúc An Sơn Trà', region: 'Miền Trung', city: 'Đà Nẵng', manager: 'Võ Minh P' },
  { store_id: 'PA-15', store_name: 'Phúc An Ngô Quyền', region: 'Miền Bắc', city: 'Hải Phòng', manager: 'Trịnh Văn Q' },
  { store_id: 'PA-16', store_name: 'Phúc An Ninh Kiều', region: 'Miền Nam', city: 'Cần Thơ', manager: 'Lý Thanh R' },
  { store_id: 'PA-17', store_name: 'Phúc An Thủ Dầu Một', region: 'Miền Nam', city: 'Bình Dương', manager: 'Mai Ngọc S' },
  { store_id: 'PA-18', store_name: 'Phúc An Biên Hòa', region: 'Miền Nam', city: 'Đồng Nai', manager: 'Đinh Tiến T' }
];

// Write stores.csv
const storesCsv = 'store_id,store_name,region,city,manager\n' +
  stores.map(s => `${s.store_id},${s.store_name},${s.region},${s.city},${s.manager}`).join('\n');
fs.writeFileSync(path.join(dataDir, 'stores.csv'), storesCsv);

// 2. PRODUCTS & COGS
const products = [
  { sku: 'ELC-001', name: 'Nồi chiên không dầu 5.5L', category: 'Thiết bị gia dụng', price: 1850000, cogs: 1150000 },
  { sku: 'ELC-002', name: 'Máy lọc không khí Plasma', category: 'Thiết bị gia dụng', price: 3200000, cogs: 2100000 },
  { sku: 'ELC-003', name: 'Robot hút bụi thông minh', category: 'Thiết bị gia dụng', price: 4900000, cogs: 3400000 },
  { sku: 'ELC-004', name: 'Ấm đun nước siêu tốc inox', category: 'Thiết bị gia dụng', price: 450000, cogs: 260000 },
  { sku: 'FSH-001', name: 'Áo thun Polo cao cấp', category: 'Thời trang & Phụ kiện', price: 350000, cogs: 140000 },
  { sku: 'FSH-002', name: 'Quần âu Slimfit công sở', category: 'Thời trang & Phụ kiện', price: 590000, cogs: 270000 },
  { sku: 'FSH-003', name: 'Áo khoác gió trượt nước', category: 'Thời trang & Phụ kiện', price: 790000, cogs: 360000 },
  { sku: 'FSH-004', name: 'Balo chống gù đa năng', category: 'Thời trang & Phụ kiện', price: 620000, cogs: 280000 },
  { sku: 'COS-001', name: 'Serum dưỡng sáng Vitamin C', category: 'Mỹ phẩm & Chăm sóc', price: 420000, cogs: 160000 },
  { sku: 'COS-002', name: 'Kem chống nắng quang phổ rộng', category: 'Mỹ phẩm & Chăm sóc', price: 360000, cogs: 135000 },
  { sku: 'COS-003', name: 'Sữa rửa mặt tạo bọt dịu nhẹ', category: 'Mỹ phẩm & Chăm sóc', price: 210000, cogs: 75000 },
  { sku: 'LIF-001', name: 'Bộ hộp cơm thủy tinh 3 ngăn', category: 'Đồ dùng gia đình', price: 280000, cogs: 130000 },
  { sku: 'LIF-002', name: 'Bộ dao làm bếp 6 món inox', category: 'Đồ dùng gia đình', price: 650000, cogs: 320000 },
  { sku: 'LIF-003', name: 'Chảo chống dính vân đá 28cm', category: 'Đồ dùng gia đình', price: 480000, cogs: 240000 },
  { sku: 'FOD-001', name: 'Hạt dinh dưỡng Granola 500g', category: 'Thực phẩm dinh dưỡng', price: 180000, cogs: 95000 },
  { sku: 'FOD-002', name: 'Mật ong hoa rừng nguyên chất', category: 'Thực phẩm dinh dưỡng', price: 250000, cogs: 125000 }
];

const productsCsv = 'sku,name,category,price,cogs\n' +
  products.map(p => `${p.sku},${p.name},${p.category},${p.price},${p.cogs}`).join('\n');
fs.writeFileSync(path.join(dataDir, 'products_cogs.csv'), productsCsv);

// 3. TARGETS (Kỳ 2026-09 và 2026-10) - Hiệu chuẩn chuẩn xác theo quy mô thực tế 18 điểm bán
const t10Targets = {
  'PA-01': 2000000000,
  'PA-02': 2380000000,
  'PA-03': 2680000000,
  'PA-04': 2600000000,
  'PA-05': 2960000000,
  'PA-06': 2060000000,
  'PA-07': 2490000000,
  'PA-08': 2320000000,
  'PA-09': 2010000000,
  'PA-10': 2280000000,
  'PA-11': 2400000000, // sụt giảm ở T10
  'PA-12': 1880000000,
  'PA-13': 2040000000,
  'PA-14': 2270000000,
  'PA-15': 1810000000,
  'PA-16': 920000000,  // bán nhiều hàng biên mỏng
  'PA-17': 1830000000,
  'PA-18': 2550000000
};

const targets = [];
stores.forEach(s => {
  const t10 = t10Targets[s.store_id] || 2000000000;
  const t09 = Math.round(t10 / 1.05 / 10000000) * 10000000;
  targets.push({
    period: '2026-09',
    store_id: s.store_id,
    store_name: s.store_name,
    target_revenue: t09,
    target_gross_profit: Math.round(t09 * 0.42),
    max_return_rate_pct: 3.5
  });
  targets.push({
    period: '2026-10',
    store_id: s.store_id,
    store_name: s.store_name,
    target_revenue: t10,
    target_gross_profit: Math.round(t10 * 0.42),
    max_return_rate_pct: 3.5
  });
});

const targetsCsv = 'period,store_id,store_name,target_revenue,target_gross_profit,max_return_rate_pct\n' +
  targets.map(t => `${t.period},${t.store_id},${t.store_name},${t.target_revenue},${t.target_gross_profit},${t.max_return_rate_pct}`).join('\n');
fs.writeFileSync(path.join(dataDir, 'targets.csv'), targetsCsv);

// 4. TRANSACTIONS & RETURNS GENERATION (~60.000 records mẫu đại diện)
console.log('Generating realistic transactions and returns...');
const transactions = [];
const returns = [];

let orderCounter = 100000;
let returnCounter = 50000;

// Các kịch bản đặc thù để test năng lực phân tích & phát hiện của AI Agent:
// PA-05 (Hà Đông): Doanh thu trông có vẻ đạt, nhưng tỷ lệ hàng trả cực cao (7.8%) do lỗi lô hàng ELC-001
// PA-11 (Tân Bình): Doanh thu sụt giảm mạnh (-22% so với tháng trước) do mất khách hàng công sở
// PA-16 (Cần Thơ): Bán rất nhiều mặt hàng giá rẻ biên lợi nhuận thấp, không đạt chỉ tiêu lợi nhuận gộp dù doanh thu đạt
// PA-07 (Quận 1): Tăng trưởng vững chắc, đạt >110% cả doanh thu và lợi nhuận gộp

const periods = [
  { name: '2026-09', days: 30, weight: 1.0 },
  { name: '2026-10', days: 31, weight: 1.08 }
];

periods.forEach(p => {
  stores.forEach((store, storeIdx) => {
    // Số lượng đơn hàng của mỗi cửa hàng theo kỳ (~1500 - 2200 đơn mỗi tháng)
    let numOrders = Math.floor(1400 + Math.random() * 600);
    if (store.store_id === 'PA-11' && p.name === '2026-10') {
      numOrders = Math.floor(numOrders * 0.75); // Giảm mạnh ở kỳ 2026-10
    }

    for (let i = 0; i < numOrders; i++) {
      orderCounter++;
      const orderId = `ORD-${orderCounter}`;
      const day = Math.floor(1 + Math.random() * p.days);
      const dateStr = `${p.name}-${day < 10 ? '0' + day : day}`;

      // Chọn sản phẩm ngẫu nhiên có trọng số
      let product = products[Math.floor(Math.random() * products.length)];
      if (store.store_id === 'PA-16') {
        // Cần Thơ chuộng hàng biên thấp: Thực phẩm, thời trang giảm giá
        const lowMarginSkus = ['FOD-001', 'FOD-002', 'LIF-001', 'COS-003'];
        product = products.find(prod => prod.sku === lowMarginSkus[Math.floor(Math.random() * lowMarginSkus.length)]) || product;
      }
      if (store.store_id === 'PA-05' && p.name === '2026-10' && Math.random() < 0.25) {
        // Hà Đông bán nhiều ELC-001 bị lỗi
        product = products.find(prod => prod.sku === 'ELC-001') || product;
      }

      const qty = Math.floor(1 + Math.random() * 2);
      const grossAmount = qty * product.price;
      const discount = Math.random() < 0.2 ? Math.round(grossAmount * 0.1) : 0;
      const netAmount = grossAmount - discount;

      // Trạng thái đơn hàng: SUCCESS, CANCELLED
      // Tỷ lệ hủy ~3-5%
      let status = 'SUCCESS';
      if (Math.random() < 0.04) {
        status = 'CANCELLED';
      }

      const record = {
        order_id: orderId,
        date: dateStr,
        store_id: store.store_id,
        store_name: store.store_name,
        sku: product.sku,
        product_name: product.name,
        category: product.category,
        quantity: qty,
        unit_price: product.price,
        gross_amount: grossAmount,
        discount_amount: discount,
        net_amount: netAmount,
        cogs: qty * product.cogs,
        order_status: status,

        sales_channel: Math.random() < 0.8 ? 'Direct_Store' : 'Omnichannel_Pickup'
      };

      transactions.push(record);

      // Đưa một số bản ghi cố tình bị trùng duplicate (như nhân viên xuất file đúp)
      if (Math.random() < 0.015) {
        transactions.push({ ...record }); // trùng hoàn toàn
      }

      // Xử lý đổi trả (Returns)
      // Nếu đơn thành công, có xác suất phát sinh đổi trả
      if (status === 'SUCCESS') {
        let returnProb = 0.025; // 2.5% bình thường
        if (store.store_id === 'PA-05' && product.sku === 'ELC-001' && p.name === '2026-10') {
          returnProb = 0.28; // Tỷ lệ trả vọt lên 28% riêng cho mã này ở PA-05
        } else if (product.category === 'Thời trang & Phụ kiện') {
          returnProb = 0.05; // Đổi size
        }

        if (Math.random() < returnProb) {
          returnCounter++;
          const returnQty = 1;
          const returnVal = returnQty * product.price;
          const returnDay = Math.min(p.days, day + Math.floor(1 + Math.random() * 5));
          const returnDate = `${p.name}-${returnDay < 10 ? '0' + returnDay : returnDay}`;
          const reasons = ['Lỗi kỹ thuật', 'Khách đổi size', 'Khách đổi ý', 'Giao sai màu'];
          const reason = (store.store_id === 'PA-05' && product.sku === 'ELC-001') ? 'Lỗi mạch điều khiển nhiệt' : reasons[Math.floor(Math.random() * reasons.length)];

          returns.push({
            return_id: `RET-${returnCounter}`,
            original_order_id: orderId,
            return_date: returnDate,
            store_id: store.store_id,
            store_name: store.store_name,
            sku: product.sku,
            product_name: product.name,
            return_quantity: returnQty,
            refund_amount: returnVal,
            return_cogs_recovery: returnQty * product.cogs * (reason.includes('Lỗi') ? 0.3 : 1.0), // nếu hàng lỗi thì thu hồi giá vốn thấp
            reason: reason,
            return_status: 'REFUNDED'
          });
        }
      }
    }
  });
});

console.log(`Generated ${transactions.length} transaction rows (including intentional duplicates and cancelled orders)`);
console.log(`Generated ${returns.length} return records`);

// Write transactions.csv
const txHeader = 'order_id,date,store_id,store_name,sku,product_name,category,quantity,unit_price,gross_amount,discount_amount,net_amount,cogs,order_status,sales_channel\n';
const txRows = transactions.map(t =>
  `${t.order_id},${t.date},${t.store_id},"${t.store_name}",${t.sku},"${t.product_name}","${t.category}",${t.quantity},${t.unit_price},${t.gross_amount},${t.discount_amount},${t.net_amount},${t.cogs},${t.order_status},${t.sales_channel}`
).join('\n');
fs.writeFileSync(path.join(dataDir, 'transactions.csv'), txHeader + txRows);

// Write returns.csv
const retHeader = 'return_id,original_order_id,return_date,store_id,store_name,sku,product_name,return_quantity,refund_amount,return_cogs_recovery,reason,return_status\n';
const retRows = returns.map(r =>
  `${r.return_id},${r.original_order_id},${r.return_date},${r.store_id},"${r.store_name}",${r.sku},"${r.product_name}",${r.return_quantity},${r.refund_amount},${r.return_cogs_recovery},"${r.reason}",${r.return_status}`
).join('\n');
fs.writeFileSync(path.join(dataDir, 'returns.csv'), retHeader + retRows);

console.log('Sample data generated successfully in data/ directory!');

