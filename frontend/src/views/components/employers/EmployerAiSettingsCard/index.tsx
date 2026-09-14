'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PhotoCameraBackOutlinedIcon from '@mui/icons-material/PhotoCameraBackOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';

import employerAiSettingService, {
  type EmployerAiSettings,
  type PresetVoice,
  PRESET_BACKGROUNDS,
  PRESET_AVATARS,
  PRESET_VOICES,
  PRESET_SPEEDS,
  DEFAULT_EMPLOYER_AI_SETTINGS,
} from '@/services/employerAiSettingService';
import commonService from '@/services/commonService';
import aiService from '@/services/aiService';
import toastMessages from '@/utils/toastMessages';
import { InterviewAvatar } from '@/views/interviewPages/components/avatar/InterviewAvatar';

export default function EmployerAiSettingsCard() {
  const [settings, setSettings] = useState<EmployerAiSettings>(DEFAULT_EMPLOYER_AI_SETTINGS);
  const [isSpeakingTest, setIsSpeakingTest] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loaded = employerAiSettingService.getSettings();
    setSettings(loaded);
  }, []);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const handlePlayVoiceSample = async (voice: PresetVoice) => {
    if (playingVoiceId === voice.id && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
      setIsSpeakingTest(false);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingVoiceId(null);
      setIsSpeakingTest(false);
    }

    setLoadingVoiceId(voice.id);
    try {
      const blob = await aiService.tts({
        text: voice.sampleText,
        voice: voice.name,
        speed: settings.ttsSpeed || 1.0,
        format: 'mp3',
      });
      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      currentAudioRef.current = audio;
      setPlayingVoiceId(voice.id);
      setIsSpeakingTest(true);

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        setPlayingVoiceId(null);
        setIsSpeakingTest(false);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setPlayingVoiceId(null);
        setIsSpeakingTest(false);
        currentAudioRef.current = null;
        toastMessages.error('Không thể phát âm thanh mẫu, vui lòng thử lại');
      };

      await audio.play();
    } catch {
      setPlayingVoiceId(null);
      setIsSpeakingTest(false);
      currentAudioRef.current = null;
      toastMessages.error('Lỗi khi tải mẫu giọng nói');
    } finally {
      setLoadingVoiceId(null);
    }
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const updated = employerAiSettingService.saveSettings(settings);
      setSettings(updated);
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
    toastMessages.success('Đã khôi phục cài đặt mặc định');
  };

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    try {
      const res = await commonService.uploadFile(file, 'IMAGE');
      setSettings((prev) => ({
        ...prev,
        backgroundType: 'custom',
        customBackgroundUrl: res.url,
      }));
      toastMessages.success('Tải lên hình nền thành công');
    } catch {
      toastMessages.error('Tải lên hình nền thất bại, vui lòng thử lại');
    } finally {
      setUploadingBg(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await commonService.uploadFile(file, 'IMAGE');
      setSettings((prev) => ({
        ...prev,
        avatarType: 'custom',
        customAvatarUrl: res.url,
      }));
      toastMessages.success('Tải lên ảnh đại diện AI thành công');
    } catch {
      toastMessages.error('Tải lên ảnh AI thất bại, vui lòng thử lại');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const activeBgUrl = employerAiSettingService.resolveActiveBackgroundUrl(settings);
  const activeAvatarUrl = settings.avatarType === 'custom' && settings.customAvatarUrl
    ? settings.customAvatarUrl
    : null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Tiêu đề trang */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3,
            bgcolor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
          }}
        >
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 26 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            Cài đặt diện mạo AI Phỏng vấn
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
            Tùy biến hình nền phòng phỏng vấn và nhân vật AI WebP mang đậm phong cách thương hiệu Nhà tuyển dụng
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Cột trái: Khung xem trước Studio thời gian thực */}
        <Grid item xs={12} lg={5}>
          <Card
            elevation={0}
            sx={{
              position: { lg: 'sticky' },
              top: { lg: 24 },
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Khung xem trước phòng phỏng vấn
                </Typography>
              </Stack>
              <Chip
                label="Trực quan thời gian thực"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
              />
            </Box>

            <CardContent sx={{ p: 2.5 }}>
              {/* Studio Canvas Box */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  bgcolor: '#0f172a',
                  boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.18)',
                }}
              >
                <InterviewAvatar
                  interviewerName={settings.interviewerName}
                  avatarBackgroundUrl={activeBgUrl}
                  avatarId={settings.selectedAvatarId}
                  avatarImageUrl={activeAvatarUrl}
                  isSpeakingHint={isSpeakingTest}
                  avatarBackdrop={settings.selectedBackgroundId}
                />
              </Box>

              {/* Bảng điều khiển thử nghiệm nhép môi và trạng thái */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} alignItems="center">
                <Button
                  variant={isSpeakingTest ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => setIsSpeakingTest((prev) => !prev)}
                  startIcon={isSpeakingTest ? <VolumeOffOutlinedIcon /> : <VolumeUpOutlinedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                >
                  {isSpeakingTest ? 'Dừng thử khẩu hình' : 'Thử hiệu ứng nhép môi'}
                </Button>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {isSpeakingTest ? 'Đang mô phỏng nói chuyện' : 'Nhấp để kiểm tra cử động nhép môi'}
                </Typography>
              </Stack>

              {/* Thông tin tóm tắt cấu hình đang áp dụng */}
              <Box sx={{ mt: 2.5, p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Thông số hiển thị hiện tại
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Trợ lý AI
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {settings.interviewerName || 'Trợ lý AI AILA'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Chức vụ
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {settings.interviewerTitle || 'Chuyên viên tuyển dụng'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Hình nền
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {settings.backgroundType === 'custom' ? 'Ảnh riêng Nhà tuyển dụng' : 'Phông nền trống chuyên nghiệp'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Ảnh nhân vật
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {settings.avatarType === 'custom' ? 'Ảnh WebP riêng' : (settings.selectedAvatarId === 'expert_male' ? 'MINH TRÍ AI Nam' : 'AILA AI Nữ WebP')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Giọng đọc AI
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {settings.ttsVoice || 'Trúc Ly'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Tốc độ phát âm
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {settings.ttsSpeed ? `${settings.ttsSpeed}x` : '1.0x'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cột phải: Các khối tùy chỉnh */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Khối 1: Tùy chọn hình nền */}
            <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhotoCameraBackOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Hình nền phòng phỏng vấn
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Chọn một trong các không gian studio phông trống hoặc tải ảnh văn phòng thương hiệu riêng
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <RadioGroup
                  row
                  value={settings.backgroundType}
                  onChange={(e) => setSettings((prev) => ({ ...prev, backgroundType: e.target.value as 'preset' | 'custom' }))}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value="preset"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Phông nền mẫu tiêu chuẩn</Typography>}
                  />
                  <FormControlLabel
                    value="custom"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Tải ảnh nền thương hiệu</Typography>}
                  />
                </RadioGroup>

                {settings.backgroundType === 'preset' ? (
                  <Grid container spacing={2}>
                    {PRESET_BACKGROUNDS.map((item) => {
                      const isSelected = settings.selectedBackgroundId === item.id;
                      return (
                        <Grid item xs={12} sm={6} key={item.id}>
                          <Box
                            onClick={() => setSettings((prev) => ({ ...prev, selectedBackgroundId: item.id }))}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                              bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              '&:hover': {
                                borderColor: 'primary.light',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                aspectRatio: '16/9',
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundImage: `url("${item.url}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                mb: 1.5,
                                position: 'relative',
                              }}
                            >
                              <Chip
                                label={item.badge}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                                  color: '#ffffff',
                                  backdropFilter: 'blur(4px)',
                                }}
                              />
                              {isSelected && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                    color: 'primary.main',
                                    bgcolor: '#ffffff',
                                    borderRadius: '50%',
                                    display: 'flex',
                                  }}
                                >
                                  <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />
                                </Box>
                              )}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                              {item.nameVi}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                              {item.descriptionVi}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box>
                    <input
                      ref={bgInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleUploadBg}
                    />

                    {settings.customBackgroundUrl ? (
                      <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: '#f8fafc' }}>
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: '16/9',
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundImage: `url("${settings.customBackgroundUrl}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            mb: 2,
                          }}
                        />
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => bgInputRef.current?.click()}
                            disabled={uploadingBg}
                            startIcon={<CloudUploadOutlinedIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Thay đổi ảnh khác
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => setSettings((prev) => ({ ...prev, customBackgroundUrl: null }))}
                            startIcon={<DeleteOutlineOutlinedIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Xóa ảnh
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Box
                        onClick={() => bgInputRef.current?.click()}
                        sx={{
                          p: 4,
                          border: '2px dashed #cbd5e1',
                          borderRadius: 3,
                          bgcolor: '#f8fafc',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: '#eff6ff',
                          },
                        }}
                      >
                        {uploadingBg ? (
                          <CircularProgress size={32} />
                        ) : (
                          <>
                            <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              Nhấp để tải lên hình nền thương hiệu Nhà tuyển dụng
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Hỗ trợ định dạng JPG, PNG hoặc WebP tỷ lệ 16:9 độ phân giải tiêu chuẩn 1920x1080
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Khối 2: Tùy chọn nhân vật AI WebP và Tài liệu chuẩn cấu trúc */}
            <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaceRetouchingNaturalOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Nhân vật AI phỏng vấn
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Chọn nhân vật AI cử động nhép môi WebP hoặc tải bộ ảnh tùy biến riêng
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Cụm nút công cụ: Xuất gói mẫu và Hướng dẫn */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      component="a"
                      href="/downloads/ai-avatar-sample-pack.zip"
                      download="ai-avatar-sample-pack.zip"
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<DownloadOutlinedIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.8rem' }}
                    >
                      Xuất gói mẫu chuẩn
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={() => setGuideOpen(true)}
                      startIcon={<MenuBookOutlinedIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: '0.8rem', color: 'text.secondary', borderColor: '#cbd5e1' }}
                    >
                      Hướng dẫn cấu trúc
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <RadioGroup
                  row
                  value={settings.avatarType}
                  onChange={(e) => setSettings((prev) => ({ ...prev, avatarType: e.target.value as 'preset' | 'custom' }))}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value="preset"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Nhân vật AI tiêu chuẩn</Typography>}
                  />
                  <FormControlLabel
                    value="custom"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Tải ảnh hoặc gói nhân vật riêng</Typography>}
                  />
                </RadioGroup>

                {settings.avatarType === 'preset' ? (
                  <Grid container spacing={2}>
                    {PRESET_AVATARS.map((item) => {
                      const isSelected = settings.selectedAvatarId === item.id;
                      return (
                        <Grid item xs={12} sm={6} key={item.id}>
                          <Box
                            onClick={() => {
                              const isMale = item.id === 'expert_male' || item.id.startsWith('male_');
                              const currentVoice = employerAiSettingService.getPresetVoice(settings.ttsVoice);
                              const currentIsMale = currentVoice?.gender === 'male';
                              let newVoice = settings.ttsVoice;
                              if (isMale && !currentIsMale) {
                                newVoice = 'Mạnh Dũng';
                              } else if (!isMale && currentIsMale) {
                                newVoice = 'Trúc Ly';
                              }
                              setSettings((prev) => ({
                                ...prev,
                                selectedAvatarId: item.id,
                                ttsVoice: newVoice,
                              }));
                            }}
                            sx={{
                              p: 1.5,
                              borderRadius: 3,
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                              bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              '&:hover': {
                                borderColor: 'primary.light',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                              },
                            }}
                          >
                            <Box
                              component="img"
                              src={item.previewUrl}
                              alt={item.name}
                              sx={{
                                width: 80,
                                height: 80,
                                objectFit: 'contain',
                                borderRadius: 2.5,
                                bgcolor: '#0f172a',
                                p: 0.5,
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                  {item.name}
                                </Typography>
                                {isSelected && <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 20 }} />}
                              </Stack>
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block' }}>
                                {item.titleVi}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                                {item.descriptionVi}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/webp,image/png,image/jpeg"
                      style={{ display: 'none' }}
                      onChange={handleUploadAvatar}
                    />

                    {settings.customAvatarUrl ? (
                      <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box
                          component="img"
                          src={settings.customAvatarUrl}
                          alt="Ảnh AI tùy chỉnh"
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'contain',
                            borderRadius: 2.5,
                            bgcolor: '#0f172a',
                            p: 1,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            Ảnh AI WebP Nhà tuyển dụng đã tải lên
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, mb: 1.5 }}>
                            Ảnh nhân vật đang được sử dụng trong các phiên phỏng vấn
                          </Typography>
                          <Stack direction="row" spacing={1.5}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={uploadingAvatar}
                              startIcon={<CloudUploadOutlinedIcon />}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Đổi ảnh khác
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => setSettings((prev) => ({ ...prev, customAvatarUrl: null }))}
                              startIcon={<DeleteOutlineOutlinedIcon />}
                              sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                              Xóa ảnh
                            </Button>
                          </Stack>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        onClick={() => avatarInputRef.current?.click()}
                        sx={{
                          p: 4,
                          border: '2px dashed #cbd5e1',
                          borderRadius: 3,
                          bgcolor: '#f8fafc',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: '#eff6ff',
                          },
                        }}
                      >
                        {uploadingAvatar ? (
                          <CircularProgress size={32} />
                        ) : (
                          <>
                            <FaceRetouchingNaturalOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              Nhấp để tải lên ảnh nhân vật AI WebP hoặc PNG tách nền
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Khuyên dùng tệp WebP hoặc PNG trong suốt chuẩn 1024x1024 để hiển thị sắc nét nhất
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Khối 3: Tùy chọn Giọng đọc và Âm điệu AI */}
            <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraphicEqIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Giọng đọc và âm điệu AI
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Tùy biến chất giọng ba miền Bắc Trung Nam và nhịp điệu phát âm tự nhiên của AI phỏng vấn
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                {/* Lưới các giọng đọc tiêu chuẩn */}
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                  Chất giọng phỏng vấn tiêu chuẩn
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {PRESET_VOICES.map((v) => {
                    const isSelected = (settings.ttsVoice === v.id || settings.ttsVoice === v.name);
                    const isPlaying = playingVoiceId === v.id;
                    const isLoading = loadingVoiceId === v.id;

                    return (
                      <Grid item xs={12} sm={6} key={v.id}>
                        <Box
                          onClick={() => setSettings((prev) => ({ ...prev, ttsVoice: v.name }))}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                            bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            position: 'relative',
                            '&:hover': {
                              borderColor: 'primary.light',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            },
                          }}
                        >
                          <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
                                  {v.name}
                                </Typography>
                                <Chip
                                  label={`${v.genderVi} - ${v.regionVi}`}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    bgcolor: v.gender === 'female' ? '#fdf2f8' : '#eff6ff',
                                    color: v.gender === 'female' ? '#db2777' : '#2563eb',
                                    border: '1px solid',
                                    borderColor: v.gender === 'female' ? '#fbcfe8' : '#bfdbfe',
                                  }}
                                />
                              </Stack>
                              {isSelected ? (
                                <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 22 }} />
                              ) : v.badge ? (
                                <Chip
                                  label={v.badge}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}
                                />
                              ) : null}
                            </Stack>

                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', mb: 0.5 }}>
                              {v.toneVi}
                            </Typography>

                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mb: 1.5 }}>
                              {v.descriptionVi}
                            </Typography>
                          </Box>

                          <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                            <Button
                              size="small"
                              variant={isPlaying ? 'contained' : 'outlined'}
                              color={isPlaying ? 'primary' : 'inherit'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayVoiceSample(v);
                              }}
                              disabled={isLoading}
                              startIcon={
                                isLoading ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : isPlaying ? (
                                  <StopRoundedIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                                )
                              }
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                borderRadius: 2,
                                py: 0.4,
                                px: 1.5,
                                color: isPlaying ? '#ffffff' : 'text.primary',
                                borderColor: isPlaying ? 'transparent' : '#cbd5e1',
                              }}
                            >
                              {isLoading ? 'Đang tải mẫu...' : isPlaying ? 'Dừng phát' : 'Nghe thử giọng mẫu'}
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Bộ điều chỉnh tốc độ phát âm */}
                <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <SpeedOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Tốc độ và nhịp điệu phát âm
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Tùy chỉnh nhịp nói của AI để câu hỏi được truyền tải tự nhiên, rõ ràng và mạch lạc nhất
                  </Typography>

                  <Grid container spacing={1.5}>
                    {PRESET_SPEEDS.map((sp) => {
                      const isSelected = (settings.ttsSpeed ?? 1.0) === sp.value;
                      return (
                        <Grid item xs={6} sm={3} key={sp.value}>
                          <Box
                            onClick={() => setSettings((prev) => ({ ...prev, ttsSpeed: sp.value }))}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                              bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                borderColor: 'primary.light',
                              },
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}>
                              {sp.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', mt: 0.25 }}>
                              {sp.descriptionVi}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            {/* Khối 4: Tên và chức vụ trợ lý AI */}
            <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Danh xưng và thông tin trợ lý AI
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Hiển thị trực tiếp trên huy hiệu người phỏng vấn khi ứng viên bước vào phòng
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tên hiển thị người phỏng vấn AI"
                      value={settings.interviewerName}
                      onChange={(e) => setSettings((prev) => ({ ...prev, interviewerName: e.target.value }))}
                      placeholder="Ví dụ: Trợ lý AI AILA"
                      size="small"
                      helperText="Tên sẽ được xướng âm và hiển thị trong phòng phỏng vấn"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Chức danh chuyên môn"
                      value={settings.interviewerTitle}
                      onChange={(e) => setSettings((prev) => ({ ...prev, interviewerTitle: e.target.value }))}
                      placeholder="Ví dụ: Chuyên viên tuyển dụng thông minh"
                      size="small"
                      helperText="Vị trí đảm nhiệm trong hội đồng phỏng vấn"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Khối hành động lưu cấu hình */}
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

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleReset}
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

      {/* Hộp thoại Hướng dẫn chuẩn hóa bộ ảnh hành vi AI */}
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
              Hướng dẫn cấu trúc gói ảnh hành vi nhân vật AI
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
            Hệ thống AI phỏng vấn của InfoHR sử dụng cơ chế chuyển đổi biểu cảm thông minh theo ngữ cảnh câu trả lời của ứng viên. Để nhân vật tương tác nhịp nhàng, bộ ảnh nạp vào cần tuân thủ cấu trúc tên tệp tiêu chuẩn.
          </Alert>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            1. Yêu cầu kỹ thuật tệp hình ảnh
          </Typography>
          <Box sx={{ mb: 2.5, pl: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Định dạng</strong>: WebP trong suốt khuyến nghị hoặc PNG tách nền
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Tỷ lệ khung hình</strong>: Vuông 1:1 hoặc chân dung 3:4
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>Độ phân giải</strong>: 1024x1024 pixel
            </Typography>
            <Typography variant="body2">
              • <strong>Dung lượng</strong>: Dưới 300KB mỗi tệp để đảm bảo tải tức thì trong phòng họp
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            2. Bảng quy tắc đặt tên các tệp trạng thái và khẩu hình
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 220 }}>Tên tệp quy ước</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hành vi tương ứng trong phòng phỏng vấn</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Mức độ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>idle.webp</TableCell>
                  <TableCell>Trạng thái sẵn sàng tiếp nhận ứng viên khi vào phòng</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>listening.webp</TableCell>
                  <TableCell>Trạng thái chăm chú lắng nghe khi ứng viên đang nói</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>thinking.webp</TableCell>
                  <TableCell>Trạng thái AI phân tích và chấm điểm dữ liệu câu trả lời</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>processing.webp</TableCell>
                  <TableCell>Trạng thái trích xuất báo cáo đánh giá năng lực</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>speaking_01.webp đến 08</TableCell>
                  <TableCell>Chuỗi 8 khung hình chuyển động nhép môi tự nhiên khớp với giọng đọc</TableCell>
                  <TableCell><Chip label="Bắt buộc" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>blink.webp</TableCell>
                  <TableCell>Cử động chớp mắt tự nhiên mỗi 4 giây chống đứng hình</TableCell>
                  <TableCell><Chip label="Khuyên dùng" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>agree.webp</TableCell>
                  <TableCell>Gật đầu khích lệ khi ứng viên trả lời tốt</TableCell>
                  <TableCell><Chip label="Tùy chọn" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>serious.webp</TableCell>
                  <TableCell>Biểu cảm tập trung cao độ đánh giá câu hỏi kỹ thuật</TableCell>
                  <TableCell><Chip label="Tùy chọn" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>goodbye.webp</TableCell>
                  <TableCell>Biểu cảm mỉm cười chào kết thúc buổi phỏng vấn</TableCell>
                  <TableCell><Chip label="Tùy chọn" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Gợi ý: Nhà tuyển dụng có thể tải trực tiếp Gói mẫu chuẩn bao gồm tệp cấu hình manifest mẫu và 22 trạng thái biểu cảm sẵn có để làm tư liệu tham khảo cho đội ngũ thiết kế.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            component="a"
            href="/downloads/ai-avatar-sample-pack.zip"
            download="ai-avatar-sample-pack.zip"
            variant="contained"
            color="primary"
            startIcon={<DownloadOutlinedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Tải gói mẫu chuẩn về máy
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
