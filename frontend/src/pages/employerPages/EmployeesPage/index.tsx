import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

import companyTeamService from "../../../services/companyTeamService";
import toastMessages from "../../../utils/toastMessages";

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

const normalizeListPayload = (payload: any) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const EmployeesPage = () => {
  const { t } = useTranslation("employer");
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
    queryFn: () => companyTeamService.getRoles() as Promise<any>,
  });

  const { data: memberPayload, isLoading: membersLoading } = useQuery({
    queryKey: ["company-members"],
    queryFn: () => companyTeamService.getMembers() as Promise<any>,
  });

  const roles = useMemo(() => normalizeListPayload(rolePayload), [rolePayload]);
  const members = useMemo(() => normalizeListPayload(memberPayload), [memberPayload]);

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => companyTeamService.createRole(data),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.createRoleSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      setOpenRoleDialog(false);
      setRoleForm({ code: "", name: "", description: "", permissions: [] });
    },
    onError: (error: any) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.createRoleError"));
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: any) => companyTeamService.deleteRole(id),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.deleteRoleSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
    },
    onError: (error: any) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.deleteRoleError"));
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: (data: any) => companyTeamService.createMember(data),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.createMemberSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      setOpenMemberDialog(false);
      setMemberForm({ userId: "", roleId: "", status: "ACTIVE", invitedEmail: "" });
    },
    onError: (error: any) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.createMemberError"));
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: any; data: any }) => companyTeamService.updateMember(id, data),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.updateMemberSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
    onError: (error: any) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.updateMemberError"));
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: any) => companyTeamService.deleteMember(id),
    onSuccess: () => {
      toastMessages.success(t("employees.toast.deleteMemberSuccess"));
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
    onError: (error: any) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || t("employees.toast.deleteMemberError"));
    },
  });

  const handleCreateRole = () => {
    createRoleMutation.mutate({
      code: slugifyCode(roleForm.code || roleForm.name),
      name: roleForm.name?.trim(),
      description: roleForm.description?.trim() || null,
      permissions: roleForm.permissions,
      is_active: true,
    });
  };

  const handleCreateMember = () => {
    createMemberMutation.mutate({
      userId: Number(memberForm.userId),
      roleId: Number(memberForm.roleId),
      status: memberForm.status,
      invitedEmail: memberForm.invitedEmail?.trim() || null,
      is_active: true,
    });
  };

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
          <Box sx={{ mt: 2, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("employees.table.id")}</TableCell>
                  <TableCell>{t("employees.table.code")}</TableCell>
                  <TableCell>{t("employees.table.roleName")}</TableCell>
                  <TableCell>{t("employees.table.permissions")}</TableCell>
                  <TableCell>{t("employees.table.system")}</TableCell>
                  <TableCell align="right">{t("employees.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!rolesLoading &&
                  roles.map((role: any) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell>{role.code}</TableCell>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(role.permissions || []).length === 0 && <Chip size="small" label={t("employees.table.noPermissions")} />}
                          {(role.permissions || []).map((p: any) => (
                            <Chip size="small" key={`${role.id}-${p}`} label={p} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{role.is_system ? t("employees.table.yes") : t("employees.table.no")}</TableCell>
                      <TableCell align="right">
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          disabled={role.is_system || deleteRoleMutation.isPending}
                          onClick={() => deleteRoleMutation.mutate(role.id)}
                        >
                          {t("employees.table.delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {tab === "members" && (
          <Box sx={{ mt: 2, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("employees.table.id")}</TableCell>
                  <TableCell>{t("employees.table.user")}</TableCell>
                  <TableCell>{t("employees.table.email")}</TableCell>
                  <TableCell>{t("employees.table.role")}</TableCell>
                  <TableCell>{t("employees.table.status")}</TableCell>
                  <TableCell align="right">{t("employees.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!membersLoading &&
                  members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.userDict?.fullName || "-"}</TableCell>
                      <TableCell>{member.userDict?.email || member.invited_email || "-"}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={(member.roleId || member.role?.id || "").toString()}
                            onChange={(e: SelectChangeEvent) => {
                              const nextRoleId = Number(e.target.value);
                              if (!nextRoleId || nextRoleId === (member.roleId || member.role?.id)) return;
                              updateMemberMutation.mutate({
                                id: member.id,
                                data: { roleId: nextRoleId },
                              });
                            }}
                          >
                            {roles.map((role: any) => (
                              <MenuItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={member.status || "UNKNOWN"}
                          color={member.status === "ACTIVE" ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          disabled={deleteMemberMutation.isPending}
                          onClick={() => deleteMemberMutation.mutate(member.id)}
                        >
                          {t("employees.table.delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
                {roles.map((role: any) => (
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
