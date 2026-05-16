'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
  permissions: string;
};

type MemberForm = {
  id?: number;
  userId: string;
  roleId: string;
  status: string;
};

const emptyRoleForm: RoleForm = { code: '', name: '', description: '', permissions: '' };
const emptyMemberForm: MemberForm = { userId: '', roleId: '', status: 'ACTIVE' };

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
        permissions: form.permissions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };
      return form.id
        ? companyTeamService.updateRole(form.id, payload)
        : companyTeamService.createRole(payload);
    },
    onSuccess: () => {
      invalidateTeam();
      setRoleDialogOpen(false);
      toastMessages.success(t('common:messages.saveSuccess', 'Saved successfully'));
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
      toastMessages.success(t('common:messages.saveSuccess', 'Saved successfully'));
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
      permissions: role.permissions?.join(', ') || '',
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
      t('employer:company.team.deleteRoleTitle', 'Delete role'),
      t('employer:company.team.deleteRoleConfirm', { name: role.name, defaultValue: 'Delete this role?' }),
      'warning',
    );
  };

  const handleDeleteMember = (member: CompanyMember) => {
    confirmModal(
      () => deleteMemberMutation.mutateAsync(member.id),
      t('employer:company.team.deleteMemberTitle', 'Remove member'),
      t('employer:company.team.deleteMemberConfirm', 'Remove this member from the company?'),
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
              {t('employer:company.team.rolesTitle', 'Company roles')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('employer:company.team.rolesSubtitle', 'Define permissions for people who can work inside this company workspace.')}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateRole} sx={{ textTransform: 'none', fontWeight: 800 }}>
            {t('employer:company.team.addRole', 'Add role')}
          </Button>
        </Stack>
        <TableContainer sx={tableSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('employer:company.team.roleName', 'Role')}</TableCell>
                <TableCell>{t('employer:company.team.roleCode', 'Code')}</TableCell>
                <TableCell>{t('employer:company.team.permissions', 'Permissions')}</TableCell>
                <TableCell align="right">{t('common:actions.title', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rolesLoading && (
                <TableRow><TableCell colSpan={4}>{t('common:loading', 'Loading...')}</TableCell></TableRow>
              )}
              {!rolesLoading && roles.length === 0 && (
                <TableRow><TableCell colSpan={4}>{t('employer:company.team.noRoles', 'No roles yet')}</TableCell></TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{role.name}</TableCell>
                  <TableCell>{role.code || '---'}</TableCell>
                  <TableCell>{role.permissions?.join(', ') || '---'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common:actions.edit', 'Edit')}>
                      <IconButton size="small" onClick={() => openEditRole(role)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete', 'Delete')}>
                      <span>
                        <IconButton size="small" color="error" disabled={role.isSystem || role.is_system} onClick={() => handleDeleteRole(role)}>
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
              {t('employer:company.team.membersTitle', 'Company members')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('employer:company.team.membersSubtitle', 'Manage users who can access this employer workspace.')}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateMember} disabled={roles.length === 0} sx={{ textTransform: 'none', fontWeight: 800 }}>
            {t('employer:company.team.addMember', 'Add member')}
          </Button>
        </Stack>
        <TableContainer sx={tableSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('employer:company.team.member', 'Member')}</TableCell>
                <TableCell>{t('employer:company.team.roleName', 'Role')}</TableCell>
                <TableCell>{t('employer:company.team.status', 'Status')}</TableCell>
                <TableCell align="right">{t('common:actions.title', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {membersLoading && (
                <TableRow><TableCell colSpan={4}>{t('common:loading', 'Loading...')}</TableCell></TableRow>
              )}
              {!membersLoading && members.length === 0 && (
                <TableRow><TableCell colSpan={4}>{t('employer:company.team.noMembers', 'No members yet')}</TableCell></TableRow>
              )}
              {members.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {member.userDict?.fullName || member.userDict?.email || `#${member.userId || member.userDict?.id || member.id}`}
                  </TableCell>
                  <TableCell>{member.role?.name || member.roleId || '---'}</TableCell>
                  <TableCell>{member.status || '---'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common:actions.edit', 'Edit')}>
                      <IconButton size="small" onClick={() => openEditMember(member)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete', 'Delete')}>
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
          {roleForm.id ? t('employer:company.team.editRole', 'Edit role') : t('employer:company.team.createRole', 'Create role')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label={t('employer:company.team.roleCode', 'Code')} value={roleForm.code} onChange={(event) => setRoleForm((prev) => ({ ...prev, code: event.target.value }))} fullWidth />
            <TextField label={t('employer:company.team.roleName', 'Role')} value={roleForm.name} onChange={(event) => setRoleForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth />
            <TextField label={t('employer:company.team.description', 'Description')} value={roleForm.description} onChange={(event) => setRoleForm((prev) => ({ ...prev, description: event.target.value }))} fullWidth multiline minRows={2} />
            <TextField label={t('employer:company.team.permissions', 'Permissions')} value={roleForm.permissions} onChange={(event) => setRoleForm((prev) => ({ ...prev, permissions: event.target.value }))} fullWidth helperText={t('employer:company.team.permissionsHint', 'Comma separated, for example: manage_members, manage_roles')} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>{t('common:actions.cancel', 'Cancel')}</Button>
          <Button variant="contained" disabled={!roleForm.code.trim() || !roleForm.name.trim() || isSaving} onClick={() => roleMutation.mutate(roleForm)}>
            {t('common:actions.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {memberForm.id ? t('employer:company.team.editMember', 'Edit member') : t('employer:company.team.createMember', 'Add member')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label={t('employer:company.team.userId', 'User ID')} type="number" value={memberForm.userId} disabled={Boolean(memberForm.id)} onChange={(event) => setMemberForm((prev) => ({ ...prev, userId: event.target.value }))} fullWidth />
            <FormControl fullWidth>
              <InputLabel>{t('employer:company.team.roleName', 'Role')}</InputLabel>
              <Select label={t('employer:company.team.roleName', 'Role')} value={memberForm.roleId} onChange={(event) => setMemberForm((prev) => ({ ...prev, roleId: event.target.value }))}>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={String(role.id)}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('employer:company.team.status', 'Status')}</InputLabel>
              <Select label={t('employer:company.team.status', 'Status')} value={memberForm.status} onChange={(event) => setMemberForm((prev) => ({ ...prev, status: event.target.value }))}>
                <MenuItem value="ACTIVE">{t('employer:company.team.statusActive', 'Active')}</MenuItem>
                <MenuItem value="INVITED">{t('employer:company.team.statusInvited', 'Invited')}</MenuItem>
                <MenuItem value="DISABLED">{t('employer:company.team.statusDisabled', 'Disabled')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>{t('common:actions.cancel', 'Cancel')}</Button>
          <Button variant="contained" disabled={!memberForm.userId || !memberForm.roleId || isSaving} onClick={() => memberMutation.mutate(memberForm)}>
            {t('common:actions.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CompanyTeamCard;
