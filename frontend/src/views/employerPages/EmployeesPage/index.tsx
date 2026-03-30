import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataTable } from "../../../hooks";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { AxiosError } from 'axios';
import type { CompanyRole, CompanyMember } from '../../../types/models';

import companyTeamService from "../../../services/companyTeamService";
import toastMessages from "../../../utils/toastMessages";
import DataTable from "../../../components/Common/DataTable";

const COMPANY_PERMISSION_OPTIONS = [
  { key: "manage_company_profile", label: "Company profile" },
  { key: "manage_job_posts", label: "Job posts" },
  { key: "manage_candidates", label: "Candidates" },
  { key: "manage_interviews", label: "Interviews" },
  { key: "manage_question_bank", label: "Question bank" },
  { key: "manage_members", label: "Members" },
  { key: "manage_roles", label: "Roles" },
];

const slugifyCode = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");



const EmployeesPage = () => {
    const { t } = useTranslation("employer");
    const {
        sorting: roleSorting,
        onSortingChange: onRoleSortingChange,
    } = useDataTable();
    
    const {
        sorting: memberSorting,
        onSortingChange: onMemberSortingChange,
    } = useDataTable();

    const queryClient = useQueryClient();
  const [tab, setTab] = useState("roles");
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [roleForm, setRoleForm] = useState<{
    code: string;
    name: string;
    description: string;
    permissions: string[];
  }>({
    code: "",
    name: "",
    description: "",
    permissions: [],
  });
  const [memberForm, setMemberForm] = useState({
    userId: "",
    roleId: "",
    status: "ACTIVE",
    invitedEmail: "",
  });

  const { data: rolePayload, isLoading: rolesLoading } = useQuery({
    queryKey: ["company-roles"],
    queryFn: () => companyTeamService.getRoles(),
  });

  const { data: memberPayload, isLoading: membersLoading } = useQuery({
    queryKey: ["company-members"],
    queryFn: () => companyTeamService.getMembers(),
  });

  const roles = useMemo(() => rolePayload?.results || [], [rolePayload]);
  const members = useMemo(() => memberPayload?.results || [], [memberPayload]);

  const createRoleMutation = useMutation({
    mutationFn: (data: Omit<CompanyRole, "id" | "company"> & { is_active?: boolean }) => companyTeamService.createRole(data),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.createRoleSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      setOpenRoleDialog(false);
      setRoleForm({ code: "", name: "", description: "", permissions: [] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.createRoleError"));
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => companyTeamService.deleteRole(id),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.deleteRoleSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.deleteRoleError"));
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => companyTeamService.createMember(data),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.createMemberSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      setOpenMemberDialog(false);
      setMemberForm({ userId: "", roleId: "", status: "ACTIVE", invitedEmail: "" });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.createMemberError"));
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => companyTeamService.updateMember(id, data),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.updateMemberSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.updateMemberError"));
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => companyTeamService.deleteMember(id),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.deleteMemberSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ errors?: { errorMessage?: string[] } }>;
      toastMessages.error(axiosError?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.deleteMemberError"));
    },
  });

  const handleCreateRole = () => {
    createRoleMutation.mutate({
      code: slugifyCode(roleForm.code || roleForm.name),
      name: roleForm.name?.trim(),
      description: roleForm.description?.trim() || undefined,
      permissions: roleForm.permissions,
      is_active: true,
    });
  };

  const handleCreateMember = () => {
    createMemberMutation.mutate({
      userId: Number(memberForm.userId),
      roleId: Number(memberForm.roleId),
      status: memberForm.status,
      invitedEmail: memberForm.invitedEmail?.trim() || undefined,
      is_active: true,
    });
  };

  const roleColumns = useMemo<ColumnDef<CompanyRole>[]>(() => [
    { accessorKey: 'id', header: t('employees.table.id') as string, enableSorting: true },
    { accessorKey: 'code', header: t('employees.table.code') as string, enableSorting: true },
    { accessorKey: 'name', header: t('employees.table.roleName') as string, enableSorting: true },
    {
      accessorKey: 'permissions',
      header: t('employees.table.permissions') as string,
      cell: (info) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {((info.getValue() as string[]) || []).length === 0 && <Chip size="small" label={t("employees.table.noPermissions")} />}
          {((info.getValue() as string[]) || []).map((p) => (
            <Chip size="small" key={`${info.row.original.id}-${p}`} label={p} />
          ))}
        </Stack>
      ),
    },
    {
      accessorKey: 'is_system',
      header: t('employees.table.system') as string,
      cell: (info) => info.getValue() ? t("employees.table.yes") : t("employees.table.no"),
    },
    {
      id: 'actions',
      header: t('employees.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Button
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon />}
          disabled={info.row.original.is_system || deleteRoleMutation.isPending}
          onClick={() => deleteRoleMutation.mutate(info.row.original.id)}
        >
          {t("employees.table.delete")}
        </Button>
      ),
    },
  ], [t, deleteRoleMutation]);

  const memberColumns = useMemo<ColumnDef<CompanyMember>[]>(() => [
    { accessorKey: 'id', header: t('employees.table.id') as string, enableSorting: true },
    { accessorKey: 'userDict.fullName', header: t('employees.table.user') as string, enableSorting: true, cell: (info) => info.getValue() as string || "-" },
    {
      id: 'email',
      header: t('employees.table.email') as string,
      cell: (info) => info.row.original.userDict?.email || info.row.original.invited_email || "-",
    },
    {
      accessorKey: 'roleId',
      header: t('employees.table.role') as string,
      cell: (info) => (
        <FormControl size="small" fullWidth sx={{ minWidth: 200 }}>
          <Select
            value={(info.getValue() as string || info.row.original.role?.id || "").toString()}
            onChange={(e: SelectChangeEvent) => {
              const nextRoleId = Number(e.target.value);
              if (!nextRoleId || nextRoleId === ((info.getValue() as number) || info.row.original.role?.id)) return;
              updateMemberMutation.mutate({
                id: info.row.original.id,
                data: { roleId: nextRoleId },
              });
            }}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id.toString()}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      accessorKey: 'status',
      header: t('employees.table.status') as string,
      cell: (info) => (
        <Chip
          size="small"
          label={info.getValue() as string || "UNKNOWN"}
          color={info.getValue() === "ACTIVE" ? "success" : "default"}
        />
      ),
    },
    {
      id: 'actions',
      header: t('employees.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Button
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon />}
          disabled={deleteMemberMutation.isPending}
          onClick={() => deleteMemberMutation.mutate(info.row.original.id)}
        >
          {t("employees.table.delete")}
        </Button>
      ),
    },
  ], [t, roles, deleteMemberMutation.isPending, updateMemberMutation]);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "start", md: "center" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {t("employees.pageTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("employees.pageDescription")}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenRoleDialog(true)}>
              {t("employees.addRole")}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenMemberDialog(true)}>
              {t("employees.addMember")}
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab value="roles" label={t("employees.tabs.roles")} />
          <Tab value="members" label={t("employees.tabs.members")} />
        </Tabs>

        {tab === "roles" && (
          <Box sx={{ mt: 2 }}>
            <DataTable
              columns={roleColumns}
              data={roles}
              isLoading={rolesLoading}
              hidePagination
              enableSorting
              sorting={roleSorting}
              onSortingChange={onRoleSortingChange}
            />
          </Box>
        )}

        {tab === "members" && (
          <Box sx={{ mt: 2 }}>
            <DataTable
              columns={memberColumns}
              data={members}
              isLoading={membersLoading}
              hidePagination
              enableSorting
              sorting={memberSorting}
              onSortingChange={onMemberSortingChange}
            />
          </Box>
        )}
      </Paper>

      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("employees.dialog.addRoleTitle")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("employees.dialog.roleNameLabel")}
              value={roleForm.name}
              onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t("employees.dialog.codeLabel")}
              value={roleForm.code}
              onChange={(e) => setRoleForm((p) => ({ ...p, code: e.target.value }))}
              fullWidth
              helperText={t("employees.dialog.codeHelperText")}
            />
            <TextField
              label={t("employees.dialog.descriptionLabel")}
              value={roleForm.description}
              onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>{t("employees.dialog.permissionsLabel")}</InputLabel>
              <Select
                multiple
                label={t("employees.dialog.permissionsLabel")}
                value={roleForm.permissions}
                onChange={(e: SelectChangeEvent<string[]>) => setRoleForm((p) => ({ ...p, permissions: e.target.value as string[] }))}
                renderValue={(selected) => selected.join(", ")}
              >
                {COMPANY_PERMISSION_OPTIONS.map((item) => (
                  <MenuItem key={item.key} value={item.key}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>{t("employees.dialog.cancel")}</Button>
          <Button
            variant="contained"
            disabled={!roleForm.name?.trim() || createRoleMutation.isPending}
            onClick={handleCreateRole}
          >
            {t("employees.dialog.createRole")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("employees.dialog.addMemberTitle")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="number"
              label={t("employees.dialog.userIdLabel")}
              value={memberForm.userId}
              onChange={(e) => setMemberForm((p) => ({ ...p, userId: e.target.value }))}
              fullWidth
              helperText={t("employees.dialog.userIdHelperText")}
            />
            <FormControl fullWidth>
              <InputLabel>{t("employees.dialog.roleLabel")}</InputLabel>
              <Select
                label={t("employees.dialog.roleLabel")}
                value={memberForm.roleId}
                onChange={(e: SelectChangeEvent) => setMemberForm((p) => ({ ...p, roleId: e.target.value }))}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t("employees.dialog.statusLabel")}</InputLabel>
              <Select
                label={t("employees.dialog.statusLabel")}
                value={memberForm.status}
                onChange={(e: SelectChangeEvent) => setMemberForm((p) => ({ ...p, status: e.target.value }))}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INVITED">INVITED</MenuItem>
                <MenuItem value="DISABLED">DISABLED</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t("employees.dialog.invitedEmailLabel")}
              value={memberForm.invitedEmail}
              onChange={(e) => setMemberForm((p) => ({ ...p, invitedEmail: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>{t("employees.dialog.cancel")}</Button>
          <Button
            variant="contained"
            disabled={!memberForm.userId || !memberForm.roleId || createMemberMutation.isPending}
            onClick={handleCreateMember}
          >
            {t("employees.dialog.createMember")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;
