/**
 * Comprehensive i18n fix script
 * Adds missing keys and fixes untranslated values across all namespaces.
 */
const fs = require('fs');
const path = require('path');

const EN_DIR = path.join(__dirname, 'src/i18n/locales/en');
const VI_DIR = path.join(__dirname, 'src/i18n/locales/vi');

function readJSON(filepath) {
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function deepSet(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  if (current[keys[keys.length - 1]] === undefined) {
    current[keys[keys.length - 1]] = value;
    return true;
  }
  return false;
}

function deepGet(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  for (const k of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[k];
  }
  return current;
}

function forceSet(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

let totalAdded = 0;
let totalFixed = 0;

// ========== PHASE 1: Add missing dynamic keys ==========

// --- employer.json ---
console.log('\n=== employer.json ===');
const enEmployer = readJSON(path.join(EN_DIR, 'employer.json'));
const viEmployer = readJSON(path.join(VI_DIR, 'employer.json'));

// Missing interview statuses
const missingEmployerStatuses = {
  'interviewLive.statuses.draft': { en: 'Draft', vi: 'Bản nháp' },
  'interviewLive.statuses.interrupted': { en: 'Interrupted', vi: 'Bị gián đoạn' },
};

for (const [key, val] of Object.entries(missingEmployerStatuses)) {
  if (deepSet(enEmployer, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viEmployer, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

// Missing interviewListCard.statuses in employer
const employerListCardStatuses = {
  'interviewListCard.statuses.draft': { en: 'Draft', vi: 'Bản nháp' },
  'interviewListCard.statuses.scheduled': { en: 'Scheduled', vi: 'Đã lên lịch' },
  'interviewListCard.statuses.calibration': { en: 'Calibration', vi: 'Kiểm tra thiết bị' },
  'interviewListCard.statuses.in_progress': { en: 'In Progress', vi: 'Đang phỏng vấn' },
  'interviewListCard.statuses.completed': { en: 'Completed', vi: 'Hoàn thành' },
  'interviewListCard.statuses.cancelled': { en: 'Cancelled', vi: 'Đã hủy' },
  'interviewListCard.statuses.interrupted': { en: 'Interrupted', vi: 'Bị gián đoạn' },
  'interviewListCard.statuses.processing': { en: 'Processing', vi: 'Đang xử lý' },
};

for (const [key, val] of Object.entries(employerListCardStatuses)) {
  if (deepSet(enEmployer, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viEmployer, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

writeJSON(path.join(EN_DIR, 'employer.json'), enEmployer);
writeJSON(path.join(VI_DIR, 'employer.json'), viEmployer);

// --- interview.json ---
console.log('\n=== interview.json ===');
const enInterview = readJSON(path.join(EN_DIR, 'interview.json'));
const viInterview = readJSON(path.join(VI_DIR, 'interview.json'));

const missingInterviewStatuses = {
  'interviewListCard.statuses.draft': { en: 'Draft', vi: 'Bản nháp' },
  'interviewListCard.statuses.calibration': { en: 'Calibration', vi: 'Kiểm tra thiết bị' },
  'interviewListCard.statuses.interrupted': { en: 'Interrupted', vi: 'Bị gián đoạn' },
};

for (const [key, val] of Object.entries(missingInterviewStatuses)) {
  if (deepSet(enInterview, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viInterview, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

writeJSON(path.join(EN_DIR, 'interview.json'), enInterview);
writeJSON(path.join(VI_DIR, 'interview.json'), viInterview);

// --- common.json ---
console.log('\n=== common.json ===');
const enCommon = readJSON(path.join(EN_DIR, 'common.json'));
const viCommon = readJSON(path.join(VI_DIR, 'common.json'));

// Add missing interviewListCard.statuses
const commonListCardStatuses = {
  'interviewListCard.statuses.draft': { en: 'Draft', vi: 'Bản nháp' },
  'interviewListCard.statuses.scheduled': { en: 'Scheduled', vi: 'Đã lên lịch' },
  'interviewListCard.statuses.calibration': { en: 'Calibration', vi: 'Kiểm tra thiết bị' },
  'interviewListCard.statuses.in_progress': { en: 'In Progress', vi: 'Đang phỏng vấn' },
  'interviewListCard.statuses.completed': { en: 'Completed', vi: 'Hoàn thành' },
  'interviewListCard.statuses.cancelled': { en: 'Cancelled', vi: 'Đã hủy' },
  'interviewListCard.statuses.interrupted': { en: 'Interrupted', vi: 'Bị gián đoạn' },
  'interviewListCard.statuses.processing': { en: 'Processing', vi: 'Đang xử lý' },
};

for (const [key, val] of Object.entries(commonListCardStatuses)) {
  if (deepSet(enCommon, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viCommon, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

// --- Phase 2: Add CVDoc keys to common.json ---
console.log('\n=== common.json (CVDoc keys) ===');
const cvDocKeys = {
  'cvDoc.labels.email': { en: 'Email:', vi: 'Email:' },
  'cvDoc.labels.phone': { en: 'Phone:', vi: 'SĐT:' },
  'cvDoc.labels.updatedAt': { en: 'Updated:', vi: 'Cập nhật:' },
  'cvDoc.labels.position': { en: 'Position:', vi: 'Vị trí:' },
  'cvDoc.labels.experience': { en: 'Experience:', vi: 'Kinh nghiệm:' },
  'cvDoc.labels.education': { en: 'Education:', vi: 'Học vấn:' },
  'cvDoc.labels.salary': { en: 'Salary:', vi: 'Mức lương:' },
  'cvDoc.labels.workplace': { en: 'Workplace:', vi: 'Nơi làm việc:' },
  'cvDoc.labels.jobType': { en: 'Job Type:', vi: 'Hình thức:' },
  'cvDoc.labels.present': { en: 'Present', vi: 'Hiện tại' },
  'cvDoc.labels.major': { en: 'Major:', vi: 'Chuyên ngành:' },
  'cvDoc.labels.languagePrefix': { en: '', vi: 'Tiếng ' },
  'cvDoc.labels.noExpiration': { en: 'No Expiration', vi: 'Không thời hạn' },
  'cvDoc.sections.generalInfo': { en: 'GENERAL INFORMATION', vi: 'THÔNG TIN CHUNG' },
  'cvDoc.sections.workExperience': { en: 'WORK EXPERIENCE', vi: 'KINH NGHIỆM LÀM VIỆC' },
  'cvDoc.sections.education': { en: 'EDUCATION', vi: 'HỌC VẤN' },
  'cvDoc.sections.skills': { en: 'PROFESSIONAL SKILLS', vi: 'KỸ NĂNG CHUYÊN MÔN' },
  'cvDoc.sections.languages': { en: 'LANGUAGES', vi: 'NGOẠI NGỮ' },
  'cvDoc.sections.certificates': { en: 'CERTIFICATES', vi: 'CHỨNG CHỈ' },
};

for (const [key, val] of Object.entries(cvDocKeys)) {
  if (deepSet(enCommon, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viCommon, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

writeJSON(path.join(EN_DIR, 'common.json'), enCommon);
writeJSON(path.join(VI_DIR, 'common.json'), viCommon);

// --- admin.json ---
console.log('\n=== admin.json ===');
const enAdmin = readJSON(path.join(EN_DIR, 'admin.json'));
const viAdmin = readJSON(path.join(VI_DIR, 'admin.json'));

const missingAdminStatuses = {
  'pages.interviews.status.draft': { en: 'Draft', vi: 'Bản nháp' },
  'pages.interviews.status.interrupted': { en: 'Interrupted', vi: 'Bị gián đoạn' },
};

for (const [key, val] of Object.entries(missingAdminStatuses)) {
  if (deepSet(enAdmin, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viAdmin, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

writeJSON(path.join(EN_DIR, 'admin.json'), enAdmin);
writeJSON(path.join(VI_DIR, 'admin.json'), viAdmin);

// --- chat.json (Phase 3: ChatPage) ---
console.log('\n=== chat.json (ChatPage slogan) ===');
const enChat = readJSON(path.join(EN_DIR, 'chat.json'));
const viChat = readJSON(path.join(VI_DIR, 'chat.json'));

const chatKeys = {
  'slogan': { en: 'New way to follow your chance.', vi: 'Cách mới để nắm bắt cơ hội của bạn.' },
  'sloganSub': { en: 'More engage, more success', vi: 'Tương tác nhiều hơn, thành công nhiều hơn' },
};

for (const [key, val] of Object.entries(chatKeys)) {
  if (deepSet(enChat, key, val.en)) { totalAdded++; console.log(`  + EN: ${key}`); }
  if (deepSet(viChat, key, val.vi)) { totalAdded++; console.log(`  + VI: ${key}`); }
}

writeJSON(path.join(EN_DIR, 'chat.json'), enChat);
writeJSON(path.join(VI_DIR, 'chat.json'), viChat);

// ========== PHASE 4: Fix untranslated values ==========
console.log('\n=== Phase 4: Fix untranslated values ===');

// --- vi/common.json ---
const viCommonFixes = {
  'footer.rightsReserved': '© {{year}} {{appName}}. Bản quyền được bảo lưu.',
};
for (const [key, val] of Object.entries(viCommonFixes)) {
  const old = deepGet(viCommon, key);
  if (old !== val) { forceSet(viCommon, key, val); totalFixed++; console.log(`  ~ VI common: ${key}`); }
}
writeJSON(path.join(VI_DIR, 'common.json'), viCommon);

// --- vi/interview.json ---
const viInterviewReread = readJSON(path.join(VI_DIR, 'interview.json'));
const viInterviewFixes = {
  'controls.mic': 'Micrô',
  'controls.camera': 'Máy ảnh',
  'controls.chat': 'Trò chuyện',
  'voiceAi.devices.microphone': 'micrô',
  'voiceAi.devices.camera': 'máy ảnh',
};
for (const [key, val] of Object.entries(viInterviewFixes)) {
  const old = deepGet(viInterviewReread, key);
  if (old !== val) { forceSet(viInterviewReread, key, val); totalFixed++; console.log(`  ~ VI interview: ${key}`); }
}
writeJSON(path.join(VI_DIR, 'interview.json'), viInterviewReread);

// --- vi/employer.json ---
const viEmployerReread = readJSON(path.join(VI_DIR, 'employer.json'));
const viEmployerFixes = {
  'employees.table.noPermissions': 'Không có quyền',
};
for (const [key, val] of Object.entries(viEmployerFixes)) {
  const old = deepGet(viEmployerReread, key);
  if (old !== val) { forceSet(viEmployerReread, key, val); totalFixed++; console.log(`  ~ VI employer: ${key}`); }
}
writeJSON(path.join(VI_DIR, 'employer.json'), viEmployerReread);

// --- vi/admin.json ---
const viAdminReread = readJSON(path.join(VI_DIR, 'admin.json'));
const viAdminFixes = {
  'pages.interviews.type.vetting': 'Sàng lọc',
  'pages.banners.active': 'Đang hoạt động',
  'pages.banners.inactive': 'Không hoạt động',
};
for (const [key, val] of Object.entries(viAdminFixes)) {
  const old = deepGet(viAdminReread, key);
  if (old !== val) { forceSet(viAdminReread, key, val); totalFixed++; console.log(`  ~ VI admin: ${key}`); }
}
writeJSON(path.join(VI_DIR, 'admin.json'), viAdminReread);

console.log(`\n✅ Done! Added ${totalAdded} keys, fixed ${totalFixed} untranslated values.`);
