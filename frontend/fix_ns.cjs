const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'src');

// Files that need useTranslation namespace fix (from report)
const nsFixes = [
  // employer namespace
  ['views/components/employers/AppliedResumeTable/index.tsx', 'common', 'employer'],
  ['views/components/employers/CompanyForm/CompanyFormFields.tsx', 'common', 'employer'],
  ['views/components/employers/InterviewDetailCard/InterviewAiEvaluationCard.tsx', 'common', 'employer'],
  ['views/components/employers/InterviewDetailCard/InterviewAnalysisPanel.tsx', 'common', 'employer'],
  ['views/components/employers/InterviewDetailCard/InterviewHrEvaluationForm.tsx', 'common', 'employer'],
  ['views/components/employers/InterviewDetailCard/InterviewInfoCard.tsx', 'common', 'employer'],
  ['views/components/employers/InterviewDetailCard/InterviewRecordingCard.tsx', 'common', 'employer'],
  ['views/components/employers/InterviewDetailCard/InterviewTranscriptPanel.tsx', 'common', 'employer'],
  ['views/components/employers/JobPostForm/JobPostFormFields.tsx', 'common', 'employer'],
  ['views/components/employers/JobPostForm/JobPostSchema.ts', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/AdvancedSkillSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/CareerGoalsSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/CertificateSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/EducationSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/ExperienceSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/GeneralInfoSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/LanguageSection.tsx', 'common', 'employer'],
  ['views/components/employers/ProfileDetailCard/PersonalInfoSection.tsx', 'common', 'employer'],
  // public namespace  
  ['views/components/defaults/JobPostSearch/index.tsx', 'common', 'public'],
  ['views/defaultPages/CompanyDetailPage/CompanyAbout.tsx', 'common', 'public'],
  ['views/defaultPages/CompanyDetailPage/CompanyHeader.tsx', 'common', 'public'],
  ['views/defaultPages/CompanyDetailPage/CompanySidebar.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/components/JobDetailActions.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/components/JobDetailContactCard.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/components/JobDetailDescriptionCard.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/components/JobDetailHeaderCard.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/components/JobDetailInfoItem.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/components/JobDetailSidebar.tsx', 'common', 'public'],
  ['views/defaultPages/JobDetailPage/index.tsx', 'common', 'public'],
  ['views/defaultPages/JobPage/index.tsx', 'common', 'public'],
  // auth namespace
  ['views/components/auths/EmployerSignUpForm/AccountInfoStep.tsx', 'common', 'auth'],
  ['views/components/auths/EmployerSignUpForm/CompanyInfoStep.tsx', 'common', 'auth'],
  // jobSeeker namespace
  ['views/components/jobSeekers/EducationDetailCard/index.tsx', 'common', 'jobSeeker'],
  // admin namespace
  ['views/adminPages/UsersPage/hooks/useUsers.ts', 'common', 'admin'],
  // interview namespace
  ['views/interviewPages/InterviewSessionPage.tsx', 'common', 'interview'],
  // candidate namespace
  ['views/jobSeekerPages/CandidateLoginPage/index.tsx', 'common', 'candidate'],
];

let fixed = 0;
for (const [relFile, oldNS, newNS] of nsFixes) {
  const fp = path.join(SRC, relFile.replace(/\//g, path.sep));
  if (!fs.existsSync(fp)) { console.log(`SKIP (not found): ${relFile}`); continue; }
  let content = fs.readFileSync(fp, 'utf8');
  
  // Try both quote styles
  const patterns = [
    [`useTranslation('${oldNS}')`, `useTranslation('${newNS}')`],
    [`useTranslation("${oldNS}")`, `useTranslation("${newNS}")`],
  ];
  
  let changed = false;
  for (const [old, rep] of patterns) {
    if (content.includes(old)) {
      content = content.replace(old, rep);
      changed = true;
      break;
    }
  }
  
  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`✅ ${relFile}: '${oldNS}' → '${newNS}'`);
    fixed++;
  } else {
    console.log(`⚠️ ${relFile}: pattern not found`);
  }
}

console.log(`\nFixed ${fixed} files`);
