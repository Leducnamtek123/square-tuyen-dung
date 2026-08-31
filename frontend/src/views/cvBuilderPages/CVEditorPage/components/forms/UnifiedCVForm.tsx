'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Rating,
  Collapse,
  Divider,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import StarIcon from '@mui/icons-material/Star';

import {
  CVData,
  CVPersonalInfo,
  CVExperienceItem,
  CVEducationItem,
  CVSkillItem,
  CVLanguageItem,
  CVCertificateItem,
  CVProjectItem,
} from '@/types/cvBuilder';
import commonService from '@/services/commonService';

interface UnifiedCVFormProps {
  data: CVData;
  onChangeData: (updated: CVData) => void;
  onOpenAISuggestions?: () => void;
}

const COMMON_LANGUAGES = [
  'Tiếng Anh',
  'Tiếng Nhật',
  'Tiếng Hàn',
  'Tiếng Trung',
  'Tiếng Pháp',
  'Tiếng Đức',
  'Tiếng Nga',
  'Tiếng Tây Ban Nha',
  'Tiếng Thái',
];

const SKILL_SUGGESTIONS = [
  'Giao tiếp & Thuyết trình',
  'Làm việc nhóm',
  'Quản lý thời gian',
  'Giải quyết vấn đề',
  'Tư duy phản biện',
  'Microsoft Office / Excel',
  'Figma / Design',
  'Tiếng Anh giao tiếp',
  'Phân tích dữ liệu',
  'Lập kế hoạch chiến lược',
];

export const UnifiedCVForm: React.FC<UnifiedCVFormProps> = ({
  data,
  onChangeData,
  onOpenAISuggestions,
}) => {
  const [showExtraPersonalInfo, setShowExtraPersonalInfo] = useState<boolean>(
    Boolean(data.personalInfo.website || data.personalInfo.linkedin || data.personalInfo.github)
  );

  // Update handlers
  const updatePersonalInfo = (field: keyof CVPersonalInfo, value: string) => {
    onChangeData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Immediately read as Base64 Data URL so it is fully persistent in local/remote state
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target?.result as string;
        if (base64Url) {
          updatePersonalInfo('avatarUrl', base64Url);
        }
      };
      reader.readAsDataURL(file);

      // 2. In parallel, attempt upload to cloud storage
      commonService.uploadFile(file, 'AVATAR')
        .then((res) => {
          if (res?.url) {
            updatePersonalInfo('avatarUrl', res.url);
          }
        })
        .catch((err) => {
          console.warn('Upload avatar file to cloud storage failed, keeping base64 Data URL:', err);
        });
    }
  };

  // ── Experiences Handlers ──────────────────────────────────────────
  const handleAddExperience = () => {
    const newItem: CVExperienceItem = {
      id: `exp-${crypto.randomUUID()}`,
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    };
    onChangeData({ ...data, experiences: [...data.experiences, newItem] });
  };

  const handleUpdateExperience = (id: string, field: keyof CVExperienceItem, value: any) => {
    onChangeData({
      ...data,
      experiences: data.experiences.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChangeData({
      ...data,
      experiences: data.experiences.filter((item) => item.id !== id),
    });
  };

  // ── Educations Handlers ───────────────────────────────────────────
  const handleAddEducation = () => {
    const newItem: CVEducationItem = {
      id: `edu-${crypto.randomUUID()}`,
      school: '',
      major: '',
      degree: 'Cử nhân',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    };
    onChangeData({ ...data, educations: [...data.educations, newItem] });
  };

  const handleUpdateEducation = (id: string, field: keyof CVEducationItem, value: any) => {
    onChangeData({
      ...data,
      educations: data.educations.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChangeData({
      ...data,
      educations: data.educations.filter((item) => item.id !== id),
    });
  };

  // ── Skills Handlers ───────────────────────────────────────────────
  const [newSkillName, setNewSkillName] = useState('');

  const handleAddSkill = (nameToAdd?: string) => {
    const skillName = (nameToAdd || newSkillName).trim();
    if (!skillName) return;
    if (data.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) return;

    const newItem: CVSkillItem = {
      id: `sk-${crypto.randomUUID()}`,
      name: skillName,
      level: 5,
    };
    onChangeData({ ...data, skills: [...data.skills, newItem] });
    if (!nameToAdd) setNewSkillName('');
  };

  const handleUpdateSkillLevel = (id: string, level: number) => {
    onChangeData({
      ...data,
      skills: data.skills.map((s) => (s.id === id ? { ...s, level } : s)),
    });
  };

  const handleDeleteSkill = (id: string) => {
    onChangeData({
      ...data,
      skills: data.skills.filter((s) => s.id !== id),
    });
  };

  // ── Languages Handlers (Vieclam24h 5-Star Style) ───────────────────
  const handleAddLanguage = (name = 'Tiếng Anh') => {
    const newItem: CVLanguageItem = {
      id: `lang-${crypto.randomUUID()}`,
      name,
      proficiency: 'Thành thạo',
    };
    onChangeData({ ...data, languages: [...data.languages, newItem] });
  };

  const handleUpdateLanguage = (id: string, field: keyof CVLanguageItem, value: any) => {
    onChangeData({
      ...data,
      languages: data.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
  };

  const handleDeleteLanguage = (id: string) => {
    onChangeData({
      ...data,
      languages: data.languages.filter((l) => l.id !== id),
    });
  };

  // Convert proficiency string to 1-5 rating & vice-versa
  const getLanguageStarValue = (prof: string): number => {
    if (prof.includes('Bản ngữ') || prof.includes('5') || prof.includes('Xuất sắc')) return 5;
    if (prof.includes('Thành thạo') || prof.includes('4') || prof.includes('Tốt')) return 4;
    if (prof.includes('Khá') || prof.includes('3') || prof.includes('Trung bình khá')) return 3;
    if (prof.includes('Cơ bản') || prof.includes('2') || prof.includes('Sơ cấp')) return 2;
    return 1;
  };

  const setLanguageProficiencyFromStars = (stars: number): string => {
    switch (stars) {
      case 5: return 'Bản ngữ';
      case 4: return 'Thành thạo';
      case 3: return 'Khá';
      case 2: return 'Cơ bản';
      default: return 'Sơ cấp';
    }
  };

  // ── Certificates Handlers ─────────────────────────────────────────
  const handleAddCertificate = () => {
    const newItem: CVCertificateItem = {
      id: `cert-${crypto.randomUUID()}`,
      name: '',
      organization: '',
      issueDate: '',
    };
    onChangeData({ ...data, certificates: [...data.certificates, newItem] });
  };

  const handleUpdateCertificate = (id: string, field: keyof CVCertificateItem, value: any) => {
    onChangeData({
      ...data,
      certificates: data.certificates.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    });
  };

  const handleDeleteCertificate = (id: string) => {
    onChangeData({
      ...data,
      certificates: data.certificates.filter((c) => c.id !== id),
    });
  };

  // ── Projects Handlers ─────────────────────────────────────────────
  const handleAddProject = () => {
    const newItem: CVProjectItem = {
      id: `proj-${crypto.randomUUID()}`,
      name: '',
      role: '',
      description: '',
    };
    onChangeData({ ...data, projects: [...data.projects, newItem] });
  };

  const handleUpdateProject = (id: string, field: keyof CVProjectItem, value: any) => {
    onChangeData({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    });
  };

  const handleDeleteProject = (id: string) => {
    onChangeData({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* ── Section 1: Thông tin cơ bản ──────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonOutlineIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
            Thông tin cơ bản
          </Typography>
        </Stack>

        {/* Avatar & Main Identity */}
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', mb: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              overflow: 'hidden',
              bgcolor: '#e2e8f0',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          >
            <img
              src={data.personalInfo.avatarUrl || '/images/cv-avatars/avatar-modern.jpg'}
              alt={data.personalInfo.fullName || 'Avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = '/images/cv-avatars/avatar-modern.jpg';
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <label>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              <Button
                component="span"
                size="small"
                variant="outlined"
                startIcon={<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  bgcolor: '#ffffff',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
                }}
              >
                Tải ảnh chân dung lên
              </Button>
            </label>
            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontSize: '0.7rem', mt: 0.5 }}>
              Khuyên dùng ảnh chân dung rõ nét, vuông tỉ lệ 1:1 (JPG, PNG).
            </Typography>
          </Box>
        </Box>

        {/* Grid Inputs */}
        <Stack spacing={2}>
          <TextField
            label="Họ và tên *"
            value={data.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            placeholder="VD: NGUYỄN VĂN A"
            size="small"
            fullWidth
            sx={{
              '& .MuiInputBase-input': { fontWeight: 600, fontFamily: 'Inter, sans-serif' },
            }}
          />

          <TextField
            label="Vị trí ứng tuyển *"
            value={data.personalInfo.title}
            onChange={(e) => updatePersonalInfo('title', e.target.value)}
            placeholder="VD: Chuyên viên Marketing / Kỹ sư Xây dựng"
            size="small"
            fullWidth
            sx={{
              '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' },
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <TextField
              label="Email liên hệ"
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="email@example.com"
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
            />
            <TextField
              label="Số điện thoại"
              value={data.personalInfo.phoneNumber}
              onChange={(e) => updatePersonalInfo('phoneNumber', e.target.value)}
              placeholder="0912 345 678"
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 0.8fr' }, gap: 1.5 }}>
            <TextField
              label="Địa chỉ / Tỉnh thành"
              value={data.personalInfo.address}
              onChange={(e) => updatePersonalInfo('address', e.target.value)}
              placeholder="Quận 1, TP. Hồ Chí Minh"
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
            />
            <TextField
              label="Ngày sinh"
              value={data.personalInfo.dob || ''}
              onChange={(e) => updatePersonalInfo('dob', e.target.value)}
              placeholder="DD/MM/YYYY"
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
            />
          </Box>

          {/* Toggle Additional Info */}
          <Button
            onClick={() => setShowExtraPersonalInfo(!showExtraPersonalInfo)}
            endIcon={showExtraPersonalInfo ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            sx={{
              alignSelf: 'flex-start',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#2563eb',
              textTransform: 'none',
              fontFamily: 'Inter, sans-serif',
              p: 0,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            {showExtraPersonalInfo ? 'Ẩn bớt liên kết bổ sung' : 'Thông tin bổ sung (Website, LinkedIn, GitHub) >'}
          </Button>

          <Collapse in={showExtraPersonalInfo}>
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <TextField
                label="Website / Portfolio"
                value={data.personalInfo.website || ''}
                onChange={(e) => updatePersonalInfo('website', e.target.value)}
                placeholder="https://yourportfolio.me"
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
              />
              <TextField
                label="LinkedIn Profile"
                value={data.personalInfo.linkedin || ''}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
              />
              <TextField
                label="GitHub / Behance"
                value={data.personalInfo.github || ''}
                onChange={(e) => updatePersonalInfo('github', e.target.value)}
                placeholder="https://github.com/username"
                size="small"
                fullWidth
                sx={{ '& .MuiInputBase-input': { fontFamily: 'Inter, sans-serif' } }}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Paper>

      {/* ── Section 2: Mục tiêu nghề nghiệp ─────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FlagOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Mục tiêu nghề nghiệp & Tóm tắt
            </Typography>
          </Stack>
          {onOpenAISuggestions && (
            <Button
              size="small"
              onClick={onOpenAISuggestions}
              startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: '#7c3aed',
                textTransform: 'none',
                bgcolor: '#f5f3ff',
                borderRadius: '8px',
                px: 1.5,
                '&:hover': { bgcolor: '#ede9fe' },
              }}
            >
              Gợi ý bằng AI
            </Button>
          )}
        </Stack>

        <TextField
          multiline
          minRows={3}
          maxRows={6}
          value={data.personalInfo.bio || ''}
          onChange={(e) => updatePersonalInfo('bio', e.target.value)}
          placeholder="Giới thiệu sơ bản thân thông qua mong muốn, mục tiêu của bạn khi đi làm. Nêu bật thế mạnh và giá trị bạn mang lại cho nhà tuyển dụng."
          fullWidth
          size="small"
          inputProps={{ maxLength: 600 }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Nên viết từ 2 - 4 câu cô đọng, súc tích và có trọng tâm.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
            Số ký tự: {(data.personalInfo.bio || '').length}/600
          </Typography>
        </Stack>
      </Paper>

      {/* ── Section 3: Kinh nghiệm làm việc ─────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WorkOutlineIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Kinh nghiệm làm việc
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={handleAddExperience}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#2563eb',
              textTransform: 'none',
              bgcolor: '#eff6ff',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { bgcolor: '#dbeafe' },
            }}
          >
            + Thêm kinh nghiệm làm việc
          </Button>
        </Stack>

        {data.experiences.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: '12px' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1 }}>
              Chưa có thông tin kinh nghiệm làm việc
            </Typography>
            <Button size="small" onClick={handleAddExperience} sx={{ fontWeight: 700, textTransform: 'none' }}>
              + Bấm vào đây để thêm
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {data.experiences.map((exp, idx) => (
              <Box
                key={exp.id}
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.825rem' }}>
                    #{idx + 1} {exp.position || 'Chức danh công việc'}
                  </Typography>
                  <IconButton size="small" onClick={() => handleDeleteExperience(exp.id)} sx={{ color: '#ef4444', p: 0.5 }}>
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Vị trí / Chức danh *"
                    value={exp.position}
                    onChange={(e) => handleUpdateExperience(exp.id, 'position', e.target.value)}
                    placeholder="VD: Senior Frontend Developer"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Công ty / Doanh nghiệp *"
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                    placeholder="VD: Công ty Cổ phần Công nghệ ABC"
                    size="small"
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Bắt đầu (MM/YYYY)"
                    value={exp.startDate}
                    onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder="03/2022"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Kết thúc"
                    value={exp.endDate}
                    onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder="Hiện tại hoặc 12/2023"
                    size="small"
                    fullWidth
                  />
                </Box>

                <TextField
                  multiline
                  minRows={2}
                  maxRows={5}
                  label="Mô tả công việc & Thành tích chính"
                  value={exp.description}
                  onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                  placeholder="• Nhiệm vụ và các dự án phụ trách&#10;• Thành quả số liệu nổi bật (tăng trưởng %, doanh số, giảm chi phí...)"
                  size="small"
                  fullWidth
                />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* ── Section 4: Học vấn & Trình độ ────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Học vấn & Trình độ
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={handleAddEducation}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#2563eb',
              textTransform: 'none',
              bgcolor: '#eff6ff',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { bgcolor: '#dbeafe' },
            }}
          >
            + Thêm học vấn
          </Button>
        </Stack>

        {data.educations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: '12px' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1 }}>
              Chưa có thông tin học vấn
            </Typography>
            <Button size="small" onClick={handleAddEducation} sx={{ fontWeight: 700, textTransform: 'none' }}>
              + Bấm vào đây để thêm
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {data.educations.map((edu, idx) => (
              <Box
                key={edu.id}
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.825rem' }}>
                    #{idx + 1} {edu.school || 'Trường đào tạo'}
                  </Typography>
                  <IconButton size="small" onClick={() => handleDeleteEducation(edu.id)} sx={{ color: '#ef4444', p: 0.5 }}>
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Trường / Đơn vị đào tạo *"
                    value={edu.school}
                    onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                    placeholder="VD: Đại học Bách Khoa / Kinh Tế"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Chuyên ngành *"
                    value={edu.major}
                    onChange={(e) => handleUpdateEducation(edu.id, 'major', e.target.value)}
                    placeholder="VD: Khoa học máy tính / Quản trị kinh doanh"
                    size="small"
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Bằng cấp / Xếp loại"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Cử nhân / Kỹ sư / Giỏi"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Năm bắt đầu"
                    value={edu.startDate}
                    onChange={(e) => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                    placeholder="2018"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Năm tốt nghiệp"
                    value={edu.endDate}
                    onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                    placeholder="2022"
                    size="small"
                    fullWidth
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* ── Section 5: Kỹ năng chuyên môn ───────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CodeOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Kỹ năng chuyên môn
            </Typography>
          </Stack>
        </Stack>

        {/* Input add skill */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Nhập kỹ năng mới (VD: React, Figma, SEO, Bán hàng, Excel...)"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleAddSkill()}
            sx={{
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Thêm
          </Button>
        </Stack>

        {/* Quick suggestions pills */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
            Gợi ý kỹ năng phổ biến (bấm để thêm nhanh):
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {SKILL_SUGGESTIONS.map((sug) => (
              <Chip
                key={sug}
                label={`+ ${sug}`}
                size="small"
                onClick={() => handleAddSkill(sug)}
                sx={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  bgcolor: '#f1f5f9',
                  color: '#334155',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Active Skills List with Levels */}
        <Stack spacing={1.25}>
          {data.skills.map((skill) => (
            <Box
              key={skill.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.25,
                bgcolor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.825rem' }}>
                {skill.name}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Rating
                  value={skill.level || 5}
                  max={5}
                  size="small"
                  onChange={(_, val) => handleUpdateSkillLevel(skill.id, val || 5)}
                  sx={{ color: '#f59e0b' }}
                />
                <IconButton size="small" onClick={() => handleDeleteSkill(skill.id)} sx={{ color: '#94a3b8', p: 0.25, '&:hover': { color: '#ef4444' } }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* ── Section 6: Ngoại ngữ (Vieclam24h Star Rating Style) ─────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TranslateOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Ngoại ngữ
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={() => handleAddLanguage()}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#2563eb',
              textTransform: 'none',
              bgcolor: '#eff6ff',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { bgcolor: '#dbeafe' },
            }}
          >
            + Thêm ngoại ngữ
          </Button>
        </Stack>

        {data.languages.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: '12px' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', mb: 1 }}>
              Chưa có ngoại ngữ nào
            </Typography>
            <Button size="small" onClick={() => handleAddLanguage()} sx={{ fontWeight: 700, textTransform: 'none' }}>
              + Thêm ngoại ngữ đầu tiên
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {data.languages.map((lang) => (
              <Box
                key={lang.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.25,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                }}
              >
                {/* Language Select or text */}
                <TextField
                  select
                  size="small"
                  value={COMMON_LANGUAGES.includes(lang.name) ? lang.name : 'Khác'}
                  onChange={(e) => {
                    if (e.target.value !== 'Khác') {
                      handleUpdateLanguage(lang.id, 'name', e.target.value);
                    }
                  }}
                  sx={{ width: 160, bgcolor: '#ffffff' }}
                >
                  {COMMON_LANGUAGES.map((cl) => (
                    <MenuItem key={cl} value={cl}>
                      {cl}
                    </MenuItem>
                  ))}
                  <MenuItem value="Khác">Khác / Tùy chỉnh</MenuItem>
                </TextField>

                {!COMMON_LANGUAGES.includes(lang.name) && (
                  <TextField
                    size="small"
                    placeholder="Tên ngoại ngữ"
                    value={lang.name}
                    onChange={(e) => handleUpdateLanguage(lang.id, 'name', e.target.value)}
                    sx={{ flex: 1, bgcolor: '#ffffff' }}
                  />
                )}

                {/* Star Rating System matching Vieclam24h */}
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={getLanguageStarValue(lang.proficiency)}
                    max={5}
                    size="medium"
                    onChange={(_, val) => {
                      const newProf = setLanguageProficiencyFromStars(val || 3);
                      handleUpdateLanguage(lang.id, 'proficiency', newProf);
                    }}
                    sx={{ color: '#f59e0b' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteLanguage(lang.id)}
                    sx={{ color: '#94a3b8', p: 0.5, '&:hover': { color: '#ef4444' } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* ── Section 7: Chứng chỉ & Giải thưởng ───────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WorkspacePremiumOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Chứng chỉ & Giải thưởng
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={handleAddCertificate}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#2563eb',
              textTransform: 'none',
              bgcolor: '#eff6ff',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { bgcolor: '#dbeafe' },
            }}
          >
            + Thêm chứng chỉ
          </Button>
        </Stack>

        {data.certificates.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: '12px' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Chưa có chứng chỉ nào
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {data.certificates.map((cert) => (
              <Box
                key={cert.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 0.6fr auto' },
                  gap: 1.25,
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                }}
              >
                <TextField
                  size="small"
                  label="Tên chứng chỉ *"
                  value={cert.name}
                  onChange={(e) => handleUpdateCertificate(cert.id, 'name', e.target.value)}
                  placeholder="VD: Google Ads / IELTS 7.5 / PMP"
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Đơn vị cấp"
                  value={cert.organization}
                  onChange={(e) => handleUpdateCertificate(cert.id, 'organization', e.target.value)}
                  placeholder="VD: Google Skillshop / IDP"
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Năm cấp"
                  value={cert.issueDate}
                  onChange={(e) => handleUpdateCertificate(cert.id, 'issueDate', e.target.value)}
                  placeholder="2023"
                  fullWidth
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteCertificate(cert.id)}
                  sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* ── Section 8: Dự án tiêu biểu ──────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              Dự án tiêu biểu
            </Typography>
          </Stack>
          <Button
            size="small"
            onClick={handleAddProject}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#2563eb',
              textTransform: 'none',
              bgcolor: '#eff6ff',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { bgcolor: '#dbeafe' },
            }}
          >
            + Thêm dự án
          </Button>
        </Stack>

        {data.projects.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center', border: '1.5px dashed #e2e8f0', borderRadius: '12px' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
              Chưa có dự án nào
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {data.projects.map((proj, idx) => (
              <Box
                key={proj.id}
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.825rem' }}>
                    #{idx + 1} {proj.name || 'Tên dự án'}
                  </Typography>
                  <IconButton size="small" onClick={() => handleDeleteProject(proj.id)} sx={{ color: '#ef4444', p: 0.5 }}>
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <TextField
                    label="Tên dự án *"
                    value={proj.name}
                    onChange={(e) => handleUpdateProject(proj.id, 'name', e.target.value)}
                    placeholder="VD: Website Thương mại điện tử XYZ"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Vai trò trong dự án"
                    value={proj.role}
                    onChange={(e) => handleUpdateProject(proj.id, 'role', e.target.value)}
                    placeholder="VD: Trưởng nhóm phát triển / UI Designer"
                    size="small"
                    fullWidth
                  />
                </Box>

                <TextField
                  multiline
                  minRows={2}
                  maxRows={4}
                  label="Mô tả dự án & Kết quả đạt được"
                  value={proj.description}
                  onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                  placeholder="Mô tả công nghệ sử dụng, quy mô dự án và giá trị đem lại."
                  size="small"
                  fullWidth
                />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};
