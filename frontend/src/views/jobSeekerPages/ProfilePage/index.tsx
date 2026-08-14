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
import resumeService from '@/services/resumeService';
import toastMessages from '@/utils/toastMessages';
import CandidateAppliedResumeCard from '../../components/jobSeekers/CandidateDashboardMain/CandidateAppliedResumeCard';
import CandidateProfileHeroBanner from '../../components/jobSeekers/CandidateProfile/CandidateProfileHeroBanner';
import CandidateEditProfileModal, { ProfileFormData } from '../../components/jobSeekers/CandidateProfile/CandidateEditProfileModal';
import CandidateSkillsCard from '../../components/jobSeekers/CandidateProfile/CandidateSkillsCard';
import { useResumes } from '../../components/jobSeekers/hooks/useJobSeekerQueries';
import { CV_TYPES, ROUTES } from '../../../configs/constants';
import { localizeRoutePath } from '../../../configs/routeLocalization';
import type { ExtendedResume } from '@/components/Features/CVDoc';
import type { User } from '@/types/models';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Chưa cập nhật';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('DD/MM/YYYY') : 'Chưa cập nhật';
};


const INITIAL_PROFILE_DATA: ProfileFormData = {
  fullName: '',
  title: '',
  email: '',
  phoneNumber: '',
  dob: '',
  gender: '',
  city: '',
  district: '',
  address: '',
  education: '',
  experience: '',
  career: '',
  maritalStatus: '',
  bio: '',
};

const ProfilePage = () => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);
  TabTitle(t('jobSeeker:profile.title'));

  const myCompanyHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.MY_COMPANY}`, i18n.language);

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

  // Direct Avatar & Cover URL from Redux / Backend User
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(currentUser?.avatarUrl || undefined);
  const [coverUrl, setCoverUrl] = React.useState<string | undefined>(undefined);

  // Profile Form State - Clean initial state from real user data
  const [profileData, setProfileData] = React.useState<ProfileFormData>(() => ({
    ...INITIAL_PROFILE_DATA,
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phoneNumber: (currentUser as unknown as { phoneNumber?: string })?.phoneNumber || '',
  }));

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [isJobSeeking, setIsJobSeeking] = React.useState<boolean>(true);
  const [isSubmittingStatus, setIsSubmittingStatus] = React.useState<boolean>(false);

  // Clear stale mock localStorage data
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sq_user_profile_data');
    }
  }, []);

  // Synchronize profile data from Backend API
  React.useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const p = await jobSeekerProfileService.getProfile();
        if (p) {
          setIsJobSeeking(p.isJobSeeking ?? p.isSeekingJob ?? true);
          setProfileData((prev) => {
            const loc = p.location as any;
            const cityName = loc?.city?.name || (typeof loc?.city === 'string' ? loc.city : '') || '';
            const districtName = loc?.district?.name || (typeof loc?.district === 'string' ? loc.district : '') || '';
            const genderVal = p.gender === 'M' ? 'Nam' : p.gender === 'F' ? 'Nữ' : p.gender === 'O' ? 'Khác' : '';
            const maritalVal = p.maritalStatus === 'M' ? 'Đã kết hôn' : p.maritalStatus === 'S' ? 'Độc thân' : '';
            return {
              ...prev,
              fullName: currentUser?.fullName || (p as any).user?.fullName || prev.fullName,
              email: currentUser?.email || (p as any).user?.email || prev.email,
              phoneNumber: p.phone || (currentUser as any)?.phoneNumber || prev.phoneNumber,
              dob: p.birthday ? String(p.birthday).slice(0, 10) : prev.dob,
              gender: genderVal || prev.gender,
              maritalStatus: maritalVal || prev.maritalStatus,
              city: cityName || prev.city,
              district: districtName || prev.district,
              address: loc?.address || prev.address,
            };
          });
        }
      } catch (err) {
        console.warn('Could not fetch candidate profile status from backend:', err);
      }
    };

    if (currentUser) {
      void fetchProfileStatus();
    }
  }, [currentUser]);

  // Synchronize resume title, career, experience, education, bio from primary active resume
  React.useEffect(() => {
    if (resume) {
      setProfileData((prev) => ({
        ...prev,
        title: resume.title || prev.title,
        career: (resume as any).career?.name || (typeof (resume as any).career === 'string' ? (resume as any).career : '') || prev.career,
        city: (resume as any).city?.name || (typeof (resume as any).city === 'string' ? (resume as any).city : '') || prev.city,
        experience: typeof (resume as any).experience === 'object' ? (resume as any).experience?.name : (resume as any).experience ? `${(resume as any).experience} năm` : prev.experience,
        education: typeof (resume as any).academicLevel === 'object' ? (resume as any).academicLevel?.name : (resume as any).academicLevel ? String((resume as any).academicLevel) : prev.education,
        bio: (resume as any).description || prev.bio,
      }));
    }
  }, [resume]);

  // Skills from primary resume
  const skillsList = React.useMemo(() => {
    if (!resume) return [];
    if (Array.isArray((resume as any).advancedSkills) && (resume as any).advancedSkills.length > 0) {
      return (resume as any).advancedSkills.map((s: any) => s.name || String(s));
    }
    if ((resume as any).skillsSummary) {
      return String((resume as any).skillsSummary).split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [resume]);

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
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Handle Avatar Upload API
  const handleAvatarChange = async (file: File, localUrl: string) => {
    setAvatarUrl(localUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await authService.updateAvatar(formData);
      if (res?.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        if (currentUser) {
          dispatch(setUserInfo({ ...currentUser, avatarUrl: res.avatarUrl }));
        }
      }
      void dispatch(getUserInfo());
      toastMessages.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      console.error('Failed to upload avatar to server:', err);
      toastMessages.error('Không thể tải ảnh đại diện lên máy chủ. Vui lòng thử lại!');
    }
  };

  // Handle Cover Upload API
  const handleCoverChange = async (file: File, localUrl: string) => {
    setCoverUrl(localUrl);

    try {
      await authService.updateUser(({ coverUrl: localUrl } as unknown) as Partial<User>);
      void dispatch(getUserInfo());
      toastMessages.success('Cập nhật ảnh bìa thành công!');
    } catch (err) {
      console.error('Failed to upload cover to server:', err);
      toastMessages.error('Không thể cập nhật ảnh bìa lên máy chủ. Vui lòng thử lại!');
    }
  };

  // Handle Profile Save API
  const handleSaveProfile = async (updated: ProfileFormData) => {
    try {
      setProfileData(updated);

      const genderPayload =
        updated.gender === 'male' || updated.gender === 'Nam' || updated.gender === 'M'
          ? 'M'
          : updated.gender === 'female' || updated.gender === 'Nữ' || updated.gender === 'F'
            ? 'F'
            : updated.gender === 'other' || updated.gender === 'Khác' || updated.gender === 'O'
              ? 'O'
              : undefined;

      const maritalPayload =
        updated.maritalStatus === 'Đã kết hôn' || updated.maritalStatus === 'M' || updated.maritalStatus === 'married'
          ? 'M'
          : updated.maritalStatus === 'Độc thân' || updated.maritalStatus === 'S' || updated.maritalStatus === 'single'
            ? 'S'
            : undefined;

      await jobSeekerProfileService.updateProfile({
        phone: updated.phoneNumber ? updated.phoneNumber.trim() : undefined,
        birthday: updated.dob || undefined,
        gender: genderPayload,
        maritalStatus: maritalPayload,
        user: updated.fullName ? { fullName: updated.fullName.trim() } : undefined,
      });

      if (updated.fullName) {
        try {
          await authService.updateUser({ fullName: updated.fullName.trim() });
        } catch (authErr) {
          console.warn('Could not update user account name:', authErr);
        }
      }

      if (resume?.slug) {
        try {
          await resumeService.updateResume(resume.slug, {
            title: updated.title || undefined,
            description: updated.bio || undefined,
          });
        } catch (resErr) {
          console.warn('Could not update primary resume fields:', resErr);
        }
      }

      void dispatch(getUserInfo());
      toastMessages.success('Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
      toastMessages.error('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại!');
    }
  };

  const personalInfoGrid = [
    { label: 'Email', value: profileData.email || 'Chưa cập nhật', icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Số điện thoại', value: profileData.phoneNumber || 'Chưa cập nhật', icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Tỉnh / Thành phố', value: profileData.city || 'Chưa cập nhật', icon: <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Quận / Huyện', value: profileData.district || 'Chưa cập nhật', icon: <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Trình độ học vấn', value: profileData.education ? t(`common:choices.${profileData.education}`, { defaultValue: profileData.education }) : 'Chưa cập nhật', icon: <SchoolOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Kinh nghiệm', value: profileData.experience ? t(`common:choices.${profileData.experience}`, { defaultValue: profileData.experience }) : 'Chưa cập nhật', icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Ngành nghề', value: profileData.career ? t(`common:choices.${profileData.career}`, { defaultValue: profileData.career }) : 'Chưa cập nhật', icon: <CategoryOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Tình trạng hôn nhân', value: profileData.maritalStatus ? t(`common:choices.${profileData.maritalStatus}`, { defaultValue: profileData.maritalStatus }) : 'Chưa cập nhật', icon: <FavoriteBorderOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    { label: 'Ngày sinh', value: formatDate(profileData.dob), icon: <CakeOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} /> },
    {
      label: 'Giới tính',
      value:
        profileData.gender === 'male' || profileData.gender === 'Nam' || profileData.gender === 'M'
          ? 'Nam'
          : profileData.gender === 'female' || profileData.gender === 'Nữ' || profileData.gender === 'F'
            ? 'Nữ'
            : profileData.gender === 'other' || profileData.gender === 'Khác' || profileData.gender === 'O'
              ? 'Khác'
              : profileData.gender
                ? profileData.gender
                : 'Chưa cập nhật',
      icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />,
    },
  ];

  return (
    <Box>
      {/* 1. Hero Profile Banner */}
      <CandidateProfileHeroBanner
        fullName={profileData.fullName || currentUser?.fullName || 'Ứng viên'}
        title={profileData.title}
        avatarUrl={avatarUrl || currentUser?.avatarUrl || undefined}
        coverUrl={coverUrl}
        experience={profileData.experience ? t(`common:choices.${profileData.experience}`, { defaultValue: profileData.experience }) : undefined}
        updatedAt={(resume as any)?.updateAt || (resume as any)?.createdAt || undefined}
        isJobSeeking={isJobSeeking}
        isSubmittingStatus={isSubmittingStatus}
        location={profileData.city ? `${profileData.city}${profileData.district ? `, ${profileData.district}` : ''}` : ''}
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: item.value && item.value !== 'Chưa cập nhật' ? '#0f172a' : '#94a3b8', fontSize: '0.875rem' }} noWrap>
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
            <CandidateSkillsCard initialSkills={skillsList} />
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
