'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { 
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import dayjs from 'dayjs';
import { salaryString } from '@/utils/customData';
import { CV_TYPES, ROUTES } from '@/configs/constants';
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
  viewEmployerNumber,
  city,
  user,
  jobSeekerProfile,
  type,
  lastViewedDate,
  handleSave,
}: JobSeekerProfileProps) => {
    const { t } = useTranslation(['employer', 'common']);
    const { push } = useRouter();
    const theme = useTheme();
    const { allConfig } = useConfig();

    const handleNavigate = () => {
        push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, slug)}`);
    };

    return (
        <Card
            variant="outlined"
            onClick={handleNavigate}
            sx={{
                p: 3,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: pc.primary( 0.02),
                    transform: 'translateY(-4px)',
                    boxShadow: (theme: StylesTheme & { customShadows?: Record<string, string> }) => theme.customShadows?.z12,
                    '& .profile-actions': { opacity: 1, transform: 'translateX(0)' }
                },
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Avatar 
                    src={user?.avatar || user?.avatarUrl || undefined} 
                    variant="rounded"
                    sx={{ 
                        width: 72, 
                        height: 72, 
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: (theme: StylesTheme & { customShadows?: Record<string, string> }) => theme.customShadows?.z1
                    }}
                />
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 900, 
                                color: 'text.primary',
                                transition: 'color 0.2s',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            {user?.fullName || t('common:labels.notUpdated')}
                            <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1, fontSize: '0.9rem', opacity: 0.7 }}>
                                ({t('employer:profileCard.label.yearsOld', { age: jobSeekerProfile?.old || '---' })})
                            </Box>
                        </Typography>
                        
                        {lastViewedDate && (
                            <Chip
                                icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label={`${t('employer:profileCard.label.lastViewed')}: ${dayjs(lastViewedDate).format('DD/MM/YYYY HH:mm')}`}
                                size="small"
                                sx={{ 
                                    borderRadius: 1, 
                                    fontWeight: 800, 
                                    height: 22, 
                                    fontSize: '0.65rem',
                                    bgcolor: pc.success( 0.08),
                                    color: 'success.dark',
                                    border: '1px solid',
                                    borderColor: pc.success( 0.1)
                                }}
                            />
                        )}
                    </Stack>

                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            fontWeight: 800, 
                            color: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            mb: 2,
                            letterSpacing: '-0.2px'
                        }}
                    >
                        {type === CV_TYPES.cvUpload && (
                            <PictureAsPdfIcon color="error" fontSize="small" />
                        )}
                        {title || t('common:labels.notUpdated')}
                    </Typography>

                    <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5 }}>
                        <Chip
                            size="small"
                            icon={<MonetizationOnIcon sx={{ fontSize: '16px !important', color: 'inherit' }} />}
                            label={salaryString(salaryMin, salaryMax) || t('common:labels.notUpdated')}
                            sx={{ 
                                fontWeight: 800, 
                                bgcolor: pc.secondary( 0.08), 
                                color: 'secondary.main', 
                                border: 'none',
                                px: 0.5
                            }}
                        />
                        <Chip
                            size="small"
                            icon={<WorkOutlineOutlinedIcon sx={{ fontSize: '16px !important', color: 'inherit' }} />}
                            label={tConfig(String(allConfig?.experienceDict?.[experience] || '')) || t('common:labels.notUpdated')}
                            sx={{ 
                                fontWeight: 800, 
                                bgcolor: pc.primary( 0.08), 
                                color: 'primary.main', 
                                border: 'none',
                                px: 0.5
                            }}
                        />
                        <Chip
                            size="small"
                            icon={<RoomIcon sx={{ fontSize: '16px !important', color: 'inherit' }} />}
                            label={tConfig(String(allConfig?.cityDict?.[city] || '')) || t('common:labels.notUpdated')}
                            sx={{ 
                                fontWeight: 800, 
                                bgcolor: pc.info( 0.08), 
                                color: 'info.main', 
                                border: 'none',
                                px: 0.5
                            }}
                        />
                    </Stack>
                </Box>

                <Stack 
                    alignItems={{ xs: 'flex-start', md: 'flex-end' }} 
                    spacing={2} 
                    sx={{ minWidth: { md: 200 } }}
                >
                    <Stack 
                        direction="row" 
                        spacing={1} 
                        className="profile-actions"
                        sx={{ 
                            opacity: { xs: 1, md: 0.6 }, 
                            transition: 'all 0.3s',
                            transform: { xs: 'none', md: 'translateX(10px)' }
                        }}
                    >
                        <Tooltip title={isSaved ? t('employer:profileCard.actions.unsave') : t('employer:profileCard.actions.save')} arrow>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSave(slug);
                                }}
                                sx={{
                                    color: isSaved ? 'error.main' : 'text.disabled',
                                    bgcolor: isSaved ? pc.error( 0.08) : pc.actionDisabled( 0.05),
                                    '&:hover': { 
                                        bgcolor: isSaved ? 'error.main' : 'text.primary', 
                                        color: '#fff',
                                        boxShadow: (theme: StylesTheme & { customShadows?: Record<string, string> }) => theme.customShadows?.error
                                    }
                                }}
                            >
                                {isSaved ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderOutlinedIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('employer:profileCard.actions.viewProfile')} arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: 'primary.main',
                                    bgcolor: pc.primary( 0.08),
                                    '&:hover': { 
                                        bgcolor: 'primary.main', 
                                        color: '#fff',
                                        boxShadow: (theme: StylesTheme & { customShadows?: Record<string, string> }) => theme.customShadows?.primary
                                    }
                                }}
                            >
                                <RemoveRedEyeOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                            {t('employer:profileCard.label.updatedAt')}: {dayjs(updateAt).format('DD/MM/YYYY')}
                        </Typography>

                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'primary.main', 
                                fontWeight: 900, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.75, 
                                bgcolor: pc.primary( 0.05), 
                                px: 1.5, 
                                py: 0.5, 
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: pc.primary( 0.1)
                            }}
                        >
                            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 14 }} />
                            {t('employer:profileCard.label.viewsCount', { count: viewEmployerNumber })}
                        </Typography>
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
