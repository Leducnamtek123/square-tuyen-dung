const fs = require('fs');

function fix(filePath, lang) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const isVi = lang === 'vi';
  
  // Force overwrite common.status from string to object
  d.common.status = {
    completed: isVi ? 'Hoàn thành' : 'Completed',
    inProgress: isVi ? 'Đang diễn ra' : 'In Progress',
    scheduled: isVi ? 'Đã lên lịch' : 'Scheduled',
    cancelled: isVi ? 'Đã hủy' : 'Cancelled',
    pending: isVi ? 'Chờ xử lý' : 'Pending',
    unknown: isVi ? 'Không xác định' : 'Unknown',
    label: isVi ? 'Trạng thái' : 'Status'
  };
  
  // Ensure common.table exists
  if (!d.common.table || typeof d.common.table === 'string') {
    d.common.table = {};
  }
  d.common.table.noData = isVi ? 'Không có dữ liệu' : 'No data found';
  
  // Ensure common.na
  d.common.na = 'N/A';
  
  // Ensure common.system
  d.common.system = isVi ? 'Hệ thống' : 'System';
  
  fs.writeFileSync(filePath, JSON.stringify(d, null, 2) + '\n');
  console.log(lang + ' admin.json fixed');
}

fix('./src/i18n/locales/en/admin.json', 'en');
fix('./src/i18n/locales/vi/admin.json', 'vi');

// Also fix interview namespace
['en', 'vi'].forEach(lang => {
  const p = './src/i18n/locales/' + lang + '/interview.json';
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const isVi = lang === 'vi';
    if (!d.common) d.common = {};
    d.common.na = 'N/A';
    d.common.status = {
      completed: isVi ? 'Hoàn thành' : 'Completed',
      inProgress: isVi ? 'Đang diễn ra' : 'In Progress',
      scheduled: isVi ? 'Đã lên lịch' : 'Scheduled',
      cancelled: isVi ? 'Đã hủy' : 'Cancelled',
      pending: isVi ? 'Chờ xử lý' : 'Pending',
      unknown: isVi ? 'Không xác định' : 'Unknown'
    };
    if (!d.common.table) d.common.table = {};
    d.common.table.noData = isVi ? 'Không có dữ liệu' : 'No data found';
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    console.log(lang + ' interview.json fixed');
  }
});

console.log('Done!');
