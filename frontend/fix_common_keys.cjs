const fs = require('fs');

// Add common.* keys to admin namespace for both en and vi
const commonKeysEN = {
  "common": {
    "saving": "Saving...",
    "save": "Save",
    "deleting": "Deleting...",
    "delete": "Delete",
    "all": "All",
    "yes": "Yes",
    "no": "No",
    "saveChanges": "Save Changes",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "loading": "Loading...",
    "search": "Search",
    "edit": "Edit",
    "add": "Add",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "reset": "Reset",
    "actions": "Actions",
    "status": "Status",
    "active": "Active",
    "inactive": "Inactive",
    "enable": "Enable",
    "disable": "Disable",
    "noData": "No data found",
    "error": "Error",
    "success": "Success"
  }
};

const commonKeysVI = {
  "common": {
    "saving": "Đang lưu...",
    "save": "Lưu",
    "deleting": "Đang xóa...",
    "delete": "Xóa",
    "all": "Tất cả",
    "yes": "Có",
    "no": "Không",
    "saveChanges": "Lưu thay đổi",
    "cancel": "Hủy",
    "confirm": "Xác nhận",
    "loading": "Đang tải...",
    "search": "Tìm kiếm",
    "edit": "Chỉnh sửa",
    "add": "Thêm mới",
    "close": "Đóng",
    "back": "Quay lại",
    "next": "Tiếp theo",
    "submit": "Gửi",
    "reset": "Đặt lại",
    "actions": "Thao tác",
    "status": "Trạng thái",
    "active": "Hoạt động",
    "inactive": "Không hoạt động",
    "enable": "Bật",
    "disable": "Tắt",
    "noData": "Không có dữ liệu",
    "error": "Lỗi",
    "success": "Thành công"
  }
};

// Update EN
const enPath = './src/i18n/locales/en/admin.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en.common = commonKeysEN.common;
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
console.log('EN admin.json updated with common keys');

// Update VI
const viPath = './src/i18n/locales/vi/admin.json';
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
vi.common = commonKeysVI.common;
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2) + '\n');
console.log('VI admin.json updated with common keys');
