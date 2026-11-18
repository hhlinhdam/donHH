/**
 * Thống kê lượt nhấn tải đơn HH Linh Đàm.
 * Chỉ lưu thời điểm và mã tòa nhà. Không nhận họ tên, CCCD, điện thoại,
 * số căn hộ, tầng hoặc bất kỳ nội dung nào khác của biểu mẫu.
 */
const SPREADSHEET_ID = '1s8wdrRX9tCjKiTMNW__1ZvpE4DO-z1ZjiMxLRssTO0w';
const LOG_SHEET_NAME = 'LuotTai';
const TOWERS = ['HH1A','HH1B','HH1C','HH2A','HH2B','HH2C','HH3A','HH3B','HH3C','HH4A','HH4B','HH4C'];

function getLogSheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'DAN_ID_GOOGLE_SHEET_VAO_DAY') {
    throw new Error('Chưa cấu hình SPREADSHEET_ID trong Code.gs');
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET_NAME);
    sh.appendRow(['Thời điểm ghi nhận', 'Tòa nhà']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || '';
  if (action === 'hit') {
    const tower = String(p.tower || '').toUpperCase();
    if (TOWERS.includes(tower)) {
      getLogSheet_().appendRow([new Date(), tower]);
    }
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  }
  if (action === 'stats') {
    const result = getStats_();
    const json = JSON.stringify(result);
    const callback = String(p.callback || '');
    if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService.createTextOutput(callback + '(' + json + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('HH Linh Dam download statistics');
}

function getStats_() {
  const sh = getLogSheet_();
  const lastRow = sh.getLastRow();
  const counts = {};
  TOWERS.forEach(t => counts[t] = 0);
  if (lastRow >= 2) {
    const values = sh.getRange(2, 2, lastRow - 1, 1).getValues();
    values.forEach(row => {
      const tower = String(row[0] || '').toUpperCase();
      if (Object.prototype.hasOwnProperty.call(counts, tower)) counts[tower]++;
    });
  }
  return { total: Object.values(counts).reduce((a, b) => a + b, 0), towers: counts };
}

// Chạy thủ công một lần trong Apps Script để kiểm tra quyền truy cập Sheet.
function testConnection() {
  const sh = getLogSheet_();
  Logger.log('Kết nối thành công: ' + sh.getParent().getName() + ' / ' + sh.getName());
}
