'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid2 as Grid,
  IconButton,
  Box,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonService from '@/services/commonService';
import type { SelectOption, SystemConfig } from '@/types/models';

export interface ProfileFormData {
  fullName: string;
  title: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  city: string;
  district: string;
  address: string;
  education: string;
  experience: string;
  career: string;
  maritalStatus: string;
  bio: string;
}

interface CandidateEditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialData: ProfileFormData;
  onSave: (data: ProfileFormData) => void;
}

const normalizeOptionLabel = (opt: SelectOption | string | null | undefined): string => {
  if (!opt) return '';
  if (typeof opt === 'string') return opt;
  const o = opt as unknown as { name?: string; label?: string; title?: string; id?: string | number };
  return o.name || o.label || o.title || String(o.id || '');
};

const CandidateEditProfileModal: React.FC<CandidateEditProfileModalProps> = ({
  open,
  onClose,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<ProfileFormData>(initialData);
  const [config, setConfig] = React.useState<SystemConfig | null>(null);
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);

  // Synchronize initial form data
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData, open]);

  // Load system configs via commonService
  React.useEffect(() => {
    if (!open) return;
    let isMounted = true;
    commonService
      .getConfigs()
      .then((res) => {
        if (isMounted && res) {
          setConfig(res);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Options from system config
  const cityOptions: SelectOption[] = React.useMemo(() => config?.cityOptions || [], [config]);
  const careerOptions: SelectOption[] = React.useMemo(() => config?.careerOptions || [], [config]);
  const genderOptions: SelectOption[] = React.useMemo(() => config?.genderOptions || [
    { id: 'male', name: 'Nam' },
    { id: 'female', name: 'Nữ' },
    { id: 'other', name: 'Khác' },
  ], [config]);
  const maritalStatusOptions: SelectOption[] = React.useMemo(() => config?.maritalStatusOptions || [
    { id: 'single', name: 'Độc thân' },
    { id: 'married', name: 'Đã kết hôn' },
  ], [config]);
  const educationOptions: SelectOption[] = React.useMemo(() => config?.academicLevelOptions || [
    { id: 'high_school', name: 'Trung học' },
    { id: 'college', name: 'Trung cấp / Cao đẳng' },
    { id: 'university', name: 'Đại học' },
    { id: 'master', name: 'Thạc sĩ / Tiến sĩ' },
  ], [config]);
  const experienceOptions: SelectOption[] = React.useMemo(() => config?.experienceOptions || [
    { id: 'no_exp', name: 'Chưa có kinh nghiệm' },
    { id: 'under_1', name: 'Dưới 1 năm' },
    { id: '1_year', name: '1 năm' },
    { id: '2_years', name: '2 năm' },
    { id: '3_years', name: '3 năm' },
    { id: '4_years', name: '4 năm' },
    { id: '5_plus', name: '5+ năm' },
  ], [config]);

  // Fetch Districts when selected city changes
  React.useEffect(() => {
    if (!open || !formData.city) {
      setDistrictOptions([]);
      return;
    }

    const matchedCity = cityOptions.find(
      (c) =>
        normalizeOptionLabel(c).toLowerCase() === formData.city.toLowerCase() ||
        String(c.id) === String(formData.city)
    );

    const cityId = matchedCity ? matchedCity.id : formData.city;
    if (cityId) {
      commonService
        .getDistrictsByCityId(cityId)
        .then((res) => {
          const results = Array.isArray(res) ? res : res.data || [];
          setDistrictOptions(results);
        })
        .catch(() => setDistrictOptions([]));
    }
  }, [formData.city, cityOptions, open]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'city') {
        next.district = '';
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Chỉnh sửa thông tin cá nhân
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cập nhật thông tin chi tiết để tăng độ tin cậy với nhà tuyển dụng
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9', py: 3 }}>
          <Grid container spacing={2.5}>
            {/* Full Name & Title */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Họ và tên *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Chức danh chuyên môn *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="VD: Kỹ sư Cơ điện / Frontend Developer"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Email & Phone */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Email liên hệ *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Số điện thoại
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* DOB & Gender */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Ngày sinh
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Giới tính
              </Typography>
              <Autocomplete
                size="small"
                options={genderOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={genderOptions.find((g) => g.id === formData.gender || normalizeOptionLabel(g) === formData.gender) || null}
                onChange={(_, newValue) => handleChange('gender', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Giới tính" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Location: Tỉnh / Thành phố */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Tỉnh / Thành phố
              </Typography>
              <Autocomplete
                size="small"
                options={cityOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={cityOptions.find((c) => normalizeOptionLabel(c).toLowerCase() === formData.city.toLowerCase() || String(c.id) === String(formData.city)) || (formData.city ? { id: formData.city, name: formData.city } : null)}
                onChange={(_, newValue) => handleChange('city', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Tỉnh / Thành phố" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Location: Quận / Huyện */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Quận / Huyện
              </Typography>
              <Autocomplete
                size="small"
                options={districtOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={districtOptions.find((d) => normalizeOptionLabel(d).toLowerCase() === formData.district.toLowerCase() || String(d.id) === String(formData.district)) || (formData.district ? { id: formData.district, name: formData.district } : null)}
                onChange={(_, newValue) => handleChange('district', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Quận / Huyện" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Trình độ học vấn */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Trình độ học vấn
              </Typography>
              <Autocomplete
                size="small"
                options={educationOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={educationOptions.find((e) => normalizeOptionLabel(e).toLowerCase() === formData.education.toLowerCase()) || (formData.education ? { id: formData.education, name: formData.education } : null)}
                onChange={(_, newValue) => handleChange('education', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Trình độ học vấn" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Kinh nghiệm làm việc */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Kinh nghiệm làm việc
              </Typography>
              <Autocomplete
                size="small"
                options={experienceOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={experienceOptions.find((exp) => normalizeOptionLabel(exp).toLowerCase() === formData.experience.toLowerCase()) || (formData.experience ? { id: formData.experience, name: formData.experience } : null)}
                onChange={(_, newValue) => handleChange('experience', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Kinh nghiệm làm việc" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Ngành nghề chính */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Ngành nghề chính
              </Typography>
              <Autocomplete
                size="small"
                options={careerOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={careerOptions.find((cr) => normalizeOptionLabel(cr).toLowerCase() === formData.career.toLowerCase() || String(cr.id) === String(formData.career)) || (formData.career ? { id: formData.career, name: formData.career } : null)}
                onChange={(_, newValue) => handleChange('career', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Ngành nghề chính" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Tình trạng hôn nhân */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Tình trạng hôn nhân
              </Typography>
              <Autocomplete
                size="small"
                options={maritalStatusOptions}
                getOptionLabel={(opt) => normalizeOptionLabel(opt)}
                value={maritalStatusOptions.find((m) => normalizeOptionLabel(m).toLowerCase() === formData.maritalStatus.toLowerCase()) || (formData.maritalStatus ? { id: formData.maritalStatus, name: formData.maritalStatus } : null)}
                onChange={(_, newValue) => handleChange('maritalStatus', newValue ? normalizeOptionLabel(newValue) : '')}
                renderInput={(params) => <TextField {...params} placeholder="Chọn Tình trạng hôn nhân" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
              />
            </Grid>

            {/* Self Bio */}
            <Grid size={12}>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Giới thiệu bản thân
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Viết một vài dòng ngắn gọn giới thiệu mục tiêu nghề nghiệp, thế mạnh cá nhân..."
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              fontWeight: 700,
              px: 3,
              '&:hover': { backgroundColor: '#1d4ed8' },
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CandidateEditProfileModal;
