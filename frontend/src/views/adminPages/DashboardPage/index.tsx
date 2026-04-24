import React, { useMemo } from 'react';
import { Box, Typography, Card, CardHeader, CardContent, Skeleton, Paper, Stack, Chip } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useTheme } from "@mui/material/styles";
import { Grid2 as Grid } from "@mui/material";

import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VideocamIcon from '@mui/icons-material/Videocam';
import PieChartClient from '@/components/Common/Charts/PieChartClient';
import { useAdminStats } from './hooks/useAdminStats';
import StatCard from './components/StatCard';

const DashboardPage = () => {
    const { t } = useTranslation('admin');
    const theme = useTheme();

    const { data: stats, isLoading } = useAdminStats();

    const BRAND_COLORS = useMemo(() => [
        theme.palette.primary.main,
        theme.palette.info.main,
        theme.palette.secondary.main,
        theme.palette.warning.main,
        theme.palette.primary.dark,
    ], [theme.palette.primary.main, theme.palette.info.main, theme.palette.secondary.main, theme.palette.warning.main, theme.palette.primary.dark]);

    const userRoleData = useMemo(() => stats
        ? [
            { name: t('dashboard.roles.employer'), value: stats.totalEmployers || 0 },
            { name: t('dashboard.roles.jobSeeker'), value: stats.totalJobSeekers || 0 },
            { name: t('dashboard.roles.admin'), value: stats.totalAdmins || 0 },
        ]
        : [], [stats, t]);

    const pieData = useMemo(() => ({
        labels: userRoleData.map((item) => item.name),
        datasets: [
            {
                data: userRoleData.map((item) => item.value),
                backgroundColor: BRAND_COLORS,
                borderWidth: 0,
            },
        ],
    }), [userRoleData, BRAND_COLORS]);

    const pieOptions = useMemo(() => ({
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: theme.typography.fontFamily,
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.label}: ${context.parsed}`,
                },
            },
        },
        maintainAspectRatio: false,
    }), [theme.typography.fontFamily]);

    return (
        <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('dashboard.totalUsers')}
                        value={stats?.totalUsers}
                        loading={isLoading}
                        icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('dashboard.jobPosts')}
                        value={stats?.totalJobPosts}
                        loading={isLoading}
                        icon={<WorkIcon sx={{ fontSize: 40 }} />}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('dashboard.pendingApproval')}
                        value={stats?.totalJobPostsPending}
                        loading={isLoading}
                        icon={<QuestionAnswerIcon sx={{ fontSize: 40 }} />}
                        color={theme.palette.warning.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={t('dashboard.applications')}
                        value={stats?.totalApplications}
                        loading={isLoading}
                        icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
                        color={theme.palette.info.main}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card elevation={0} sx={{ height: '100%', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                        <CardHeader 
                            title={t('dashboard.userDistribution')} 
                            slotProps={{ title: { variant: 'h6', fontWeight: 700 } }}
                        />
                        <CardContent sx={{ height: 350, pt: 0 }}>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: '12px' }} />
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
                <PieChartClient data={pieData} options={pieOptions} />
            </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Paper
                            sx={{
                                p: 3,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                color: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(26, 64, 125, 0.15)'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{t('dashboard.generalStats')}</Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{t('dashboard.total')}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{stats?.totalUsers || 0} {t('dashboard.users')}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{t('dashboard.employers')}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{stats?.totalEmployers || 0}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{t('dashboard.jobSeekers')}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{stats?.totalJobSeekers || 0}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                        <Paper
                            sx={{
                                p: 3,
                                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                                color: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)'
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{t('dashboard.systemInfo')}</Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{t('dashboard.status')}</Typography>
                                    <Chip label={t('dashboard.statusActive')} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{t('dashboard.pendingPosts')}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{stats?.totalJobPostsPending || 0}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
