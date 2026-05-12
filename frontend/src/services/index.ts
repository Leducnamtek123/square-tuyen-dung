// =============================================================================
// Services Index — Domain-based re-exports
// =============================================================================
// This file re-exports all services so existing imports still work.
// New code should import from domain subfolders:
//   import { authService } from '@/services/auth'
//   import { jobService } from '@/services/jobs'
// =============================================================================

// --- Auth & Users ---
export { default as authService } from './authService';
export { default as tokenService } from './tokenService';
export { default as userService } from './userService';

// --- Jobs ---
export { default as jobService } from './jobService';
export { default as jobPostActivityService } from './jobPostActivityService';
export { default as jobPostNotificationService } from './jobPostNotificationService';

// --- Companies & Profiles ---
export { default as companyService } from './companyService';
export { default as companyImageService } from './companyImageService';
export { default as companyTeamService } from './companyTeamService';
export { default as hrmService } from './hrmService';
export { default as companyFollowed } from './companyFollowed';
export { default as jobSeekerProfileService } from './jobSeekerProfileService';
export { default as resumeService } from './resumeService';
export { default as resumeSavedService } from './resumeSavedService';
export { default as resumeViewedService } from './resumeViewedService';
export { default as educationDetailService } from './educationDetailService';
export { default as experienceDetailService } from './experienceDetailService';
export { default as certificateService } from './certificateService';
export { default as advancedSkillService } from './advancedSkillService';
export { default as languageSkillService } from './languageSkillService';

// --- Interview ---
export { default as interviewService } from './interviewService';
export { default as questionService } from './questionService';
export { default as questionGroupService } from './questionGroupService';

// --- Admin ---
export { default as adminService } from './adminService';
export { default as adminJobService } from './adminJobService';
export { default as adminManagementService } from './adminManagementService';
export { default as adminInterviewService } from './adminInterviewService';
export { default as adminSettingsService } from './adminSettingsService';

// --- Content & Common ---
export { default as commonService } from './commonService';
export { default as contentService } from './contentService';
export { default as statisticService } from './statisticService';
export { default as mediaService } from './mediaService';

// --- External Integrations ---
export * as firebaseService from './firebaseService';
export { default as goongService } from './goongService';
export { default as chatbotService } from './chatbotService';
export { default as aiService } from './aiService';
