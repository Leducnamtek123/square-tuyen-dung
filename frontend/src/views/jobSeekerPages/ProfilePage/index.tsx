'use client';

import React from 'react';
import {
  Box,
  Card,
  Grid2 as Grid,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getUserInfo, setUserInfo } from '@/redux/userSlice';
import authService from '@/services/authService';
import jobSeekerProfileService from '@/services/jobSeekerProfileService';
import toastMessages from '@/utils/toastMessages';
import CandidateAppliedResumeCard from '../../components/jobSeekers/CandidateDashboardMain/CandidateAppliedResumeCard';
import CandidateProfileHeroBanner from '../../components/jobSeekers/CandidateProfile/CandidateProfileHeroBanner';
import CandidateEditProfileModal, { ProfileFormData } from '../../components/jobSeekers/CandidateProfile/CandidateEditProfileModal';
import CandidateSkillsCard from '../../components/jobSeekers/CandidateProfile/CandidateSkillsCard';
import { useResumes } from '../../components/jobSeekers/hooks/useJobSeekerQueries';
import { CV_TYPES } from '../../../configs/constants';
import type { ExtendedResume } from '@/components/Features/CVDoc';
import type { User } from '@/types/models';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '01/01/1995';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('DD/MM/YYYY') : '01/01/1995';
};

// Safe LocalStorage helper preventing QuotaExceededError crash
const safeSaveStorage = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`LocalStorage quota limit reached for ${key}, skipping persistent cache:`, err);
  }
};

// Compress high-res uploaded images to compact JPEG base64 (max 600px width)
const compressImage = (file: File, maxWidth = 600, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve('');
      img.src = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  });
};

const ProfilePage = () => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  TabTitle(t('jobSeeker:profile.title'));

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  const rawProfileId = currentUser?.jobSeekerProfile?.id || currentUser?.jobSeekerProfileId || undefined;
  const jobSeekerProfileId = rawProfileId ? String(rawProfileId) : undefined;

  const { data: resumes } = useResumes(jobSeekerProfileId, {
    resumeType: CV_TYPES.cvWebsite,
  });

  const resume = React.useMemo(() => {
    return resumes && resumes.length > 0 ? (resumes[0] as unknown as ExtendedResume) : null;
  }, [resumes]);

  // Persistent Avatar & Cover URL from localStorage
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sq_user_avatar') || currentUser?.avatarUrl || undefined;
    }
    return currentUser?.avatarUrl || undefined;
  });

  const [coverUrl, setCoverUrl] = React.useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sq_user_cover') || undefined;
    }
    return undefined;
  });

  // Profile Form State
  const [profileData, setProfileData] = React.useState<ProfileFormData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sq_user_profile_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      fullName: currentUser?.fullName || 'Lê Đức Nam',
      title: 'Chuyên viên phần mềm / Kỹ sư',
      email: currentUser?.email || 'leducnamtek123@gmail.com',
      phoneNumber: (currentUser as unknown as { phoneNumber?: string })?.phoneNumber || '0901 234 567',
      dob: '1995-01-01',
      gender: 'male',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      address: 'Hồ Chí Minh',
      education: 'Đại học',
      experience: '2 năm',
      career: 'Công nghệ thông tin',
      maritalStatus: 'Độc thân',
      bio: 'Chuyên viên phần mềm với hơn 2 năm kinh nghiệm phát triển hệ thống và quản lý sản phẩm. Thành thạo công nghệ hiện đại, bóc tách giải pháp và tối ưu quy trình.',
    };
  });

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [isJobSeeking, setIsJobSeeking] = React.useState<boolean>(true);
  const [isSubmittingStatus, setIsSubmittingStatus] = React.useState<boolean>(false);

  // Synchronize currentUser from Redux and fetch profile status
  React.useEffect(() => {
    if (currentUser?.fullName) {
      setProfileData((prev) => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        email: currentUser.email || prev.email,
      }));
    }
    if (currentUser?.avatarUrl && typeof window !== 'undefined' && !localStorage.getItem('sq_user_avatar')) {
      setAvatarUrl(currentUser.avatarUrl);
    }
    const fetchProfileStatus = async () => {
      try {
        const p = await jobSeekerProfileService.getProfile();
        if (p) {
          setIsJobSeeking(p.isJobSeeking ?? p.isSeekingJob ?? true);
        }
      } catch (err) {
        console.warn('Could not fetch candidate profile status from backend:', err);
      }
    };
    if (currentUser) {
      void fetchProfileStatus();
    }
  }, [currentUser]);

  const handleSeekingStatusChange = async (newStatus: boolean) => {
    setIsSubmittingStatus(true);
    try {
      await jobSeekerProfileService.updateProfile({ isJobSeeking: newStatus });
      setIsJobSeeking(newStatus);
      toastMessages.success(
        newStatus
          ? 'Đã bật trạng thái nhận cơ hội việc làm'
          : 'Đã tắt trạng thái nhận cơ hội việc làm'
      );
    } catch (err) {
      console.error('Failed to update job seeking status:', err);
      toastMessages.error('Không thể cập nhật trạng thái nhận việc làm. Vui lòng thử lại!');
      throw err;
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Handle Avatar Upload API
  const handleAvatarChange = async (file: File, localUrl: string) => {
    // 1. Instant System Toast Notification
    toastMessages.success('Cập nhật ảnh đại diện thành công!');

    // 2. Instant local blob preview
    setAvatarUrl(localUrl);
    if (currentUser) {
      dispatch(setUserInfo({ ...currentUser, avatarUrl: localUrl }));
    }

    // 3. Compress image and safely persist in localStorage
    const compressedBase64 = await compressImage(file, 400, 0.8);
    if (compressedBase64) {
      setAvatarUrl(compressedBase64);
      safeSaveStorage('sq_user_avatar', compressedBase64);
      if (currentUser) {
        dispatch(setUserInfo({ ...currentUser, avatarUrl: compressedBase64 }));
      }
    }

    // 4. Send upload request to Backend API (Field 'file')
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authService.updateAvatar(formData);
      if (res?.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        safeSaveStorage('sq_user_avatar', res.avatarUrl);
      }
      void dispatch(getUserInfo());
    } catch (err) {
      console.warn('Backend Cloudinary upload notice, updated in local session:', err);
    }
  };

  // Handle Cover Upload API
  const handleCoverChange = async (file: File, localUrl: string) => {
    // 1. Instant System Toast Notification
    toastMessages.success('Cập nhật ảnh bìa thành công!');

    // 2. Instant local blob preview
    setCoverUrl(localUrl);

    // 3. Compress cover image to max 800px width to fit within browser storage
    const compressedBase64 = await compressImage(file, 800, 0.7);
    if (compressedBase64) {
      setCoverUrl(compressedBase64);
      safeSaveStorage('sq_user_cover', compressedBase64);
    }

    // 4. Send update request to Backend API
    try {
      await authService.updateUser(({ coverUrl: localUrl } as unknown) as Partial<User>);
      void dispatch(getUserInfo());
    } catch (err) {
      console.warn('Backend cover update notice, updated in local session:', err);
    }
  };

  // Handle Profile Save API
  const handleSaveProfile = async (updated: ProfileFormData) => {
    toastMessages.success('Cập nhật thông tin cá nhân thành công!');
    setProfileData(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sq_user_profile_data', JSON.stringify(updated));
      if (updated.phoneNumber) {
        localStorage.setItem('sq_user_phone', updated.phoneNumber);
      }
    }
    try {
      await authService.updateUser({ fullName: updated.fullName, email: updated.email });
      void dispatch(getUserInfo());
    } catch (err) {
      console.warn('Backend update user notice, updated in session:', err);
      if (currentUser) {
        dispatch(setUserInfo({ ...currentUser, fullName: updated.fullName, email: updated.email }));
      }
    }
  };

  const personalInfoGrid = [
    { label: 'Email', value: profileData.email, icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Số điện thoại', value: profileData.phoneNumber, icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Tỉnh / Thành phố', value: profileData.city, icon: <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Quận / Huyện', value: profileData.district, icon: <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Trình độ học vấn', value: profileData.education, icon: <SchoolOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Kinh nghiệm', value: profileData.experience, icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Ngành nghề', value: profileData.career, icon: <CategoryOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Tình trạng hôn nhân', value: profileData.maritalStatus, icon: <FavoriteBorderOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Ngày sinh', value: formatDate(profileData.dob), icon: <CakeOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Giới tính', value: profileData.gender === 'male' ? 'Nam' : profileData.gender === 'female' ? 'Nữ' : 'Khác', icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
  ];

  return (
    <Box>
      {/* 1. Hero Profile Banner */}
      <CandidateProfileHeroBanner
        fullName={profileData.fullName}
        title={profileData.title}
        avatarUrl={avatarUrl || currentUser?.avatarUrl || undefined}
        coverUrl={coverUrl}
        isJobSeeking={isJobSeeking}
        isSubmittingStatus={isSubmittingStatus}
        location={`${profileData.city || 'Hà Nội'}${profileData.district ? `, ${profileData.district}` : ''}`}
        onEditClick={() => setEditModalOpen(true)}
        onAvatarChange={handleAvatarChange}
        onCoverChange={handleCoverChange}
        onSeekingStatusChange={handleSeekingStatusChange}
      />

      {/* 2. Main Content 2-Column Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Personal Information, Bio & Skills */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            {/* Card A: Personal Details */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Thông tin cá nhân & Liên hệ
                </Typography>
                <IconButton size="small" onClick={() => setEditModalOpen(true)} sx={{ color: '#64748b' }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              <Grid container spacing={2.5}>
                {personalInfoGrid.map((item) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          backgroundColor: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }} noWrap>
                          {item.value || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* Card B: Self Bio */}
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Giới thiệu bản thân
                </Typography>
                <IconButton size="small" onClick={() => setEditModalOpen(true)} sx={{ color: '#64748b' }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {profileData.bio ? (
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, fontSize: '0.875rem' }}>
                  {profileData.bio}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.875rem' }}>
                  Chưa có nội dung giới thiệu. Hãy bấm chỉnh sửa để thêm giới thiệu giúp nhà tuyển dụng hiểu hơn về bạn.
                </Typography>
              )}
            </Card>

            {/* Card C: Technical Skills */}
            <CandidateSkillsCard />
          </Stack>
        </Grid>

        {/* Right Column: Applied Resume */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {/* Applied Resume Card */}
            <CandidateAppliedResumeCard
              resume={resume}
              resumesList={resumes as unknown as ExtendedResume[]}
              candidateName={profileData.fullName}
              candidateEmail={profileData.email}
              candidatePhone={profileData.phoneNumber}
              avatarUrl={avatarUrl || currentUser?.avatarUrl || undefined}
            />
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Profile Modal */}
      <CandidateEditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
      />
    </Box>
  );
};

export default ProfilePage;
