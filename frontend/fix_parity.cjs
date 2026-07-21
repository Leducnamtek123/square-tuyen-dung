const fs = require('fs');
const path = require('path');
const LOCALES = path.join(__dirname, 'src', 'i18n', 'locales');

function deepSet(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ========== 1. Fix common.json EN - add missing keys ==========
const enCommon = loadJSON(path.join(LOCALES, 'en', 'common.json'));
const viCommon = loadJSON(path.join(LOCALES, 'vi', 'common.json'));

// Keys in VI but not EN (from audit)
const missingInENCommon = {
  'actions.sendOTP': 'Send OTP',
  'actions.verifyOTP': 'Verify OTP',
  'actions.changePhone': 'Change Phone',
  'actions.resendOTP': 'Resend OTP',
  'labels.notUpdated': 'Not updated',
  'labels.messages': 'Messages',
  'placeholders.allCities': 'All cities/provinces',
  'saving': 'Saving...',
  'save': 'Save',
  'deleting': 'Deleting...',
  'delete': 'Delete',
  'yes': 'Yes',
  'no': 'No',
  'saveChanges': 'Save Changes',
  'successMessage': 'Success!',
  'errorMessage': 'An error occurred!',
  'login.phone': 'Phone Number',
  'login.phoneIntro': 'Please enter your phone number to continue',
  'login.otpIntro': 'Enter the OTP code sent to your phone',
  'login.resendIn': 'Resend code in...',
  'validation.invalidDate': 'Invalid date',
  'form.phoneNumber': 'Your phone number',
  'form.otpCode': 'OTP Code',
  'loadPreviousMessages': 'Load previous messages',
  'typeAMessage': 'Type a message...',
  'chatRooms': 'Chat Rooms',
  'appliedResume.ai.viewAnalysis': 'View AI Analysis',
  'appliedResume.ai.failed': 'Analysis failed',
  'appliedResume.email.resendTooltip': 'Resend email',
  'appliedResume.email.sendTooltip': 'Send feedback',
  'companyProfile.title': 'Company Profile',
  'logo': 'Logo',
  'cover': 'Cover Image',
  'companyForm.validation.companyNameRequired': 'Company name is required',
  'interviewDetail.messages.aiAnalyzingDesc': 'AI is analyzing the profile...',
  'interviewDetail.messages.aiNeedsTrigger': 'AI analysis needs to be triggered',
  'interviewDetail.messages.noData': 'No data',
  'interviewDetail.messages.noDetails': 'No details available',
  'interviewDetail.messages.noQuestions': 'No interview questions',
  'interviewDetail.messages.noTranscript': 'No transcript',
  'interviewDetail.messages.noTranscriptDesc': 'No conversation has been recorded yet.',
  'interviewDetail.actions.triggerAi': 'Trigger Analysis',
  'interviewDetail.subtitle.analysis': 'Analysis Results',
  'interviewDetail.subtitle.questions': 'Suggested Questions',
  'interviewDetail.subtitle.transcript': 'Conversation Transcript',
  'interviewDetail.label.detailedFeedback': 'Detailed Feedback',
  'interviewDetail.label.interviewer': 'Interviewer',
  'jobPost.manageSubtitle': 'Manage post details',
  'jobPost.remaining': 'Remaining',
  'jobPostForm.section.basicInfo': 'Basic Information',
  'jobPostForm.section.location': 'Work Area',
  'jobPostForm.section.contact': 'Contact Information',
  'minimum-wage-comparison': 'Minimum wage',
  'maximum-wage-comparison': 'Maximum wage',
  'editorContent': 'Content',
  'profileDetailCard.label.issuedDate': 'Issued Date',
  'content': 'Content',
  'start-date-comparison': 'Start date',
  'end-date-comparison': 'End date',
  'questionGroupsCard.label.questionCount': 'Question count',
  'questionGroupsCard.table.noData': 'No data',
  // Also add the pagination key used in DataTable
  'pagination.rowsPerPage': 'Rows per page',
  // Error keys used in errorHandling.ts
  'errors.networkError': 'Network error. Please check your connection.',
  'errors.unauthorized': 'Unauthorized. Please log in again.',
  'errors.forbidden': 'You do not have permission to access this resource.',
  'errors.notFound': 'The requested resource was not found.',
  'errors.payloadTooLarge': 'The uploaded file is too large.',
  'errors.tooManyRequests': 'Too many requests. Please try again later.',
  'errors.serverError': 'Server error. Please try again later.',
  'errors.generic': 'An unexpected error occurred.',
  // Keys used in InterviewSessionPage
  'errors.missingInvite': 'Missing invitation',
  'errors.missingSessionId': 'Missing session ID',
  'errors.invalidSession': 'Invalid session',
  'errors.tokenMissing': 'Authentication token missing',
  // Common keys
  'common.status.unknown': 'Unknown',
  'common.na': 'N/A',
  'common.table.noData': 'No data',
};

for (const [key, val] of Object.entries(missingInENCommon)) {
  deepSet(enCommon, key, val);
}
saveJSON(path.join(LOCALES, 'en', 'common.json'), enCommon);
console.log(`✅ EN common.json: added ${Object.keys(missingInENCommon).length} keys`);

// Also add pagination.rowsPerPage to VI common
deepSet(viCommon, 'pagination.rowsPerPage', 'Số dòng mỗi trang');
saveJSON(path.join(LOCALES, 'vi', 'common.json'), viCommon);
console.log('✅ VI common.json: added pagination.rowsPerPage');

// ========== 2. Fix employer.json EN - add missing keys ==========
const enEmployer = loadJSON(path.join(LOCALES, 'en', 'employer.json'));

const missingInENEmployer = {
  'company.following': 'Following',
  'company.follow': 'Follow',
  'company.followers': 'followers',
  'company.notUpdated': 'Information not updated',
  'company.jobCount': 'jobs',
  'applyForm.resume.empty': 'Your resume is empty',
  'applyForm.resume.pleaseUpload': 'Please attach a CV or create a new one.',
  'applyForm.resume.createNow': 'Create resume now',
};

for (const [key, val] of Object.entries(missingInENEmployer)) {
  deepSet(enEmployer, key, val);
}
saveJSON(path.join(LOCALES, 'en', 'employer.json'), enEmployer);
console.log(`✅ EN employer.json: added ${Object.keys(missingInENEmployer).length} keys`);

// ========== 3. Fix jobSeeker.json EN - add missing keys ==========
const enJobSeeker = loadJSON(path.join(LOCALES, 'en', 'jobSeeker.json'));

const missingInENJobSeeker = {
  'applyForm.resume.empty': 'Your resume is empty',
  'applyForm.resume.pleaseUpload': 'Please attach a CV or create a new one.',
  'applyForm.resume.createNow': 'Create resume now',
  'company.following': 'Following',
  'company.follow': 'Follow',
  'company.followers': 'followers',
  'company.notUpdated': 'Information not updated',
  'company.jobCount': 'jobs',
};

for (const [key, val] of Object.entries(missingInENJobSeeker)) {
  deepSet(enJobSeeker, key, val);
}
saveJSON(path.join(LOCALES, 'en', 'jobSeeker.json'), enJobSeeker);
console.log(`✅ EN jobSeeker.json: added ${Object.keys(missingInENJobSeeker).length} keys`);

console.log('\n✅ All parity fixes applied!');
