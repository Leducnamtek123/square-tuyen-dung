'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Stack, Chip, Divider, LinearProgress, Skeleton } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useTheme } from "@mui/material/styles";
import { Grid2 as Grid } from "@mui/material";

import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BarChartClient from '@/components/Common/Charts/BarChartClient';
import PieChartClient from '@/components/Common/Charts/PieChartClient';
import {
    ChartEmptyState,
    ChartLoadingState,
    chartColors,
    createCartesianOptions,
    createDoughnutOptions,
    rgba,
} from '@/components/Common/Charts/chartDesign';
import { useAdminStats } from './hooks/useAdminStats';
import StatCard from './components/StatCard';

type ChartItem = {
    name: string;
    value: number;
    color: string;
};

type DashboardPanelProps = {
    title: string;
    children: React.ReactNode;
    accentColor?: string;
    action?: React.ReactNode;
};

type InfoRowProps = {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    color?: string;
    loading?: boolean;
};

type ProgressRowProps = {
    label: string;
    value: number;
    total: number;
    color: string;
    formatter: (value: number) => string;
    loading?: boolean;
};

const n = (value?: number | null) => Number(value ?? 0);

const percent = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
};

const DashboardPanel = ({ title, children, accentColor = chartColors.navy, action }: DashboardPanelProps) => (
    <Paper
        elevation={0}
        sx={{
            height: '100%',
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 14px 34px rgba(15, 57, 127, 0.06)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                inset: '0 0 auto 0',
                height: 3,
                backgroundColor: accentColor,
            },
        }}
    >
        <Stack spacing={2} sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 850, letterSpacing: 0, lineHeight: 1.3 }}>
                    {title}
                </Typography>
                {action}
            </Box>
            {children}
        </Stack>
    </Paper>
);

const InfoRow = ({ label, value, icon, color = chartColors.navy, loading }: InfoRowProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            {icon ? (
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        color,
                        bgcolor: rgba(color, 0.1),
                        flex: '0 0 auto',
                        '& svg': { fontSize: 18 },
                    }}
                >
                    {icon}
                </Box>
            ) : null}
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 750, lineHeight: 1.35 }}>
                {label}
            </Typography>
        </Stack>
        {loading ? (
            <Skeleton width={72} height={24} />
        ) : (
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 850, whiteSpace: 'nowrap' }}>
                {value}
            </Typography>
        )}
    </Box>
);

const ProgressRow = ({ label, value, total, color, formatter, loading }: ProgressRowProps) => {
    const progress = percent(value, total);

    return (
        <Stack spacing={0.75}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 750 }}>
                    {label}
                </Typography>
                {loading ? (
                    <Skeleton width={72} height={22} />
                ) : (
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 850 }}>
                        {formatter(value)} / {formatter(total)}
                    </Typography>
                )}
            </Box>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: rgba(color, 0.11),
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        bgcolor: color,
                    },
                }}
            />
        </Stack>
    );
};

const makeBarData = (items: ChartItem[]) => ({
    labels: items.map((item) => item.name),
    datasets: [
        {
            data: items.map((item) => item.value),
            backgroundColor: items.map((item) => rgba(item.color, 0.84)),
            borderColor: items.map((item) => item.color),
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 34,
            categoryPercentage: 0.7,
            barPercentage: 0.86,
        },
    ],
});

const makeDoughnutData = (items: ChartItem[]) => ({
    labels: items.map((item) => item.name),
    datasets: [
        {
            data: items.map((item) => item.value),
            backgroundColor: items.map((item) => rgba(item.color, 0.9)),
            hoverBackgroundColor: items.map((item) => item.color),
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 8,
            spacing: 3,
        },
    ],
});

const hasValues = (items: ChartItem[]) => items.some((item) => item.value > 0);

const DashboardPage = () => {
    const { t, i18n } = useTranslation('admin');
    const theme = useTheme();

    const { data: stats, isLoading } = useAdminStats();

    const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
    const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
    const decimalFormatter = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

    const formatNumber = (value: number) => numberFormatter.format(value);
    const formatDecimal = (value: number) => decimalFormatter.format(value);

    const totalUsers = n(stats?.totalUsers);
    const totalEmployers = n(stats?.totalEmployers);
    const totalJobSeekers = n(stats?.totalJobSeekers);
    const totalAdmins = n(stats?.totalAdmins);
    const totalJobPosts = n(stats?.totalJobPosts);
    const totalJobPostsPending = n(stats?.totalJobPostsPending);
    const totalJobPostsRejected = n(stats?.totalJobPostsRejected);
    const totalJobPostsActive = n(stats?.totalJobPostsActive);
    const totalJobPostsExpired = n(stats?.totalJobPostsExpired);
    const totalApplications = n(stats?.totalApplications);
    const totalApplicationsPending = n(stats?.totalApplicationsPending);
    const totalApplicationsHired = n(stats?.totalApplicationsHired);
    const totalInterviews = n(stats?.totalInterviews);
    const totalInterviewsScheduled = n(stats?.totalInterviewsScheduled);
    const totalInterviewsInProgress = n(stats?.totalInterviewsInProgress);
    const totalInterviewsCompleted = n(stats?.totalInterviewsCompleted);
    const totalInterviewsCancelled = n(stats?.totalInterviewsCancelled);
    const totalCompanies = n(stats?.totalCompanies);
    const totalCompaniesVerified = n(stats?.totalCompaniesVerified);
    const totalCompanyVerificationsPending = n(stats?.totalCompanyVerificationsPending);
    const totalCompanyVerificationsReviewing = n(stats?.totalCompanyVerificationsReviewing);
    const totalResumes = n(stats?.totalResumes);
    const totalActiveResumes = n(stats?.totalActiveResumes);
    const totalSavedJobPosts = n(stats?.totalSavedJobPosts);
    const totalSavedResumes = n(stats?.totalSavedResumes);
    const totalCompanyFollowers = n(stats?.totalCompanyFollowers);
    const totalResumeViews = n(stats?.totalResumeViews);
    const totalQuestions = n(stats?.totalQuestions);
    const totalQuestionGroups = n(stats?.totalQuestionGroups);
    const applicationPerJobPost = totalJobPosts > 0 ? totalApplications / totalJobPosts : 0;

    const roleItems = useMemo<ChartItem[]>(() => [
        { name: t('dashboard.roles.employer'), value: totalEmployers, color: chartColors.sky },
        { name: t('dashboard.roles.jobSeeker'), value: totalJobSeekers, color: chartColors.emerald },
        { name: t('dashboard.roles.admin'), value: totalAdmins, color: chartColors.amber },
    ], [t, totalAdmins, totalEmployers, totalJobSeekers]);

    const jobStateItems = useMemo<ChartItem[]>(() => [
        { name: t('dashboard.jobStates.active', 'Active'), value: totalJobPostsActive, color: chartColors.emerald },
        { name: t('dashboard.jobStates.pending', 'Pending'), value: totalJobPostsPending, color: chartColors.amber },
        { name: t('dashboard.jobStates.rejected', 'Rejected'), value: totalJobPostsRejected, color: chartColors.red },
        { name: t('dashboard.jobStates.expired', 'Expired'), value: totalJobPostsExpired, color: chartColors.slate },
    ], [t, totalJobPostsActive, totalJobPostsExpired, totalJobPostsPending, totalJobPostsRejected]);

    const applicationItems = useMemo<ChartItem[]>(() => [
        { name: t('dashboard.applicationStates.pending', 'Pending'), value: n(stats?.totalApplicationsPending), color: chartColors.amber },
        { name: t('dashboard.applicationStates.contacted', 'Contacted'), value: n(stats?.totalApplicationsContacted), color: chartColors.sky },
        { name: t('dashboard.applicationStates.tested', 'Tested'), value: n(stats?.totalApplicationsTested), color: chartColors.cyan },
        { name: t('dashboard.applicationStates.interviewed', 'Interviewed'), value: n(stats?.totalApplicationsInterviewed), color: chartColors.violet },
        { name: t('dashboard.applicationStates.hired', 'Hired'), value: n(stats?.totalApplicationsHired), color: chartColors.emerald },
        { name: t('dashboard.applicationStates.notSelected', 'Not selected'), value: n(stats?.totalApplicationsNotSelected), color: chartColors.red },
    ], [stats, t]);

    const interviewItems = useMemo<ChartItem[]>(() => [
        { name: t('dashboard.interviewStates.draft', 'Draft'), value: n(stats?.totalInterviewsDraft), color: chartColors.slate },
        { name: t('dashboard.interviewStates.scheduled', 'Scheduled'), value: totalInterviewsScheduled, color: chartColors.sky },
        { name: t('dashboard.interviewStates.inProgress', 'In progress'), value: totalInterviewsInProgress, color: chartColors.amber },
        { name: t('dashboard.interviewStates.completed', 'Completed'), value: totalInterviewsCompleted, color: chartColors.emerald },
        { name: t('dashboard.interviewStates.cancelled', 'Cancelled'), value: totalInterviewsCancelled, color: chartColors.red },
    ], [stats, t, totalInterviewsCancelled, totalInterviewsCompleted, totalInterviewsInProgress, totalInterviewsScheduled]);

    const doughnutOptions = useMemo(() => createDoughnutOptions(theme), [theme]);
    const barOptions = useMemo(() => {
        const base = createCartesianOptions(theme, { displayLegend: false }) as any;
        return {
            ...base,
            indexAxis: 'y' as const,
            layout: {
                padding: { top: 4, right: 10, bottom: 0, left: 0 },
            },
            scales: {
                x: {
                    ...base.scales.y,
                    grid: {
                        ...base.scales.y.grid,
                        color: rgba(chartColors.navy, 0.08),
                    },
                },
                y: {
                    ...base.scales.x,
                    ticks: {
                        ...base.scales.x.ticks,
                        autoSkip: false,
                        padding: 8,
                    },
                },
            },
        };
    }, [theme]);

    return (
        <Box sx={{ pb: 3 }}>
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.totalUsers')}
                        value={totalUsers}
                        loading={isLoading}
                        icon={<PeopleIcon />}
                        color={chartColors.navy}
                        helper={t('dashboard.cardHelpers.userMix', {
                            employers: formatNumber(totalEmployers),
                            jobSeekers: formatNumber(totalJobSeekers),
                        })}
                        progress={percent(totalJobSeekers, totalUsers)}
                        footerLabel={t('dashboard.roles.jobSeeker')}
                        footerValue={`${percent(totalJobSeekers, totalUsers)}%`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.companies', 'Companies')}
                        value={totalCompanies}
                        loading={isLoading}
                        icon={<BusinessIcon />}
                        color={chartColors.sky}
                        helper={t('dashboard.cardHelpers.verifiedCompanies', {
                            verified: formatNumber(totalCompaniesVerified),
                            pending: formatNumber(totalCompanyVerificationsPending + totalCompanyVerificationsReviewing),
                        })}
                        progress={percent(totalCompaniesVerified, totalCompanies)}
                        footerLabel={t('dashboard.verifiedRate', 'Verified rate')}
                        footerValue={`${percent(totalCompaniesVerified, totalCompanies)}%`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.jobPosts')}
                        value={totalJobPosts}
                        loading={isLoading}
                        icon={<WorkIcon />}
                        color={chartColors.emerald}
                        helper={t('dashboard.cardHelpers.jobPostMix', {
                            active: formatNumber(totalJobPostsActive),
                            pending: formatNumber(totalJobPostsPending),
                        })}
                        progress={percent(totalJobPostsActive, totalJobPosts)}
                        footerLabel={t('dashboard.activeRate', 'Active rate')}
                        footerValue={`${percent(totalJobPostsActive, totalJobPosts)}%`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.applications')}
                        value={totalApplications}
                        loading={isLoading}
                        icon={<AssessmentIcon />}
                        color={chartColors.violet}
                        helper={t('dashboard.cardHelpers.applicationMix', {
                            pending: formatNumber(totalApplicationsPending),
                            hired: formatNumber(totalApplicationsHired),
                        })}
                        progress={percent(totalApplicationsHired, totalApplications)}
                        footerLabel={t('dashboard.hiringRate', 'Hiring rate')}
                        footerValue={`${percent(totalApplicationsHired, totalApplications)}%`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.interviews', 'Interviews')}
                        value={totalInterviews}
                        loading={isLoading}
                        icon={<EventAvailableIcon />}
                        color={chartColors.cyan}
                        helper={t('dashboard.cardHelpers.interviewMix', {
                            scheduled: formatNumber(totalInterviewsScheduled),
                            completed: formatNumber(totalInterviewsCompleted),
                        })}
                        progress={percent(totalInterviewsCompleted, totalInterviews)}
                        footerLabel={t('dashboard.completionRate', 'Completion rate')}
                        footerValue={`${percent(totalInterviewsCompleted, totalInterviews)}%`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.resumes', 'Resumes')}
                        value={totalResumes}
                        loading={isLoading}
                        icon={<DescriptionIcon />}
                        color={chartColors.gold}
                        helper={t('dashboard.cardHelpers.resumeMix', {
                            active: formatNumber(totalActiveResumes),
                            profiles: formatNumber(n(stats?.totalJobSeekerProfiles)),
                        })}
                        progress={percent(totalActiveResumes, totalResumes)}
                        footerLabel={t('dashboard.activeProfileRate', 'Active CV rate')}
                        footerValue={`${percent(totalActiveResumes, totalResumes)}%`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.pendingApproval')}
                        value={totalJobPostsPending + totalCompanyVerificationsPending + totalCompanyVerificationsReviewing}
                        loading={isLoading}
                        icon={<QuestionAnswerIcon />}
                        color={chartColors.amber}
                        helper={t('dashboard.cardHelpers.pendingMix', {
                            posts: formatNumber(totalJobPostsPending),
                            companies: formatNumber(totalCompanyVerificationsPending + totalCompanyVerificationsReviewing),
                        })}
                        footerLabel={t('dashboard.pendingPosts')}
                        footerValue={formatNumber(totalJobPostsPending)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.last30Days', 'Last 30 days')}
                        value={n(stats?.newUsers30d)}
                        loading={isLoading}
                        icon={<ManageAccountsIcon />}
                        color={chartColors.red}
                        helper={t('dashboard.cardHelpers.recentUsers', {
                            employers: formatNumber(n(stats?.newEmployers30d)),
                            jobSeekers: formatNumber(n(stats?.newJobSeekers30d)),
                        })}
                        footerLabel={t('dashboard.newApplications30d', 'New applications')}
                        footerValue={formatNumber(n(stats?.newApplications30d))}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardPanel
                        title={t('dashboard.userDistribution')}
                        accentColor={chartColors.navy}
                        action={<Chip size="small" label={formatNumber(totalUsers)} sx={{ fontWeight: 850, bgcolor: rgba(chartColors.navy, 0.08), color: chartColors.navy }} />}
                    >
                        <Box sx={{ position: 'relative', height: 300 }}>
                            {isLoading ? (
                                <ChartLoadingState height="100%" label={t('dashboard.loadingChart', { defaultValue: 'Loading chart' })} />
                            ) : !hasValues(roleItems) ? (
                                <ChartEmptyState height="100%" label={t('dashboard.noUserData', { defaultValue: 'No user data yet' })} />
                            ) : (
                                <PieChartClient data={makeDoughnutData(roleItems)} options={doughnutOptions} height="100%" />
                            )}
                        </Box>
                    </DashboardPanel>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardPanel title={t('dashboard.jobPostStatus', 'Job post status')} accentColor={chartColors.emerald}>
                        <Box sx={{ height: 300 }}>
                            {isLoading ? (
                                <ChartLoadingState height="100%" label={t('dashboard.loadingChart', { defaultValue: 'Loading chart' })} />
                            ) : !hasValues(jobStateItems) ? (
                                <ChartEmptyState height="100%" label={t('dashboard.noJobPostData', { defaultValue: 'No job post data yet' })} />
                            ) : (
                                <BarChartClient data={makeBarData(jobStateItems)} options={barOptions} height="100%" />
                            )}
                        </Box>
                    </DashboardPanel>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardPanel title={t('dashboard.applicationPipeline', 'Application pipeline')} accentColor={chartColors.violet}>
                        <Box sx={{ height: 300 }}>
                            {isLoading ? (
                                <ChartLoadingState height="100%" label={t('dashboard.loadingChart', { defaultValue: 'Loading chart' })} />
                            ) : !hasValues(applicationItems) ? (
                                <ChartEmptyState height="100%" label={t('dashboard.noApplicationData', { defaultValue: 'No application data yet' })} />
                            ) : (
                                <BarChartClient data={makeBarData(applicationItems)} options={barOptions} height="100%" />
                            )}
                        </Box>
                    </DashboardPanel>
                </Grid>
            </Grid>

            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardPanel title={t('dashboard.interviewStatus', 'Interview status')} accentColor={chartColors.cyan}>
                        <Box sx={{ height: 300 }}>
                            {isLoading ? (
                                <ChartLoadingState height="100%" label={t('dashboard.loadingChart', { defaultValue: 'Loading chart' })} />
                            ) : !hasValues(interviewItems) ? (
                                <ChartEmptyState height="100%" label={t('dashboard.noInterviewData', { defaultValue: 'No interview data yet' })} />
                            ) : (
                                <PieChartClient data={makeDoughnutData(interviewItems)} options={doughnutOptions} height="100%" />
                            )}
                        </Box>
                    </DashboardPanel>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardPanel title={t('dashboard.profileCompanyStats', 'Profiles & companies')} accentColor={chartColors.sky}>
                        <Stack spacing={1.75}>
                            <ProgressRow
                                label={t('dashboard.verifiedCompanies', 'Verified companies')}
                                value={totalCompaniesVerified}
                                total={totalCompanies}
                                color={chartColors.sky}
                                formatter={formatNumber}
                                loading={isLoading}
                            />
                            <ProgressRow
                                label={t('dashboard.activeResumes', 'Active resumes')}
                                value={totalActiveResumes}
                                total={totalResumes}
                                color={chartColors.gold}
                                formatter={formatNumber}
                                loading={isLoading}
                            />
                            <Divider />
                            <InfoRow
                                label={t('dashboard.savedJobs', 'Saved jobs')}
                                value={formatNumber(totalSavedJobPosts)}
                                icon={<BookmarkAddedIcon />}
                                color={chartColors.emerald}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.savedResumes', 'Saved resumes')}
                                value={formatNumber(totalSavedResumes)}
                                icon={<DescriptionIcon />}
                                color={chartColors.violet}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.companyFollowers', 'Company followers')}
                                value={formatNumber(totalCompanyFollowers)}
                                icon={<VerifiedUserIcon />}
                                color={chartColors.cyan}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.resumeViews', 'Resume views')}
                                value={formatNumber(totalResumeViews)}
                                icon={<VisibilityIcon />}
                                color={chartColors.amber}
                                loading={isLoading}
                            />
                        </Stack>
                    </DashboardPanel>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardPanel title={t('dashboard.operatingStats', 'Operating stats')} accentColor={chartColors.amber}>
                        <Stack spacing={1.75}>
                            <InfoRow
                                label={t('dashboard.avgApplicationsPerJob', 'Avg applications / job')}
                                value={formatDecimal(applicationPerJobPost)}
                                icon={<AssessmentIcon />}
                                color={chartColors.violet}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.questionBank', 'Question bank')}
                                value={formatNumber(totalQuestions)}
                                icon={<HelpOutlineIcon />}
                                color={chartColors.navy}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.questionGroups', 'Question groups')}
                                value={formatNumber(totalQuestionGroups)}
                                icon={<QuestionAnswerIcon />}
                                color={chartColors.sky}
                                loading={isLoading}
                            />
                            <Divider />
                            <InfoRow
                                label={t('dashboard.newJobPosts30d', 'New job posts')}
                                value={formatNumber(n(stats?.newJobPosts30d))}
                                icon={<WorkIcon />}
                                color={chartColors.emerald}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.newApplications30d', 'New applications')}
                                value={formatNumber(n(stats?.newApplications30d))}
                                icon={<AssessmentIcon />}
                                color={chartColors.violet}
                                loading={isLoading}
                            />
                            <InfoRow
                                label={t('dashboard.newInterviews30d', 'New interviews')}
                                value={formatNumber(n(stats?.newInterviews30d))}
                                icon={<EventAvailableIcon />}
                                color={chartColors.cyan}
                                loading={isLoading}
                            />
                        </Stack>
                    </DashboardPanel>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
