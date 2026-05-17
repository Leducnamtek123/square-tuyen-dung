'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminJobService from '../../../services/adminJobService';
import adminManagementService from '../../../services/adminManagementService';
import aiService from '../../../services/aiService';
import voiceProfileService, { type VoiceProfilePayload } from '../../../services/voiceProfileService';
import type { VoiceProfile } from '../../../types/models';
import toastMessages from '../../../utils/toastMessages';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<VoiceProfile | null>(null);
  const [deleteProfile, setDeleteProfile] = useState<VoiceProfile | null>(null);
  const [testProfile, setTestProfile] = useState<VoiceProfile | null>(null);
  const [sampleProfile, setSampleProfile] = useState<VoiceProfile | null>(null);
  const [grantProfile, setGrantProfile] = useState<VoiceProfile | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditForm>({ ...EMPTY_CREATE_FORM, status: 'ready' });
  const [createSampleFile, setCreateSampleFile] = useState<File | null>(null);
  const [createSampleText, setCreateSampleText] = useState('');
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleText, setSampleText] = useState('');
  const [grantTargetType, setGrantTargetType] = useState<'company' | 'job'>('company');
  const [grantCompany, setGrantCompany] = useState('');
  const [grantJob, setGrantJob] = useState('');
  const [grantDefault, setGrantDefault] = useState(true);
  const [testText, setTestText] = useState('Xin chào, đây là giọng phỏng vấn AI của Square.');
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-voice-profiles'],
    queryFn: () => voiceProfileService.getVoiceProfiles({ page: 1, pageSize: 100 }),
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
  const companies = useMemo(() => companiesData?.results ?? [], [companiesData]);
  const jobs = useMemo(() => jobsData?.results ?? [], [jobsData]);

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
      toastMessages.success(createForm.voiceType === 'cloned' ? 'Voice profile and sample created.' : 'Voice profile created.');
      resetCreateDialog();
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error('Could not create voice profile.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<VoiceProfilePayload> & { status?: string } }) => voiceProfileService.updateVoiceProfile(id, payload),
    onSuccess: () => {
      toastMessages.success('Voice profile updated.');
      setEditProfile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error('Could not update voice profile.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => voiceProfileService.deleteVoiceProfile(id),
    onSuccess: () => {
      toastMessages.success('Voice profile deleted.');
      setDeleteProfile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error('Could not delete voice profile.'),
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
    onError: () => toastMessages.error('Could not generate voice preview.'),
  });

  const sampleMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => voiceProfileService.uploadSample(id, formData),
    onSuccess: () => {
      toastMessages.success('Voice sample uploaded.');
      setSampleProfile(null);
      setSampleFile(null);
      setSampleText('');
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error('Could not upload voice sample.'),
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
      toastMessages.success('Voice access granted.');
      setGrantProfile(null);
      setGrantCompany('');
      setGrantJob('');
      queryClient.invalidateQueries({ queryKey: ['admin-voice-profiles'] });
    },
    onError: () => toastMessages.error('Could not grant voice access.'),
  });

  const submitCreate = () => {
    if (createForm.voiceType === 'cloned' && (!createSampleFile || !createSampleText.trim())) {
      toastMessages.error('Audio file and exact transcript are required for cloned voices.');
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

  const openEditDialog = (profile: VoiceProfile) => {
    setEditProfile(profile);
    setEditForm({
      name: profile.name || '',
      description: profile.description || '',
      language: profile.language || 'vi',
      voiceType: getProfileType(profile),
      presetVoiceId: profile.presetVoiceId || profile.preset_voice_id || '',
      consentConfirmed: Boolean(profile.consentConfirmed ?? profile.consent_confirmed),
      status: profile.status || 'ready',
    });
  };

  const submitEdit = () => {
    if (!editProfile) return;
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

  const openTestDialog = (profile: VoiceProfile) => {
    if (profile.status !== 'ready') {
      toastMessages.error('Voice must be ready before testing.');
      return;
    }
    if (testAudioUrl) {
      URL.revokeObjectURL(testAudioUrl);
    }
    setTestAudioUrl(null);
    setTestProfile(profile);
  };

  const closeTestDialog = () => {
    if (testAudioUrl) {
      URL.revokeObjectURL(testAudioUrl);
    }
    setTestAudioUrl(null);
    setTestProfile(null);
  };

  const submitTest = () => {
    if (!testProfile || !testText.trim()) {
      toastMessages.error('Enter a sentence to test this voice.');
      return;
    }
    testMutation.mutate({ id: testProfile.id, text: testText.trim() });
  };

  const submitSample = () => {
    if (!sampleProfile || !sampleFile || !sampleText.trim()) {
      toastMessages.error('Audio file and transcript are required.');
      return;
    }
    const formData = new FormData();
    formData.append('audio', sampleFile);
    formData.append('referenceText', sampleText.trim());
    sampleMutation.mutate({ id: sampleProfile.id, formData });
  };

  const submitGrant = () => {
    if (!grantProfile) return;
    if (grantTargetType === 'company' && !grantCompany) {
      toastMessages.error('Select a company.');
      return;
    }
    if (grantTargetType === 'job' && !grantJob) {
      toastMessages.error('Select a job post.');
      return;
    }
    grantMutation.mutate({ id: grantProfile.id });
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Voice Profiles
          </Typography>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" href="/admin">Admin</Link>
            <Typography color="text.primary">Voice Profiles</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<GraphicEqIcon />} onClick={() => setCreateOpen(true)}>
          New Voice
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>Could not load voice profiles.</Alert> : null}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Samples</TableCell>
                  <TableCell>Grants</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{profile.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{profile.description || profile.presetVoiceId || profile.preset_voice_id}</Typography>
                    </TableCell>
                    <TableCell>{getProfileType(profile)}</TableCell>
                    <TableCell><Chip label={profile.status} color={statusColor(profile.status)} size="small" /></TableCell>
                    <TableCell>{profile.sampleCount ?? profile.samples?.length ?? 0}</TableCell>
                    <TableCell>{profile.grantCount ?? profile.grants?.length ?? 0}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openEditDialog(profile)}>
                          Edit
                        </Button>
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label={`Test ${profile.name}`}
                          disabled={profile.status !== 'ready'}
                          onClick={() => openTestDialog(profile)}
                        >
                          <PlayCircleOutlineIcon fontSize="small" />
                        </IconButton>
                        {getProfileType(profile) === 'cloned' ? (
                          <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setSampleProfile(profile)}>
                            Sample
                          </Button>
                        ) : null}
                        <Button size="small" variant="outlined" startIcon={<BusinessIcon />} onClick={() => setGrantProfile(profile)}>
                          Grant
                        </Button>
                        <Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteProfile(profile)}>
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No voice profiles yet.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={resetCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>New Voice Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={createForm.name} onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Description" value={createForm.description} onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField select label="Type" value={createForm.voiceType} onChange={(e) => setCreateForm((prev) => ({ ...prev, voiceType: e.target.value as CreateForm['voiceType'] }))} fullWidth>
              <MenuItem value="cloned">Cloned</MenuItem>
              <MenuItem value="preset">Preset</MenuItem>
            </TextField>
            <TextField label="Language" value={createForm.language} onChange={(e) => setCreateForm((prev) => ({ ...prev, language: e.target.value }))} fullWidth />
            {createForm.voiceType === 'preset' ? (
              <TextField label="Preset voice ID" value={createForm.presetVoiceId} onChange={(e) => setCreateForm((prev) => ({ ...prev, presetVoiceId: e.target.value }))} fullWidth />
            ) : (
              <>
                <Alert severity="info">Upload a clean mp3/wav sample and paste the exact transcript for cloning.</Alert>
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                  {createSampleFile ? createSampleFile.name : 'Choose mp3/wav'}
                  <input hidden type="file" accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.webm" onChange={(e) => setCreateSampleFile(e.target.files?.[0] ?? null)} />
                </Button>
                <TextField label="Exact transcript" value={createSampleText} onChange={(e) => setCreateSampleText(e.target.value)} fullWidth multiline minRows={3} />
                <FormControlLabel
                  control={<Switch checked={createForm.consentConfirmed} onChange={(e) => setCreateForm((prev) => ({ ...prev, consentConfirmed: e.target.checked }))} />}
                  label="I confirm we have permission to clone and use this voice."
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetCreateDialog}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!createForm.name.trim() || createMutation.isPending}
            onClick={submitCreate}
          >
            {createMutation.isPending ? <CircularProgress size={18} /> : createForm.voiceType === 'cloned' ? 'Create & Upload' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editProfile} onClose={() => setEditProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Voice Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Description" value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField select label="Type" value={editForm.voiceType} onChange={(e) => setEditForm((prev) => ({ ...prev, voiceType: e.target.value as EditForm['voiceType'] }))} fullWidth>
              <MenuItem value="cloned">Cloned</MenuItem>
              <MenuItem value="preset">Preset</MenuItem>
            </TextField>
            <TextField select label="Status" value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))} fullWidth>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
            <TextField label="Language" value={editForm.language} onChange={(e) => setEditForm((prev) => ({ ...prev, language: e.target.value }))} fullWidth />
            {editForm.voiceType === 'preset' ? (
              <TextField label="Preset voice ID" value={editForm.presetVoiceId} onChange={(e) => setEditForm((prev) => ({ ...prev, presetVoiceId: e.target.value }))} fullWidth />
            ) : (
              <FormControlLabel
                control={<Switch checked={editForm.consentConfirmed} onChange={(e) => setEditForm((prev) => ({ ...prev, consentConfirmed: e.target.checked }))} />}
                label="I confirm we have permission to clone and use this voice."
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfile(null)}>Cancel</Button>
          <Button variant="contained" disabled={!editForm.name.trim() || updateMutation.isPending} onClick={submitEdit}>
            {updateMutation.isPending ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteProfile} onClose={() => setDeleteProfile(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Voice Profile</DialogTitle>
        <DialogContent>
          <Typography>
            Delete "{deleteProfile?.name}"? This also removes its samples and grants.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProfile(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={deleteMutation.isPending || !deleteProfile} onClick={() => deleteProfile && deleteMutation.mutate(deleteProfile.id)}>
            {deleteMutation.isPending ? <CircularProgress size={18} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!testProfile} onClose={closeTestDialog} fullWidth maxWidth="sm">
        <DialogTitle>Test Voice</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {testProfile?.name}
            </Typography>
            <TextField
              label="Test sentence"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            {testAudioUrl ? (
              <Box component="audio" src={testAudioUrl} controls autoPlay sx={{ width: '100%' }} />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTestDialog}>Close</Button>
          <Button variant="contained" startIcon={<PlayCircleOutlineIcon />} disabled={testMutation.isPending || !testText.trim()} onClick={submitTest}>
            {testMutation.isPending ? <CircularProgress size={18} /> : 'Generate & Play'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!sampleProfile} onClose={() => setSampleProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>Upload Voice Sample</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">Use 10-30 seconds of clean speech and paste the exact transcript.</Alert>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              {sampleFile ? sampleFile.name : 'Choose mp3/wav'}
              <input hidden type="file" accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.webm" onChange={(e) => setSampleFile(e.target.files?.[0] ?? null)} />
            </Button>
            <TextField label="Exact transcript" value={sampleText} onChange={(e) => setSampleText(e.target.value)} fullWidth multiline minRows={4} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSampleProfile(null)}>Cancel</Button>
          <Button variant="contained" disabled={sampleMutation.isPending} onClick={submitSample}>
            {sampleMutation.isPending ? <CircularProgress size={18} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!grantProfile} onClose={() => setGrantProfile(null)} fullWidth maxWidth="sm">
        <DialogTitle>Grant Voice Access</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Grant to" value={grantTargetType} onChange={(e) => setGrantTargetType(e.target.value as 'company' | 'job')} fullWidth>
              <MenuItem value="company">Company</MenuItem>
              <MenuItem value="job">Job post</MenuItem>
            </TextField>
            {grantTargetType === 'company' ? (
              <TextField select label="Company" value={grantCompany} onChange={(e) => setGrantCompany(e.target.value)} fullWidth>
                {companies.map((company) => <MenuItem key={company.id} value={company.id}>{company.companyName}</MenuItem>)}
              </TextField>
            ) : (
              <TextField select label="Job post" value={grantJob} onChange={(e) => setGrantJob(e.target.value)} fullWidth>
                {jobs.map((job) => <MenuItem key={job.id} value={job.id}>{job.jobName}</MenuItem>)}
              </TextField>
            )}
            <FormControlLabel
              control={<Switch checked={grantDefault} onChange={(e) => setGrantDefault(e.target.checked)} />}
              label="Use as default voice for this target"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrantProfile(null)}>Cancel</Button>
          <Button variant="contained" disabled={grantMutation.isPending} onClick={submitGrant}>
            {grantMutation.isPending ? <CircularProgress size={18} /> : 'Grant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoiceProfilesPage;
