# I18N Namespace Fix Report

Files needing fixes: 92

## Files using WRONG namespace (need useTranslation fix)

### views/adminPages/InterviewsPage/components/InterviewTable.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('interview')`
- Wrong NS keys (20): common.status.completed, common.status.pending, common.status.inProgress, common.status.scheduled, common.status.cancelled...

### views/adminPages/UsersPage/hooks/useUsers.ts
- Current: `useTranslation('common')`
- Suggested: `useTranslation('admin')`
- Wrong NS keys (5): pages.users.toast.blockSuccess, pages.users.toast.unblockSuccess, pages.users.toast.actionFailed, pages.users.toast.roleUpdated, pages.users.toast.roleUpdateFailed

### views/components/auths/EmployerSignUpForm/AccountInfoStep.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('auth')`
- Wrong NS keys (8): form.fullName, form.fullNamePlaceholder, form.email, form.emailPlaceholder, form.password...

### views/components/auths/EmployerSignUpForm/CompanyInfoStep.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('auth')`
- Wrong NS keys (22): form.companyName, form.companyNamePlaceholder, form.companyEmail, form.companyEmailPlaceholder, form.companyPhone...

### views/components/defaults/JobPostSearch/index.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (15): jobSearch.searchPlaceholder, jobSearch.allCareers, jobSearch.allCities, jobSearch.searchButton, jobSearch.advancedFilter...

### views/components/employers/AppliedResumeTable/index.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (15): appliedResume.table.profileName, appliedResume.table.onlineResume, appliedResume.table.attachedResume, appliedResume.table.notUpdated, appliedResume.table.appliedPosition...

### views/components/employers/CompanyForm/CompanyFormFields.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (34): companyForm.title.companyname, companyForm.placeholder.entercompanyname, companyForm.title.taxcode, companyForm.placeholder.entercompanytaxcode, companyForm.title.companysize...

### views/components/employers/InterviewDetailCard/InterviewAiEvaluationCard.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (7): interviewDetail.subtitle.aiEvaluation, interviewDetail.label.technicalScore, interviewDetail.label.communicationScore, interviewDetail.messages.aiGenerating, interviewDetail.actions.retryAi...

### views/components/employers/InterviewDetailCard/InterviewHrEvaluationForm.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (10): interviewDetail.actions.hrEvaluation, interviewDetail.actions.attitudeScore, interviewDetail.actions.professionalScore, interviewDetail.actions.resultLabel, interviewDetail.actions.pending...

### views/components/employers/InterviewDetailCard/InterviewInfoCard.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (5): interviewDetail.subtitle.info, interviewDetail.label.candidate, interviewDetail.label.position, interviewDetail.label.type, interviewDetail.label.schedule

### views/components/employers/InterviewDetailCard/InterviewRecordingCard.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (2): interviewDetail.subtitle.recording, interviewDetail.actions.openRecording

### views/components/employers/JobPostForm/JobPostFormFields.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (40): jobPostForm.warning, jobPostForm.title.jobtitle, jobPostForm.placeholder.enterjobtitle, jobPostForm.title.career, jobPostForm.placeholder.selectcareer...

### views/components/employers/JobPostForm/JobPostSchema.ts
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (51): jobPostForm.validation.jobnameisrequired, jobPostForm.validation.jobnameexceededallowedlength, jobPostForm.validation.careerisrequired, jobPostForm.validation.careerisrequired, jobPostForm.validation.positionisrequired...

### views/components/employers/ProfileDetailCard/AdvancedSkillSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (1): profileDetailCard.title.advancedSkills

### views/components/employers/ProfileDetailCard/CareerGoalsSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (1): profileDetailCard.title.careerGoals
- Truly missing (1): common:labels.notUpdated

### views/components/employers/ProfileDetailCard/CertificateSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (1): profileDetailCard.title.certificates

### views/components/employers/ProfileDetailCard/EducationSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (2): profileDetailCard.title.education, profileDetailCard.label.major
- Truly missing (1): common:labels.present

### views/components/employers/ProfileDetailCard/ExperienceSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (1): profileDetailCard.title.workExperience
- Truly missing (2): common:labels.present, common:labels.notUpdated

### views/components/employers/ProfileDetailCard/GeneralInfoSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (10): profileDetailCard.title.generalInfo, profileDetailCard.label.desiredPosition, profileDetailCard.label.desiredLevel, profileDetailCard.label.educationLevel, profileDetailCard.label.experience...

### views/components/employers/ProfileDetailCard/LanguageSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (1): profileDetailCard.title.languages

### views/components/employers/ProfileDetailCard/PersonalInfoSection.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('employer')`
- Wrong NS keys (8): profileDetailCard.title.personalInfo, profileDetailCard.label.phone, profileDetailCard.label.gender, profileDetailCard.label.dob, profileDetailCard.label.maritalStatus...
- Truly missing (1): common:labels.email

### views/components/jobSeekers/EducationDetailCard/index.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('jobSeeker')`
- Wrong NS keys (10): profile.messages.educationAddSuccess, profile.messages.educationUpdateSuccess, profile.messages.educationDeleteSuccess, profile.messages.deleteConfirmTitle, profile.sections.education...
- Truly missing (2): common:actions.add, common:noData

### views/defaultPages/CompanyDetailPage/CompanyAbout.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (2): companyDetail.about, companyDetail.notUpdated

### views/defaultPages/CompanyDetailPage/CompanyHeader.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (6): companyDetail.notUpdated, companyDetail.since, companyDetail.shareWithQr, companyDetail.followed, companyDetail.follow...

### views/defaultPages/CompanyDetailPage/CompanySidebar.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (7): companyDetail.website, companyDetail.notUpdated, companyDetail.followAt, companyDetail.generalInfo, companyDetail.notUpdated...

### views/defaultPages/JobDetailPage/components/JobDetailActions.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (5): jobDetail.actions.applied, jobDetail.actions.apply, jobDetail.actions.saved, jobDetail.actions.save, jobDetail.actions.share

### views/defaultPages/JobDetailPage/components/JobDetailContactCard.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (10): jobDetail.contactInfo, jobDetail.contactPerson, jobDetail.notUpdated, jobDetail.contactEmail, jobDetail.notUpdated...

### views/defaultPages/JobDetailPage/components/JobDetailDescriptionCard.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (9): jobDetail.description, jobDetail.requirements, jobDetail.benefits, jobDetail.career, jobDetail.workplaceType...

### views/defaultPages/JobDetailPage/components/JobDetailHeaderCard.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (8): jobDetail.notUpdated, jobDetail.deadline, jobDetail.views, jobDetail.postedDate, jobDetail.salary...

### views/defaultPages/JobDetailPage/components/JobDetailInfoItem.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (1): jobDetail.notUpdated

### views/defaultPages/JobDetailPage/components/JobDetailSidebar.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (1): jobDetail.similarJobs

### views/defaultPages/JobDetailPage/index.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (5): jobDetail.savedSuccess, jobDetail.unsavedSuccess, jobDetail.noData, jobDetail.actions.applied, jobDetail.actions.apply

### views/defaultPages/JobPage/index.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('public')`
- Wrong NS keys (2): jobSearch.tabTitle, jobSearch.recommendedJobs

### views/interviewPages/InterviewSessionPage.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('interview')`
- Wrong NS keys (15): unavailableTitle, readyTitle, interviewDetail.title, errors.missingInvite, errors.missingSessionId...
- Truly missing (5): common:actions.backHome, common:labels.job, common:actions.back, common:actions.backHome, common:labels.time

### views/jobSeekerPages/CandidateLoginPage/index.tsx
- Current: `useTranslation('common')`
- Suggested: `useTranslation('candidate')`
- Wrong NS keys (3): login.title, login.body, login.label
- Truly missing (1): common:actions.joinNow

## Truly missing keys (need to be added to JSON)

### Namespace: common (530 keys)
- `common:errorBoundary.title`
- `common:errorBoundary.message`
- `common:errorBoundary.copyError`
- `common:errorBoundary.retry`
- `common:errorBoundary.reload`
- `chat:chatbot.greeting.employer`
- `chat:chatbot.greeting.jobSeeker`
- `chat:chatbot.systemPrompt.employer`
- `chat:chatbot.systemPrompt.jobSeeker`
- `chat:chatbot.error.apology`
- `chat:chatbot.error.busy`
- `chat:chatbot.error.tryAgainLater`
- `chat:chatbot.launcherAria`
- `chat:chatbot.status`
- `chat:chatbot.closeAria`
- `chat:chatbot.placeholder`
- `chat:send`
- `chat:chatbot.retry`
- `common:labels.notUpdated`
- `employer:profileCard.label.yearsOld`
- `employer:profileCard.label.lastViewed`
- `employer:profileCard.actions.unsave`
- `employer:profileCard.actions.save`
- `employer:profileCard.actions.viewProfile`
- `employer:profileCard.label.updatedAt`
- `employer:profileCard.label.viewsCount`
- `admin:sidebar.systemOverview`
- `admin:sidebar.systemAndUsers`
- `admin:sidebar.usersAndPermissions`
- `admin:sidebar.systemConfiguration`
- `admin:sidebar.generalCategories`
- `admin:sidebar.careersManagement`
- `admin:sidebar.citiesManagement`
- `admin:sidebar.districtsManagement`
- `admin:sidebar.wardsManagement`
- `admin:sidebar.contentManagement`
- `admin:sidebar.bannersManagement`
- `admin:sidebar.feedbacksManagement`
- `admin:sidebar.chatWithEmployers`
- `admin:sidebar.infoAndProfiles`
- `admin:sidebar.companyManagement`
- `admin:sidebar.candidateProfiles`
- `admin:sidebar.resumeManagement`
- `admin:sidebar.recruitmentAndInterviews`
- `admin:sidebar.jobPosts`
- `admin:sidebar.activityLogs`
- `admin:sidebar.questionBank`
- `admin:sidebar.interviewQuestionSets`
- `admin:sidebar.interviewSchedule`
- `admin:sidebar.interviewLive`
- `admin:sidebar.jobNotifications`
- `employer:sidebar.dashboard`
- `employer:sidebar.jobPostList`
- `employer:sidebar.candidateManagement`
- `employer:sidebar.appliedApplications`
- `employer:sidebar.savedProfiles`
- `employer:sidebar.findCandidates`
- `employer:sidebar.onlineInterviews`
- `employer:sidebar.interviewList`
- `employer:sidebar.interviewLive`
- `employer:sidebar.questionBank`
- `employer:sidebar.questionSets`
- `employer:sidebar.notifications`
- `employer:sidebar.accountManagement`
- `employer:sidebar.companyInfo`
- `employer:sidebar.employerVerification`
- `employer:sidebar.account`
- `employer:sidebar.settings`
- `employer:sidebar.employeeRoles`
- `jobSeeker:nav.myDashboard`
- `jobSeeker:nav.profile`
- `jobSeeker:nav.jobs`
- `jobSeeker:nav.myCompany`
- `jobSeeker:nav.myInterviews`
- `jobSeeker:nav.notifications`
- `jobSeeker:nav.accountSettings`
- `common:errors.networkError`
- `common:errors.unauthorized`
- `common:errors.forbidden`
- `common:errors.notFound`
- `common:errors.payloadTooLarge`
- `common:errors.tooManyRequests`
- `common:errors.serverError`
- `common:errors.generic`
- `common:labels.uncategorized`
- `admin:pages.wards.toast.addSuccess`
- `admin:pages.wards.toast.addError`
- `admin:pages.wards.toast.updateSuccess`
- `admin:pages.wards.toast.updateError`
- `admin:pages.wards.toast.deleteSuccess`
- `admin:pages.wards.toast.deleteError`
- `auth:login.adminTitle`
- `admin:login.slide1Title`
- `admin:login.slide1Subtitle`
- `admin:login.slide2Title`
- `admin:login.slide2Subtitle`
- `admin:login.slide3Title`
- `admin:login.slide3Subtitle`
- `auth:messages.loginError`
- `auth:messages.tryAgain`
- `auth:messages.noAdminAccount`
- `auth:login.headingAdmin`
- `auth:login.welcomeBack`
- `auth:login.errorTitle`
- `auth:login.visitPage`
- `common:search`
- `common:placeholders.fieldOperation.all`
- `common:placeholders.selectCity`
- `employer:appliedResume.status.updateSuccess`
- `employer:appliedResume.delete.success`
- `employer:appliedResume.delete.title`
- `employer:appliedResume.delete.confirm`
- `employer:appliedResume.manageSubtitle`
- `employer:appliedResume.downloadList`
- `employer:appliedResume.filters`
- `employer:appliedResume.allJobPosts`
- `employer:appliedResume.allStatuses`
- `common:reset`
- `employer:appliedResume.advancedFilter`
- `interview:employer.questions.textRequired`
- `interview:employer.questions.updateSuccess`
- `interview:employer.questions.createSuccess`
- `interview:interviewCreateCard.messages.updateSuccess`
- `interview:interviewCreateCard.messages.scheduleSuccess`
- `interview:interviewCreateCard.title.editOnlineInterview`
- `interview:interviewCreateCard.title.scheduleOnlineInterview`
- `interview:interviewCreateCard.description.schedulingHelper`
- `interview:interviewCreateCard.label.basicInfo`
- `interview:interviewCreateCard.validation.selectJobPost`
- `interview:interviewCreateCard.label.selectjobpost`
- `interview:interviewCreateCard.validation.selectCandidate`
- `interview:interviewCreateCard.label.selectcandidate`
- `interview:interviewCreateCard.title.scheduledtime`
- `interview:interviewCreateCard.label.questions`
- `interview:interviewCreateCard.label.selectquestiongroupoptional`
- `interview:interviewCreateCard.helperText.selectaquestiongrouptoautomaticallyfillthequestions below`
- `common:none`
- `interview:interviewCreateCard.label.selectinterviewquestions`
- `interview:interviewCreateCard.label.selectquestions`
- `interview:employer.questions.add`
- `interview:employer.questions.edit`
- `common:cancel`
- `common:save`
- `interview:interviewCreateCard.scheduleNow`
- `interview:employer.questions.editTitle`
- `interview:employer.questions.createTitle`
- `interview:employer.questions.textLabel`
- `interview:interviewDetail.messages.evaluationSuccess`
- `interview:interviewDetail.messages.aiTriggerSuccess`
- `interview:interviewDetail.messages.notFound`
- `interview:interviewDetail.messages.notFoundDesc`
- `interview:interviewDetail.actions.backToList`
- `interview:interviewDetail.title`
- `interview:interviewDetail.label.roomCode`
- `interview:interviewDetail.tooltips.cannotJoin`
- `common:actions.joinNow`
- `common:labels.messages`
- `interview:interviewListCard.title`
- `interview:interviewListCard.messages.deleteSuccess`
- `interview:interviewListCard.confirmDeleteTitle`
- `interview:interviewListCard.confirmDeleteMessage`
- `interview:interviewListCard.messages.cancelSuccess`
- `interview:interviewListCard.confirmCancelTitle`
- `interview:interviewListCard.confirmCancelMessage`
- `interview:interviewListCard.candidate`
- `interview:interviewListCard.position`
- `interview:interviewListCard.time`
- `interview:interviewListCard.status`
- `interview:interviewListCard.aiScore`
- `interview:interviewListCard.grading`
- `common:actions`
- `common:view`
- `interview:interviewListCard.editInterview`
- `interview:interviewListCard.cancelInterview`
- `interview:interviewListCard.deleteInterview`
- `interview:interviewListCard.description`
- `interview:interviewListCard.scheduleInterview`
- `interview:interviewListCard.noInterviews`
- `employer:profileSearch.placeholder.enterkeywords`
- `employer:profileSearch.placeholder.selectcityprovince`
- `employer:profileSearch.label.search`
- `employer:profileSearch.title.advancedFilters`
- `employer:profileSearch.label.clearFilters`
- `employer:profileSearch.label.careers`
- `employer:profileSearch.placeholder.allcareers`
- `employer:profileSearch.label.experience`
- `employer:profileSearch.placeholder.allexperience`
- `employer:profileSearch.label.position`
- `employer:profileSearch.placeholder.allpositions`
- `employer:profileSearch.label.academicLevel`
- `employer:profileSearch.placeholder.allacademiclevels`
- `employer:profileSearch.label.workplace`
- `employer:profileSearch.placeholder.allworkplaces`
- `employer:profileSearch.label.employmentType`
- `employer:profileSearch.placeholder.allemploymenttypes`
- `employer:profileSearch.label.gender`
- `employer:profileSearch.placeholder.allgenders`
- `employer:profileSearch.label.maritalStatus`
- `employer:profileSearch.placeholder.allmaritalstatuses`
- `interview:employer.questionBank.title`
- `interview:employer.questionBank.textRequired`
- `interview:employer.questionBank.updateSuccess`
- `interview:employer.questionBank.createSuccess`
- `interview:employer.questionBank.deleteSuccess`
- `interview:employer.questionBank.deleteTitle`
- `interview:employer.questionBank.deleteConfirm`
- `interview:employer.questionBank.columns.text`
- `common:actions.edit`
- `common:actions.delete`
- `interview:employer.questionBank.add`
- `interview:employer.questionBank.noData`
- `interview:employer.questionBank.editTitle`
- `interview:employer.questionBank.createTitle`
- `interview:employer.questionBank.textLabel`
- `interview:employer.questionBank.hint`
- `common:actions.cancel`
- `common:actions.save`
- `employer:questionGroupsCard.title`
- `employer:questionGroupsCard.messages.createSuccess`
- `employer:questionGroupsCard.messages.updateSuccess`
- `employer:questionGroupsCard.messages.deleteSuccess`
- `employer:questionGroupsCard.dialog.confirmDeleteTitle`
- `employer:questionGroupsCard.dialog.confirmDeleteMessage`
- `employer:questionGroupsCard.table.groupName`
- `employer:questionGroupsCard.table.numberOfQuestions`
- `employer:questionGroupsCard.table.description`
- `common:breadcrumbs.employer`
- `employer:questionGroupsCard.onlineInterview`
- `employer:questionGroupsCard.questionGroups`
- `employer:questionGroupsCard.actions.addGroup`
- `employer:questionGroupsCard.placeholder.searchquestiongroups`
- `employer:questionGroupsCard.noData`
- `employer:questionGroupsCard.dialog.addTitle`
- `employer:questionGroupsCard.dialog.editTitle`
- `employer:questionGroupsCard.label.questiongroupname`
- `employer:questionGroupsCard.label.description`
- `employer:questionGroupsCard.label.selectquestions`
- `employer:questionGroupsCard.actions.createNewQuestion`
- `employer:questionGroupsCard.dialog.createNewQuestion`
- `employer:questionGroupsCard.label.questioncontent`
- `employer:savedResume.messages.unsaveSuccess`
- `employer:savedResume.confirmUnsaveTitle`
- `employer:savedResume.confirmUnsaveMessage`
- `employer:savedResume.manageSubtitle`
- `employer:savedResume.downloadList`
- `employer:savedResume.filters`
- `employer:savedResumeFilterForm.placeholder.enterjobpostorcandidatename`
- `employer:savedResumeFilterForm.placeholder.entermaximumsalary`
- `employer:savedResumeFilterForm.placeholder.selectexperience`
- `employer:savedResumeFilterForm.placeholder.selectlocation`
- `employer:savedResumeFilterForm.title.reset`
- `employer:savedResumeFilterForm.label.refresh`
- `employer:savedResumeFilterForm.label.search`
- `employer:savedResumeTable.label.resumeTitle`
- `common:notUpdated`
- `employer:savedResumeTable.label.candidateName`
- `employer:savedResumeTable.label.salary`
- `employer:savedResumeTable.label.experience`
- `employer:savedResumeTable.label.cityProvince`
- `employer:savedResumeTable.label.savedDate`
- `employer:savedResumeTable.label.actions`
- `employer:savedResumeTable.title.viewprofile`
- `employer:savedResumeTable.label.unsave`
- `employer:savedResumeTable.title.youhaventsavedanycandidatesyet`
- `jobSeeker:profile.messages.skillAddSuccess`
- `jobSeeker:profile.messages.skillUpdateSuccess`
- `jobSeeker:profile.messages.skillDeleteSuccess`
- `jobSeeker:profile.messages.deleteConfirmTitle`
- `jobSeeker:profile.sections.skills`
- `jobSeeker:profile.messages.deleteConfirmWarning`
- `common:actions.add`
- `jobSeeker:profile.fields.skill`
- `jobSeeker:profile.fields.level`
- `jobSeeker:profile.fields.actions`
- `jobSeeker:profile.messages.noSkillData`
- `jobSeeker:profile.validation.skillNameRequired`
- `jobSeeker:profile.validation.skillNameMax`
- `jobSeeker:profile.validation.levelRequired`
- `jobSeeker:profile.fields.skillName`
- `jobSeeker:profile.placeholders.skillName`
- `jobSeeker:jobManagement.empty.applied`
- `jobSeeker:jobManagement.actions.searchJobs`
- `jobSeeker:jobManagement.appliedOn`
- `jobSeeker:jobApplication.onlineProfile`
- `jobSeeker:jobApplication.attachedResume`
- `jobSeeker:profile.messages.profileStatusUpdateSuccess`
- `common:status.searchable`
- `jobSeeker:profile.tooltips.searchable`
- `common:loading`
- `common:actions.download`
- `jobSeeker:profile.actions.generatingPdf`
- `jobSeeker:notUpdated`
- `jobSeeker:profile.summary.experience`
- `jobSeeker:profile.summary.position`
- `jobSeeker:profile.summary.desiredSalary`
- `jobSeeker:profile.summary.lastUpdated`
- `jobSeeker:profile.messages.profileCompletionWarning`
- `jobSeeker:profile.actions.editProfile`
- `jobSeeker:profile.messages.certificateAddSuccess`
- `jobSeeker:profile.messages.certificateUpdateSuccess`
- `jobSeeker:profile.messages.certificateDeleteSuccess`
- `jobSeeker:profile.sections.certificates`
- `jobSeeker:profile.messages.noCertificateData`
- `jobSeeker:profile.fields.noExpiration`
- `jobSeeker:profile.validation.certificateNameRequired`
- `jobSeeker:profile.validation.certificateNameMax`
- `jobSeeker:profile.validation.trainingPlaceRequired`
- `jobSeeker:profile.validation.trainingPlaceMax`
- `jobSeeker:profile.validation.startDateRequired`
- `jobSeeker:profile.fields.certificateName`
- `jobSeeker:profile.placeholders.certificateName`
- `jobSeeker:profile.fields.trainingPlace`
- `jobSeeker:profile.placeholders.trainingPlace`
- `jobSeeker:profile.fields.startDate`
- `jobSeeker:profile.fields.expirationDate`
- `jobSeeker:myCompany.messages.unfollowSuccess`
- `jobSeeker:myCompany.empty.followed`
- `jobSeeker:myCompany.actions.findCompanies`
- `jobSeeker:myCompany.actions.unfollow`
- `jobSeeker:myCompany.empty.viewed`
- `jobSeeker:myCompany.savedProfile`
- `jobSeeker:profile.messages.resumeUploadSuccess`
- `jobSeeker:profile.actions.uploadCv`
- `jobSeeker:profile.cv.loading`
- `jobSeeker:profile.cv.emptyTitle`
- `jobSeeker:profile.cv.emptySubtitle`
- `jobSeeker:profile.cv.loadingPreview`
- `jobSeeker:profile.cv.updateTitle`
- `jobSeeker:profile.validation.fileRequired`
- `jobSeeker:profile.fields.cvFile`
- `jobSeeker:profile.validation.degreeNameRequired`
- `jobSeeker:profile.validation.degreeNameMax`
- `jobSeeker:profile.validation.majorRequired`
- `jobSeeker:profile.validation.majorMax`
- `jobSeeker:profile.validation.gradeOrRankMax`
- `jobSeeker:profile.fields.degreeName`
- `jobSeeker:profile.placeholders.degreeName`
- `jobSeeker:profile.fields.major`
- `jobSeeker:profile.placeholders.major`
- `jobSeeker:profile.fields.completedDate`
- `jobSeeker:profile.fields.gradeOrRank`
- `jobSeeker:profile.placeholders.gradeOrRank`
- `jobSeeker:profile.fields.additionalDescription`
- `jobSeeker:profile.placeholders.additionalDescription`
- `jobSeeker:profile.messages.experienceAddSuccess`
- `jobSeeker:profile.messages.experienceUpdateSuccess`
- `jobSeeker:profile.messages.experienceDeleteSuccess`
- `jobSeeker:profile.sections.experience`
- `jobSeeker:profile.messages.noExperienceData`
- `jobSeeker:profile.fields.present`
- `jobSeeker:profile.fields.description`
- `common:noData`
- `jobSeeker:profile.validation.jobTitleRequired`
- `jobSeeker:profile.validation.jobTitleMax`
- `jobSeeker:profile.validation.companyNameRequired`
- `jobSeeker:profile.validation.companyNameMax`
- `jobSeeker:profile.validation.startDateYesterday`
- `jobSeeker:profile.validation.startDateComparison`
- `jobSeeker:profile.validation.endDateRequired`
- `jobSeeker:profile.validation.endDateToday`
- `jobSeeker:profile.validation.endDateComparison`
- `jobSeeker:profile.validation.lastSalaryInvalid`
- `jobSeeker:profile.validation.leaveReasonMax`
- `jobSeeker:profile.validation.descriptionMax`
- `jobSeeker:profile.placeholders.jobTitle`
- `jobSeeker:profile.fields.jobTitle`
- `jobSeeker:profile.fields.companyName`
- `jobSeeker:profile.placeholders.companyName`
- `jobSeeker:profile.fields.endDate`
- `jobSeeker:profile.fields.lastSalary`
- `jobSeeker:profile.placeholders.lastSalary`
- `jobSeeker:profile.fields.leaveReason`
- `jobSeeker:profile.placeholders.leaveReason`
- `jobSeeker:profile.messages.profileUpdateSuccess`
- `jobSeeker:profile.messages.notFound`
- `jobSeeker:profile.fields.objective`
- `jobSeeker:profile.fields.skillsSummary`
- `jobSeeker:profile.fields.desiredPosition`
- `jobSeeker:profile.fields.desiredLevel`
- `jobSeeker:profile.fields.academicLevel`
- `jobSeeker:profile.fields.experience`
- `jobSeeker:profile.fields.career`
- `jobSeeker:profile.fields.workLocation`
- `jobSeeker:profile.fields.desiredSalary`
- `jobSeeker:profile.fields.expectedSalary`
- `jobSeeker:profile.fields.workplaceType`
- `jobSeeker:profile.fields.jobType`
- `jobSeeker:profile.sections.resume`
- `jobSeeker:profile.validation.desiredPositionRequired`
- `jobSeeker:profile.validation.desiredPositionMax`
- `jobSeeker:profile.validation.desiredLevelRequired`
- `jobSeeker:profile.validation.academicLevelRequired`
- `jobSeeker:profile.validation.experienceRequired`
- `jobSeeker:profile.validation.careerRequired`
- `jobSeeker:profile.validation.cityRequired`
- `jobSeeker:profile.validation.salaryMinRequired`
- `jobSeeker:profile.validation.salaryMinInvalid`
- `jobSeeker:profile.validation.salaryMinComparison`
- `jobSeeker:profile.validation.salaryMaxRequired`
- `jobSeeker:profile.validation.salaryMaxInvalid`
- `jobSeeker:profile.validation.salaryMaxComparison`
- `jobSeeker:profile.validation.expectedSalaryInvalid`
- `jobSeeker:profile.validation.workplaceTypeRequired`
- `jobSeeker:profile.validation.jobTypeRequired`
- `jobSeeker:profile.validation.objectiveRequired`
- `jobSeeker:profile.validation.objectiveMax`
- `jobSeeker:profile.validation.skillsSummaryMax`
- `jobSeeker:profile.placeholders.desiredPosition`
- `jobSeeker:profile.placeholders.selectLevel`
- `jobSeeker:profile.placeholders.selectAcademicLevel`
- `jobSeeker:profile.placeholders.selectExperience`
- `jobSeeker:profile.placeholders.selectCareer`
- `jobSeeker:profile.fields.city`
- `jobSeeker:profile.placeholders.selectCity`
- `jobSeeker:profile.fields.salaryMin`
- `jobSeeker:profile.placeholders.salaryMin`
- `jobSeeker:profile.fields.salaryMax`
- `jobSeeker:profile.placeholders.salaryMax`
- `jobSeeker:profile.placeholders.expectedSalary`
- `jobSeeker:profile.placeholders.selectWorkplaceType`
- `jobSeeker:profile.placeholders.selectJobType`
- `jobSeeker:profile.placeholders.objective`
- `jobSeeker:profile.placeholders.skillsSummary`
- `jobSeeker:jobApplication.title`
- `jobSeeker:jobApplication.aria.navigateToProfile`
- `common:lastModified`
- `common:status.notSearchable`
- `jobSeeker:jobManagement.notifications.updatedSuccess`
- `jobSeeker:jobManagement.notifications.addedSuccess`
- `jobSeeker:jobManagement.notifications.deletedSuccess`
- `jobSeeker:jobManagement.notifications.deleteTitle`
- `jobSeeker:jobManagement.notifications.deleteWarning`
- `jobSeeker:jobManagement.notifications.title`
- `jobSeeker:jobManagement.notifications.subtitle`
- `jobSeeker:jobManagement.notifications.create`
- `jobSeeker:jobManagement.notifications.empty`
- `jobSeeker:jobManagement.notifications.createNow`
- `jobSeeker:jobManagement.notifications.modalTitle`
- `jobSeeker:jobManagement.notifications.form.validation.keywordRequired`
- `jobSeeker:jobManagement.notifications.form.validation.keywordMax`
- `jobSeeker:jobManagement.notifications.form.validation.careerRequired`
- `jobSeeker:jobManagement.notifications.form.validation.cityRequired`
- `jobSeeker:jobManagement.notifications.form.validation.salaryInvalid`
- `jobSeeker:jobManagement.notifications.form.keyword`
- `jobSeeker:jobManagement.notifications.form.keywordPlaceholder`
- `jobSeeker:jobManagement.notifications.form.career`
- `jobSeeker:jobManagement.notifications.form.careerPlaceholder`
- `jobSeeker:jobManagement.notifications.form.city`
- `jobSeeker:jobManagement.notifications.form.cityPlaceholder`
- `jobSeeker:jobManagement.notifications.form.position`
- `jobSeeker:jobManagement.notifications.form.positionPlaceholder`
- `jobSeeker:jobManagement.notifications.form.experience`
- `jobSeeker:jobManagement.notifications.form.experiencePlaceholder`
- `jobSeeker:jobManagement.notifications.form.salary`
- `jobSeeker:jobManagement.notifications.form.salaryPlaceholder`
- `jobSeeker:jobManagement.notifications.form.frequency`
- `jobSeeker:profile.messages.languageAddSuccess`
- `jobSeeker:profile.messages.languageUpdateSuccess`
- `jobSeeker:profile.messages.languageDeleteSuccess`
- `jobSeeker:profile.sections.language`
- `jobSeeker:profile.fields.language`
- `jobSeeker:profile.messages.noLanguageData`
- `jobSeeker:profile.validation.languageRequired`
- `jobSeeker:profile.placeholders.selectLanguage`
- `jobSeeker:profile.messages.personalUpdateSuccess`
- `jobSeeker:profile.fields.fullName`
- `jobSeeker:profile.fields.phone`
- `jobSeeker:profile.fields.gender`
- `jobSeeker:profile.fields.birthday`
- `jobSeeker:profile.fields.maritalStatus`
- `common:city`
- `jobSeeker:profile.fields.district`
- `jobSeeker:profile.fields.address`
- `jobSeeker:profile.sections.personal`
- `jobSeeker:profile.validation.fullNameRequired`
- `jobSeeker:profile.validation.fullNameMax`
- `jobSeeker:profile.validation.phoneRequired`
- `jobSeeker:profile.validation.phoneInvalid`
- `jobSeeker:profile.validation.phoneMax`
- `jobSeeker:profile.validation.birthdayRequired`
- `jobSeeker:profile.validation.birthdayInvalid`
- `jobSeeker:profile.validation.genderRequired`
- `jobSeeker:profile.validation.fieldMax`
- `jobSeeker:profile.validation.maritalStatusRequired`
- `jobSeeker:profile.validation.districtRequired`
- `jobSeeker:profile.validation.addressRequired`
- `jobSeeker:profile.validation.addressMax`
- `jobSeeker:profile.fields.idCardNumber`
- `jobSeeker:profile.fields.idCardIssuePlace`
- `jobSeeker:profile.fields.taxCode`
- `jobSeeker:profile.fields.socialInsuranceNo`
- `jobSeeker:profile.fields.permanentAddress`
- `jobSeeker:profile.fields.contactAddress`
- `jobSeeker:profile.fields.emergencyContactName`
- `jobSeeker:profile.fields.emergencyContactPhone`
- `jobSeeker:profile.placeholders.fullName`
- `jobSeeker:profile.placeholders.idCardNumber`
- `jobSeeker:profile.fields.idCardIssueDate`
- `jobSeeker:profile.placeholders.idCardIssuePlace`
- `jobSeeker:profile.placeholders.taxCode`
- `jobSeeker:profile.placeholders.socialInsuranceNo`
- `jobSeeker:profile.placeholders.permanentAddress`
- `jobSeeker:profile.placeholders.contactAddress`
- `jobSeeker:profile.placeholders.emergencyContactName`
- `jobSeeker:profile.placeholders.emergencyContactPhone`
- `jobSeeker:profile.messages.resumeDeleteSuccess`
- `jobSeeker:attachedProfile.sections.cv`
- `jobSeeker:profile.messages.noResumeData`
- `jobSeeker:attachedProfile.sidebar.cv`
- `jobSeeker:jobManagement.messages.saved`
- `jobSeeker:jobManagement.messages.unsaved`
- `jobSeeker:jobManagement.empty.saved`
- `jobSeeker:jobManagement.actions.unsave`
- `jobSeeker:myInterviewsTitle`
- `common:status.scheduled`
- `common:status.inProgress`
- `common:status.completed`
- `common:status.cancelled`
- `errors:systemErrorTitle`
- `jobSeeker:noInterviewsTitle`
- `jobSeeker:myInterviews.defaultRoomName`
- `common:labels.time`
- `jobSeeker:myInterviews.aiInterview`
- `jobSeeker:myInterviews.liveInterview`
- `common:labels.job`
- `jobSeeker:profile.title`
- `jobSeeker:profile.appProfile`
- `jobSeeker:profile.attachedResumes`
- `jobSeeker:profile.whoViewed`
- `common:viewDetails`

### Namespace: admin (1 keys)
- `pages.jobs.table.status`

### Namespace: employer (14 keys)
- `common:actions.change`
- `common:actions.saveChanges`
- `common:validation.max255`
- `common:validation.max30`
- `common:actions.preview`
- `common:actions.delete`
- `common:actions.upload`
- `common:labels.notUpdated`
- `common:labels.present`
- `common:labels.viewAttachedResume`
- `common:messages.loadingPdf`
- `common:labels.email`
- `common:buttons.back`
- `common:labels.back`

### Namespace: jobSeeker (2 keys)
- `common:actions.add`
- `common:noData`

### Namespace: interview (4 keys)
- `common:actions.backHome`
- `common:labels.job`
- `common:actions.back`
- `common:labels.time`

### Namespace: candidate (1 keys)
- `common:actions.joinNow`

## Auto-fixing namespace issues...


Total files auto-fixed: 0