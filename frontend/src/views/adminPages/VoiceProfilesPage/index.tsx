'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import adminJobService from '../../../services/adminJobService';
import adminManagementService from '../../../services/adminManagementService';
import aiService from '../../../services/aiService';
import voiceProfileService, { type VoiceProfilePayload } from '../../../services/voiceProfileService';
import type { VoiceProfile } from '../../../types/models';
import toastMessages from '../../../utils/toastMessages';
import { useDataTable } from '../../../hooks';
import DataTable from '../../../components/Common/DataTable';
import FilterBar, { filterControlSx } from '../../../components/Common/FilterBar';
import {
  getVoiceProfileFormValidationErrors,
  type VoiceProfileFormValidationErrors,
} from './voiceProfileFormValidation';

type CreateForm = {
  name: string;
  description: string;
  language: string;
  voiceType: 'cloned' | 'preset';
  presetVoiceId: string;
  consentConfirmed: boolean;
};

type EditForm = CreateForm & {
  status: string;
  sampleCount: number;
};

const EMPTY_CREATE_FORM: CreateForm = {
  name: '',
  description: '',
  language: 'vi',
  voiceType: 'cloned',
  presetVoiceId: '',
  consentConfirmed: true,
};

const statusColor = (status?: string): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'ready') return 'success';
  if (status === 'draft' || status === 'processing') return 'warning';
  if (status === 'failed' || status === 'disabled') return 'error';
  return 'default';
};

const getProfileType = (profile: VoiceProfile) => profile.voiceType || profile.voice_type || 'cloned';

const VoiceProfilesPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');
  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
    searchTerm,
    debouncedSearchTerm,
    onSearchChange,
    setPage,
  } = useDataTable({
    initialPageSize: 10,
    initialSorting: [{ id: 'name', desc: false }],
    debounceMs: 350,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<VoiceProfile | null>(null);
  const [deleteProfile, setDeleteProfile] = useState<VoiceProfile | null>(null);
  const [testProfile, setTestProfile] = useState<VoiceProfile | null>(null);
  const [sampleProfile, setSampleProfile] = useState<VoiceProfile | null>(null);
  const [grantProfile, setGrantProfile] = useState<VoiceProfile | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditForm>({ ...EMPTY_CREATE_FORM, status: 'ready', sampleCount: 0 });
  const [createSampleFile, setCreateSampleFile] = useState<File | null>(null);
  const [createSampleText, setCreateSampleText] = useState('');
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleText, setSampleText] = useState('');
  const [grantTargetType, setGrantTargetType] = useState<'company' | 'job'>('company');
  const [grantCompany, setGrantCompany] = useState('');
  const [grantJob, setGrantJob] = useState('');
  const [grantDefault, setGrantDefault] = useState(true);
  const [testText, setTestText] = useState(() => t('pages.voiceProfiles.messages.defaultTestSentence'));
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [preparingProfileId, setPreparingProfileId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [voiceTypeFilter, setVoiceTypeFilter] = useState('all');

  useEffect(() => {
    setPage(0);
  }, [statusFilter, voiceTypeFilter, setPage]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-voice-profiles', page, pageSize, debouncedSearchTerm, statusFilter, voiceTypeFilter, ordering],
    queryFn: () => voiceProfileService.getVoiceProfiles({
      page: page + 1,
      pageSize,
      search: debouncedSearchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      voiceType: voiceTypeFilter === 'all' ? undefined : voiceTypeFilter,
      ordering,
    }),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['admin-voice-profile-companies'],
    queryFn: () => adminManagementService.getCompanies({ page: 1, pageSize: 200 }),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['admin-voice-profile-jobs'],
    queryFn: () => adminJobService.getAllJobs({ page: 1, pageSize: 200 }),
  });

  const profiles = useMemo(() => data?.results ?? [], [data]);
  const totalProfiles = data?.count ?? 0;
  const companies = useMemo(() => companiesData?.results ?? [], [companiesData]);
  const jobs = useMemo(() => jobsData?.results ?? [], [jobsData]);
  const createValidationErrors = useMemo(
    () => getVoiceProfileFormValidationErrors(createForm),
    [createForm],
  );
  const editValidationErrors = useMemo(
    () => getVoiceProfileFormValidationErrors(editForm),
    [editForm],
  );
  const hasCreateValidationErrors = Object.keys(createValidationErrors).length > 0;
  const hasEditValidationErrors = Object.keys(editValidationErrors).length > 0;
  const getVoiceProfileValidationText = (
    errors: VoiceProfileFormValidationErrors,
    field: keyof VoiceProfileFormValidationErrors,
  ) => (
    errors[field]
      ? t(`pages.voiceProfiles.validation.${errors[field]}`)
      : undefined
  );



  const activeFilterCount = [
    Boolean(searchTerm.trim()),
    statusFilter !== 'all',
    voiceTypeFilter !== 'all',
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    setPage(0);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleVoiceTypeFilterChange = (value: string) => {
    setVoiceTypeFilter(value);
    setPage(0);
  };

  const resetFilters = () => {
    handleSearchChange('');
    setStatusFilter('all');
    setVoiceTypeFilter('all');
    setPage(0);
  };

  const getStatusLabel = useCallback((status?: string) => {
    if (status === 'draft') return t('pages.voiceProfiles.statuses.draft');
    if (status === 'processing') return t('pages.voiceProfiles.statuses.processing');
    if (status === 'ready') return t('pages.voiceProfiles.statuses.ready');
    if (status === 'disabled') return t('pages.voiceProfiles.statuses.disabled');
    if (status === 'failed') return t('pages.voiceProfiles.statuses.failed');
    return status || '';
  }, [t]);

  const getVoiceTypeLabel = useCallback((type?: string) => {
    if (type === 'preset') return t('pages.voiceProfiles.types.preset');
    if (type === 'cloned') return t('pages.voiceProfiles.types.cloned');
    return type || '';
  }, [t]);

  const getProfileSampleCount = (profile?: VoiceProfile | null) => profile?.sampleCount ?? profile?.samples?.length ?? 0;
  const getProfileTotalDuration = (profile?: VoiceProfile | null) => Number(profile?.totalDurationSeconds ?? 0);
  const getProfileReadyFlag = useCallback((profile?: VoiceProfile | null) => Boolean(
    profile?.isReadyForTts
    ?? (
      profile?.status === 'ready'
      && (getProfileType(profile as VoiceProfile) === 'preset' || getProfileSampleCount(profile) > 0)
    )
  ), [getProfileType]);

  const resetCreateDialog = () => {
    setCreateOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateSampleFile(null);
    setCreateSampleText('');
  };

  const createMutation = useMutation({
    mutationFn: async (payload: VoiceProfilePayload) => {
      const profile = await voiceProfileService.createVoiceProfile(payload);

      if (payload.voice_type === 'cloned' && createSampleFile && createSampleText.trim()) {
        const formData = new FormData();
        formData.append('audio', createSampleFile);
        formData.append('referenceText', createSampleText.trim());
        await voiceProfileService.uploadSample(profile.id, formData);
      }

      return profile;
    },
    onSuccess: () => {
      toastMessages.success(
        createForm.voiceType === 'cloned'
          ? t('pages.voiceProfiles.toast.createWithSampleSuccess')
          : t('pages.voiceProfiles.toast.createSuccess')
      );
      resetCreateDialog();
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.createError')),
  });

  const prepareMutation = useMutation({
    mutationFn: (id: number) => voiceProfileService.prepareVoiceProfile(id),
    onMutate: (id) => {
      setPreparingProfileId(id);
    },
    onSuccess: (prepared) => {
      if (editProfile && editProfile.id === prepared.id) {
        setEditProfile(prepared);
        setEditForm((prev) => ({
          ...prev,
          status: prepared.status || prev.status,
          sampleCount: prepared.sampleCount ?? prev.sampleCount,
        }));
      }
      toastMessages.success(t('pages.voiceProfiles.toast.prepareSuccess'));
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.prepareError')),
    onSettled: () => {
      setPreparingProfileId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<VoiceProfilePayload> & { status?: string } }) => voiceProfileService.updateVoiceProfile(id, payload),
    onSuccess: () => {
      toastMessages.success(t('pages.voiceProfiles.toast.updateSuccess'));
      setEditProfile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => voiceProfileService.deleteVoiceProfile(id),
    onSuccess: () => {
      toastMessages.success(t('pages.voiceProfiles.toast.deleteSuccess'));
      setDeleteProfile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.deleteError')),
  });

  const testMutation = useMutation({
    mutationFn: async ({ id, text }: { id: number; text: string }) => {
      return aiService.tts({
        text,
        voiceProfileId: id,
        format: 'mp3',
      });
    },
    onSuccess: (blob) => {
      if (testAudioUrl) {
        URL.revokeObjectURL(testAudioUrl);
      }
      const nextUrl = URL.createObjectURL(blob);
      setTestAudioUrl(nextUrl);
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.previewError')),
  });

  const sampleMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => voiceProfileService.uploadSample(id, formData),
    onSuccess: () => {
      toastMessages.success(t('pages.voiceProfiles.toast.sampleSuccess'));
      setSampleProfile(null);
      setSampleFile(null);
      setSampleText('');
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.sampleError')),
  });

  const grantMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      voiceProfileService.createGrant(id, {
        company: grantTargetType === 'company' ? Number(grantCompany) : null,
        jobPost: grantTargetType === 'job' ? Number(grantJob) : null,
        isDefault: grantDefault,
        isActive: true,
      }),
    onSuccess: () => {
      toastMessages.success(t('pages.voiceProfiles.toast.grantSuccess'));
      setGrantProfile(null);
      setGrantCompany('');
      setGrantJob('');
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error(t('pages.voiceProfiles.toast.grantError')),
  });

  const submitCreate = () => {
    if (hasCreateValidationErrors) {
      return;
    }

    if (createForm.voiceType === 'cloned' && (!createSampleFile || !createSampleText.trim())) {
      toastMessages.error(t('pages.voiceProfiles.validation.cloneSampleRequired'));
      return;
    }

    createMutation.mutate({
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      language: createForm.language.trim() || 'vi',
      voice_type: createForm.voiceType,
      preset_voice_id: createForm.voiceType === 'preset' ? createForm.presetVoiceId.trim() : '',
      preset_engine: createForm.voiceType === 'preset' ? 'vieneu' : '',
      consent_confirmed: createForm.voiceType === 'cloned' ? createForm.consentConfirmed : false,
    });
  };

  const openEditDialog = useCallback((profile: VoiceProfile) => {
    setEditProfile(profile);
    setEditForm({
      name: profile.name || '',
      description: profile.description || '',
      language: profile.language || 'vi',
      voiceType: getProfileType(profile),
      presetVoiceId: profile.presetVoiceId || profile.preset_voice_id || '',
      consentConfirmed: Boolean(profile.consentConfirmed ?? profile.consent_confirmed),
      status: profile.status || 'ready',
      sampleCount: getProfileSampleCount(profile),
    });
  }, []);

  const submitEdit = () => {
    if (!editProfile) return;
    if (hasEditValidationErrors) {
      return;
    }

    updateMutation.mutate({
      id: editProfile.id,
      payload: {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        language: editForm.language.trim() || 'vi',
        voice_type: editForm.voiceType,
        status: editForm.status,
        preset_voice_id: editForm.voiceType === 'preset' ? editForm.presetVoiceId.trim() : '',
        preset_engine: editForm.voiceType === 'preset' ? 'vieneu' : '',
        consent_confirmed: editForm.voiceType === 'cloned' ? editForm.consentConfirmed : false,
      },
    });
  };

  const openTestDialog = useCallback((profile: VoiceProfile) => {
    if (!getProfileReadyFlag(profile)) {
      toastMessages.error(t('pages.voiceProfiles.validation.voiceNotReady'));
      return;
    }
    if (testAudioUrl) {
      URL.revokeObjectURL(testAudioUrl);
    }
    setTestAudioUrl(null);
    setTestProfile(profile);
  }, [testAudioUrl, t, getProfileReadyFlag]);

  const closeTestDialog = () => {
    if (testAudioUrl) {
      URL.revokeObjectURL(testAudioUrl);
    }
    setTestAudioUrl(null);
    setTestProfile(null);
  };

  const submitTest = () => {
    if (!testProfile || !testText.trim()) {
      toastMessages.error(t('pages.voiceProfiles.validation.testSentenceRequired'));
      return;
    }
    testMutation.mutate({ id: testProfile.id, text: testText.trim() });
  };

  const submitSample = () => {
    if (!sampleProfile || !sampleFile || !sampleText.trim()) {
      toastMessages.error(t('pages.voiceProfiles.validation.sampleRequired'));
      return;
    }
    const formData = new FormData();
    formData.append('audio', sampleFile);
    formData.append('referenceText', sampleText.trim());
    sampleMutation.mutate({ id: sampleProfile.id, formData });
  };

  const submitPrepareProfile = () => {
    if (!editProfile) return;
    prepareMutation.mutate(editProfile.id);
  };

  const submitGrant = () => {
    if (!grantProfile) return;
    if (grantTargetType === 'company' && !grantCompany) {
      toastMessages.error(t('pages.voiceProfiles.validation.companyRequired'));
      return;
    }
    if (grantTargetType === 'job' && !grantJob) {
      toastMessages.error(t('pages.voiceProfiles.validation.jobRequired'));
      return;
    }
    grantMutation.mutate({ id: grantProfile.id });
  };

  const columns = useMemo<ColumnDef<VoiceProfile>[]>(() => ([
    {
      accessorKey: 'name',
      header: t('pages.voiceProfiles.table.name') as string,
      cell: (info) => {
        const profile = info.row.original;
        return (
          <Box>
            <Typography fontWeight={700}>{profile.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {profile.description || profile.presetVoiceId || profile.preset_voice_id || '-'}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'voiceType',
      header: t('pages.voiceProfiles.table.type') as string,
      cell: (info) => getVoiceTypeLabel(getProfileType(info.row.original)),
    },
    {
      accessorKey: 'status',
      header: t('pages.voiceProfiles.table.status') as string,
      cell: (info) => (
        <Chip label={getStatusLabel(info.row.original.status)} color={statusColor(info.row.original.status)} size="small" />
      ),
    },
    {
      id: 'samples',
      header: t('pages.voiceProfiles.table.samples') as string,
      cell: (info) => info.row.original.sampleCount ?? info.row.original.samples?.length ?? 0,
    },
    {
      id: 'grants',
      header: t('pages.voiceProfiles.table.grants') as string,
      cell: (info) => info.row.original.grantCount ?? info.row.original.grants?.length ?? 0,
    },
    {
      id: 'actions',
      header: t('pages.voiceProfiles.table.actions') as string,
      meta: { align: 'right' as const },
      cell: (info) => {
        const profile = info.row.original;
        return (
          <Stack direction="row" gap={1} justifyContent="flex-end" flexWrap="wrap">
            <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openEditDialog(profile)}>
              {t('pages.voiceProfiles.actions.edit')}
            </Button>
            <IconButton
              size="small"
              color="primary"
              aria-label={t('pages.voiceProfiles.messages.testActionAria', { name: profile.name })}
              disabled={profile.status !== 'ready'}
              onClick={() => openTestDialog(profile)}
            >
              <PlayCircleOutlineIcon fontSize="small" />
            </IconButton>
            {getProfileType(profile) === 'cloned' ? (
              <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setSampleProfile(profile)}>
                {t('pages.voiceProfiles.actions.sample')}
              </Button>
            ) : null}
            <Button size="small" variant="outlined" startIcon={<BusinessIcon />} onClick={() => setGrantProfile(profile)}>
              {t('pages.voiceProfiles.actions.grant')}
            </Button>
            <Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteProfile(profile)}>
              {t('pages.voiceProfiles.actions.delete')}
            </Button>
          </Stack>
        );
      },
    },
  ]), [getStatusLabel, getVoiceTypeLabel, openEditDialog, openTestDialog, t]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {t('pages.voiceProfiles.title')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<GraphicEqIcon />} onClick={() => setCreateOpen(true)}>
          {t('pages.voiceProfiles.newVoice')}
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{t('pages.voiceProfiles.loadError')}</Alert> : null}

      <FilterBar
        title={t('pages.voiceProfiles.filter.title')}
        description={t('pages.voiceProfiles.filter.description')}
        searchValue={searchTerm}
        searchPlaceholder={t('pages.voiceProfiles.searchPlaceholder')}
        onSearchChange={handleSearchChange}
        filtersLabel={t('pages.voiceProfiles.filter.title')}
        advancedLabel={t('pages.voiceProfiles.filter.advanced')}
        activeFilterCount={activeFilterCount}
        onReset={resetFilters}
        resetLabel={t('pages.voiceProfiles.filter.reset')}
      >
        <TextField
          select
          size="small"
          label={t('pages.voiceProfiles.filter.status')}
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          sx={filterControlSx}
        >
          <MenuItem value="all">{t('pages.voiceProfiles.filter.all')}</MenuItem>
          <MenuItem value="draft">{t('pages.voiceProfiles.statuses.draft')}</MenuItem>
          <MenuItem value="processing">{t('pages.voiceProfiles.statuses.processing')}</MenuItem>
          <MenuItem value="ready">{t('pages.voiceProfiles.statuses.ready')}</MenuItem>
          <MenuItem value="disabled">{t('pages.voiceProfiles.statuses.disabled')}</MenuItem>
          <MenuItem value="failed">{t('pages.voiceProfiles.statuses.failed')}</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label={t('pages.voiceProfiles.filter.type')}
          value={voiceTypeFilter}
          onChange={(e) => handleVoiceTypeFilterChange(e.target.value)}
          sx={filterControlSx}
        >
          <MenuItem value="all">{t('pages.voiceProfiles.filter.all')}</MenuItem>
          <MenuItem value="cloned">{t('pages.voiceProfiles.voiceTypes.cloned')}</MenuItem>
          <MenuItem value="preset">{t('pages.voiceProfiles.voiceTypes.preset')}</MenuItem>
        </TextField>
      </FilterBar>

      <DataTable
        columns={columns}
        data={profiles}
        isLoading={isLoading}
        rowCount={totalProfiles}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        enableSorting
        sorting={sorting}
        onSortingChange={onSortingChange}
        emptyMessage={t('pages.voiceProfiles.table.empty')}
      />

      <Dialog open={createOpen} onClose={resetCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('pages.voiceProfiles.dialogs.createTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('pages.voiceProfiles.fields.name')}
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              error={Boolean(createValidationErrors.name)}
              helperText={getVoiceProfileValidationText(createValidationErrors, 'name')}
              fullWidth
            />
            <TextField label={t('pages.voiceProfiles.fields.description')} value={createForm.description} onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField select label={t('pages.voiceProfiles.fields.type')} value={createForm.voiceType} onChange={(e) => setCreateForm((prev) => ({ ...prev, voiceType: e.target.value as CreateForm['voiceType'] }))} fullWidth>
              <MenuItem value="cloned">{t('pages.voiceProfiles.voiceTypes.cloned')}</MenuItem>
              <MenuItem value="preset">{t('pages.voiceProfiles.voiceTypes.preset')}</MenuItem>
            </TextField>
            <TextField
              label={t('pages.voiceProfiles.fields.language')}
              value={createForm.language}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, language: e.target.value }))}
              error={Boolean(createValidationErrors.language)}
              helperText={getVoiceProfileValidationText(createValidationErrors, 'language')}
              fullWidth
            />
            {createForm.voiceType === 'preset' ? (
              <TextField
                label={t('pages.voiceProfiles.fields.presetVoiceId')}
                value={createForm.presetVoiceId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, presetVoiceId: e.target.value }))}
                error={Boolean(createValidationErrors.presetVoiceId)}
                helperText={getVoiceProfileValidationText(createValidationErrors, 'presetVoiceId')}
                fullWidth
              />
            ) : (
              <>
                <Alert severity="info">{t('pages.voiceProfiles.messages.cloneHint')}</Alert>
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                  {createSampleFile ? createSampleFile.name : t('pages.voiceProfiles.messages.chooseAudio')}
                  <input hidden type="file" aria-label={t('pages.voiceProfiles.messages.createSampleAria')} accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.webm" onChange={(e) => setCreateSampleFile(e.target.files?.[0] ?? null)} />
                </Button>
                <TextField label={t('pages.voiceProfiles.fields.exactTranscript')} value={createSampleText} onChange={(e) => setCreateSampleText(e.target.value)} fullWidth multiline minRows={3} />
                <FormControlLabel
                  control={<Switch checked={createForm.consentConfirmed} onChange={(e) => setCreateForm((prev) => ({ ...prev, consentConfirmed: e.target.checked }))} />}
                  label={t('pages.voiceProfiles.messages.permissionConfirm')}
                />
                {createValidationErrors.consentConfirmed ? (
                  <FormHelperText error>
                    {getVoiceProfileValidationText(createValidationErrors, 'consentConfirmed')}
                  </FormHelperText>
                ) : null}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetCreateDialog}>{t('pages.voiceProfiles.actions.cancel')}</Button>
          <Button
            variant="contained"
            disabled={hasCreateValidationErrors || createMutation.isPending}
            onClick={submitCreate}
          >
            {createMutation.isPending ? <CircularProgress size={18} /> : createForm.voiceType === 'cloned' ? t('pages.voiceProfiles.actions.createAndUpload') : t('pages.voiceProfiles.actions.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editProfile} onClose={() => setEditProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('pages.voiceProfiles.dialogs.editTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('pages.voiceProfiles.fields.name')}
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              error={Boolean(editValidationErrors.name)}
              helperText={getVoiceProfileValidationText(editValidationErrors, 'name')}
              fullWidth
            />
            <TextField label={t('pages.voiceProfiles.fields.description')} value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField select label={t('pages.voiceProfiles.fields.type')} value={editForm.voiceType} onChange={(e) => setEditForm((prev) => ({ ...prev, voiceType: e.target.value as EditForm['voiceType'] }))} fullWidth>
              <MenuItem value="cloned">{t('pages.voiceProfiles.voiceTypes.cloned')}</MenuItem>
              <MenuItem value="preset">{t('pages.voiceProfiles.voiceTypes.preset')}</MenuItem>
            </TextField>
            <TextField select label={t('pages.voiceProfiles.fields.status')} value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))} fullWidth>
              <MenuItem value="draft">{t('pages.voiceProfiles.statuses.draft')}</MenuItem>
              <MenuItem value="processing">{t('pages.voiceProfiles.statuses.processing')}</MenuItem>
              <MenuItem value="ready">{t('pages.voiceProfiles.statuses.ready')}</MenuItem>
              <MenuItem value="disabled">{t('pages.voiceProfiles.statuses.disabled')}</MenuItem>
              <MenuItem value="failed">{t('pages.voiceProfiles.statuses.failed')}</MenuItem>
            </TextField>
            {getVoiceProfileValidationText(editValidationErrors, 'sampleCount') ? (
              <FormHelperText error>
                {getVoiceProfileValidationText(editValidationErrors, 'sampleCount')}
              </FormHelperText>
            ) : null}
            {editForm.voiceType === 'cloned' ? (
              <Alert severity={getProfileReadyFlag(editProfile) ? 'success' : 'info'}>
                {t('pages.voiceProfiles.messages.preparationSummary', {
                  sampleCount: editForm.sampleCount,
                  totalDurationSeconds: getProfileTotalDuration(editProfile).toFixed(2),
                  readyLabel: getProfileReadyFlag(editProfile)
                    ? t('pages.voiceProfiles.messages.readyForReuse')
                    : t('pages.voiceProfiles.messages.needsPrepare'),
                })}
              </Alert>
            ) : null}
            <TextField
              label={t('pages.voiceProfiles.fields.language')}
              value={editForm.language}
              onChange={(e) => setEditForm((prev) => ({ ...prev, language: e.target.value }))}
              error={Boolean(editValidationErrors.language)}
              helperText={getVoiceProfileValidationText(editValidationErrors, 'language')}
              fullWidth
            />
            {editForm.voiceType === 'preset' ? (
              <TextField
                label={t('pages.voiceProfiles.fields.presetVoiceId')}
                value={editForm.presetVoiceId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, presetVoiceId: e.target.value }))}
                error={Boolean(editValidationErrors.presetVoiceId)}
                helperText={getVoiceProfileValidationText(editValidationErrors, 'presetVoiceId')}
                fullWidth
              />
            ) : (
              <>
                <FormControlLabel
                  control={<Switch checked={editForm.consentConfirmed} onChange={(e) => setEditForm((prev) => ({ ...prev, consentConfirmed: e.target.checked }))} />}
                  label={t('pages.voiceProfiles.messages.permissionConfirm')}
                />
                {editValidationErrors.consentConfirmed ? (
                  <FormHelperText error>
                    {getVoiceProfileValidationText(editValidationErrors, 'consentConfirmed')}
                  </FormHelperText>
                ) : null}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfile(null)}>{t('pages.voiceProfiles.actions.cancel')}</Button>
          {editForm.voiceType === 'cloned' ? (
            <Button
              variant="outlined"
              startIcon={<GraphicEqIcon />}
              disabled={prepareMutation.isPending || !editProfile}
              onClick={submitPrepareProfile}
            >
              {prepareMutation.isPending && preparingProfileId === editProfile?.id ? <CircularProgress size={18} /> : t('pages.voiceProfiles.actions.prepareVoice')}
            </Button>
          ) : null}
          <Button variant="contained" disabled={hasEditValidationErrors || updateMutation.isPending} onClick={submitEdit}>
            {updateMutation.isPending ? <CircularProgress size={18} /> : t('pages.voiceProfiles.actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteProfile} onClose={() => setDeleteProfile(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t('pages.voiceProfiles.dialogs.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.voiceProfiles.messages.deleteConfirm', { name: deleteProfile?.name || '' })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProfile(null)}>{t('pages.voiceProfiles.actions.cancel')}</Button>
          <Button color="error" variant="contained" disabled={deleteMutation.isPending || !deleteProfile} onClick={() => deleteProfile && deleteMutation.mutate(deleteProfile.id)}>
            {deleteMutation.isPending ? <CircularProgress size={18} /> : t('pages.voiceProfiles.actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!testProfile} onClose={closeTestDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('pages.voiceProfiles.dialogs.testTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {testProfile?.name}
            </Typography>
            <TextField
              label={t('pages.voiceProfiles.fields.testSentence')}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            {testAudioUrl ? (
              <Box component="audio" src={testAudioUrl} controls autoPlay aria-label={t('pages.voiceProfiles.messages.generatedPreviewAria')} sx={{ width: '100%' }}>
                <track kind="captions" />
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTestDialog}>{t('pages.voiceProfiles.actions.close')}</Button>
          <Button variant="contained" startIcon={<PlayCircleOutlineIcon />} disabled={testMutation.isPending || !testText.trim()} onClick={submitTest}>
            {testMutation.isPending ? <CircularProgress size={18} /> : t('pages.voiceProfiles.actions.generateAndPlay')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!sampleProfile} onClose={() => setSampleProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('pages.voiceProfiles.dialogs.sampleTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">{t('pages.voiceProfiles.messages.sampleHint')}</Alert>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              {sampleFile ? sampleFile.name : t('pages.voiceProfiles.messages.chooseAudio')}
              <input hidden type="file" aria-label={t('pages.voiceProfiles.messages.uploadSampleAria')} accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.webm" onChange={(e) => setSampleFile(e.target.files?.[0] ?? null)} />
            </Button>
            <TextField label={t('pages.voiceProfiles.fields.exactTranscript')} value={sampleText} onChange={(e) => setSampleText(e.target.value)} fullWidth multiline minRows={4} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSampleProfile(null)}>{t('pages.voiceProfiles.actions.cancel')}</Button>
          <Button variant="contained" disabled={sampleMutation.isPending} onClick={submitSample}>
            {sampleMutation.isPending ? <CircularProgress size={18} /> : t('pages.voiceProfiles.actions.upload')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!grantProfile} onClose={() => setGrantProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('pages.voiceProfiles.dialogs.grantTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t('pages.voiceProfiles.fields.grantTo')} value={grantTargetType} onChange={(e) => setGrantTargetType(e.target.value as 'company' | 'job')} fullWidth>
              <MenuItem value="company">{t('pages.voiceProfiles.grantTargets.company')}</MenuItem>
              <MenuItem value="job">{t('pages.voiceProfiles.grantTargets.job')}</MenuItem>
            </TextField>
            {grantTargetType === 'company' ? (
              <TextField select label={t('pages.voiceProfiles.fields.company')} value={grantCompany} onChange={(e) => setGrantCompany(e.target.value)} fullWidth>
                {companies.map((company) => <MenuItem key={company.id} value={company.id}>{company.companyName}</MenuItem>)}
              </TextField>
            ) : (
              <TextField select label={t('pages.voiceProfiles.fields.jobPost')} value={grantJob} onChange={(e) => setGrantJob(e.target.value)} fullWidth>
                {jobs.map((job) => <MenuItem key={job.id} value={job.id}>{job.jobName}</MenuItem>)}
              </TextField>
            )}
            <FormControlLabel
              control={<Switch checked={grantDefault} onChange={(e) => setGrantDefault(e.target.checked)} />}
              label={t('pages.voiceProfiles.messages.defaultVoice')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrantProfile(null)}>{t('pages.voiceProfiles.actions.cancel')}</Button>
          <Button variant="contained" disabled={grantMutation.isPending} onClick={submitGrant}>
            {grantMutation.isPending ? <CircularProgress size={18} /> : t('pages.voiceProfiles.actions.grant')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoiceProfilesPage;
