'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WcIcon from '@mui/icons-material/Wc';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import BadgeIcon from '@mui/icons-material/Badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation, Trans } from 'react-i18next';
import DataTable from '@/components/Common/DataTable';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import adminManagementService from '@/services/adminManagementService';
import { CV_TYPES, ROUTES } from '@/configs/constants';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import dayjs from '@/configs/dayjs-config';
import { useConfig } from '@/hooks/useConfig';
import type { ColumnDef } from '@tanstack/react-table';
import type { JobSeekerProfile, Resume, UserDict } from '@/types/models';
import type { Location } from '@/types/models';
import { getSafeResourceUrl } from '@/utils/safeExternalUrl';
import { tConfig } from '@/utils/tConfig';
import errorHandling from '@/utils/errorHandling';

type ProfileDetailRecord = JobSeekerProfile & {
  birthday?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  maritalStatus?: 'S' | 'M' | null;
  isActive?: boolean;
  createAt?: string;
  updateAt?: string;
  userDict?: UserDict;
  location?: Location | null;
  viewEmployerNumber?: number;
};

const getInitials = (name?: string | null): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CV';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const valueOrDash = (value?: React.ReactNode): React.ReactNode => {
  if (value === undefined || value === null || value === '') return '-';
  return value;
};

const resolveConfigText = (
  dict: Record<string, string> | undefined,
  value: string | number | null | undefined | { id?: string | number; name?: string | null }
): string => {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'object') {
    return value.name || tConfig(dict?.[String(value.id ?? '')]);
  }
  return tConfig(dict?.[String(value)]);
};

const SectionCard = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, md: 3 },
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
}) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.default',
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ color: 'primary.main', mt: 0.2 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const ProfileDetailPage = ({ id }: { id?: string } = {}) => {
  const { t, i18n } = useTranslation('admin');
  const router = useRouter();
  const params = useParams<{ id?: string; slug?: string | string[] }>();
  const slugId = Array.isArray(params?.slug) ? params.slug[params.slug.length - 1] : params?.slug;
  const profileId = id || params?.id || slugId;
  const queryClient = useQueryClient();
  const { allConfig } = useConfig();

  const profileQuery = useQuery<ProfileDetailRecord>({
    queryKey: ['admin-profile-detail', profileId],
    queryFn: async () => adminManagementService.getProfileDetail(profileId!),
    enabled: Boolean(profileId),
  });

  const resumesQuery = useQuery<Resume[]>({
    queryKey: ['admin-profile-resumes', profileId],
    queryFn: async () => {
      const response = await adminManagementService.getResumes({ jobSeekerProfileId: profileId! });
      return response.results || [];
    },
    enabled: Boolean(profileId),
  });

  const deleteMutation = useMutation<void, Error>({
    mutationFn: async () => {
      if (!profileId) return;
      await adminManagementService.deleteProfile(profileId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-profile-detail', profileId] });
      router.push(localizeRoutePath(`/${ROUTES.ADMIN.PROFILES}`, i18n.language));
    },
    onError: (error) => {
      errorHandling(error);
    },
  });

  const profile = profileQuery.data;
  const resumes = resumesQuery.data || [];
  const isLoading = profileQuery.isLoading;
  const [openDelete, setOpenDelete] = React.useState(false);
  const primaryResume = resumes[0];

  const locationText = resolveConfigText(allConfig?.cityDict, profile?.location?.city);
  const districtText = profile?.location?.districtDict?.name || '';
  const genderText = resolveConfigText(allConfig?.genderDict, profile?.gender);
  const maritalText = resolveConfigText(allConfig?.maritalStatusDict, profile?.maritalStatus);

  const resumeColumns = useMemo<ColumnDef<Resume>[]>(() => [
    {
      accessorKey: 'title',
      header: t('pages.profileDetail.table.title') as string,
      cell: (info) => {
        const resume = info.row.original;
        const isOnline = resume.type === CV_TYPES.cvWebsite;
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              {info.getValue() as string || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('pages.profileDetail.table.online')}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'type',
      header: t('pages.profileDetail.table.resumeType') as string,
      cell: (info) => {
        return (
          <Chip
            size="small"
            label={t('pages.profileDetail.table.online')}
            color="primary"
            variant="filled"
          />
        );
      },
    },
    {
      accessorKey: 'createAt',
      header: t('pages.profileDetail.table.createdAt') as string,
      cell: (info) => (info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '-'),
    },
    {
      accessorKey: 'updateAt',
      header: t('pages.profileDetail.table.updatedAt') as string,
      cell: (info) => (info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '-'),
    },
    {
      id: 'actions',
      header: t('pages.profileDetail.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => {
        const resume = info.row.original;
        const safeFileUrl = getSafeResourceUrl(resume.fileUrl || '');
        const isOnline = resume.type === CV_TYPES.cvWebsite && resume.slug;
        const onlineHref = resume.slug
          ? localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE, resume.slug, ':slug')}`, i18n.language)
          : undefined;

        return (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title={isOnline ? t('pages.profileDetail.table.openOnline') : t('pages.profileDetail.table.view')}>
              <span>
                <IconButton aria-label="Thao tác"
                  size="small"
                  component="a"
                  href={isOnline ? onlineHref : safeFileUrl || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="info"
                  disabled={!onlineHref && !safeFileUrl}
                >
                  {isOnline ? <OpenInNewIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('pages.profileDetail.table.download')}>
              <span>
                <IconButton aria-label="Tải xuống"
                  size="small"
                  component="a"
                  href={safeFileUrl || undefined}
                  download
                  color="primary"
                  disabled={!safeFileUrl}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [i18n.language, t]);

  if (isLoading) {
    return <BackdropLoading open />;
  }

  if (!profile) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {t('pages.profileDetail.messages.notFound')}
        </Typography>
      </Paper>
    );
  }

  const candidateName = profile.userDict?.fullName || t('pages.profileDetail.labels.noData');
  const candidateEmail = profile.userDict?.email || '';
  const candidateAvatarUrl = profile.userDict?.avatarUrl || '';
  const candidatePhone = profile.phone || '';
  const createdAt = profile.createAt || '';
  const updatedAt = profile.updateAt || '';
  const primaryResumeFileName = primaryResume?.fileUrl
    ? decodeURIComponent((primaryResume.fileUrl.split('/').pop() || '').split('?')[0])
    : '';

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(localizeRoutePath(`/${ROUTES.ADMIN.PROFILES}`, i18n.language))}
              sx={{ fontWeight: 900, textTransform: 'none', px: 0.5 }}
            >
              {t('pages.profileDetail.back')}
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 1000, mt: 0.75 }}>
              {t('pages.profileDetail.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('pages.profileDetail.subtitle')}
            </Typography>
          </Box>

          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDelete(true)}
            sx={{ whiteSpace: 'nowrap', fontWeight: 900, textTransform: 'none' }}
          >
            {t('pages.profileDetail.deleteBtn')}
          </Button>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Avatar
              src={candidateAvatarUrl || undefined}
              alt={candidateName}
              sx={{ width: 88, height: 88, fontSize: 30, fontWeight: 1000 }}
            >
              {getInitials(candidateName)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Chip
                  label={profile.isActive === false ? t('pages.profileDetail.labels.inactive') : t('pages.profileDetail.labels.active')}
                  color={profile.isActive === false ? 'default' : 'success'}
                  variant={profile.isActive === false ? 'outlined' : 'filled'}
                  size="small"
                />
                <Chip
                  label={`${t('pages.profileDetail.labels.profileId')}: ${profile.id}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 1000, overflowWrap: 'anywhere' }}>
                {candidateName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.75, overflowWrap: 'anywhere' }}>
                {valueOrDash(candidateEmail || profile.userDict?.email)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title={t('pages.profileDetail.sections.contact')}>
              <Stack spacing={1.5}>
                <InfoRow icon={<EmailIcon fontSize="small" />} label={t('pages.profileDetail.labels.email')} value={valueOrDash(candidateEmail)} />
                <InfoRow icon={<PhoneIcon fontSize="small" />} label={t('pages.profileDetail.labels.phone')} value={valueOrDash(candidatePhone)} />
                <InfoRow icon={<LocationOnIcon fontSize="small" />} label={t('pages.profileDetail.labels.location')} value={valueOrDash(locationText)} />
                <InfoRow icon={<LocationOnIcon fontSize="small" />} label={t('pages.profileDetail.labels.district')} value={valueOrDash(districtText)} />
                <InfoRow icon={<LocationOnIcon fontSize="small" />} label={t('pages.profileDetail.labels.address')} value={valueOrDash(profile.location?.address)} />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title={t('pages.profileDetail.sections.details')}>
              <Stack spacing={1.5}>
                <InfoRow icon={<PersonIcon fontSize="small" />} label={t('pages.profileDetail.labels.fullName')} value={valueOrDash(candidateName)} />
                <InfoRow icon={<EventIcon fontSize="small" />} label={t('pages.profileDetail.labels.birthday')} value={valueOrDash(profile.birthday ? dayjs(profile.birthday).format('DD/MM/YYYY') : '')} />
                <InfoRow icon={<WcIcon fontSize="small" />} label={t('pages.profileDetail.labels.gender')} value={valueOrDash(genderText)} />
                <InfoRow icon={<FamilyRestroomIcon fontSize="small" />} label={t('pages.profileDetail.labels.maritalStatus')} value={valueOrDash(maritalText)} />
                <InfoRow icon={<BadgeIcon fontSize="small" />} label={t('pages.profileDetail.labels.createdAt')} value={valueOrDash(createdAt ? dayjs(createdAt).format('DD/MM/YYYY') : '')} />
                <InfoRow icon={<BadgeIcon fontSize="small" />} label={t('pages.profileDetail.labels.updatedAt')} value={valueOrDash(updatedAt ? dayjs(updatedAt).format('DD/MM/YYYY') : '')} />
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title={t('pages.profileDetail.sections.summary')}>
              <Stack spacing={1.5}>
                <InfoRow icon={<BadgeIcon fontSize="small" />} label={t('pages.profileDetail.labels.profileId')} value={profile.id} />
                <InfoRow
                  icon={<BadgeIcon fontSize="small" />}
                  label={t('pages.profileDetail.table.title')}
                  value={valueOrDash(primaryResume?.title)}
                />
                <InfoRow
                  icon={<BadgeIcon fontSize="small" />}
                  label={t('pages.profileDetail.table.resumeType')}
                  value={valueOrDash(primaryResume ? t('pages.profileDetail.table.online') : '')}
                />
                <InfoRow
                  icon={<BadgeIcon fontSize="small" />}
                  label={t('pages.profileDetail.labels.createdAt')}
                  value={valueOrDash(primaryResume?.createAt ? dayjs(primaryResume.createAt).format('DD/MM/YYYY') : '')}
                />
                <InfoRow
                  icon={<BadgeIcon fontSize="small" />}
                  label={t('pages.profileDetail.labels.updatedAt')}
                  value={valueOrDash(primaryResume?.updateAt ? dayjs(primaryResume.updateAt).format('DD/MM/YYYY') : '')}
                />
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title={t('pages.profileDetail.sections.details')}>
              <Stack spacing={1.5}>
                <InfoRow
                  icon={<OpenInNewIcon fontSize="small" />}
                  label={t('pages.profileDetail.table.openOnline')}
                  value={valueOrDash(primaryResume?.sourceUrl || primaryResume?.sourceRef || primaryResume?.sourcePlatform)}
                />
                <InfoRow
                  icon={<BadgeIcon fontSize="small" />}
                  label={t('pages.profileDetail.table.attached')}
                  value={valueOrDash(primaryResumeFileName || (primaryResume?.fileUrl ? 'Có file đính kèm' : ''))}
                />
                <InfoRow
                  icon={<BadgeIcon fontSize="small" />}
                  label={t('pages.profileDetail.labels.source')}
                  value={valueOrDash(primaryResume?.sourcePlatform || primaryResume?.sourceRef || '')}
                />
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <SectionCard title={t('pages.profileDetail.sections.resumes')}>
          <DataTable
            columns={resumeColumns}
            data={resumes}
            isLoading={resumesQuery.isLoading}
            rowCount={resumes.length}
            pagination={{ pageIndex: 0, pageSize: resumes.length || 10 }}
            onPaginationChange={() => undefined}
          />
          {!resumesQuery.isLoading && resumes.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {t('pages.profileDetail.messages.noResumes')}
            </Typography>
          )}
        </SectionCard>
      </Stack>

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.profileDetail.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            <Trans
              t={t}
              i18nKey="pages.profileDetail.deleteConfirm"
              values={{ name: candidateName }}
              components={{ strong: <strong /> }}
            />
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">
            {t('common:actions.cancel')}
          </Button>
          <Button
            onClick={() => deleteMutation.mutate()}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t('pages.profileDetail.deletingBtn') : t('pages.profileDetail.deleteBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileDetailPage;
