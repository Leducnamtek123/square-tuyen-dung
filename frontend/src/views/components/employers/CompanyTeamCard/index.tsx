'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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

const tableSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  overflow: 'hidden',
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

  const formatPermissions = (permissions?: string[]) => {
    if (!permissions?.length) return '---';
    return permissions.map(getPermissionLabel).join(', ');
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
      return form.id
        ? companyTeamService.updateRole(form.id, payload)
        : companyTeamService.createRole(payload);
    },
    onSuccess: () => {
      invalidateTeam();
      setRoleDialogOpen(false);
      toastMessages.success(t('common:messages.saveSuccess'));
    },
    onError: (error) => errorHandling(error),
  });

  const memberMutation = useMutation({
    mutationFn: (form: MemberForm) => {
      const payload = {
        userId: Number(form.userId),
        roleId: Number(form.roleId),
        status: form.status,
      };
      return form.id
        ? companyTeamService.updateMember(form.id, payload)
        : companyTeamService.createMember(payload);
    },
    onSuccess: () => {
      invalidateTeam();
      setMemberDialogOpen(false);
      toastMessages.success(t('common:messages.saveSuccess'));
    },
    onError: (error) => errorHandling(error),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => companyTeamService.deleteRole(id),
    onSuccess: invalidateTeam,
    onError: (error) => errorHandling(error),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => companyTeamService.deleteMember(id),
    onSuccess: invalidateTeam,
    onError: (error) => errorHandling(error),
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
      permissions: role.permissions?.filter((permission) => permission !== '*') || [],
    });
    setRoleDialogOpen(true);
  };

  const openCreateMember = () => {
    setMemberForm({ ...emptyMemberForm, roleId: roles[0]?.id ? String(roles[0].id) : '' });
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
      () => deleteRoleMutation.mutateAsync(role.id),
      t('employer:company.team.deleteRoleTitle'),
      t('employer:company.team.deleteRoleConfirm', { name: role.name }),
      'warning',
    );
  };

  const handleDeleteMember = (member: CompanyMember) => {
    confirmModal(
      () => deleteMemberMutation.mutateAsync(member.id),
      t('employer:company.team.deleteMemberTitle'),
      t('employer:company.team.deleteMemberConfirm'),
      'warning',
    );
  };

  const isSaving = roleMutation.isPending || memberMutation.isPending;

  return (
    <Stack spacing={4}>
      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {t('employer:company.team.rolesTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('employer:company.team.rolesSubtitle')}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateRole} sx={{ textTransform: 'none', fontWeight: 800 }}>
            {t('employer:company.team.addRole')}
          </Button>
        </Stack>
        <TableContainer sx={tableSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('employer:company.team.roleName')}</TableCell>
                <TableCell>{t('employer:company.team.roleCode')}</TableCell>
                <TableCell>{t('employer:company.team.permissions')}</TableCell>
                <TableCell align="right">{t('common:actions.title')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rolesLoading && (
                <TableRow><TableCell colSpan={4}>{t('common:loading')}</TableCell></TableRow>
              )}
              {!rolesLoading && roles.length === 0 && (
                <TableRow><TableCell colSpan={4}>{t('employer:company.team.noRoles')}</TableCell></TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{role.name}</TableCell>
                  <TableCell>{role.code || '---'}</TableCell>
                  <TableCell>{formatPermissions(role.permissions)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={isSystemRole(role) ? t('employer:company.team.systemRoleLocked') : t('common:actions.edit')}>
                      <span>
                        <IconButton size="small" disabled={isSystemRole(role)} onClick={() => openEditRole(role)}><EditIcon fontSize="small" /></IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={isSystemRole(role) ? t('employer:company.team.systemRoleLocked') : t('common:actions.delete')}>
                      <span>
                        <IconButton size="small" color="error" disabled={isSystemRole(role)} onClick={() => handleDeleteRole(role)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {t('employer:company.team.membersTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('employer:company.team.membersSubtitle')}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateMember} disabled={roles.length === 0} sx={{ textTransform: 'none', fontWeight: 800 }}>
            {t('employer:company.team.addMember')}
          </Button>
        </Stack>
        <TableContainer sx={tableSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('employer:company.team.member')}</TableCell>
                <TableCell>{t('employer:company.team.roleName')}</TableCell>
                <TableCell>{t('employer:company.team.status')}</TableCell>
                <TableCell align="right">{t('common:actions.title')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {membersLoading && (
                <TableRow><TableCell colSpan={4}>{t('common:loading')}</TableCell></TableRow>
              )}
              {!membersLoading && members.length === 0 && (
                <TableRow><TableCell colSpan={4}>{t('employer:company.team.noMembers')}</TableCell></TableRow>
              )}
              {members.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {member.userDict?.fullName || member.userDict?.email || `#${member.userId || member.userDict?.id || member.id}`}
                  </TableCell>
                  <TableCell>{member.role?.name || member.roleId || '---'}</TableCell>
                  <TableCell>{member.status || '---'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common:actions.edit')}>
                      <IconButton size="small" onClick={() => openEditMember(member)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete')}>
                      <IconButton size="small" color="error" onClick={() => handleDeleteMember(member)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {roleForm.id ? t('employer:company.team.editRole') : t('employer:company.team.createRole')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label={t('employer:company.team.roleCode')} value={roleForm.code} onChange={(event) => setRoleForm((prev) => ({ ...prev, code: event.target.value }))} fullWidth />
            <TextField label={t('employer:company.team.roleName')} value={roleForm.name} onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth />
            <TextField label={t('employer:company.team.roleDescription')} value={roleForm.description} onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))} fullWidth multiline minRows={2} />
            <FormControl component="fieldset">
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('employer:company.team.permissions')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                {t('employer:company.team.permissionsHint')}
              </Typography>
              <Stack spacing={0.5}>
                {companyPermissionOptions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={(
                      <Checkbox
                        checked={roleForm.permissions.includes(permission)}
                        onChange={() => toggleRolePermission(permission)}
                      />
                    )}
                    label={getPermissionLabel(permission)}
                  />
                ))}
              </Stack>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>{t('common:actions.cancel')}</Button>
          <Button variant="contained" disabled={!roleForm.code.trim() || !roleForm.name.trim() || isSaving} onClick={() => roleMutation.mutate(roleForm)}>
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {memberForm.id ? t('employer:company.team.editMember') : t('employer:company.team.createMember')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label={t('employer:company.team.userId')} type="number" value={memberForm.userId} disabled={Boolean(memberForm.id)} onChange={(event) => setMemberForm((prev) => ({ ...prev, userId: event.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>{t('employer:company.team.roleName')}</InputLabel>
              <Select label={t('employer:company.team.roleName')} value={memberForm.roleId} onChange={(event) => setMemberForm((prev) => ({ ...prev, roleId: event.target.value }))}>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={String(role.id)}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('employer:company.team.status')}</InputLabel>
              <Select label={t('employer:company.team.status')} value={memberForm.status} onChange={(event) => setMemberForm((prev) => ({ ...prev, status: event.target.value }))}>
                <MenuItem value="ACTIVE">{t('employer:company.team.statusActive')}</MenuItem>
                <MenuItem value="INVITED">{t('employer:company.team.statusInvited')}</MenuItem>
                <MenuItem value="DISABLED">{t('employer:company.team.statusDisabled')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>{t('common:actions.cancel')}</Button>
          <Button variant="contained" disabled={!memberForm.userId || !memberForm.roleId || isSaving} onClick={() => memberMutation.mutate(memberForm)}>
            {t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CompanyTeamCard;
