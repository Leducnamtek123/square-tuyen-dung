'use client';

import React from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useTranslation } from 'react-i18next';

interface SuggestedSkill {
  name: string;
  category: 'construction' | 'realEstate' | 'architecture' | 'interior' | 'soft';
}

const POPULAR_SUGGESTIONS: SuggestedSkill[] = [
  // 1. Xây dựng (Construction)
  { name: 'AutoCAD Xây dựng', category: 'construction' },
  { name: 'Revit Structure', category: 'construction' },
  { name: 'Bóc tách khối lượng (QS)', category: 'construction' },
  { name: 'Dự toán công trình', category: 'construction' },
  { name: 'Giám sát thi công', category: 'construction' },
  { name: 'Quản lý an toàn lao động (HSE)', category: 'construction' },
  { name: 'Kết cấu thép', category: 'construction' },
  { name: 'Thi công MEP', category: 'construction' },
  { name: 'Nghiệm thu công trình', category: 'construction' },
  { name: 'Đọc bản vẽ kết cấu', category: 'construction' },
  { name: 'MS Project tiến độ', category: 'construction' },
  { name: 'Chỉ huy trưởng công trường', category: 'construction' },

  // 2. Bất động sản (Real Estate)
  { name: 'Môi giới Bất động sản', category: 'realEstate' },
  { name: 'Thẩm định giá BĐS', category: 'realEstate' },
  { name: 'Pháp lý Bất động sản', category: 'realEstate' },
  { name: 'Tư vấn đầu tư BĐS', category: 'realEstate' },
  { name: 'Phát triển dự án BĐS', category: 'realEstate' },
  { name: 'Đàm phán & Chốt deal BĐS', category: 'realEstate' },
  { name: 'Marketing Bất động sản', category: 'realEstate' },
  { name: 'Quản lý sàn giao dịch', category: 'realEstate' },
  { name: 'Quản lý tòa nhà & Tài sản', category: 'realEstate' },
  { name: 'Chăm sóc khách hàng VIP', category: 'realEstate' },

  // 3. Kiến trúc (Architecture)
  { name: 'Thiết kế kiến trúc', category: 'architecture' },
  { name: '3ds Max Architecture', category: 'architecture' },
  { name: 'SketchUp Kiến trúc', category: 'architecture' },
  { name: 'Lumion / Enscape', category: 'architecture' },
  { name: 'V-Ray Render', category: 'architecture' },
  { name: 'Phối cảnh 3D ngoại thất', category: 'architecture' },
  { name: 'Khai triển bản vẽ kiến trúc', category: 'architecture' },
  { name: 'Revit Architecture', category: 'architecture' },
  { name: 'Quy hoạch đô thị', category: 'architecture' },
  { name: 'Thiết kế cảnh quan', category: 'architecture' },
  { name: 'Photoshop kiến trúc', category: 'architecture' },

  // 4. Nội thất (Interior Design)
  { name: 'Thiết kế nội thất', category: 'interior' },
  { name: '3ds Max / Corona Nội thất', category: 'interior' },
  { name: 'SketchUp Nội thất', category: 'interior' },
  { name: 'Bố trí mặt bằng (Layout)', category: 'interior' },
  { name: 'Bóc tách nội thất & Fit-out', category: 'interior' },
  { name: 'Lựa chọn vật liệu nội thất', category: 'interior' },
  { name: 'Giám sát thi công nội thất', category: 'interior' },
  { name: 'Thiết kế chiếu sáng (Lighting)', category: 'interior' },
  { name: 'Thiết kế tủ bếp & Đồ gỗ', category: 'interior' },

  // 5. Kỹ năng mềm & Bổ trợ (Soft Skills)
  { name: 'Quản lý dự án', category: 'soft' },
  { name: 'Đàm phán & Thuyết phục', category: 'soft' },
  { name: 'Tiếng Anh chuyên ngành', category: 'soft' },
  { name: 'Làm việc nhóm', category: 'soft' },
  { name: 'Giải quyết vấn đề', category: 'soft' },
  { name: 'Quản lý tiến độ & Chi phí', category: 'soft' },
  { name: 'Thuyết trình & Bảo vệ phương án', category: 'soft' },
];

interface CandidateSkillsCardProps {
  initialSkills?: string[];
  onSave?: (skills: string[]) => Promise<void> | void;
}

const CandidateSkillsCard: React.FC<CandidateSkillsCardProps> = ({
  initialSkills = [],
  onSave,
}) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const [skills, setSkills] = React.useState<string[]>(initialSkills || []);
  const [draftSkills, setDraftSkills] = React.useState<string[]>([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [newSkillInput, setNewSkillInput] = React.useState('');
  const [inputError, setInputError] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (initialSkills) {
      setSkills(initialSkills);
    }
  }, [initialSkills]);

  const handleOpenModal = () => {
    setDraftSkills([...skills]);
    setNewSkillInput('');
    setInputError(null);
    setActiveCategory('all');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setInputError(null);
  };

  const handleAddSkill = (customSkill?: string) => {
    const raw = customSkill !== undefined ? customSkill : newSkillInput;
    const trimmed = raw.trim();

    if (!trimmed) return;

    if (draftSkills.length >= 20) {
      setInputError(
        t('jobSeeker:candidateProfile.skills.maxSkillsReached', {
          defaultValue: 'Đã đạt giới hạn tối đa 20 kỹ năng',
        })
      );
      return;
    }

    if (draftSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setInputError(
        t('jobSeeker:candidateProfile.skills.duplicateSkill', {
          defaultValue: 'Kỹ năng này đã được thêm trước đó',
        })
      );
      return;
    }

    if (!skills.includes(newSkillInput.trim()) || !draftSkills.includes(trimmed)) {
      setDraftSkills((prev) => [...prev, trimmed]);
    }
    if (customSkill === undefined) {
      setNewSkillInput('');
    }
    setInputError(null);
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setDraftSkills((prev) => prev.filter((s) => s !== skillToDelete));
    setInputError(null);
  };

  const handleToggleSuggestedSkill = (skillName: string) => {
    if (draftSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      setDraftSkills((prev) => prev.filter((s) => s.toLowerCase() !== skillName.toLowerCase()));
      setInputError(null);
    } else {
      handleAddSkill(skillName);
    }
  };

  const handleClearAll = () => {
    setDraftSkills([]);
    setInputError(null);
  };

  const handleSaveModal = async () => {
    setIsSaving(true);
    try {
      setSkills(draftSkills);
      if (onSave) {
        await onSave(draftSkills);
      }
      setOpenModal(false);
    } catch (err) {
      console.error('Failed to save candidate skills:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSuggestions = React.useMemo(() => {
    if (activeCategory === 'all') return POPULAR_SUGGESTIONS;
    return POPULAR_SUGGESTIONS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(15,23,42,0.04)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: '#cbd5e1',
          boxShadow: '0 8px 30px -4px rgba(15,23,42,0.06)',
        },
      }}
    >
      {/* Card Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                {t('jobSeeker:candidateProfile.skills.title', { defaultValue: 'Kỹ năng chuyên môn' })}
              </Typography>
              <Chip
                label={t('jobSeeker:candidateProfile.skills.skillsCount', {
                  count: skills.length,
                  defaultValue: `${skills.length} kỹ năng`,
                })}
                size="small"
                sx={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  height: 22,
                  borderRadius: '6px',
                  border: '1px solid #dbeafe',
                }}
              />
            </Box>
          </Box>
        </Box>

        <Tooltip title="Chỉnh sửa kỹ năng">
          <IconButton
            aria-label="Thao tác"
            size="small"
            onClick={handleOpenModal}
            sx={{
              color: '#64748b',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              p: 0.75,
              transition: 'all 0.15s ease',
              '&:hover': {
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                borderColor: '#bfdbfe',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Skills Display Cloud */}
      {skills.length === 0 ? (
        <Box
          sx={{
            py: 3,
            px: 2,
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 28, color: '#94a3b8' }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', maxWidth: 360 }}>
            {t('jobSeeker:candidateProfile.skills.empty', {
              defaultValue: 'Chưa thêm kỹ năng chuyên môn nào. Thêm các kỹ năng bạn thông thạo để nhà tuyển dụng dễ dàng tìm thấy.',
            })}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleOpenModal}
            sx={{
              borderRadius: '10px',
              borderColor: '#2563eb',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              px: 2,
              py: 0.5,
              '&:hover': {
                backgroundColor: '#eff6ff',
                borderColor: '#1d4ed8',
              },
            }}
          >
            {t('jobSeeker:candidateProfile.skills.addSkill', { defaultValue: 'Thêm kỹ năng' })}
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 15, color: '#2563eb !important' }} />}
              sx={{
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontWeight: 600,
                color: '#0f172a',
                fontSize: '0.8125rem',
                py: 0.75,
                px: 0.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe',
                  color: '#1d4ed8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px -1px rgba(37,99,235,0.12)',
                },
              }}
            />
          ))}
          <Button
            size="small"
            startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleOpenModal}
            sx={{
              borderRadius: '10px',
              border: '1px dashed #93c5fd',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: '0.775rem',
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: '#dbeafe',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {t('jobSeeker:candidateProfile.skills.addSkill', { defaultValue: 'Thêm kỹ năng' })}
          </Button>
        </Box>
      )}

      {/* Helpful Skill Tip / Insight Bar */}
      {skills.length > 0 && (
        <Box
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18, color: skills.length >= 5 ? '#16a34a' : '#f59e0b', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}>
            {skills.length >= 5
              ? 'Hồ sơ kỹ năng chuyên môn rất phong phú, giúp tăng 45% tỷ lệ liên hệ từ nhà tuyển dụng.'
              : 'Gợi ý: Thêm từ 5 kỹ năng trở lên để mở khóa mức độ hoàn thiện hồ sơ cao nhất.'}
          </Typography>
        </Box>
      )}

      {/* ── Modern Skills Management Modal ────────────────────────────────────── */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: { xs: 1, sm: 1.5 },
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(15,23,42,0.25)',
          },
        }}
      >
        {/* Modal Header */}
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 2.5 },
            pb: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem', lineHeight: 1.3 }}>
                {t('jobSeeker:candidateProfile.skills.manageModalTitle', { defaultValue: 'Quản lý kỹ năng chuyên môn' })}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block', mt: 0.25 }}>
                {t('jobSeeker:candidateProfile.skills.modalSubtitle', {
                  defaultValue: 'Thêm các kỹ năng thế mạnh và kinh nghiệm thực chiến giúp CV của bạn thu hút nhà tuyển dụng.',
                })}
              </Typography>
            </Box>
          </Box>

          <IconButton
            aria-label="Đóng"
            onClick={handleCloseModal}
            size="small"
            sx={{
              color: '#64748b',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              p: 0.75,
              '&:hover': { backgroundColor: '#f1f5f9', color: '#0f172a' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        {/* Modal Content */}
        <DialogContent dividers sx={{ borderColor: '#f1f5f9', py: 2.5, px: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.5}>
            {/* Input Row */}
            <Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('jobSeeker:candidateProfile.skills.skillInputPlaceholder', {
                    defaultValue: 'Nhập tên kỹ năng (VD: ReactJS, Figma, Tiếng Anh...)...',
                  })}
                  value={newSkillInput}
                  onChange={(e) => {
                    setNewSkillInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddRoundedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  error={Boolean(inputError)}
                  helperText={
                    inputError ||
                    'Nhấn Enter hoặc dấu phẩy để thêm nhanh'
                  }
                  FormHelperTextProps={{
                    sx: {
                      mx: 0.5,
                      mt: 0.5,
                      color: inputError ? '#dc2626' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: inputError ? 600 : 400,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        backgroundColor: '#ffffff',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleAddSkill()}
                  disabled={!newSkillInput.trim() || draftSkills.length >= 20}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#2563eb',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    px: 2.5,
                    height: 40,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px -1px rgba(37,99,235,0.3)',
                    '&:hover': {
                      backgroundColor: '#1d4ed8',
                      boxShadow: '0 4px 12px -2px rgba(37,99,235,0.4)',
                    },
                  }}
                >
                  {t('jobSeeker:candidateProfile.skills.add', { defaultValue: 'Thêm' })}
                </Button>
              </Box>
            </Box>

            {/* Selected Skills Section */}
            <Box
              sx={{
                p: 2,
                borderRadius: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8rem' }}>
                  {t('jobSeeker:candidateProfile.skills.selectedSkills', { defaultValue: 'Kỹ năng đã chọn' })} ({draftSkills.length}/20)
                </Typography>
                {draftSkills.length > 0 && (
                  <Button
                    size="small"
                    onClick={handleClearAll}
                    startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      color: '#ef4444',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      p: 0,
                      minWidth: 0,
                      '&:hover': { backgroundColor: 'transparent', color: '#b91c1c' },
                    }}
                  >
                    {t('jobSeeker:candidateProfile.skills.clearAll', { defaultValue: 'Xóa tất cả' })}
                  </Button>
                )}
              </Box>

              {draftSkills.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8125rem', textAlign: 'center', py: 1 }}>
                  {t('jobSeeker:candidateProfile.skills.empty', { defaultValue: 'Chưa có kỹ năng nào được chọn. Nhập ở trên hoặc chọn từ danh sách gợi ý.' })}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {draftSkills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleDeleteSkill(skill)}
                      deleteIcon={<CloseRoundedIcon sx={{ fontSize: '15px !important', color: '#475569 !important' }} />}
                      sx={{
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontWeight: 600,
                        color: '#0f172a',
                        fontSize: '0.8125rem',
                        height: 32,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        '& .MuiChip-deleteIcon:hover': {
                          color: '#ef4444 !important',
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Popular Suggestions Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8rem' }}>
                  {t('jobSeeker:candidateProfile.skills.suggestedTitle', { defaultValue: 'Gợi ý kỹ năng phổ biến' })}
                </Typography>
              </Box>

              {/* Category Filter Tabs */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                {[
                  { id: 'all', label: t('jobSeeker:candidateProfile.skills.categoryAll', { defaultValue: 'Tất cả' }) },
                  { id: 'construction', label: t('jobSeeker:candidateProfile.skills.categoryConstruction', { defaultValue: 'Xây dựng' }) },
                  { id: 'realEstate', label: t('jobSeeker:candidateProfile.skills.categoryRealEstate', { defaultValue: 'Bất động sản' }) },
                  { id: 'architecture', label: t('jobSeeker:candidateProfile.skills.categoryArchitecture', { defaultValue: 'Kiến trúc' }) },
                  { id: 'interior', label: t('jobSeeker:candidateProfile.skills.categoryInterior', { defaultValue: 'Nội thất' }) },
                  { id: 'soft', label: t('jobSeeker:candidateProfile.skills.categorySoft', { defaultValue: 'Kỹ năng mềm' }) },
                ].map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      size="small"
                      clickable
                      onClick={() => setActiveCategory(cat.id)}
                      sx={{
                        fontSize: '0.725rem',
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#eff6ff' : '#f1f5f9',
                        color: isSelected ? '#1d4ed8' : '#64748b',
                        border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: isSelected ? '#dbeafe' : '#e2e8f0',
                        },
                      }}
                    />
                  );
                })}
              </Box>

              {/* Suggested Skills Grid */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 150, overflowY: 'auto', pr: 0.5 }}>
                {filteredSuggestions.map((item) => {
                  const isSelected = draftSkills.some((s) => s.toLowerCase() === item.name.toLowerCase());
                  return (
                    <Chip
                      key={item.name}
                      label={item.name}
                      size="small"
                      clickable
                      onClick={() => handleToggleSuggestedSkill(item.name)}
                      icon={
                        isSelected ? (
                          <CheckRoundedIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />
                        ) : (
                          <AddRoundedIcon sx={{ fontSize: '14px !important', color: '#64748b !important' }} />
                        )
                      }
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        color: isSelected ? '#166534' : '#334155',
                        border: isSelected ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: isSelected ? '#dcfce7' : '#eff6ff',
                          borderColor: isSelected ? '#86efac' : '#bfdbfe',
                          color: isSelected ? '#14532d' : '#1d4ed8',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem' }}>
            {draftSkills.length > 0
              ? `Đã chọn ${draftSkills.length} kỹ năng`
              : 'Chưa chọn kỹ năng'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.25 }}>
            <Button
              onClick={handleCloseModal}
              disabled={isSaving}
              sx={{
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: '10px',
                textTransform: 'none',
                px: 2,
                '&:hover': { backgroundColor: '#f1f5f9', color: '#0f172a' },
              }}
            >
              {t('jobSeeker:candidateProfile.skills.cancel', { defaultValue: 'Hủy bỏ' })}
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveModal}
              disabled={isSaving}
              sx={{
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'none',
                px: 3,
                boxShadow: '0 2px 8px -1px rgba(37,99,235,0.35)',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  boxShadow: '0 4px 12px -2px rgba(37,99,235,0.45)',
                },
              }}
            >
              {t('jobSeeker:candidateProfile.skills.done', { defaultValue: 'Hoàn tất' })}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CandidateSkillsCard;
