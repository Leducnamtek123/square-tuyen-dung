// @ts-nocheck
import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import companyTeamService from "../../../services/companyTeamService";
import toastMessages from "../../../utils/toastMessages";

interface Props {
  [key: string]: any;
}



const COMPANY_PERMISSION_OPTIONS = [
  { key: "manage_company_profile", label: "Company profile" },
  { key: "manage_job_posts", label: "Job posts" },
  { key: "manage_candidates", label: "Candidates" },
  { key: "manage_interviews", label: "Interviews" },
  { key: "manage_question_bank", label: "Question bank" },
  { key: "manage_members", label: "Members" },
  { key: "manage_roles", label: "Roles" },
];

const slugifyCode = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeListPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const EmployeesPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("roles");
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [roleForm, setRoleForm] = useState({
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

  const roles = useMemo(() => normalizeListPayload(rolePayload), [rolePayload]);
  const members = useMemo(() => normalizeListPayload(memberPayload), [memberPayload]);
  const roleById = useMemo(() => {
    const map = new Map();
    roles.forEach((r) => map.set(r.id, r));
    return map;
  }, [roles]);

  const createRoleMutation = useMutation({
    mutationFn: companyTeamService.createRole,
    onSuccess: () => {
      toastMessages.success("Tạo role thành công");
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
      setOpenRoleDialog(false);
      setRoleForm({ code: "", name: "", description: "", permissions: [] });
    },
    onError: (error) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || "Không thể tạo role");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: companyTeamService.deleteRole,
    onSuccess: () => {
      toastMessages.success("Đã xóa role");
      queryClient.invalidateQueries({ queryKey: ["company-roles"] });
    },
    onError: (error) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || "Không thể xóa role");
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: companyTeamService.createMember,
    onSuccess: () => {
      toastMessages.success("Đã thêm nhân viên vào công ty");
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
      setOpenMemberDialog(false);
      setMemberForm({ userId: "", roleId: "", status: "ACTIVE", invitedEmail: "" });
    },
    onError: (error) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || "Không thể thêm nhân viên");
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => companyTeamService.updateMember(id, data),
    onSuccess: () => {
      toastMessages.success("Đã cập nhật role nhân viên");
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
    onError: (error) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || "Không thể cập nhật nhân viên");
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: companyTeamService.deleteMember,
    onSuccess: () => {
      toastMessages.success("Đã xóa nhân viên khỏi công ty");
      queryClient.invalidateQueries({ queryKey: ["company-members"] });
    },
    onError: (error) => {
      toastMessages.error(error?.response?.data?.errors?.errorMessage?.[0] || "Không thể xóa nhân viên");
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
              Quản lý nhân sự công ty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý role, thêm nhân viên và gán role trực tiếp.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenRoleDialog(true)}>
              Thêm role
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenMemberDialog(true)}>
              Thêm nhân viên
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab value="roles" label="Roles" />
          <Tab value="members" label="Members" />
        </Tabs>

        {tab === "roles" && (
          <Box sx={{ mt: 2, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Tên role</TableCell>
                  <TableCell>Quyền</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!rolesLoading &&
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell>{role.code}</TableCell>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(role.permissions || []).length === 0 && <Chip size="small" label="No permissions" />}
                          {(role.permissions || []).map((p) => (
                            <Chip size="small" key={`${role.id}-${p}`} label={p} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{role.is_system ? "Yes" : "No"}</TableCell>
                      <TableCell align="right">
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          disabled={role.is_system || deleteRoleMutation.isPending}
                          onClick={() => deleteRoleMutation.mutate(role.id)}
                        >
                          Xóa
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
                  <TableCell>ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!membersLoading &&
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.userDict?.fullName || "-"}</TableCell>
                      <TableCell>{member.userDict?.email || member.invited_email || "-"}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={member.roleId || member.role?.id || ""}
                            onChange={(e) => {
                              const nextRoleId = Number(e.target.value);
                              if (!nextRoleId || nextRoleId === (member.roleId || member.role?.id)) return;
                              updateMemberMutation.mutate({
                                id: member.id,
                                data: { roleId: nextRoleId },
                              });
                            }}
                          >
                            {roles.map((role) => (
                              <MenuItem key={role.id} value={role.id}>
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
                          Xóa
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
        <DialogTitle>Thêm role mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên role"
              value={roleForm.name}
              onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Code (slug)"
              value={roleForm.code}
              onChange={(e) => setRoleForm((p) => ({ ...p, code: e.target.value }))}
              fullWidth
              helperText="Để trống sẽ tự sinh từ tên role."
            />
            <TextField
              label="Mô tả"
              value={roleForm.description}
              onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                label="Permissions"
                value={roleForm.permissions}
                onChange={(e) => setRoleForm((p) => ({ ...p, permissions: e.target.value }))}
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
          <Button onClick={() => setOpenRoleDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!roleForm.name?.trim() || createRoleMutation.isPending}
            onClick={handleCreateRole}
          >
            Tạo role
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMemberDialog} onClose={() => setOpenMemberDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm nhân viên</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="number"
              label="User ID"
              value={memberForm.userId}
              onChange={(e) => setMemberForm((p) => ({ ...p, userId: e.target.value }))}
              fullWidth
              helperText="Nhập ID tài khoản user cần thêm vào công ty."
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={memberForm.roleId}
                onChange={(e) => setMemberForm((p) => ({ ...p, roleId: e.target.value }))}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={memberForm.status}
                onChange={(e) => setMemberForm((p) => ({ ...p, status: e.target.value }))}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INVITED">INVITED</MenuItem>
                <MenuItem value="DISABLED">DISABLED</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Invited email (optional)"
              value={memberForm.invitedEmail}
              onChange={(e) => setMemberForm((p) => ({ ...p, invitedEmail: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!memberForm.userId || !memberForm.roleId || createMemberMutation.isPending}
            onClick={handleCreateMember}
          >
            Thêm nhân viên
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;
