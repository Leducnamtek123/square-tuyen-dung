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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '@/utils/generalFunction';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getUserInfo, setUserInfo } from '@/redux/userSlice';
import authService from '@/services/authService';
import commonService from '@/services/commonService';
import jobSeekerProfileService from '@/services/jobSeekerProfileService';
import resumeService from '@/services/resumeService';
import toastMessages from '@/utils/toastMessages';
import CandidateAppliedResumeCard from '@/views/components/jobSeekers/CandidateDashboardMain/CandidateAppliedResumeCard';
import CandidateProfileHeroBanner from '@/views/components/jobSeekers/CandidateProfile/CandidateProfileHeroBanner';
import CandidateEditProfileModal, { ProfileFormData } from '@/views/components/jobSeekers/CandidateProfile/CandidateEditProfileModal';
import CandidateSkillsCard from '@/views/components/jobSeekers/CandidateProfile/CandidateSkillsCard';
import PhoneVerificationModal from '@/views/components/modals/PhoneVerificationModal';
import { useResumes } from '@/views/components/jobSeekers/hooks/useJobSeekerQueries';
import { CV_TYPES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import type { ExtendedResume } from '@/components/Features/CVDoc';
import type { User, SystemConfig } from '@/types/models';

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
  const [profileIdState, setProfileIdState] = React.useState<string | undefined>(
    rawProfileId ? String(rawProfileId) : undefined
  );

  React.useEffect(() => {
    const rawId = currentUser?.jobSeekerProfile?.id || currentUser?.jobSeekerProfileId;
    if (rawId) {
      setProfileIdState(String(rawId));
    }
  }, [currentUser]);

  const { data: resumes, refetch: refetchResumes } = useResumes(profileIdState, {
    resumeType: CV_TYPES.cvWebsite,
    type: CV_TYPES.cvWebsite,
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
  const [phoneVerifyModalOpen, setPhoneVerifyModalOpen] = React.useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined' && currentUser?.id) {
      return (
        currentUser.isPhoneVerified === true ||
        localStorage.getItem(`phone_verified_${currentUser.id}`) === 'true'
      );
    }
    return Boolean(currentUser?.isPhoneVerified);
  });
  const [isJobSeeking, setIsJobSeeking] = React.useState<boolean>(true);
  const [isSubmittingStatus, setIsSubmittingStatus] = React.useState<boolean>(false);

  // Sync phone verification status with currentUser
  React.useEffect(() => {
    if (currentUser?.isPhoneVerified) {
      setIsPhoneVerified(true);
    } else if (typeof window !== 'undefined' && currentUser?.id) {
      const stored = localStorage.getItem(`phone_verified_${currentUser.id}`);
      if (stored === 'true') {
        setIsPhoneVerified(true);
      }
    }
  }, [currentUser]);

  // Load system configs for ID resolution
  const [systemConfig, setSystemConfig] = React.useState<SystemConfig | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    commonService
      .getConfigs()
      .then((res) => {
        if (isMounted && res) {
          setSystemConfig(res);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

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
          if (p.id) {
            setProfileIdState(String(p.id));
          }
          setIsJobSeeking(p.isJobSeeking ?? p.isSeekingJob ?? true);
          setProfileData((prev) => {
            const loc = p.location as any;
            const cityName =
              loc?.cityDict?.name ||
              loc?.city?.name ||
              (typeof loc?.city === 'string' ? loc.city : '') ||
              (loc?.city ? systemConfig?.cityOptions?.find((c) => String(c.id) === String(loc.city))?.name : '') ||
              '';
            const districtName =
              loc?.districtDict?.name ||
              loc?.district?.name ||
              (typeof loc?.district === 'string' ? loc.district : '') ||
              '';
            const genderVal =
              p.gender === 'M' ? 'Nam' : p.gender === 'F' ? 'Nữ' : p.gender === 'O' ? 'Khác' : '';
            const maritalVal =
              p.maritalStatus === 'M' ? 'Đã kết hôn' : p.maritalStatus === 'S' ? 'Độc thân' : '';
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
  }, [currentUser, systemConfig]);

  // Synchronize resume title, career, experience, education, bio from primary active resume
  React.useEffect(() => {
    if (resume) {
      setProfileData((prev) => {
        const careerName =
          (resume as any).careerChooseData?.name ||
          (resume as any).career?.name ||
          (typeof (resume as any).career === 'string' ? (resume as any).career : '') ||
          (typeof (resume as any).career === 'number'
            ? systemConfig?.careerOptions?.find((c) => Number(c.id) === (resume as any).career)?.name
            : '') ||
          prev.career;

        const cityName =
          (resume as any).cityChooseData?.name ||
          (resume as any).city?.name ||
          (typeof (resume as any).city === 'string' ? (resume as any).city : '') ||
          (typeof (resume as any).city === 'number'
            ? systemConfig?.cityOptions?.find((c) => Number(c.id) === (resume as any).city)?.name
            : '') ||
          prev.city;

        const expName =
          (resume as any).experienceChooseData?.name ||
          (typeof (resume as any).experience === 'object'
            ? (resume as any).experience?.name
            : typeof (resume as any).experience === 'number'
              ? systemConfig?.experienceOptions?.find((e) => Number(e.id) === (resume as any).experience)?.name
              : (resume as any).experience
                ? String((resume as any).experience)
                : prev.experience);

        const eduName =
          (resume as any).academicLevelChooseData?.name ||
          (typeof (resume as any).academicLevel === 'object'
            ? (resume as any).academicLevel?.name
            : typeof (resume as any).academicLevel === 'number'
              ? systemConfig?.academicLevelOptions?.find((e) => Number(e.id) === (resume as any).academicLevel)?.name
              : (resume as any).academicLevel
                ? String((resume as any).academicLevel)
                : prev.education);

        return {
          ...prev,
          title: resume.title || prev.title,
          career: careerName || prev.career,
          city: cityName || prev.city,
          experience: expName || prev.experience,
          education: eduName || prev.education,
          bio: (resume as any).description || prev.bio,
        };
      });
    }
  }, [resume, systemConfig]);

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

      // Resolve City ID
      let resolvedCityId: number | undefined;
      if (updated.city) {
        const foundCity = systemConfig?.cityOptions?.find(
          (c) =>
            String(c.id) === String(updated.city) ||
            String(c.name || '').toLowerCase() === updated.city.toLowerCase()
        );
        if (foundCity) {
          resolvedCityId = Number(foundCity.id);
        } else if (!isNaN(Number(updated.city))) {
          resolvedCityId = Number(updated.city);
        }
      }

      // Resolve District ID
      let resolvedDistrictId: number | undefined;
      if (updated.district && updated.district !== 'Chưa cập nhật') {
        if (!isNaN(Number(updated.district))) {
          resolvedDistrictId = Number(updated.district);
        } else if (resolvedCityId) {
          try {
            const districtsRes = await commonService.getDistrictsByCityId(resolvedCityId);
            const districtsList = Array.isArray(districtsRes) ? districtsRes : districtsRes?.data || [];
            const foundDistrict = districtsList.find(
              (d: any) =>
                String(d.id) === String(updated.district) ||
                String(d.name || '').toLowerCase() === updated.district.toLowerCase()
            );
            if (foundDistrict) {
              resolvedDistrictId = Number(foundDistrict.id);
            }
          } catch (dErr) {
            console.warn('Could not resolve district ID:', dErr);
          }
        }
      }

      // Resolve Career ID
      let resolvedCareerId: number | undefined;
      if (updated.career && updated.career !== 'Chưa cập nhật') {
        const foundCareer = systemConfig?.careerOptions?.find(
          (c) =>
            String(c.id) === String(updated.career) ||
            String(c.name || '').toLowerCase() === updated.career.toLowerCase()
        );
        if (foundCareer) {
          resolvedCareerId = Number(foundCareer.id);
        } else if (!isNaN(Number(updated.career))) {
          resolvedCareerId = Number(updated.career);
        }
      }

      // Resolve Academic Level ID
      let resolvedAcademicId: number | undefined;
      if (updated.education && updated.education !== 'Chưa cập nhật') {
        const foundEdu = systemConfig?.academicLevelOptions?.find(
          (e) =>
            String(e.id) === String(updated.education) ||
            String(e.name || '').toLowerCase() === updated.education.toLowerCase() ||
            t(`common:choices.${e.name}`, { defaultValue: e.name || '' }).toLowerCase() === updated.education.toLowerCase()
        );
        if (foundEdu) {
          resolvedAcademicId = Number(foundEdu.id);
        } else if (!isNaN(Number(updated.education))) {
          resolvedAcademicId = Number(updated.education);
        }
      }

      // Resolve Experience ID
      let resolvedExpId: number | undefined;
      if (updated.experience && updated.experience !== 'Chưa cập nhật') {
        const foundExp = systemConfig?.experienceOptions?.find(
          (ex) =>
            String(ex.id) === String(updated.experience) ||
            String(ex.name || '').toLowerCase() === updated.experience.toLowerCase() ||
            t(`common:choices.${ex.name}`, { defaultValue: ex.name || '' }).toLowerCase() === updated.experience.toLowerCase()
        );
        if (foundExp) {
          resolvedExpId = Number(foundExp.id);
        } else if (!isNaN(Number(updated.experience))) {
          resolvedExpId = Number(updated.experience);
        }
      }

      const locationPayload: any = {};
      if (resolvedCityId) locationPayload.city = resolvedCityId;
      if (resolvedDistrictId) locationPayload.district = resolvedDistrictId;
      if (updated.address && updated.address !== 'Chưa cập nhật') {
        locationPayload.address = updated.address.trim();
      }

      await jobSeekerProfileService.updateProfile({
        phone: updated.phoneNumber ? updated.phoneNumber.trim() : undefined,
        birthday: updated.dob || undefined,
        gender: genderPayload,
        maritalStatus: maritalPayload,
        location: Object.keys(locationPayload).length > 0 ? locationPayload : undefined,
        user: updated.fullName ? { fullName: updated.fullName.trim() } : undefined,
      });

      if (updated.fullName) {
        try {
          await authService.updateUser({ fullName: updated.fullName.trim() });
        } catch (authErr) {
          console.warn('Could not update user account name:', authErr);
        }
      }

      let targetResumeSlug = resume?.slug;
      if (!targetResumeSlug && profileIdState) {
        try {
          const fetched = await jobSeekerProfileService.getResumes(profileIdState, {
            resumeType: CV_TYPES.cvWebsite,
            type: CV_TYPES.cvWebsite,
          });
          const list = Array.isArray(fetched) ? fetched : fetched?.results || [];
          if (list.length > 0 && list[0]?.slug) {
            targetResumeSlug = list[0].slug;
          }
        } catch (fErr) {
          console.warn('Could not retrieve target resume slug:', fErr);
        }
      }

      if (targetResumeSlug) {
        try {
          await resumeService.updateResume(targetResumeSlug, {
            title: updated.title || undefined,
            description: updated.bio || undefined,
            career: resolvedCareerId || undefined,
            city: resolvedCityId || undefined,
            academicLevel: resolvedAcademicId || undefined,
            experience: resolvedExpId || undefined,
          });
        } catch (resErr) {
          console.warn('Could not update primary resume fields:', resErr);
        }
      }

      if (refetchResumes) {
        void refetchResumes();
      }
      void dispatch(getUserInfo());
      toastMessages.success('Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
      toastMessages.error('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại!');
    }
  };

  // Handle Skills Save API
  const handleSaveSkills = async (newSkills: string[]) => {
    let targetResumeSlug = resume?.slug;
    if (!targetResumeSlug && profileIdState) {
      try {
        const fetched = await jobSeekerProfileService.getResumes(profileIdState, {
          resumeType: CV_TYPES.cvWebsite,
          type: CV_TYPES.cvWebsite,
        });
        const list = Array.isArray(fetched) ? fetched : fetched?.results || [];
        if (list.length > 0 && list[0]?.slug) {
          targetResumeSlug = list[0].slug;
        }
      } catch (fErr) {
        console.warn('Could not retrieve target resume slug:', fErr);
      }
    }

    if (targetResumeSlug) {
      try {
        await resumeService.updateResume(targetResumeSlug, {
          skillsSummary: newSkills.join(', '),
        });
        if (refetchResumes) {
          void refetchResumes();
        }
        toastMessages.success('Cập nhật kỹ năng chuyên môn thành công!');
      } catch (err) {
        console.error('Failed to update resume skills:', err);
        toastMessages.error('Không thể cập nhật kỹ năng. Vui lòng thử lại!');
      }
    } else {
      toastMessages.success('Cập nhật kỹ năng chuyên môn thành công!');
    }
  };

  const personalInfoGrid = [
    {
      label: 'Email',
      value: profileData.email || 'Chưa cập nhật',
      icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />,
      isEmail: true,
      isVerified: Boolean(currentUser?.isVerifyEmail ?? true),
    },
    {
      label: 'Số điện thoại',
      value: profileData.phoneNumber || 'Chưa cập nhật',
      icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />,
      isPhone: true,
      isVerified: isPhoneVerified,
    },
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
                <IconButton aria-label="Thao tác" size="small" onClick={() => setEditModalOpen(true)} sx={{ color: '#64748b' }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              <Grid container spacing={2.5}>
                {personalInfoGrid.map((item: any) => (
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: item.value && item.value !== 'Chưa cập nhật' ? '#0f172a' : '#94a3b8',
                              fontSize: '0.875rem',
                            }}
                            noWrap
                          >
                            {item.value || 'Chưa cập nhật'}
                          </Typography>

                          {/* Email Verified Checkmark */}
                          {item.isEmail && item.isVerified && item.value && item.value !== 'Chưa cập nhật' && (
                            <Tooltip title="Email đã được xác thực">
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                            </Tooltip>
                          )}

                          {/* Phone Verified Checkmark */}
                          {item.isPhone && item.isVerified && item.value && item.value !== 'Chưa cập nhật' && (
                            <Tooltip title="Số điện thoại đã được xác thực">
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                            </Tooltip>
                          )}

                          {/* Phone Not Verified -> 'Xác thực ngay' Button */}
                          {item.isPhone && !item.isVerified && (
                            <Button
                              size="small"
                              onClick={() => setPhoneVerifyModalOpen(true)}
                              startIcon={<WarningAmberIcon sx={{ fontSize: 14, color: '#d97706' }} />}
                              sx={{
                                py: 0.1,
                                px: 0.75,
                                height: 22,
                                borderRadius: '6px',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                color: '#b45309',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  backgroundColor: '#fef3c7',
                                  borderColor: '#fcd34d',
                                  transform: 'translateY(-1px)',
                                },
                              }}
                            >
                              Xác thực ngay
                            </Button>
                          )}
                        </Box>
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
                <IconButton aria-label="Thao tác" size="small" onClick={() => setEditModalOpen(true)} sx={{ color: '#64748b' }}>
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
            <CandidateSkillsCard initialSkills={skillsList} onSave={handleSaveSkills} />
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
              onRefresh={refetchResumes}
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

      {/* Phone OTP Verification Modal */}
      <PhoneVerificationModal
        open={phoneVerifyModalOpen}
        onClose={() => setPhoneVerifyModalOpen(false)}
        initialPhone={profileData.phoneNumber}
        onSuccess={(verifiedPhone) => {
          setProfileData((prev) => ({ ...prev, phoneNumber: verifiedPhone }));
          setIsPhoneVerified(true);
        }}
      />
    </Box>
  );
};

export default ProfilePage;
