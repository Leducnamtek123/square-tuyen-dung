'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Grid2 as Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

import hrmService, { NativeDepartment, NativeDesignation } from '@/services/hrmService';
import { TabTitle } from '@/utils/generalFunction';

export default function DepartmentListPage() {
  TabTitle('Phòng ban & Chức danh | Native HRM');

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<NativeDepartment[]>([]);
  const [designations, setDesignations] = useState<NativeDesignation[]>([]);
  
  const [openDeptModal, setOpenDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, desigData] = await Promise.all([
        hrmService.getDepartments().catch(() => []),
        hrmService.getDesignations().catch(() => []),
      ]);
      setDepartments(deptData);
      setDesignations(desigData);
    } catch (err) {
      console.error('Error fetching department data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async () => {
    try {
      await hrmService.createDepartment(deptForm);
      setOpenDeptModal(false);
      setSuccessMsg('Đã tạo phòng ban mới thành công!');
      fetchData();
    } catch (err) {
      alert('Không thể tạo phòng ban.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" display="flex" alignItems="center" gap={1.5}>
            <BusinessIcon fontSize="large" color="primary" /> Quản lý Phòng ban & Chức danh (Departments & Designations)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cơ cấu tổ chức doanh nghiệp & danh mục vị trí công việc theo chuẩn mực Frappe ERPNext
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDeptModal(true)}>
          Tạo Phòng ban Mới
        </Button>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Section 1: Departments */}
          <Typography variant="h6" fontWeight={700} mb={2} color="primary.main" display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary" /> Danh sách Phòng ban (Departments)
          </Typography>

          <Grid container spacing={2.5} sx={{ mb: 5 }}>
            {departments.map((dept) => (
              <Grid key={dept.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ borderRadius: 3, p: 2.5, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#ffffff' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} color="primary.dark">
                      {dept.name}
                    </Typography>
                    {dept.code && <Chip label={dept.code} size="small" color="primary" variant="outlined" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1.5 }}>
                    {dept.description || 'Chưa có mô tả phòng ban.'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={1.5} borderTop="1px solid #eee">
                    <Typography variant="caption" color="text.secondary">
                      Trưởng phòng: {dept.manager_name || 'Chưa gán'}
                    </Typography>
                    <Chip label={`${dept.employee_count} Nhân sự`} size="small" color="info" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Section 2: Designations */}
          <Typography variant="h6" fontWeight={700} mb={2} color="primary.main" display="flex" alignItems="center" gap={1}>
            <BadgeOutlinedIcon color="primary" /> Danh mục Vị trí & Chức danh (Designations)
          </Typography>

          <Grid container spacing={2.5}>
            {designations.map((desig) => (
              <Grid key={desig.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, p: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: '#f8fafc' }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <BadgeOutlinedIcon color="primary" />
                    <Box>
                      <Typography fontWeight={700}>{desig.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {desig.code || 'DESIGNATION'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Modal: Create Dept */}
      <Dialog open={openDeptModal} onClose={() => setOpenDeptModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Tạo Phòng ban Mới</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên phòng ban"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mã phòng ban (vd: DEPT-IT)"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Mô tả"
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeptModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateDept}>
            Xác nhận Tạo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
