'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import companyTeamService from '@/services/companyTeamService';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import type { CompanyMember, CompanyRole } from '@/types/models';

type RoleForm = {
  id?: number;
  code: string;
  name: string;
  description: string;
  permissions: string[];
};

type MemberForm = {
  id?: number;
  userId: string;
  roleId: string;
  status: string;
};

const emptyRoleForm: RoleForm = { code: '', name: '', description: '', permissions: [] };
const emptyMemberForm: MemberForm = { userId: '', roleId: '', status: 'ACTIVE' };

const companyPermissionOptions = [
  'manage_company_profile',
  'manage_job_posts',
  'manage_candidates',
  'manage_interviews',
  'manage_question_bank',
  'manage_employees',
  'manage_members',
  'manage_roles',
];

const tableContainerSx = {
  border: '1px solid #e2e8f0',
  borderRadius: 3,
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  bgcolor: '#ffffff',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
};

const tableHeaderCellSx = {
  bgcolor: '#f8fafc',
  color: '#475569',
  fontWeight: 800,
  fontSize: '0.8125rem',
  py: 1.5,
  borderBottom: '1px solid #e2e8f0',
};

const CompanyTeamCard = () => {
  const { t } = useTranslation(['employer', 'common']);
  const queryClient = useQueryClient();
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const { data: roleData, isLoading: rolesLoading } = useQuery({
    queryKey: ['companyRoles'],
    queryFn: () => companyTeamService.getRoles({ pageSize: 200 }),
  });
  const { data: memberData, isLoading: membersLoading } = useQuery({
    queryKey: ['companyMembers'],
    queryFn: () => companyTeamService.getMembers({ pageSize: 200 }),
  });

  const roles = useMemo(() => roleData?.results || [], [roleData]);
  const members = useMemo(() => memberData?.results || [], [memberData]);

  const isSystemRole = (role: CompanyRole) => Boolean(role.isSystem || role.is_system);

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case '*':
        return t('employer:company.team.permissionLabels.all');
      case 'manage_company_profile':
        return t('employer:company.team.permissionLabels.manageCompanyProfile');
      case 'manage_job_posts':
        return t('employer:company.team.permissionLabels.manageJobPosts');
      case 'manage_candidates':
        return t('employer:company.team.permissionLabels.manageCandidates');
      case 'manage_interviews':
        return t('employer:company.team.permissionLabels.manageInterviews');
      case 'manage_question_bank':
        return t('employer:company.team.permissionLabels.manageQuestionBank');
      case 'manage_employees':
        return t('employer:company.team.permissionLabels.manageEmployees');
      case 'manage_members':
        return t('employer:company.team.permissionLabels.manageMembers');
      case 'manage_roles':
        return t('employer:company.team.permissionLabels.manageRoles');
      default:
        return permission;
    }
  };

  const toggleRolePermission = (permission: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((item) => item !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const invalidateTeam = () => {
    queryClient.invalidateQueries({ queryKey: ['companyRoles'] });
    queryClient.invalidateQueries({ queryKey: ['companyMembers'] });
  };

  const roleMutation = useMutation({
    mutationFn: (form: RoleForm) => {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.permissions,
      };
      if (form.id) {
        return companyTeamService.updateRole(form.id, payload);
      }
      return companyTeamService.createRole(payload);
    },
    onSuccess: () => {
      toastMessages.success(t('common:messages.saveSuccess'));
      setRoleDialogOpen(false);
      setRoleForm(emptyRoleForm);
      invalidateTeam();
    },
    onError: (error) => {
      errorHandling(error);
    },
  });

  const memberMutation = useMutation({
    mutationFn: (form: MemberForm) => {
      const payload = {
        userId: Number(form.userId),
        roleId: Number(form.roleId),
        status: form.status,
      };
      if (form.id) {
        return companyTeamService.updateMember(form.id, payload);
      }
      return companyTeamService.createMember(payload);
    },
    onSuccess: () => {
      toastMessages.success(t('common:messages.saveSuccess'));
      setMemberDialogOpen(false);
      setMemberForm(emptyMemberForm);
      invalidateTeam();
    },
    onError: (error) => {
      errorHandling(error);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => companyTeamService.deleteRole(roleId),
    onSuccess: () => {
      toastMessages.success(t('employer:company.team.deleteSuccess'));
      invalidateTeam();
    },
    onError: (error) => {
      errorHandling(error);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: number) => companyTeamService.deleteMember(memberId),
    onSuccess: () => {
      toastMessages.success(t('employer:company.team.deleteSuccess'));
      invalidateTeam();
    },
    onError: (error) => {
      errorHandling(error);
    },
  });

  const openCreateRole = () => {
    setRoleForm(emptyRoleForm);
    setRoleDialogOpen(true);
  };

  const openEditRole = (role: CompanyRole) => {
    setRoleForm({
      id: role.id,
      code: role.code || '',
      name: role.name || '',
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setRoleDialogOpen(true);
  };

  const openCreateMember = () => {
    const defaultRoleId = roles[0] ? String(roles[0].id) : '';
    setMemberForm({ userId: '', roleId: defaultRoleId, status: 'ACTIVE' });
    setMemberDialogOpen(true);
  };

  const openEditMember = (member: CompanyMember) => {
    setMemberForm({
      id: member.id,
      userId: String(member.userId || member.userDict?.id || ''),
      roleId: String(member.roleId || member.role?.id || ''),
      status: member.status || 'ACTIVE',
    });
    setMemberDialogOpen(true);
  };

  const handleDeleteRole = (role: CompanyRole) => {
    confirmModal(
      () => deleteRoleMutation.mutate(role.id),
      t('employer:company.team.deleteRoleTitle'),
      t('employer:company.team.deleteRoleConfirm'),
      'warning',
    );
  };

  const handleDeleteMember = (member: CompanyMember) => {
    confirmModal(
      () => deleteMemberMutation.mutate(member.id),
      t('employer:company.team.deleteMemberTitle'),
      t('employer:company.team.deleteMemberConfirm'),
      'warning',
    );
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Chip
            label={t('employer:company.team.statusActive')}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              bgcolor: '#f0fdf4',
              color: '#16a34a',
              borderRadius: 2,
            }}
          />
        );
      case 'INVITED':
        return (
          <Chip
            label={t('employer:company.team.statusInvited')}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              bgcolor: '#fffbeb',
              color: '#d97706',
              borderRadius: 2,
            }}
          />
        );
      case 'DISABLED':
        return (
          <Chip
            label={t('employer:company.team.statusDisabled')}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              bgcolor: '#f1f5f9',
              color: '#64748b',
              borderRadius: 2,
            }}
          />
        );
      default:
        return <Typography variant="caption">{status || '---'}</Typography>;
    }
  };

  const isSaving = roleMutation.isPending || memberMutation.isPending;

  return (
    <Stack spacing={4}>
      {/* 1. Bảng Vai trò & Phân quyền */}
      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                {t('employer:company.team.rolesTitle')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                {t('employer:company.team.rolesSubtitle')}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateRole}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: '#2563eb',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {t('employer:company.team.addRole')}
          </Button>
        </Stack>

        <TableContainer sx={tableContainerSx}>
          <Table size="medium" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellSx}>{t('employer:company.team.roleName')}</TableCell>
                <TableCell sx={tableHeaderCellSx}>{t('employer:company.team.roleCode')}</TableCell>
                <TableCell sx={tableHeaderCellSx}>{t('employer:company.team.permissions')}</TableCell>
                <TableCell sx={tableHeaderCellSx} align="right">{t('common:actions.title')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rolesLoading && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: '#64748b' }}>{t('common:loading')}</TableCell></TableRow>
              )}
              {!rolesLoading && roles.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: '#64748b' }}>{t('employer:company.team.noRoles')}</TableCell></TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{role.name}</span>
                      {isSystemRole(role) && (
                        <Tooltip title={t('employer:company.team.systemRoleLocked')}>
                          <LockOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>{role.code || '---'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {(role.permissions || []).map((perm) => (
                        <Chip
                          key={typeof perm === 'object' ? String((perm as any).id ?? (perm as any).code) : String(perm)}
                          label={getPermissionLabel(perm)}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            bgcolor: '#f1f5f9',
                            color: '#334155',
                            borderRadius: 1.5,
                          }}
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title={isSystemRole(role) ? t('employer:company.team.systemRoleLocked') : t('common:actions.edit')}>
                        <span>
                          <IconButton aria-label="Thao tác" size="small" disabled={isSystemRole(role)} onClick={() => openEditRole(role)} sx={{ color: '#64748b' }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={isSystemRole(role) ? t('employer:company.team.systemRoleLocked') : t('common:actions.delete')}>
                        <span>
                          <IconButton aria-label="Thao tác" size="small" color="error" disabled={isSystemRole(role)} onClick={() => handleDeleteRole(role)}>
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 2. Bảng Thành viên */}
      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GroupOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                {t('employer:company.team.membersTitle')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                {t('employer:company.team.membersSubtitle')}
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateMember}
            disabled={roles.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2,
              bgcolor: '#2563eb',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {t('employer:company.team.addMember')}
          </Button>
        </Stack>

        <TableContainer sx={tableContainerSx}>
          <Table size="medium" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellSx}>{t('employer:company.team.member')}</TableCell>
                <TableCell sx={tableHeaderCellSx}>{t('employer:company.team.roleName')}</TableCell>
                <TableCell sx={tableHeaderCellSx}>{t('employer:company.team.status')}</TableCell>
                <TableCell sx={tableHeaderCellSx} align="right">{t('common:actions.title')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {membersLoading && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: '#64748b' }}>{t('common:loading')}</TableCell></TableRow>
              )}
              {!membersLoading && members.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: '#64748b' }}>{t('employer:company.team.noMembers')}</TableCell></TableRow>
              )}
              {members.map((member) => (
                <TableRow key={member.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {member.userDict?.fullName || member.userDict?.email || `#${member.userId || member.userDict?.id || member.id}`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.role?.name || member.roleId || '---'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: 1.5,
                      }}
                    />
                  </TableCell>
                  <TableCell>{renderStatusBadge(member.status)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title={t('common:actions.edit')}>
                        <IconButton aria-label="Thao tác" size="small" onClick={() => openEditMember(member)} sx={{ color: '#64748b' }}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common:actions.delete')}>
                        <IconButton aria-label="Thao tác" size="small" color="error" onClick={() => handleDeleteMember(member)}>
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {roleForm.id ? t('employer:company.team.editRole') : t('employer:company.team.createRole')}
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2.5}>
            <TextField
              label={t('employer:company.team.roleCode')}
              value={roleForm.code}
              onChange={(event) => setRoleForm((prev) => ({ ...prev, code: event.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label={t('employer:company.team.roleName')}
              value={roleForm.name}
              onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label={t('employer:company.team.roleDescription')}
              value={roleForm.description}
              onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                {t('employer:company.team.permissions')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                {t('employer:company.team.permissionsHint')}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5 }}>
                {companyPermissionOptions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={(
                      <Checkbox
                        size="small"
                        checked={roleForm.permissions.includes(permission)}
                        onChange={() => toggleRolePermission(permission)}
                        sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#2563eb' } }}
                      />
                    )}
                    label={<Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{getPermissionLabel(permission)}</Typography>}
                  />
                ))}
              </Box>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setRoleDialogOpen(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={!roleForm.code.trim() || !roleForm.name.trim() || isSaving}
            onClick={() => roleMutation.mutate(roleForm)}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Dialog */}
      <Dialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {memberForm.id ? t('employer:company.team.editMember') : t('employer:company.team.createMember')}
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2.5}>
            <TextField
              label={t('employer:company.team.userId')}
              type="number"
              value={memberForm.userId}
              disabled={Boolean(memberForm.id)}
              onChange={(event) => setMemberForm((prev) => ({ ...prev, userId: event.target.value }))}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>{t('employer:company.team.roleName')}</InputLabel>
              <Select
                label={t('employer:company.team.roleName')}
                value={memberForm.roleId}
                onChange={(event) => setMemberForm((prev) => ({ ...prev, roleId: event.target.value }))}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={String(role.id)}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>{t('employer:company.team.status')}</InputLabel>
              <Select
                label={t('employer:company.team.status')}
                value={memberForm.status}
                onChange={(event) => setMemberForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <MenuItem value="ACTIVE">{t('employer:company.team.statusActive')}</MenuItem>
                <MenuItem value="INVITED">{t('employer:company.team.statusInvited')}</MenuItem>
                <MenuItem value="DISABLED">{t('employer:company.team.statusDisabled')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setMemberDialogOpen(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={!memberForm.userId || !memberForm.roleId || isSaving}
            onClick={() => memberMutation.mutate(memberForm)}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#2563eb' }}
          >
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CompanyTeamCard;
