'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  TextField,
  Chip,
  Stack,
  ButtonBase,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useTranslation } from 'react-i18next';
import type { CandidateStep2Values } from '../schemas/candidateOnboardingSchema';
import type { SelectOption } from '@/types/models';

interface StepSkillsExperienceProps {
  values: CandidateStep2Values;
  onChange: (field: keyof CandidateStep2Values, value: any) => void;
  errors: Record<string, string>;
  experienceOptions: SelectOption[];
  academicLevelOptions: SelectOption[];
}

interface SuggestedSkill {
  name: string;
  category: 'construction' | 'realEstate' | 'architecture' | 'interior' | 'soft';
}

const POPULAR_SUGGESTIONS: SuggestedSkill[] = [
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
  { name: 'Thiết kế nội thất', category: 'interior' },
  { name: '3ds Max / Corona Nội thất', category: 'interior' },
  { name: 'SketchUp Nội thất', category: 'interior' },
  { name: 'Bố trí mặt bằng (Layout)', category: 'interior' },
  { name: 'Bóc tách nội thất & Fit-out', category: 'interior' },
  { name: 'Lựa chọn vật liệu nội thất', category: 'interior' },
  { name: 'Giám sát thi công nội thất', category: 'interior' },
  { name: 'Thiết kế chiếu sáng (Lighting)', category: 'interior' },
  { name: 'Thiết kế tủ bếp & Đồ gỗ', category: 'interior' },
  { name: 'Quản lý dự án', category: 'soft' },
  { name: 'Đàm phán & Thuyết phục', category: 'soft' },
  { name: 'Tiếng Anh chuyên ngành', category: 'soft' },
  { name: 'Làm việc nhóm', category: 'soft' },
  { name: 'Giải quyết vấn đề', category: 'soft' },
  { name: 'Quản lý tiến độ & Chi phí', category: 'soft' },
  { name: 'Thuyết trình & Bảo vệ phương án', category: 'soft' },
];

export default function StepSkillsExperience({
  values,
  onChange,
  errors,
  experienceOptions,
  academicLevelOptions,
}: StepSkillsExperienceProps) {
  const { t } = useTranslation('jobSeeker');
  const [skillInput, setSkillInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCustomSalary, setShowCustomSalary] = useState(
    Boolean(
      !values.isSalaryNegotiable &&
        values.salaryMin &&
        values.salaryMax &&
        ![
          '0-10000000',
          '10000000-15000000',
          '15000000-25000000',
          '25000000-50000000',
        ].includes(`${values.salaryMin}-${values.salaryMax}`),
    ),
  );

  const currentSkills: string[] = useMemo(() => values.skills || [], [values.skills]);

  const salaryQuickRanges = [
    { label: t('onboarding.step2.salaryBelow10', '< 10 triệu'), min: 0, max: 10000000, negotiable: false },
    { label: t('onboarding.step2.salary10To15', '10 - 15 triệu'), min: 10000000, max: 15000000, negotiable: false },
    { label: t('onboarding.step2.salary15To25', '15 - 25 triệu'), min: 15000000, max: 25000000, negotiable: false },
    { label: t('onboarding.step2.salaryAbove25', '> 25 triệu'), min: 25000000, max: 50000000, negotiable: false },
    { label: t('onboarding.step2.salaryNegotiable', 'Thỏa thuận'), min: 0, max: 0, negotiable: true },
  ];

  const handleAddCustomSkill = (customSkill?: string) => {
    const raw = customSkill !== undefined ? customSkill : skillInput;
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (currentSkills.length >= 20) {
      setInputError('Đã đạt giới hạn tối đa 20 kỹ năng.');
      return;
    }

    const tokens = trimmed
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!tokens.length) return;

    const newSkills = [...currentSkills];
    let addedCount = 0;

    for (const token of tokens) {
      if (newSkills.length >= 20) break;
      const exists = newSkills.some((s) => s.toLowerCase() === token.toLowerCase());
      if (!exists) {
        newSkills.push(token);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      onChange('skills', newSkills);
      setInputError(null);
    } else if (tokens.length === 1 && newSkills.some((s) => s.toLowerCase() === tokens[0].toLowerCase())) {
      setInputError('Kỹ năng này đã có trong danh sách của bạn.');
    }

    if (customSkill === undefined) {
      setSkillInput('');
    }
  };

  const handleToggleSuggestedSkill = (skillName: string) => {
    const exists = currentSkills.some((s) => s.toLowerCase() === skillName.toLowerCase());
    if (exists) {
      onChange(
        'skills',
        currentSkills.filter((s) => s.toLowerCase() !== skillName.toLowerCase()),
      );
      setInputError(null);
    } else {
      if (currentSkills.length >= 20) {
        setInputError('Đã đạt giới hạn tối đa 20 kỹ năng.');
        return;
      }
      onChange('skills', [...currentSkills, skillName]);
      setInputError(null);
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    onChange(
      'skills',
      currentSkills.filter((s) => s !== skillToDelete),
    );
    setInputError(null);
  };

  const handleClearAllSkills = () => {
    onChange('skills', []);
    setInputError(null);
  };

  const handleSelectSalaryQuick = (range: { min: number; max: number; negotiable: boolean }) => {
    setShowCustomSalary(false);
    onChange('isSalaryNegotiable', range.negotiable);
    onChange('salaryMin', range.min);
    onChange('salaryMax', range.max);
  };

  const filteredSuggestions = useMemo(() => {
    if (activeCategory === 'all') return POPULAR_SUGGESTIONS;
    return POPULAR_SUGGESTIONS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PsychologyOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            {t('onboarding.step2.title', 'Kỹ năng & Kinh nghiệm làm việc')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748B', pl: { xs: 0, sm: 6 } }}>
          {t('onboarding.step2.subtitle', 'Chọn hoặc nhập các kỹ năng thế mạnh và mức lương mong muốn để tối ưu đề xuất việc làm')}
        </Typography>
      </Box>

      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
              {t('onboarding.step2.skillsLabel', 'Kỹ năng thế mạnh của bạn')}{' '}
              <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: currentSkills.length >= 20 ? '#EF4444' : currentSkills.length > 0 ? '#2563EB' : '#64748B',
                backgroundColor: currentSkills.length > 0 ? '#EFF6FF' : '#F1F5F9',
                px: 1.25,
                py: 0.25,
                borderRadius: '8px',
              }}
            >
              {currentSkills.length}/20 kỹ năng
            </Typography>
          </Stack>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('onboarding.step2.skillsPlaceholder', 'Nhập tên kỹ năng rồi bấm Thêm...')}
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                error={Boolean(errors.skills || inputError)}
                helperText={inputError || errors.skills || t('onboarding.step2.skillsHelper', 'Nhập và nhấn Enter hoặc chọn từ danh sách bên dưới')}
                slotProps={{
                  formHelperText: {
                    sx: { mx: 0.5, mt: 0.5, color: inputError || errors.skills ? '#EF4444' : '#64748B', fontSize: '0.75rem' },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#FFFFFF' },
                    '&.Mui-focused': { backgroundColor: '#FFFFFF', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleAddCustomSkill()}
                disabled={!skillInput.trim() || currentSkills.length >= 20}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 3,
                  height: 40,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px -1px rgba(37,99,235,0.3)',
                }}
              >
                {t('common.add', 'Thêm')}
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 2, mb: 2.5, borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid', borderColor: errors.skills ? '#FCA5A5' : '#E2E8F0' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.8rem' }}>
                Kỹ năng đã chọn ({currentSkills.length})
              </Typography>
              {currentSkills.length > 0 && (
                <Button size="small" onClick={handleClearAllSkills} startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />} sx={{ color: '#EF4444', fontSize: '0.725rem', fontWeight: 600, textTransform: 'none', p: 0, minWidth: 0 }}>
                  Xóa tất cả
                </Button>
              )}
            </Stack>
            {currentSkills.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8125rem', textAlign: 'center', py: 1.5 }}>
                Chưa có kỹ năng nào. Nhập ở ô trên hoặc chọn từ danh sách gợi ý.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleDeleteSkill(skill)}
                    deleteIcon={<CloseRoundedIcon sx={{ fontSize: '15px !important', color: '#1D4ED8 !important' }} />}
                    sx={{ borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontWeight: 600, color: '#1D4ED8', fontSize: '0.8125rem', height: 32 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.825rem' }}>
                Gợi ý kỹ năng phổ biến theo chuyên ngành (Click để chọn nhanh)
              </Typography>
            </Stack>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'construction', label: 'Xây dựng' },
                { id: 'realEstate', label: 'Bất động sản' },
                { id: 'architecture', label: 'Kiến trúc' },
                { id: 'interior', label: 'Nội thất' },
                { id: 'soft', label: 'Kỹ năng mềm' },
              ].map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.label}
                  size="small"
                  clickable
                  onClick={() => setActiveCategory(cat.id)}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    borderRadius: '8px',
                    backgroundColor: activeCategory === cat.id ? '#EFF6FF' : '#F1F5F9',
                    color: activeCategory === cat.id ? '#1D4ED8' : '#64748B',
                    border: activeCategory === cat.id ? '1px solid #BFDBFE' : '1px solid transparent',
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 160, overflowY: 'auto', pr: 0.5 }}>
              {filteredSuggestions.map((item) => {
                const isSelected = currentSkills.some((s) => s.toLowerCase() === item.name.toLowerCase());
                return (
                  <Chip
                    key={item.name}
                    label={item.name}
                    size="small"
                    clickable
                    onClick={() => handleToggleSuggestedSkill(item.name)}
                    icon={isSelected ? <CheckRoundedIcon sx={{ fontSize: '14px !important', color: '#16A34A !important' }} /> : <AddRoundedIcon sx={{ fontSize: '14px !important', color: '#64748B !important' }} />}
                    sx={{
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#F0FDF4' : '#F8FAFC',
                      color: isSelected ? '#166534' : '#334155',
                      border: isSelected ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step2.experienceLabel', 'Số năm kinh nghiệm làm việc')}
          </Typography>
          <FormControl fullWidth>
            <Select
              value={values.experience || ''}
              onChange={(e) => onChange('experience', Number(e.target.value))}
              sx={{ borderRadius: '12px', backgroundColor: '#F8FAFC' }}
            >
              {(experienceOptions || []).map((exp) => (
                <MenuItem key={String(exp.id)} value={Number(exp.id)}>{exp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('onboarding.step2.academicLevelLabel', 'Trình độ học vấn cao nhất')}
          </Typography>
          <FormControl fullWidth>
            <Select
              value={values.academicLevel || ''}
              onChange={(e) => onChange('academicLevel', Number(e.target.value))}
              sx={{ borderRadius: '12px', backgroundColor: '#F8FAFC' }}
            >
              {(academicLevelOptions || []).map((ac) => (
                <MenuItem key={String(ac.id)} value={Number(ac.id)}>{ac.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
            {t('onboarding.step2.salaryLabel', 'Mức lương mong muốn (VNĐ / tháng)')}
          </Typography>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {salaryQuickRanges.map((range) => {
              const isSelected = !showCustomSalary && (range.negotiable ? values.isSalaryNegotiable : !values.isSalaryNegotiable && Number(values.salaryMin) === range.min && Number(values.salaryMax) === range.max);
              return (
                <Grid size={{ xs: 6, sm: 2.4 }} key={range.label}>
                  <ButtonBase
                    onClick={() => handleSelectSalaryQuick(range)}
                    sx={{
                      width: '100%', py: 1.5, px: 1, borderRadius: '12px', border: '1.5px solid', borderColor: isSelected ? '#2563EB' : '#E2E8F0', backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : '#F8FAFC', color: isSelected ? '#2563EB' : '#475569', fontWeight: isSelected ? 700 : 500, fontSize: '0.8125rem'
                    }}
                  >
                    {range.label}
                  </ButtonBase>
                </Grid>
              );
            })}
          </Grid>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <ButtonBase onClick={() => { setShowCustomSalary(!showCustomSalary); if (!showCustomSalary) onChange('isSalaryNegotiable', false); }} sx={{ color: showCustomSalary ? '#2563EB' : '#64748B', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'underline' }}>
              {showCustomSalary ? 'Ẩn mức lương tùy chỉnh' : '+ Nhập mức lương cụ thể (Tùy chỉnh)'}
            </ButtonBase>
          </Stack>

          {showCustomSalary && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="number" label={t('onboarding.step2.salaryMin', 'Lương tối thiểu (VNĐ)')} placeholder="VD: 10,000,000" value={values.salaryMin || ''} onChange={(e) => onChange('salaryMin', Number(e.target.value))} error={Boolean(errors.salaryMin || errors.salaryMax)} helperText={errors.salaryMin || ''} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="number" label={t('onboarding.step2.salaryMax', 'Lương tối đa (VNĐ)')} placeholder="VD: 20,000,000" value={values.salaryMax || ''} onChange={(e) => onChange('salaryMax', Number(e.target.value))} error={Boolean(errors.salaryMax)} helperText={errors.salaryMax || ''} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF' } }} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
