 'use client';
import React from 'react';
import { Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useDataTable } from '../../../hooks';
import type { CompanyRole } from '../../../types/models';
import companyTeamService, { type CompanyMemberPayload, type CompanyMemberUpdatePayload, type CompanyRolePayload } from '../../../services/companyTeamService';
import toastMessages from '../../../utils/toastMessages';
import DataTable from '../../../components/Common/DataTable';
import EmployeesRoleDialog from './EmployeesRoleDialog';
import EmployeesMemberDialog from './EmployeesMemberDialog';
import EmployeesPageHeader from './EmployeesPageHeader';
import { useEmployeesPageColumns } from './useEmployeesPageColumns';

type TabValue = 'roles' | 'members';

type FormState = { code: string; name: string; description: string; permissions: string[] };
type MemberFormState = { userId: string; roleId: string; status: string; invitedEmail: string };
type State = {
  tab: TabValue;
  openRoleDialog: boolean;
  openMemberDialog: boolean;
  roleForm: FormState;
  memberForm: MemberFormState;
};
type Action =
  | { type: 'set_tab'; payload: TabValue }
  | { type: 'open_role_dialog' }
  | { type: 'close_role_dialog' }
  | { type: 'open_member_dialog' }
  | { type: 'close_member_dialog' }
  | { type: 'update_role_form'; payload: Partial<FormState> }
  | { type: 'reset_role_form' }
  | { type: 'update_member_form'; payload: Partial<MemberFormState> }
  | { type: 'reset_member_form' };

const initialState: State = {
  tab: 'roles',
  openRoleDialog: false,
  openMemberDialog: false,
  roleForm: { code: '', name: '', description: '', permissions: [] },
  memberForm: { userId: '', roleId: '', status: 'ACTIVE', invitedEmail: '' },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_tab':
      return { ...state, tab: action.payload };
    case 'open_role_dialog':
      return { ...state, openRoleDialog: true };
    case 'close_role_dialog':
      return { ...state, openRoleDialog: false };
    case 'open_member_dialog':
      return { ...state, openMemberDialog: true };
    case 'close_member_dialog':
      return { ...state, openMemberDialog: false };
    case 'update_role_form':
      return { ...state, roleForm: { ...state.roleForm, ...action.payload } };
    case 'reset_role_form':
      return { ...state, roleForm: initialState.roleForm };
    case 'update_member_form':
      return { ...state, memberForm: { ...state.memberForm, ...action.payload } };
    case 'reset_member_form':
      return { ...state, memberForm: initialState.memberForm };
    default:
      return state;
  }
}

const COMPANY_PERMISSION_OPTIONS = [
  { key: 'manage_company_profile', label: 'Company profile' },
  { key: 'manage_job_posts', label: 'Job posts' },
  { key: 'manage_candidates', label: 'Candidates' },
  { key: 'manage_interviews', label: 'Interviews' },
  { key: 'manage_question_bank', label: 'Question bank' },
  { key: 'manage_members', label: 'Members' },
  { key: 'manage_roles', label: 'Roles' },
];

const slugifyCode = (value: string) =>
  String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const EmployeesPage = () => {
  const { t } = useTranslation('employer');
  const queryClient = useQueryClient();
  const { sorting: roleSorting, onSortingChange: onRoleSortingChange } = useDataTable();
  const { sorting: memberSorting, onSortingChange: onMemberSortingChange } = useDataTable();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { data: rolePayload, isLoading: rolesLoading } = useQuery({ queryKey: ['company-roles'], queryFn: () => companyTeamService.getRoles() });
  const { data: memberPayload, isLoading: membersLoading } = useQuery({ queryKey: ['company-members'], queryFn: () => companyTeamService.getMembers() });

  const roles = React.useMemo(() => rolePayload?.results || [], [rolePayload]);
  const members = React.useMemo(() => memberPayload?.results || [], [memberPayload]);

  const createRoleMutation = useMutation({
    mutationFn: (data: CompanyRolePayload) => companyTeamService.createRole(data),
    onSuccess: () => {
      toastMessages.success(t('employees.toast.createRoleSuccess'));
      queryClient.invalidateQueries({ queryKey: ['company-roles'] });
      dispatch({ type: 'close_role_dialog' });
      dispatch({ type: 'reset_role_form' });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t('employees.toast.createRoleError'));
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => companyTeamService.deleteRole(id),
    onSuccess: () => {
      toastMessages.success(t('employees.toast.deleteRoleSuccess'));
      queryClient.invalidateQueries({ queryKey: ['company-roles'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t('employees.toast.deleteRoleError'));
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: (data: CompanyMemberPayload) => companyTeamService.createMember(data),
    onSuccess: () => {
      toastMessages.success(t('employees.toast.createMemberSuccess'));
      queryClient.invalidateQueries({ queryKey: ['company-members'] });
      dispatch({ type: 'close_member_dialog' });
      dispatch({ type: 'reset_member_form' });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t('employees.toast.createMemberError'));
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyMemberUpdatePayload }) => companyTeamService.updateMember(id, data),
    onSuccess: () => {
      toastMessages.success(t('employees.toast.updateMemberSuccess'));
      queryClient.invalidateQueries({ queryKey: ['company-members'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t('employees.toast.updateMemberError'));
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => companyTeamService.deleteMember(id),
    onSuccess: () => {
      toastMessages.success(t('employees.toast.deleteMemberSuccess'));
      queryClient.invalidateQueries({ queryKey: ['company-members'] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t('employees.toast.deleteMemberError'));
    },
  });

  const handleCreateRole = () => {
    createRoleMutation.mutate({
      code: slugifyCode(state.roleForm.code || state.roleForm.name),
      name: state.roleForm.name.trim(),
      description: state.roleForm.description.trim() || undefined,
      permissions: state.roleForm.permissions,
      is_active: true,
    });
  };

  const handleCreateMember = () => {
    createMemberMutation.mutate({
      userId: Number(state.memberForm.userId),
      roleId: Number(state.memberForm.roleId),
      status: state.memberForm.status,
      invitedEmail: state.memberForm.invitedEmail.trim() || undefined,
      is_active: true,
    });
  };

  const { roleColumns, memberColumns } = useEmployeesPageColumns({
    t,
    roles,
    deleteRolePending: deleteRoleMutation.isPending,
    deleteMemberPending: deleteMemberMutation.isPending,
    onDeleteRole: (id) => deleteRoleMutation.mutate(id),
    onDeleteMember: (id) => deleteMemberMutation.mutate(id),
    onUpdateMemberRole: ({ id, roleId }) => updateMemberMutation.mutate({ id, data: { roleId } }),
  });

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <EmployeesPageHeader
          t={t}
          tab={state.tab}
          onChangeTab={(tab) => dispatch({ type: 'set_tab', payload: tab })}
          onAddRole={() => dispatch({ type: 'open_role_dialog' })}
          onAddMember={() => dispatch({ type: 'open_member_dialog' })}
        />

        {state.tab === 'roles' && (
          <Box sx={{ mt: 2 }}>
            <DataTable columns={roleColumns} data={roles} isLoading={rolesLoading} hidePagination enableSorting sorting={roleSorting} onSortingChange={onRoleSortingChange} />
          </Box>
        )}

        {state.tab === 'members' && (
          <Box sx={{ mt: 2 }}>
            <DataTable columns={memberColumns} data={members} isLoading={membersLoading} hidePagination enableSorting sorting={memberSorting} onSortingChange={onMemberSortingChange} />
          </Box>
        )}
      </Paper>

      <EmployeesRoleDialog
        open={state.openRoleDialog}
        form={state.roleForm}
        loading={createRoleMutation.isPending}
        permissions={COMPANY_PERMISSION_OPTIONS}
        onClose={() => dispatch({ type: 'close_role_dialog' })}
        onChange={(patch) => dispatch({ type: 'update_role_form', payload: patch })}
        onSubmit={handleCreateRole}
        t={t}
      />

      <EmployeesMemberDialog
        open={state.openMemberDialog}
        form={state.memberForm}
        loading={createMemberMutation.isPending}
        roles={roles}
        onClose={() => dispatch({ type: 'close_member_dialog' })}
        onChange={(patch) => dispatch({ type: 'update_member_form', payload: patch })}
        onSubmit={handleCreateMember}
        t={t}
      />
    </Box>
  );
};

export default EmployeesPage;
