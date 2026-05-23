/**
 * GOOGLE APPS SCRIPT — Quảng Cáo Tân Thành
 * ============================================
 * Chức năng:
 *   1. Nhận dữ liệu form từ website (POST request)
 *   2. Lưu vào Google Sheet để theo dõi
 *   3. Gửi email thông báo về tanthanhads@gmail.com
 *
 * Cách deploy:
 *   1. Vào script.google.com → New project
 *   2. Paste toàn bộ code này vào
 *   3. Deploy → New deployment → Web App
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Copy URL → dán vào GAS_URL trong main.js
 */

// ──────────────────────────────────────────────
// CẤU HÌNH — chỉnh 2 dòng này
// ──────────────────────────────────────────────
const EMAIL_TO = 'dj.thaomeo@gmail.com';  // Email nhận thông báo
const SHEET_NAME = 'Liên hệ';               // Tên sheet trong Google Sheets

// ──────────────────────────────────────────────
// MAP tên dịch vụ từ value → label hiển thị
// ──────────────────────────────────────────────
const SERVICE_LABELS = {
  bangHieu: 'Bảng hiệu & Signboard',
  inAn: 'In ấn khổ lớn (bạt, PP, standee)',
  decal: 'Tem nhãn, Decal, Namecard',
  cnc: 'Gia công CNC & Laser',
  khac: 'Dịch vụ khác',
};

// ──────────────────────────────────────────────
// HÀM GET — khi mở URL trực tiếp trên browser
// (Form thật dùng POST, cái này chỉ để test URL)
// ──────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Quảng Cáo Tân Thành — Google Apps Script đang hoạt động [OK]',
      note: 'Form gửi qua POST, không phải GET. Script này hoạt động bình thường.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────
// HÀM CHÍNH — nhận POST từ website
// ──────────────────────────────────────────────
function doPost(e) {
  // Khi chạy thủ công từ editor, e sẽ undefined → dùng testScript() thay thế
  if (!e || !e.postData) {
    return buildResponse({
      success: false,
      error: 'Hãy chọn hàm testScript() để test thủ công, không chạy doPost() trực tiếp'
    });
  }

  try {
    // Parse JSON từ form
    const raw = e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const name = (data.name || '').trim();
    const phone = (data.phone || '').trim();
    const service = SERVICE_LABELS[data.service] || data.service || 'Không rõ';
    const note = (data.note || '').trim();
    const time = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    // 1. Lưu vào Google Sheet
    saveToSheet({ time, name, phone, service, note });

    // 2. Gửi email thông báo
    sendEmailNotification({ time, name, phone, service, note });

    // 3. Trả về success
    return buildResponse({ success: true, message: 'Gửi thành công' });

  } catch (err) {
    console.error('Lỗi doPost:', err.message);
    return buildResponse({ success: false, error: err.message });
  }
}

// ──────────────────────────────────────────────
// LẤY HOẶC TẠO SPREADSHEET TỰ ĐỘNG
// (Standalone script không có getActiveSpreadsheet)
// ──────────────────────────────────────────────
function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SPREADSHEET_ID');

  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // ID cũ không hợp lệ → tạo mới
      ssId = null;
    }
  }

  // Tạo spreadsheet mới và lưu ID lại
  const ss = SpreadsheetApp.create('[Form] Quảng Cáo Tân Thành — Đơn liên hệ');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('[OK] Đã tạo spreadsheet mới: ' + ss.getUrl());
  return ss;
}

// ──────────────────────────────────────────────
// LƯU DỮ LIỆU VÀO SHEET
// ──────────────────────────────────────────────
function saveToSheet({ time, name, phone, service, note }) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Tạo sheet nếu chưa có
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Thêm header nếu sheet còn trống
  if (sheet.getLastRow() === 0) {
    const headers = ['Thời gian', 'Họ & Tên', 'Số điện thoại', 'Dịch vụ', 'Ghi chú'];
    sheet.appendRow(headers);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#FF6B00');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 250);
    sheet.setColumnWidth(5, 350);
  }

  // Append dữ liệu
  sheet.appendRow([time, name, phone, service, note]);

  // Highlight dòng chẵn
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, 5).setBackground('#FFF8F3');
  }
}

// ──────────────────────────────────────────────
// GỬI EMAIL THÔNG BÁO
// ──────────────────────────────────────────────
function sendEmailNotification({ time, name, phone, service, note }) {
  const subject = `[Báo Giá] Yêu cầu mới — ${name} (${phone})`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B00, #FF8C42); padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Yêu cầu báo giá mới!</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Quảng Cáo Tân Thành — Hệ thống website</p>
      </div>

      <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555; width: 35%;">Thời gian</td>
            <td style="padding: 12px 8px; color: #222;">${time}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background: #fff;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">Họ & tên</td>
            <td style="padding: 12px 8px; color: #222; font-size: 16px;"><strong>${name}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">Số điện thoại</td>
            <td style="padding: 12px 8px;">
              <a href="https://zalo.me/${phone}" target="_blank" style="color: #FF6B00; font-size: 18px; font-weight: bold; text-decoration: none;">${phone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #eee; background: #fff;">
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">Dịch vụ</td>
            <td style="padding: 12px 8px; color: #222;">${service}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; font-weight: bold; color: #555;">Ghi chú</td>
            <td style="padding: 12px 8px; color: #222;">${note || '<em style="color:#aaa">Không có</em>'}</td>
          </tr>
        </table>
      </div>

      <div style="background: #FF6B00; padding: 16px 24px; border-radius: 0 0 8px 8px; text-align: center;">
        <a href="https://zalo.me/${phone}" target="_blank"
           style="display: inline-block; background: white; color: #FF6B00; padding: 10px 20px;
                  border-radius: 24px; font-weight: bold; text-decoration: none; font-size: 15px; margin: 4px;">
          Chat Zalo
        </a>
        <a href="tel:${phone}"
           style="display: inline-block; color: white; padding: 10px 20px;
                  border-radius: 24px; font-weight: bold; text-decoration: none; font-size: 15px;
                  border: 2px solid white; margin: 4px; letter-spacing: 1px;">
          Gọi trực tiếp
        </a>
      </div>

      <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 16px;">
        Email này được gửi tự động từ website tanthanhads.vn<br>
        Vui lòng không reply trực tiếp email này.
      </p>
    </div>
  `;

  GmailApp.sendEmail(EMAIL_TO, subject, `Yêu cầu báo giá mới:\nTên: ${name}\nSĐT: ${phone}\nDịch vụ: ${service}\nGhi chú: ${note}`, {
    htmlBody,
    name: 'Website Quảng Cáo Tân Thành',
  });
}

// ──────────────────────────────────────────────
// BUILD RESPONSE (hỗ trợ CORS)
// ──────────────────────────────────────────────
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────
// TEST FUNCTION — chạy thủ công để kiểm tra
// ──────────────────────────────────────────────
function testScript() {
  saveToSheet({
    time: '23/05/2025 13:30:00',
    name: 'Nguyễn Văn Test',
    phone: '0777772255',
    service: 'Bảng hiệu & Signboard',
    note: 'Test chạy thử từ Apps Script Editor',
  });
  sendEmailNotification({
    time: '23/05/2025 13:30:00',
    name: 'Nguyễn Văn Test',
    phone: '0777772255',
    service: 'Bảng hiệu & Signboard',
    note: 'Test chạy thử từ Apps Script Editor',
  });
  Logger.log('[OK] Test xong! Kiểm tra Gmail và Google Sheet.');
}
