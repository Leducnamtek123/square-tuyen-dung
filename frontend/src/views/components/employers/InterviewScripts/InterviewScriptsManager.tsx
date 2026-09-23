'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Skeleton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';

import type {
  InterviewScript,
  InterviewScriptInput,
  ScenarioType,
  HrPersona,
} from '@/types/interviewScript';
import { SCENARIO_OPTIONS, HR_PERSONA_OPTIONS } from '@/types/interviewScript';
import interviewScriptService from '@/services/interviewScriptService';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import { InterviewScriptCard } from './InterviewScriptCard';
import { InterviewScriptDrawer } from './InterviewScriptDrawer';
import { InterviewScriptPreviewModal } from './InterviewScriptPreviewModal';

type TabValue = 'all' | 'company' | 'system';

export const InterviewScriptsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');

  // Scripts state
  const [scripts, setScripts] = useState<InterviewScript[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer & Modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<InterviewScript | null>(null);
  const [previewingScript, setPreviewingScript] = useState<InterviewScript | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cloningId, setCloningId] = useState<number | null>(null);

  // Load scripts
  const fetchScripts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewScriptService.getScripts({
        search: searchQuery,
        scenario_type: selectedScenario,
        hr_persona: selectedPersona,
        tab: activeTab,
      });
      setScripts(data);
    } catch (err: unknown) {
      toastMessages.error(err instanceof Error ? err.message : 'Không thể tải danh sách kịch bản phỏng vấn');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, selectedScenario, selectedPersona]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  // Handle Create New
  const handleOpenCreate = () => {
    setEditingScript(null);
    setIsDrawerOpen(true);
  };

  // Handle Edit
  const handleOpenEdit = (script: InterviewScript) => {
    setEditingScript(script);
    setIsDrawerOpen(true);
  };

  // Handle Drawer Submit
  const handleDrawerSubmit = async (data: InterviewScriptInput) => {
    setIsSubmitting(true);
    try {
      if (editingScript) {
        await interviewScriptService.updateScript(editingScript.id, data);
        toastMessages.success('Cập nhật kịch bản phỏng vấn thành công!');
      } else {
        await interviewScriptService.createScript(data);
        toastMessages.success('Tạo mới kịch bản phỏng vấn thành công!');
      }
      await fetchScripts();
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 1-Click Clone
  const handleClone = async (script: InterviewScript) => {
    setCloningId(script.id);
    try {
      const cloned = await interviewScriptService.cloneScript(script.id);
      toastMessages.success(`Đã nhân bản kịch bản "${cloned.name}" vào danh sách của công ty bạn!`);
      await fetchScripts();
    } catch (err: unknown) {
      toastMessages.error(err instanceof Error ? err.message : 'Không thể nhân bản kịch bản');
    } finally {
      setCloningId(null);
    }
  };

  // Handle Delete
  const handleDelete = (script: InterviewScript) => {
    confirmModal(
      async () => {
        try {
          await interviewScriptService.deleteScript(script.id);
          toastMessages.success('Đã xóa kịch bản phỏng vấn thành công');
          await fetchScripts();
        } catch (err: unknown) {
          toastMessages.error(err instanceof Error ? err.message : 'Không thể xóa kịch bản');
        }
      },
      'Xác nhận xóa kịch bản',
      `Bạn có chắc chắn muốn xóa kịch bản "${script.name}" không? Hành động này không thể hoàn tác.`,
      'warning',
      true,
      'Xóa kịch bản',
      'Hủy'
    );
  };

  // Compute counts for tabs
  const companyCount = useMemo(() => scripts.filter((s) => !s.is_system_preset).length, [scripts]);
  const systemCount = useMemo(() => scripts.filter((s) => s.is_system_preset).length, [scripts]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Banner & Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2.5}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.35)',
              }}
            >
              <PsychologyOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                  Kịch bản Phỏng vấn AI
                </Typography>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                  label="LiveKit Voice AI"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                Chuẩn hóa các kịch bản phỏng vấn theo vị trí (Kỹ thuật, STAR, B2B, Fresher, Quản lý) và cá nhân hóa phong thái AI
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: 2.5,
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            Tạo kịch bản mới
          </Button>
        </Stack>

        {/* Tab Navigation */}
        <Box sx={{ mt: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: 48,
              },
            }}
          >
            <Tab
              icon={<LayersOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              value="all"
              label={`Tất cả kịch bản`}
            />
            <Tab
              icon={<BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              value="company"
              label={`Kịch bản của bạn`}
            />
            <Tab
              icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              value="system"
              label={`Thư viện mẫu chuẩn InfoHR`}
            />
          </Tabs>
        </Box>

        {/* Filters Row */}
        <Grid container spacing={2} sx={{ mt: 2 }} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên kịch bản, vị trí, từ khóa..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-scenario-label">Loại kịch bản</InputLabel>
              <Select
                labelId="filter-scenario-label"
                value={selectedScenario}
                label="Loại kịch bản"
                onChange={(e) => setSelectedScenario(e.target.value)}
              >
                <MenuItem value="all">Tất cả phân loại</MenuItem>
                {SCENARIO_OPTIONS.map((sc) => (
                  <MenuItem key={sc.type} value={sc.type}>
                    {sc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-persona-label">Phong thái HR</InputLabel>
              <Select
                labelId="filter-persona-label"
                value={selectedPersona}
                label="Phong thái HR"
                onChange={(e) => setSelectedPersona(e.target.value)}
              >
                <MenuItem value="all">Tất cả phong thái</MenuItem>
                {HR_PERSONA_OPTIONS.map((pr) => (
                  <MenuItem key={pr.persona} value={pr.persona}>
                    {pr.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Scripts Grid */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1.5 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : scripts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3.5,
            border: '2px dashed #cbd5e1',
            bgcolor: '#f8fafc',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#e0e7ff',
              color: 'primary.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <PsychologyOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Không tìm thấy kịch bản phù hợp
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mb: 3 }}>
            Thử thay đổi bộ lọc tìm kiếm hoặc tạo một kịch bản phỏng vấn riêng biệt cho doanh nghiệp của bạn.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}
          >
            Tạo kịch bản đầu tiên
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {scripts.map((script) => (
            <Grid item xs={12} md={6} lg={4} key={script.id}>
              <InterviewScriptCard
                script={script}
                onPreview={(s) => setPreviewingScript(s)}
                onEdit={handleOpenEdit}
                onClone={handleClone}
                onDelete={handleDelete}
                isCloning={cloningId === script.id}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Drawer: Create / Edit Script */}
      <InterviewScriptDrawer
        open={isDrawerOpen}
        script={editingScript}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingScript(null);
        }}
        onSubmit={handleDrawerSubmit}
        isLoading={isSubmitting}
      />

      {/* Modal: Full Preview */}
      <InterviewScriptPreviewModal
        open={Boolean(previewingScript)}
        script={previewingScript}
        onClose={() => setPreviewingScript(null)}
        onEdit={handleOpenEdit}
        onClone={handleClone}
      />
    </Box>
  );
};

export default InterviewScriptsManager;
