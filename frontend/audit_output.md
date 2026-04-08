# I18N Audit Report

- Total source files scanned: 587
- Total translation key usages found: 2549

## Missing keys in EN (21 keys)

| # | Namespace | Key | Used In |
|---|-----------|-----|---------|
| 1 | common | `choices.${option.name}` | components/Common/Controls/MultiSelectCustom/index.tsx, components/Common/Controls/MultiSelectSearchCustom/index.tsx, components/Common/Controls/SingleSelectCustom/index.tsx, components/Common/Controls/SingleSelectSearchCustom/index.tsx, views/components/defaults/JobPostSearch/index.tsx |
| 2 | common | `choices.${val}` | utils/tConfig.ts |
| 3 | admin | `pages.interviews.status.${val}` | views/adminPages/InterviewsPage/index.tsx |
| 4 | admin | `pages.interviews.status.${st}` | views/adminPages/InterviewsPage/index.tsx |
| 5 | admin | `pages.jobActivity.statusOptions.${status === 1 ? ` | views/adminPages/JobActivityPage/index.tsx |
| 6 | admin | `pages.jobs.table.status` | views/adminPages/JobsPage/index.tsx |
| 7 | common | `${prefix}.${option.id}` | views/components/defaults/JobPostSearch/index.tsx |
| 8 | employer | `applicationChart.labels.${title2Key}` | views/components/employers/charts/ApplicationChart/index.tsx |
| 9 | employer | `applicationChart.labels.${title1Key}` | views/components/employers/charts/ApplicationChart/index.tsx |
| 10 | employer | `candidateChart.labels.${title1Key}` | views/components/employers/charts/CandidateChart/index.tsx |
| 11 | employer | `candidateChart.labels.${title2Key}` | views/components/employers/charts/CandidateChart/index.tsx |
| 12 | employer | `hiringAcademicChart.labels.${labelKey}` | views/components/employers/charts/HiringAcademicChart/index.tsx |
| 13 | employer | `recruitmentChart.labels.${labelKey}` | views/components/employers/charts/RecruitmentChart/index.tsx |
| 14 | interview | `interviewLive.statuses.${session.status}` | views/components/employers/InterviewDetailCard/index.tsx |
| 15 | interview | `interviewListCard.statuses.${status}` | views/components/employers/InterviewListCard/index.tsx |
| 16 | common | `actions` | views/components/employers/InterviewListCard/index.tsx |
| 17 | jobSeeker | `activityChart.labels.${String(data?.title1 || ` | views/components/jobSeekers/charts/index.tsx |
| 18 | jobSeeker | `activityChart.labels.${String(data?.title2 || ` | views/components/jobSeekers/charts/index.tsx |
| 19 | jobSeeker | `activityChart.labels.${String(data?.title3 || ` | views/components/jobSeekers/charts/index.tsx |
| 20 | employer | `interviewLive.statuses.${getValue() as string}` | views/employerPages/InterviewPages/InterviewLivePage.tsx |
| 21 | common | `interviewListCard.statuses.${statusKey}` | views/interviewPages/InterviewSessionPage.tsx |

## Missing keys in VI (21 keys)

| # | Namespace | Key | Used In |
|---|-----------|-----|---------|
| 1 | common | `choices.${option.name}` | components/Common/Controls/MultiSelectCustom/index.tsx, components/Common/Controls/MultiSelectSearchCustom/index.tsx, components/Common/Controls/SingleSelectCustom/index.tsx, components/Common/Controls/SingleSelectSearchCustom/index.tsx, views/components/defaults/JobPostSearch/index.tsx |
| 2 | common | `choices.${val}` | utils/tConfig.ts |
| 3 | admin | `pages.interviews.status.${val}` | views/adminPages/InterviewsPage/index.tsx |
| 4 | admin | `pages.interviews.status.${st}` | views/adminPages/InterviewsPage/index.tsx |
| 5 | admin | `pages.jobActivity.statusOptions.${status === 1 ? ` | views/adminPages/JobActivityPage/index.tsx |
| 6 | admin | `pages.jobs.table.status` | views/adminPages/JobsPage/index.tsx |
| 7 | common | `${prefix}.${option.id}` | views/components/defaults/JobPostSearch/index.tsx |
| 8 | employer | `applicationChart.labels.${title2Key}` | views/components/employers/charts/ApplicationChart/index.tsx |
| 9 | employer | `applicationChart.labels.${title1Key}` | views/components/employers/charts/ApplicationChart/index.tsx |
| 10 | employer | `candidateChart.labels.${title1Key}` | views/components/employers/charts/CandidateChart/index.tsx |
| 11 | employer | `candidateChart.labels.${title2Key}` | views/components/employers/charts/CandidateChart/index.tsx |
| 12 | employer | `hiringAcademicChart.labels.${labelKey}` | views/components/employers/charts/HiringAcademicChart/index.tsx |
| 13 | employer | `recruitmentChart.labels.${labelKey}` | views/components/employers/charts/RecruitmentChart/index.tsx |
| 14 | interview | `interviewLive.statuses.${session.status}` | views/components/employers/InterviewDetailCard/index.tsx |
| 15 | interview | `interviewListCard.statuses.${status}` | views/components/employers/InterviewListCard/index.tsx |
| 16 | common | `actions` | views/components/employers/InterviewListCard/index.tsx |
| 17 | jobSeeker | `activityChart.labels.${String(data?.title1 || ` | views/components/jobSeekers/charts/index.tsx |
| 18 | jobSeeker | `activityChart.labels.${String(data?.title2 || ` | views/components/jobSeekers/charts/index.tsx |
| 19 | jobSeeker | `activityChart.labels.${String(data?.title3 || ` | views/components/jobSeekers/charts/index.tsx |
| 20 | employer | `interviewLive.statuses.${getValue() as string}` | views/employerPages/InterviewPages/InterviewLivePage.tsx |
| 21 | common | `interviewListCard.statuses.${statusKey}` | views/interviewPages/InterviewSessionPage.tsx |

## EN/VI Parity Check (keys in JSON but missing in opposite lang)

## useTranslation namespace usage

| Namespace | File Count |
|-----------|------------|
| common | 20 |
| admin | 33 |
| employer | 46 |
| public | 17 |
| auth | 19 |
| chat | 4 |
| jobSeeker | 9 |
| about | 1 |
| errors | 3 |
| interview | 1 |