'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
  MenuItem,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import {
  useHrmDepartments,
  useHrmDesignations,
  useHrmEmployees,
  useHrmMutations,
} from '../hooks/useHrmQueries';
import { NativeDepartment, NativeDesignation } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: pc.divider(0.95) },
    '&:hover': { backgroundColor: pc.bgDefault(0.45) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    py: '10px',
  },
};

export default function DepartmentListPage() {
  TabTitle('Phòng ban & Chức danh | InfoHR HRM');

  const { data: departments = [], isLoading: deptLoading, refetch: refetchDepts } = useHrmDepartments();
  const { data: designations = [], isLoading: desigLoading, refetch: refetchDesigs } = useHrmDesignations();
  const { data: employees = [] } = useHrmEmployees();

  const {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createDesignation,
    updateDesignation,
    deleteDesignation,
  } = useHrmMutations();

  // Department Modal States
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<NativeDepartment | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', manager: '', parent: '' });
  const [deletingDeptId, setDeletingDeptId] = useState<number | null>(null);

  // Designation Modal States
  const [openDesigModal, setOpenDesigModal] = useState(false);
  const [editingDesig, setEditingDesig] = useState<NativeDesignation | null>(null);
  const [desigForm, setDesigForm] = useState({ title: '', code: '', description: '' });
  const [deletingDesigId, setDeletingDesigId] = useState<number | null>(null);

  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', description: '', manager: '', parent: '' });
    setOpenDeptModal(true);
  };

  const handleOpenEditDept = (dept: NativeDepartment) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      manager: dept.manager ? String(dept.manager) : '',
      parent: dept.parent ? String(dept.parent) : '',
    });
    setOpenDeptModal(true);
  };

  const handleSaveDept = async () => {
    if (!deptForm.name.trim()) return;
    const payload = {
      name: deptForm.name,
      code: deptForm.code || undefined,
      description: deptForm.description || undefined,
      manager: deptForm.manager ? Number(deptForm.manager) : null,
      parent: deptForm.parent ? Number(deptForm.parent) : null,
    };

    if (editingDept) {
      updateDepartment.mutate({ id: editingDept.id, data: payload }, {
        onSuccess: () => setOpenDeptModal(false),
      });
    } else {
      createDepartment.mutate(payload as any, {
        onSuccess: () => setOpenDeptModal(false),
      });
    }
  };

  const handleConfirmDeleteDept = () => {
    if (!deletingDeptId) return;
    deleteDepartment.mutate(deletingDeptId, {
      onSuccess: () => setDeletingDeptId(null),
    });
  };

  const handleOpenCreateDesig = () => {
    setEditingDesig(null);
    setDesigForm({ title: '', code: '', description: '' });
    setOpenDesigModal(true);
  };

  const handleOpenEditDesig = (desig: NativeDesignation) => {
    setEditingDesig(desig);
    setDesigForm({
      title: desig.title || '',
      code: desig.code || '',
      description: desig.description || '',
    });
    setOpenDesigModal(true);
  };

  const handleSaveDesig = async () => {
    if (!desigForm.title.trim()) return;
    const payload = {
      title: desigForm.title,
      code: desigForm.code || undefined,
      description: desigForm.description || undefined,
    };

    if (editingDesig) {
      updateDesignation.mutate({ id: editingDesig.id, data: payload }, {
        onSuccess: () => setOpenDesigModal(false),
      });
    } else {
      createDesignation.mutate(payload, {
        onSuccess: () => setOpenDesigModal(false),
      });
    }
  };

  const handleConfirmDeleteDesig = () => {
    if (!deletingDesigId) return;
    deleteDesignation.mutate(deletingDesigId, {
      onSuccess: () => setDeletingDesigId(null),
    });
  };

  const handleRefresh = () => {
    refetchDepts();
    refetchDesigs();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3.5}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusinessIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' }, letterSpacing: '-0.02em' }}>
                Phòng ban & Vị trí Chức danh
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                Quản lý cơ cấu bộ máy tổ chức doanh nghiệp và danh mục định biên chức danh
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={handleRefresh}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                color: '#0f172a',
                borderColor: '#cbd5e1',
                bgcolor: '#ffffff',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDept}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                bgcolor: '#7c3aed',
                boxShadow: '0 4px 12px 0 rgba(124, 58, 237, 0.2)',
                '&:hover': { bgcolor: '#6d28d9' },
              }}
            >
              Thêm Phòng ban
            </Button>
          </Stack>
        </Box>

        {/* 1. Bento Department Cards */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', mb: 2 }}>
            Danh sách Phòng ban ({departments.length})
          </Typography>

          {deptLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : departments.length === 0 ? (
            <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Chưa có phòng ban nào được tạo.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {departments.map((dept) => (
                <Grid key={dept.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: '#7c3aed',
                        boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.1)',
                      },
                    }}
                  >
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: '#f5f3ff',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip
                            label={`${dept.employee_count || 0} Nhân sự`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.725rem',
                              bgcolor: '#eff6ff',
                              color: '#2563eb',
                              borderRadius: 1.5,
                              mr: 0.5,
                            }}
                          />
                          <Tooltip title="Chỉnh sửa">
                            <IconButton aria-label="Thao tác" size="small" onClick={() => handleOpenEditDept(dept)} sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}>
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa phòng ban">
                            <IconButton aria-label="Thao tác" size="small" onClick={() => setDeletingDeptId(dept.id)} sx={{ color: '#64748b', '&:hover': { color: '#dc2626' } }}>
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.25 }}>
                        {dept.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'block', mb: 1 }}>
                        Mã: {dept.code || '---'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', minHeight: 38 }}>
                        {dept.description || 'Chưa có mô tả phòng ban.'}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        Trưởng phòng:
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 700 }}>
                        {dept.manager_name || 'Chưa gán'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* 2. Designation / Title Table */}
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Danh mục Chức danh & Định biên ({designations.length})
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDesig}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                borderColor: '#cbd5e1',
                color: '#0f172a',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              Thêm Chức danh
            </Button>
          </Stack>

          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#ffffff' }}>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Tên Chức danh</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Mã Chức danh</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>Mô tả Vị trí</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="center">Số nhân sự</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }} align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {desigLoading ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : designations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>Chưa có chức danh nào.</TableCell></TableRow>
                  ) : (
                    designations.map((desig) => (
                      <TableRow key={desig.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{desig.title}</TableCell>
                        <TableCell sx={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{desig.code || '---'}</TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>{desig.description || '---'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${desig.employee_count || 0} người`}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.725rem', bgcolor: '#f1f5f9', color: '#334155' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Chỉnh sửa">
                              <IconButton aria-label="Thao tác" size="small" onClick={() => handleOpenEditDesig(desig)} sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}>
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa chức danh">
                              <IconButton aria-label="Thao tác" size="small" onClick={() => setDeletingDesigId(desig.id)} sx={{ color: '#64748b', '&:hover': { color: '#dc2626' } }}>
                                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Stack>

      {/* Create / Edit Department Dialog */}
      <Dialog
        open={openDeptModal}
        onClose={() => setOpenDeptModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {editingDept ? 'Chỉnh sửa Phòng ban' : 'Thêm Phòng ban Mới'}
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <TextField
              label="Tên phòng ban"
              placeholder="VD: Phòng Kỹ thuật & Thiết kế"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              fullWidth
              sx={inputSx}
            />
            <TextField
              label="Mã phòng ban"
              placeholder="VD: DEPT-ENG"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              fullWidth
              sx={inputSx}
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  select
                  label="Trưởng phòng phụ trách"
                  value={deptForm.manager}
                  onChange={(e) => setDeptForm({ ...deptForm, manager: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="">-- Chưa gán trưởng phòng --</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_code})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Phòng ban trực thuộc (Cấp trên)"
                  value={deptForm.parent}
                  onChange={(e) => setDeptForm({ ...deptForm, parent: e.target.value })}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="">-- Phòng ban cấp cao nhất --</MenuItem>
                  {departments
                    .filter((d) => !editingDept || d.id !== editingDept.id)
                    .map((d) => (
                      <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
            <TextField
              label="Mô tả chức năng"
              placeholder="Mô tả chức năng, nhiệm vụ chính của phòng ban"
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenDeptModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!deptForm.name.trim() || createDepartment.isPending || updateDepartment.isPending}
            onClick={handleSaveDept}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#7c3aed' }}
          >
            {editingDept ? (updateDepartment.isPending ? 'Đang lưu...' : 'Cập nhật') : (createDepartment.isPending ? 'Đang tạo...' : 'Tạo phòng ban')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Department Confirm Dialog */}
      <Dialog
        open={Boolean(deletingDeptId)}
        onClose={() => setDeletingDeptId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#dc2626', p: 2.5 }}>
          Xác nhận Xóa Phòng ban
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '0 !important' }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc chắn muốn xóa phòng ban này? Hành động này sẽ gỡ liên kết của các nhân sự trực thuộc.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setDeletingDeptId(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleteDepartment.isPending}
            onClick={handleConfirmDeleteDept}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            {deleteDepartment.isPending ? 'Đang xóa...' : 'Xóa phòng ban'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Designation Dialog */}
      <Dialog
        open={openDesigModal}
        onClose={() => setOpenDesigModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
          {editingDesig ? 'Chỉnh sửa Chức danh' : 'Thêm Chức danh Mới'}
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
          <Stack spacing={2}>
            <TextField
              label="Tên chức danh"
              placeholder="VD: Kỹ sư Kết cấu Cao cấp"
              value={desigForm.title}
              onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
              fullWidth
              sx={inputSx}
            />
            <TextField
              label="Mã chức danh"
              placeholder="VD: DESIG-SR-ENG"
              value={desigForm.code}
              onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })}
              fullWidth
              sx={inputSx}
            />
            <TextField
              label="Mô tả công việc"
              value={desigForm.description}
              onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setOpenDesigModal(false)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!desigForm.title.trim() || createDesignation.isPending || updateDesignation.isPending}
            onClick={handleSaveDesig}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#7c3aed' }}
          >
            {editingDesig ? (updateDesignation.isPending ? 'Đang lưu...' : 'Cập nhật') : (createDesignation.isPending ? 'Đang tạo...' : 'Tạo chức danh')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Designation Confirm Dialog */}
      <Dialog
        open={Boolean(deletingDesigId)}
        onClose={() => setDeletingDesigId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#dc2626', p: 2.5 }}>
          Xác nhận Xóa Chức danh
        </DialogTitle>
        <DialogContent sx={{ p: 2.5, pt: '0 !important' }}>
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Bạn có chắc chắn muốn xóa chức danh này khỏi danh mục định biên?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setDeletingDesigId(null)} sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={deleteDesignation.isPending}
            onClick={handleConfirmDeleteDesig}
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none', bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
          >
            {deleteDesignation.isPending ? 'Đang xóa...' : 'Xóa chức danh'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
