'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { 
    Button,
    Card, 
    Chip, 
    IconButton, 
    Skeleton, 
    Stack, 
    Tooltip, 
    Typography, 
    Box, 
    Avatar, 
    alpha, 
    useTheme 
} from "@mui/material";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import RoomIcon from '@mui/icons-material/Room';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import dayjs from 'dayjs';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import { CV_TYPES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { Theme as StylesTheme } from '@mui/material/styles';
import type { UserDict } from '@/types/models';
import pc from '@/utils/muiColors';

interface JobSeekerProfileProps {
  id: string | number;
  slug: string;
  title: string;
  salaryMin?: number;
  salaryMax?: number;
  experience: number;
  updateAt: string | Date;
  isSaved?: boolean;
  matchScore?: number;
  viewEmployerNumber?: number;
  city: number | string;
  user?: UserDict & { avatar?: string };
  jobSeekerProfile?: {
    old?: number | string;
  };
  type?: string;
  lastViewedDate?: string | Date;
  handleSave: (slug: string) => void;
}

const JobSeekerProfile = ({
  id,
  slug,
  title,
  salaryMin,
  salaryMax,
  experience,
  updateAt,
  isSaved,
  matchScore,
  viewEmployerNumber,
  city,
  user,
  jobSeekerProfile,
  type,
  lastViewedDate,
  handleSave,
}: JobSeekerProfileProps) => {
    const { t, i18n } = useTranslation(['employer', 'common']);
    const { push } = useRouter();
    const theme = useTheme();
    const { allConfig } = useConfig();
    const profileDetailHref = slug
        ? localizeRoutePath(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, slug)}`, i18n.language)
        : undefined;

    const handleNavigate = () => {
        if (profileDetailHref) {
            push(profileDetailHref);
        }
    };

    const lastViewedLabel = lastViewedDate
        ? t('employer:profileCard.label.lastViewed', { date: dayjs(lastViewedDate).format('DD/MM/YYYY HH:mm') })
        : '';
    const updatedAtLabel = t('employer:profileCard.label.updatedAt', { date: dayjs(updateAt).format('DD/MM/YYYY') });

    return (
        <Card
            variant="outlined"
            onClick={handleNavigate}
            sx={{
                p: '14px 16px',
                minHeight: 90,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: '1px solid',
                borderColor: '#E2E8F0',
                backgroundColor: '#FFFFFF',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: pc.primary(0.015),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
                },
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar 
                        src={user?.avatar || user?.avatarUrl || undefined} 
                        variant="rounded"
                        sx={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '8px',
                            border: '1px solid #F1F5F9',
                            flexShrink: 0,
                        }}
                    />
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontWeight: 700, 
                                    fontSize: '0.95rem',
                                    color: '#0F172A',
                                    lineHeight: 1.3,
                                    transition: 'color 0.2s',
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                {user?.fullName || title || "Ứng viên"}
                                {jobSeekerProfile?.old && String(jobSeekerProfile.old) !== '---' && (
                                    <Box component="span" sx={{ fontWeight: 500, color: '#64748B', ml: 0.75, fontSize: '0.8125rem' }}>
                                        ({jobSeekerProfile.old} tuổi)
                                    </Box>
                                )}
                            </Typography>
                            
                            {matchScore && matchScore > 0 ? (
                                <Chip
                                    label="Phù hợp nhu cầu"
                                    size="small"
                                    sx={{ 
                                        borderRadius: '6px', 
                                        fontWeight: 600, 
                                        height: 20, 
                                        fontSize: '0.6875rem',
                                        bgcolor: '#EFF6FF',
                                        color: '#2563EB',
                                        border: '1px solid #DBEAFE',
                                    }}
                                />
                            ) : null}

                            {lastViewedDate && (
                                <Chip
                                    icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                    label={lastViewedLabel}
                                    size="small"
                                    sx={{ 
                                        borderRadius: '6px', 
                                        fontWeight: 600, 
                                        height: 20, 
                                        fontSize: '0.65rem',
                                        bgcolor: pc.success(0.08),
                                        color: 'success.dark',
                                    }}
                                />
                            )}
                        </Stack>

                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'primary.main', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.75,
                                fontSize: '0.85rem',
                                mt: 0.25,
                            }}
                        >
                            {type === CV_TYPES.cvUpload && (
                                <PictureAsPdfIcon color="error" fontSize="small" />
                            )}
                            {title || "Chưa cập nhật vị trí"}
                        </Typography>

                        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75, mt: 0.5 }}>
                            {Boolean(salaryMin || salaryMax) && (
                                <Chip
                                    size="small"
                                    icon={<MonetizationOnIcon sx={{ fontSize: '14px !important', color: '#64748B' }} />}
                                    label={formatLocalizedSalaryRange(salaryMin, salaryMax, i18n.language)}
                                    sx={{ 
                                        fontWeight: 600, 
                                        bgcolor: '#F8FAFC', 
                                        color: '#475569', 
                                        fontSize: '0.72rem',
                                        height: 22,
                                        border: '1px solid #F1F5F9',
                                    }}
                                />
                            )}
                            {Boolean(experience && allConfig?.experienceDict?.[experience]) && (
                                <Chip
                                    size="small"
                                    icon={<WorkOutlineOutlinedIcon sx={{ fontSize: '14px !important', color: '#64748B' }} />}
                                    label={tConfig(String(allConfig?.experienceDict?.[experience] || ''))}
                                    sx={{ 
                                        fontWeight: 600, 
                                        bgcolor: '#F8FAFC', 
                                        color: '#475569', 
                                        fontSize: '0.72rem',
                                        height: 22,
                                        border: '1px solid #F1F5F9',
                                    }}
                                />
                            )}
                            {Boolean(city && allConfig?.cityDict?.[city]) && (
                                <Chip
                                    size="small"
                                    icon={<RoomIcon sx={{ fontSize: '14px !important', color: '#64748B' }} />}
                                    label={tConfig(String(allConfig?.cityDict?.[city] || ''))}
                                    sx={{ 
                                        fontWeight: 600, 
                                        bgcolor: '#F8FAFC', 
                                        color: '#475569', 
                                        fontSize: '0.72rem',
                                        height: 22,
                                        border: '1px solid #F1F5F9',
                                    }}
                                />
                            )}
                        </Stack>
                    </Box>
                </Stack>

                <Stack 
                    alignItems={{ xs: 'flex-start', md: 'flex-end' }} 
                    justifyContent="space-between"
                    spacing={1} 
                    sx={{ minWidth: { md: 160 }, flexShrink: 0, height: '100%' }}
                >
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.75rem' }}>
                        {updatedAtLabel}
                    </Typography>

                    <Stack 
                        direction="row" 
                        spacing={0.75} 
                        alignItems="center"
                    >
                        <Tooltip title={isSaved ? t('employer:profileCard.actions.unsave') : t('employer:profileCard.actions.save')} arrow>
                            <IconButton aria-label="Thao tác"
                                size="small"
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleSave(slug);
                                }}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    color: isSaved ? 'primary.main' : '#64748B',
                                    bgcolor: isSaved ? '#EFF6FF' : '#F8FAFC',
                                    border: '1px solid',
                                    borderColor: isSaved ? '#BFDBFE' : '#E2E8F0',
                                    '&:hover': { 
                                        bgcolor: isSaved ? '#DBEAFE' : '#E2E8F0', 
                                        color: 'primary.main',
                                    }
                                }}
                            >
                                {isSaved ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                        </Tooltip>
                        
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleNavigate();
                            }}
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.775rem',
                                color: 'primary.main',
                                borderColor: '#BFDBFE',
                                bgcolor: '#EFF6FF',
                                textTransform: 'none',
                                px: 1.5,
                                py: 0.4,
                                height: 32,
                                borderRadius: '6px',
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: '#FFFFFF',
                                    borderColor: 'primary.main',
                                }
                            }}
                        >
                            Xem hồ sơ
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    );
};

const Loading = () => {
    const theme = useTheme();
    return (
        <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                <Skeleton variant="rounded" width={72} height={72} sx={{ borderRadius: 2.5 }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton width="30%" height={28} sx={{ mb: 1, borderRadius: 1 }} />
                    <Skeleton width="50%" height={32} sx={{ mb: 2, borderRadius: 1 }} />
                    <Stack direction="row" spacing={1.5}>
                        <Skeleton width={100} height={24} sx={{ borderRadius: 10 }} />
                        <Skeleton width={120} height={24} sx={{ borderRadius: 10 }} />
                        <Skeleton width={110} height={24} sx={{ borderRadius: 10 }} />
                    </Stack>
                </Box>
                <Stack alignItems="flex-end" spacing={2}>
                    <Stack direction="row" spacing={1}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                    </Stack>
                    <Skeleton width={120} height={20} sx={{ borderRadius: 1 }} />
                    <Skeleton width={80} height={24} sx={{ borderRadius: 1 }} />
                </Stack>
            </Stack>
        </Card>
    );
};

JobSeekerProfile.Loading = Loading;

export default JobSeekerProfile;
