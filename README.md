# HỆ THỐNG PHÂN TÍCH QUẢN TRỊ BÁN LẺ & TRỢ LÝ COPILOT - PHÚC AN RETAIL
## KIẾN TRÚC 5 BƯỚC • 2 CỔNG DUYỆT • 7 LUẬT BẤT BIẾN (CHUẨN BẢO VỆ ĐỒ ÁN HỘI ĐỒNG)

Hệ thống AI Agent tự động hóa toàn diện quy trình từ **Thu thập dữ liệu thô (60.152 dòng/tháng từ 18 cửa hàng)** đến **Làm sạch, Thẩm định Cổng 1, Tính toán định lượng bằng Code, Nhận định AI đối chiếu số liệu, Phê duyệt Cổng 2** và **Hỗ trợ Giám đốc Kinh doanh qua Trợ lý Copilot Chỉ-Đọc**.

---

## 1. 7 LUẬT BẤT BIẾN ĐÓNG ĐINH VÀO KIẾN TRÚC MÃ NGUỒN

1. **AI không tính số:** Mọi con số (Doanh thu thuần, Giá vốn COGS, Lợi nhuận gộp GP, Tỷ lệ hoàn thành KPI, Tăng trưởng MoM, Tỷ lệ trả hàng) **100% do Code tính toán** ở Bước 3. AI chỉ có nhiệm vụ diễn giải ngữ nghĩa và tổng hợp nguyên nhân.
2. **Hai cổng duyệt người là bắt buộc:**
   - **Cổng 1 (Data Clean Gate):** Kế toán trưởng thẩm định và ký duyệt dữ liệu đã làm sạch. Chưa duyệt Cổng 1 thì hệ thống **khóa chặt** không cho đi tiếp sang Bước 3, 4, 5.
   - **Cổng 2 (Executive Report Gate):** Giám đốc Kinh doanh thẩm định báo cáo và ký duyệt gói chỉ đạo điều hành. Chưa duyệt Cổng 2 thì không được xuất bản chính thức.
3. **Trợ lý Chat Copilot chỉ-đọc (Read-Only):** Chặn bằng kiến trúc mã nguồn. Trợ lý chỉ có quyền đọc (`queryData`, `explainAnomaly`), từ chối tuyệt đối mọi lệnh can thiệp, sửa đổi hoặc ghi đè số liệu.
4. **Từ chối sớm (Early Rejection):** Báo lỗi cụ thể bằng tiếng Việt, hướng dẫn chi tiết cách sửa khi tệp dữ liệu sai định dạng hoặc thiếu bảng bắt buộc.
5. **Luôn có chế độ dự phòng (Fallback Mode):** Đảm bảo hệ thống vẫn tự động sinh nhận định chuẩn tắc và đối chiếu số liệu ngay cả khi mạng ngắt hoặc API AI quá tải.
6. **Khóa API chỉ nằm ở Backend:** Bảo vệ toàn diện, không bao giờ lộ khóa API ra client bundle.
7. **Không chạy mã do AI sinh ra:** Mọi thao tác làm sạch và lọc dữ liệu đều nằm trong danh sách trắng (whitelist) do kỹ sư định nghĩa.

---

## 2. QUY TRÌNH 5 BƯỚC & 2 CỔNG DUYỆT (5-STEP PIPELINE)

```
[BƯỚC 1: TIẾP NHẬN DỮ LIỆU]
   │  • Tiếp nhận 60.152 giao dịch từ 18 Cửa hàng (CSV, XLSX, Google Sheet)
   │  • Kiểm tra schema, cấu trúc 5 bảng dữ liệu, từ chối sớm nếu lỗi
   ▼
[BƯỚC 2: PHÂN TÍCH HỒ SƠ & LÀM SẠCH]
   │  • Khử 900 giao dịch trùng lặp (Dedup Key: order_id + sku + date + store_id)
   │  • Bóc tách 2.358 đơn hàng hủy khỏi dòng tiền doanh thu
   │  • Hạch toán khấu trừ và bù COGS cho 1.856 phiếu đổi trả
   │  • Điểm chất lượng dữ liệu sạch: 94.6% (56.894 dòng hợp lệ)
   ▼
[🔒 CỔNG DUYỆT 1 - BẮT BUỘC: DUYỆT DỮ LIỆU SẠCH]
   │  • Kế toán trưởng thẩm định bảng mẫu dữ liệu bất thường
   │  • Ký xác nhận & cấp mã chứng nhận điện tử: PA-GATE1-CONFIRMED-XXXX
   │  • Mở khóa Bước 3 (Chỉ số & 18 Cửa Hàng)
   ▼
[BƯỚC 3: TÍNH TOÁN CHỈ SỐ & PHÂN TÍCH ĐỊNH LƯỢNG]
   │  • 100% Tính bằng Code thuần (Luật 1: AI không tính số)
   │  • Doanh thu thuần: 38.984.250.000 đ (Tăng trưởng MoM +3.21%)
   │  • Giá vốn COGS: 23.163.500.000 đ
   │  • Lợi nhuận gộp (GP): 15.820.750.000 đ (Biên lãi gộp 40.58%)
   │  • Tỷ lệ đạt KPI: 104.2% mục tiêu Hội đồng Quản trị
   │  • Bảng xếp hạng chi tiết 18 điểm bán & Cơ cấu 4 ngành hàng
   ▼
[BƯỚC 4: NHẬN ĐỊNH AI & ĐỐI CHIẾU SỐ LIỆU]
   │  • AI viết bản nhận định giải thích nguyên nhân cốt lõi (Root Cause)
   │  • MA TRẬN ĐỐI CHIẾU SỐ LIỆU (Strict Number Verification):
   │    Quét 11 con số trong bài viết của AI, đối chiếu khớp 100% với Code Bước 3
   │  • Cấp chứng chỉ "ZERO HALLUCINATION - SỐ LIỆU SẠCH KHÔNG ẢO GIÁC"
   ▼
[🔒 CỔNG DUYỆT 2 - BẮT BUỘC: KÝ DUYỆT BAN GIÁM ĐỐC]
   │  • Giám đốc Kinh doanh thẩm định nhận định và 4 trụ cột chiến lược
   │  • Ký phê duyệt & đóng dấu mộc đỏ điện tử: OFFICIALLY_APPROVED
   ▼
[BƯỚC 5: XUẤT BẢN & TRỢ LÝ COPILOT CHỈ-ĐỌC]
      • Xuất bản báo cáo quản trị chuẩn A4 / In PDF đầy đủ 2 con dấu mộc
      • Tải file CSV 56.894 dòng dữ liệu sạch đã qua Cổng 1
      • Kích hoạt Trợ lý Copilot Chỉ-Đọc (Read-Only) hỗ trợ tra cứu tức thì
```

---

## 3. TOP 3 CỬA HÀNG ĐIỂM NÓNG ĐƯỢC PHÊ DUYỆT HỖ TRỢ KHẨN CẤP

1. **PA-05 Hà Đông (Tỷ lệ đổi trả 9.8% > Ngưỡng đỏ 3.5%):**
   - *Nguyên nhân cốt lõi:* Lô Nồi chiên không dầu mã ELC-001 bị lỗi rơ-le nhiệt ngắt sớm tại kho Hà Đông.
   - *Chỉ thị Cổng 2:* Thu hồi ngay toàn bộ lô hàng lỗi và yêu cầu Nhà cung cấp bồi hoàn 100% giá vốn.
2. **PA-11 Tân Bình (Doanh thu giảm mạnh -21.8% MoM, đạt 78.4% kế hoạch):**
   - *Nguyên nhân cốt lõi:* Đại siêu thị đối thủ mở cách 500m tung khuyến mãi sốc; cửa hàng thiếu chiến dịch giữ chân khách cũ.
   - *Chỉ thị Cổng 2:* Kích hoạt chiến dịch CRM gửi voucher tri ân tới 4.200 khách hàng cũ trong bán kính 3km; GĐKD xuống hỗ trợ điểm bán.
3. **PA-16 Ninh Kiều - Cần Thơ (Lệch cơ cấu Product Mix: DT đạt 95.5% nhưng GP chỉ đạt 72.2%):**
   - *Nguyên nhân cốt lõi:* Nhân viên chỉ tập trung bán hàng điện máy phổ thông biên mỏng (<12%) để chạy doanh số.
   - *Chỉ thị Cổng 2:* Đổi cơ chế hoa hồng: tính thưởng theo Lợi nhuận gộp (GP) thay vì Doanh thu thuần; bắt buộc đào tạo kỹ năng cross-sell nhóm hàng biên GP > 50%.

---

## 4. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

1. Khởi động máy chủ:
   ```bash
   ./start.sh
   # Hoặc: node server.js
   ```
2. Mở trình duyệt tại:
   👉 **`http://localhost:3000`**
