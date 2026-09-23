'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PhotoCameraBackOutlinedIcon from '@mui/icons-material/PhotoCameraBackOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';

import employerAiSettingService, {
  type EmployerAiSettings,
  DEFAULT_EMPLOYER_AI_SETTINGS,
} from '@/services/employerAiSettingService';
import commonService from '@/services/commonService';
import toastMessages from '@/utils/toastMessages';
import { InterviewAvatar } from '@/views/interviewPages/components/avatar/InterviewAvatar';

import { AiActionBar } from './AiActionBar';
import { AiStudioPreview } from './AiStudioPreview';
import { AiIdentityCard } from './AiIdentityCard';
import { AiVoiceSelector } from './AiVoiceSelector';
import { AiSpaceCard } from './AiSpaceCard';
import { ActionVideosManager } from './ActionVideosManager';

// Export subcomponents and dependencies for external consumers
export {
  InterviewAvatar,
  AiActionBar,
  AiStudioPreview,
  AiIdentityCard,
  AiVoiceSelector,
  AiSpaceCard,
  ActionVideosManager,
};

export default function EmployerAiSettingsCard() {
  const [settings, setSettings] = useState<EmployerAiSettings>(DEFAULT_EMPLOYER_AI_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isSpeakingTest, setIsSpeakingTest] = useState(false);
  const [testedAction, setTestedAction] = useState<string>('idle');
  const [guideOpen, setGuideOpen] = useState(false);

  // Load settings on mount: local cache first, then async sync from backend
  useEffect(() => {
    let isMounted = true;
    const initial = employerAiSettingService.getSettings();
    setSettings(initial);

    employerAiSettingService
      .getSettingsAsync()
      .then((loaded) => {
        if (isMounted && loaded) {
          setSettings(loaded);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải cấu hình AI từ máy chủ:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeSettings = (partial: Partial<EmployerAiSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...partial,
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await employerAiSettingService.saveSettingsAsync(settings);
      setSettings(updated);
      setIsDirty(false);
      toastMessages.success('Lưu cài đặt diện mạo và giọng đọc AI thành công');
    } catch {
      toastMessages.error('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const reset = employerAiSettingService.resetSettings();
    setSettings(reset);
    setIsDirty(false);
    toastMessages.success('Đã khôi phục cài đặt mặc định');
  };

  // Helper file uploader using commonService.uploadFile
  const handleUploadBackgroundFile = async (file: File) => {
    return await commonService.uploadFile(file, 'IMAGE');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header action bar */}
      <AiActionBar
        isDirty={isDirty}
        isSaving={saving}
        onSave={handleSave}
        onReset={handleReset}
      />

      <Grid container spacing={3}>
        {/* Left Column: Real-time Studio Live Preview */}
        <Grid item xs={12} lg={5}>
          <AiStudioPreview
            settings={settings}
            isSpeakingTest={isSpeakingTest}
            onToggleSpeakingTest={() => setIsSpeakingTest((prev) => !prev)}
            testedAction={testedAction}
            onSelectAction={(actionKey) => setTestedAction(actionKey)}
          />
        </Grid>

        {/* Right Column: Settings Tabs */}
        <Grid item xs={12} lg={7}>
          {/* Tabs bar */}
          <Box sx={{ borderBottom: '1px solid #e2e8f0', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
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
                icon={<BadgeOutlinedIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label="Nhận diện & Phong thái"
              />
              <Tab
                icon={<GraphicEqIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label="Giọng nói & Tốc độ"
              />
              <Tab
                icon={<PhotoCameraBackOutlinedIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label="Không gian phỏng vấn"
              />
              <Tab
                icon={<VideoCameraFrontOutlinedIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label="Video cử chỉ"
              />
            </Tabs>
          </Box>

          <Stack spacing={3}>
            {/* Tab 0: Identity and HR Persona */}
            {activeTab === 0 && (
              <AiIdentityCard
                settings={settings}
                onChange={handleChangeSettings}
                onGuideOpen={() => setGuideOpen(true)}
              />
            )}

            {/* Tab 1: Voice and Speed */}
            {activeTab === 1 && (
              <AiVoiceSelector
                selectedVoice={settings.ttsVoice}
                voiceSpeed={settings.ttsSpeed}
                onVoiceChange={(voice) => handleChangeSettings({ ttsVoice: voice })}
                onSpeedChange={(speed) => handleChangeSettings({ ttsSpeed: speed })}
                onSpeakingStateChange={(speaking) => setIsSpeakingTest(speaking)}
              />
            )}

            {/* Tab 2: Interview Space Background */}
            {activeTab === 2 && (
              <AiSpaceCard
                backgroundType={settings.backgroundType || 'preset'}
                selectedBackgroundId={settings.selectedBackgroundId || 'modern_office'}
                customBackgroundUrl={settings.customBackgroundUrl}
                onChange={handleChangeSettings}
              />
            )}

            {/* Tab 3: Action Videos Manager */}
            {activeTab === 3 && (
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <ActionVideosManager
                    actions={settings.avatarActions}
                    characterId={settings.activeCharacterId || 'ng_c_linh'}
                    onPreviewAction={(actionKey) => setTestedAction(actionKey)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Sync notice banner */}
            <Alert
              severity="info"
              sx={{
                borderRadius: 3,
                fontSize: '0.85rem',
                fontWeight: 500,
                bgcolor: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
              }}
            >
              Các thay đổi trên sẽ tự động được lưu và đồng bộ ngay lập tức với toàn bộ các phòng phỏng vấn trực tiếp do Nhà tuyển dụng quản lý.
            </Alert>

            {/* Footer action buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleReset}
                disabled={saving}
                startIcon={<RestartAltOutlinedIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  color: 'text.secondary',
                  borderColor: '#cbd5e1',
                }}
              >
                Khôi phục mặc định
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1,
                }}
              >
                {saving ? 'Đang lưu cấu hình...' : 'Lưu cài đặt'}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Guide Dialog */}
      <Dialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3.5,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <MenuBookOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Hướng dẫn chuẩn hóa Trợ lý AI Aila và Bộ video cử chỉ thực tế
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={() => setGuideOpen(false)}
            sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '50%', color: 'text.secondary' }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </Button>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2.5 }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            Hệ thống AI phỏng vấn của InfoHR ứng dụng công nghệ kết hợp giữa bộ video cử chỉ hành vi tự nhiên Full HD cùng mô hình học sâu nhận diện và đồng bộ khẩu hình thông minh AILA để tái tạo chuyển động trực tiếp theo thời gian thực.
          </Alert>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            1. Tiêu chuẩn 1: Bộ 5 Video cử chỉ tự nhiên Full HD
          </Typography>
          <Box sx={{ mb: 2.5, pl: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Định dạng</strong>: MP4 chuẩn mã hóa video H.264, âm thanh AAC nếu có
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Độ phân giải</strong>: Full HD 1080p, tốc độ khung hình 30fps hoặc 60fps mượt mà
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Tỷ lệ khung hình</strong>: 16:9 khung ngang hoặc 9:16 khung dọc đồng nhất
            </Typography>
            <Typography variant="body2">
              • <strong>Dung lượng</strong>: Tối ưu dưới 5MB mỗi clip video để bảo đảm nạp tức thì trong phòng họp
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            2. Tiêu chuẩn 2: Ảnh chân dung AI độ phân giải cao cho đồng bộ khẩu hình AILA
          </Typography>
          <Box sx={{ mb: 2.5, pl: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Độ phân giải</strong>: 1024x1024 pixel, khuôn mặt rõ nét góc nhìn chính diện
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Định dạng</strong>: JPG chất lượng cao hoặc PNG không nền trong suốt
            </Typography>
            <Typography variant="body2">
              • <strong>Mục đích</strong>: Nạp vào mô hình trí tuệ nhân tạo AILA để tái tạo khẩu hình miệng khớp từng mili-giây với giọng nói phát ra từ hệ thống chuyển văn bản thành giọng nói
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            3. Bảng quy ước đặt tên 5 video cử chỉ hành vi
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 220 }}>Tên tệp quy ước</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hành vi tương ứng trong phòng phỏng vấn</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Tiêu chuẩn</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>idle.mp4</TableCell>
                  <TableCell>Cử động thở nhẹ và chớp mắt tự nhiên trong lúc lắng nghe ứng viên trả lời</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>wave.mp4</TableCell>
                  <TableCell>Vẫy tay chào đón thân thiện khi ứng viên bắt đầu tham gia phòng phỏng vấn</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>nod.mp4</TableCell>
                  <TableCell>Gật đầu tán đồng và khích lệ khi ứng viên đang trình bày quan điểm</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>thinking.mp4</TableCell>
                  <TableCell>Nghiêng đầu suy nghĩ và phân tích khi hệ thống đang xử lý câu trả lời</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>thanks_wave.mp4</TableCell>
                  <TableCell>Mỉm cười cúi chào và vẫy tay cảm ơn khi kết thúc phiên phỏng vấn</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Gợi ý: Doanh nghiệp có thể tải trực tiếp Tài liệu chuẩn hóa kỹ thuật và gói tài nguyên mẫu để làm tư liệu triển khai cho đội ngũ kỹ thuật và thiết kế.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            component="a"
            href="/downloads/ai-avatar-sample-pack.zip"
            download="aila-recruiter-guide.zip"
            variant="contained"
            color="primary"
            startIcon={<DownloadOutlinedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Tải tài liệu chuẩn hóa Trợ lý AI Aila
          </Button>
          <Button
            variant="outlined"
            onClick={() => setGuideOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Đóng hướng dẫn
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
