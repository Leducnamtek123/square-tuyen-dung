'use client';
import React, { useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { Box, Card, Pagination, Stack, Typography, Grid2 as Grid, Paper, alpha, useTheme } from "@mui/material";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import NoDataCard from '../../../../components/Common/NoDataCard';
import toastMessages from '../../../../utils/toastMessages';
import ProfileSearch from '../ProfileSearch';
import JobSeekerProfile from '../../../../components/Features/JobSeekerProfile';
import { useEmployerResumes, useToggleSaveResumeOptimistic } from '../hooks/useEmployerQueries';
import type { Resume } from '@/types/models';

const ProfileCard: React.FC = () => {
    const { t } = useTranslation('employer');
    const theme = useTheme();
    const { resumeFilter } = useAppSelector((state) => state.filter);
    const { pageSize } = resumeFilter;
    const [page, setPage] = React.useState(1);

    React.useEffect(() => {
        setPage(1);
    }, [resumeFilter]);

    const queryParams = useMemo(() => ({
        ...resumeFilter,
        page,
    }), [resumeFilter, page]);

    const { data: queryData, isLoading } = useEmployerResumes(queryParams);
    const resumes: Resume[] = queryData?.results || [];
    const count = queryData?.count || 0;

    const { mutate: toggleSave } = useToggleSaveResumeOptimistic();

    const handleChangePage = (_: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = (slug: string) => {
        toggleSave(slug, {
            onSuccess: (resData: Record<string, unknown>) => {
                const isSaved = resData.isSaved;
                toastMessages.success(
                    isSaved ? t('profileCard.messages.saveSuccess') : t('profileCard.messages.unsaveSuccess')
                );
            },
        });
    };

    const totalPages = Math.ceil(count / pageSize);

    return (
        <Grid container spacing={4}>
            <ProfileSearch />
            <Grid size={{ xs: 12, lg: 9 }}>
                <Stack spacing={5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px' }}>
                                {t('profileCard.label.resultsFound')}
                            </Typography>
                            <Typography component="span" variant="h3" color="primary" sx={{ fontWeight: 1000, lineHeight: 1 }}>
                                {count}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700, opacity: 0.8 }}>
                                {t('profileCard.label.profiles', { count })}
                            </Typography>
                        </Box>
                    </Box>

                    <Box>
                        {isLoading ? (
                            <Grid container spacing={3}>
                                {Array.from(new Array(pageSize)).map((_, index) => (
                                    <Grid key={index} size={{ xs: 12 }}>
                                        <JobSeekerProfile.Loading />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : resumes.length === 0 ? (
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    textAlign: 'center', 
                                    py: 15, 
                                    borderRadius: 4, 
                                    bgcolor: alpha(theme.palette.action.disabled, 0.04),
                                    border: '2px dashed',
                                    borderColor: alpha(theme.palette.divider, 0.6)
                                }}
                            >
                                <SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3, opacity: 0.3 }} />
                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '-0.5px' }}>
                                    {t('profileCard.title.noresultsfound')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600, maxWidth: 400, mx: 'auto', opacity: 0.7 }}>
                                    Try adjusting your search filters or keywords to discover more talented candidates.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={5}>
                                <Grid container spacing={3}>
                                    {resumes.map((resume) => (
                                        <Grid key={resume.id} size={{ xs: 12 }}>
                                            <JobSeekerProfile
                                                id={resume.id}
                                                slug={resume.slug}
                                                title={resume.title || ''}
                                                salaryMin={resume.salaryMin ?? undefined}
                                                salaryMax={resume.salaryMax ?? undefined}
                                                experience={resume.experience ?? 0}
                                                updateAt={resume.updateAt || ''}
                                                isSaved={resume.isSaved || false}
                                                viewEmployerNumber={resume.viewEmployerNumber || 0}
                                                user={resume.userDict as Record<string, unknown>}
                                                city={resume.city?.id ?? ''}
                                                jobSeekerProfile={resume.jobSeekerProfileDict || {}}
                                                type={resume.type?.toString()}
                                                lastViewedDate={resume.lastViewedDate ?? undefined}
                                                handleSave={handleSave}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                        <Pagination
                                            color="primary"
                                            shape="rounded"
                                            variant="outlined"
                                            count={totalPages}
                                            page={page}
                                            onChange={handleChangePage}
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    backgroundColor: 'background.paper',
                                                    fontWeight: 800,
                                                    borderRadius: 2,
                                                    borderColor: alpha(theme.palette.divider, 0.8),
                                                    height: 44,
                                                    minWidth: 44,
                                                    '&.Mui-selected': {
                                                        boxShadow: (theme) => theme.customShadows?.primary,
                                                        border: 'none',
                                                        color: '#fff',
                                                        fontWeight: 1000
                                                    },
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                        borderColor: 'primary.main'
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default ProfileCard;
