'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Stack,
  Tooltip,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { CVData, CandidateCVRecord } from '@/types/cvBuilder';
import { INITIAL_CV_SAMPLE_DATA, getSampleDataForTemplate } from '../templates/templatesData';
import { CVEditorSidebar } from './components/CVEditorSidebar';
import { CVLivePreview } from './components/CVLivePreview';
import { TemplateSwitcherModal } from './components/TemplateSwitcherModal';
import { printCVToPDF } from './utils/pdfExport';
import { exportCVToDocx, exportCVToJSON } from './utils/docxExport';
import { TabTitle } from '@/utils/generalFunction';
import { useAppSelector } from '@/redux/hooks';
import cvBuilderService from '@/services/cvBuilderService';
import jobSeekerProfileService from '@/services/jobSeekerProfileService';
import resumeService from '@/services/resumeService';
import toastMessages from '@/utils/toastMessages';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useTranslation } from 'react-i18next';

export const CVEditorPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { i18n } = useTranslation();
  const { currentUser } = useAppSelector((state) => state.user);

  const cvIdParam = searchParams.get('id');
  const initialTemplateParam = searchParams.get('template') || 'modern-navy';
  const initialColorParam = searchParams.get('color') || undefined;

  TabTitle('Trình Tạo & Trang Trí CV Trực Tuyến | InfoHR Tuyển Dụng');

  const [activeCVId, setActiveCVId] = useState<number | null>(cvIdParam ? Number(cvIdParam) : null);
  const activeCVIdRef = useRef<number | null>(activeCVId);
  activeCVIdRef.current = activeCVId;
  const [cvSlug, setCvSlug] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isMainCv, setIsMainCv] = useState<boolean>(false);

  const [cvData, setCvData] = useState<CVData>(() => {
    const templateSpecific = getSampleDataForTemplate(initialTemplateParam);
    return {
      ...templateSpecific,
      templateId: initialTemplateParam,
      theme: {
        ...templateSpecific.theme,
        primaryColor: initialColorParam || templateSpecific.theme.primaryColor,
      },
    };
  });

  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const isInitialLoad = useRef<boolean>(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. Load CV from Database if ID is provided
  useEffect(() => {
    if (cvIdParam) {
      const loadCVFromDB = async () => {
        try {
          const record = await cvBuilderService.getCandidateCVDetail(Number(cvIdParam));
          setActiveCVId(record.id);
          setCvSlug(record.slug);
          setIsPublic(record.is_public);
          setIsMainCv(record.is_main_cv);

          const templateSpecific = getSampleDataForTemplate(record.template_code || 'modern-navy');
          const mergedTheme = {
            ...templateSpecific.theme,
            ...(record.theme_config || {}),
          };

          const rawCV = record.cv_data || {};
          const mergedCVData: CVData = {
            ...templateSpecific,
            ...rawCV,
            id: record.id,
            title: record.title || 'CV Chưa Đặt Tên',
            templateId: record.template_code || 'modern-navy',
            personalInfo: {
              ...templateSpecific.personalInfo,
              ...(rawCV.personalInfo || {}),
              avatarUrl:
                rawCV.personalInfo?.avatarUrl ||
                templateSpecific.personalInfo.avatarUrl ||
                '/images/cv-avatars/avatar-modern.jpg',
            },
            theme: mergedTheme,
          };

          setCvData(mergedCVData);
          setSaveStatus('saved');
          setLastSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        } catch (err) {
          console.error('Failed to load CV record from database:', err);
          toastMessages.error('Không tìm thấy bản ghi CV hoặc bạn không có quyền truy cập.');
        } finally {
          setTimeout(() => {
            isInitialLoad.current = false;
          }, 600);
        }
      };

      loadCVFromDB();
    } else {
      // If templateParam is given and no ID, optionally fetch template sample data from DB
      const loadTemplateFromDB = async () => {
        try {
          const tpl = await cvBuilderService.getTemplateDetail(initialTemplateParam);
          if (tpl && tpl.sample_data) {
            const templateSpecific = getSampleDataForTemplate(tpl.code);
            const rawSample = (tpl.sample_data as CVData) || {};
            setCvData((prev) => ({
              ...prev,
              ...templateSpecific,
              ...rawSample,
              templateId: tpl.code,
              personalInfo: {
                ...templateSpecific.personalInfo,
                ...(rawSample.personalInfo || {}),
                avatarUrl:
                  rawSample.personalInfo?.avatarUrl ||
                  templateSpecific.personalInfo.avatarUrl ||
                  '/images/cv-avatars/avatar-modern.jpg',
              },
              theme: {
                ...prev.theme,
                ...(tpl.default_theme || {}),
                primaryColor: initialColorParam || tpl.default_theme?.primaryColor || prev.theme.primaryColor,
              },
            }));
          }
        } catch (e) {
          console.warn('Could not fetch template sample data:', e);
        } finally {
          setTimeout(() => {
            isInitialLoad.current = false;
          }, 600);
        }
      };

      loadTemplateFromDB();
    }
  }, [cvIdParam, initialTemplateParam, initialColorParam]);

  // 2. Auto-Save Function
  const performSave = useCallback(
    async (dataToSave: CVData, currentId: number | null) => {
      if (!currentUser) {
        localStorage.setItem('square_cv_draft', JSON.stringify(dataToSave));
        setSaveStatus('saved');
        setLastSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        return;
      }

      setSaveStatus('saving');
      try {
        const targetId = currentId || activeCVIdRef.current;
        if (targetId) {
          await cvBuilderService.updateCandidateCV(targetId, {
            title: dataToSave.title || 'CV Chưa Đặt Tên',
            template_code: dataToSave.templateId,
            theme_config: dataToSave.theme,
            cv_data: dataToSave,
            is_public: isPublic,
            is_main_cv: isMainCv,
          });
        } else {
          const newRecord = await cvBuilderService.createCandidateCV({
            title: dataToSave.title || 'CV Chưa Đặt Tên',
            template_code: dataToSave.templateId,
            theme_config: dataToSave.theme,
            cv_data: dataToSave,
            is_public: isPublic,
            is_main_cv: isMainCv,
          });
          activeCVIdRef.current = newRecord.id;
          setActiveCVId(newRecord.id);
          setCvSlug(newRecord.slug);
        }

        setSaveStatus('saved');
        setLastSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      } catch (error) {
        console.error('Error auto-saving CV:', error);
        setSaveStatus('error');
      }
    },
    [currentUser, isPublic, isMainCv]
  );

  // 3. Debounced Auto-Save trigger
  const handleDataChange = useCallback(
    (updated: CVData) => {
      setCvData(updated);

      if (isInitialLoad.current) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      setSaveStatus('saving');
      debounceTimer.current = setTimeout(() => {
        performSave(updated, activeCVIdRef.current);
      }, 1200);
    },
    [performSave]
  );

  const handleManualSave = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    performSave(cvData, activeCVIdRef.current);
    toastMessages.success('Đã lưu CV thành công lên hệ thống!');
  };

  const handleDownloadPDF = () => {
    const docTitle = `CV_${(cvData.personalInfo?.fullName || cvData.title || 'Square_CV').replace(/\s+/g, '_')}`;
    printCVToPDF('cv-print-area', docTitle);
  };

  const handleSharePublicLink = () => {
    if (!cvSlug) {
      toastMessages.warn('Vui lòng lưu CV trước khi tạo link chia sẻ.');
      return;
    }
    const publicUrl = `${window.location.origin}/cv/${cvSlug}`;
    navigator.clipboard.writeText(publicUrl);
    toastMessages.success('Đã sao chép đường link CV công khai!');
  };

  // 4. One-Click Sync from Candidate Profile
  const handleSyncFromProfile = async () => {
    if (!currentUser) {
      toastMessages.warn('Vui lòng đăng nhập để đồng bộ thông tin từ Hồ sơ cá nhân.');
      return;
    }

    setIsSyncing(true);
    try {
      const profile = await jobSeekerProfileService.getProfile();

      let primaryResumeSlug: string | null = null;
      if (profile) {
        try {
          const resumes = await resumeService.getResumes({ pageSize: 1 });
          if (resumes && resumes.results && resumes.results.length > 0) {
            primaryResumeSlug = resumes.results[0].slug;
          }
        } catch (e) {
          console.warn('Could not fetch resumes for sync:', e);
        }
      }

      let experiencesData = cvData.experiences;
      let educationsData = cvData.educations;
      let skillsData = cvData.skills;
      let languagesData = cvData.languages;
      let certificatesData = cvData.certificates;

      if (primaryResumeSlug) {
        try {
          const [expList, eduList, skillList, langList, certList] = await Promise.all([
            resumeService.getExperiencesDetail(primaryResumeSlug).catch(() => []),
            resumeService.getEducationsDetail(primaryResumeSlug).catch(() => []),
            resumeService.getAdvancedSkills(primaryResumeSlug).catch(() => []),
            resumeService.getLanguageSkills(primaryResumeSlug).catch(() => []),
            resumeService.getCertificates(primaryResumeSlug).catch(() => []),
          ]);

          if (expList.length > 0) {
            experiencesData = expList.map((e, idx) => ({
              id: `exp-${idx}-${Date.now()}`,
              position: e.jobName || (e as any).position || '',
              company: e.companyName || '',
              startDate: e.startDate ? String(e.startDate).slice(0, 7) : '',
              endDate: e.endDate ? String(e.endDate).slice(0, 7) : 'Hiện tại',
              isCurrent: !e.endDate,
              description: e.description || '',
            }));
          }

          if (eduList.length > 0) {
            educationsData = eduList.map((ed, idx) => ({
              id: `edu-${idx}-${Date.now()}`,
              school: ed.trainingPlaceName || (ed as any).schoolName || '',
              major: ed.major || '',
              degree: ed.degreeName || (ed as any).degree || 'Cử nhân',
              startDate: ed.startDate ? String(ed.startDate).slice(0, 4) : '',
              endDate: ed.completedDate ? String(ed.completedDate).slice(0, 4) : (ed as any).endDate ? String((ed as any).endDate).slice(0, 4) : '',
              gpa: (ed as any).gpa || '',
              description: ed.description || '',
            }));
          }

          if (skillList.length > 0) {
            skillsData = skillList.map((s, idx) => ({
              id: `sk-${idx}-${Date.now()}`,
              name: s.name || s.skillName || '',
              level: Number(s.level) || 5,
            }));
          }

          if (langList.length > 0) {
            languagesData = langList.map((l, idx) => ({
              id: `lang-${idx}-${Date.now()}`,
              name: l.languageName || (typeof (l as any).language === 'object' ? (l as any).language?.name : String(l.language || 'Ngoại ngữ')),
              proficiency: l.levelName || String(l.level || 'Thành thạo'),
            }));
          }

          if (certList.length > 0) {
            certificatesData = certList.map((c, idx) => ({
              id: `cert-${idx}-${Date.now()}`,
              name: c.name || c.certificateName || '',
              organization: c.trainingPlaceName || c.trainingPlace || '',
              issueDate: c.startDate ? String(c.startDate).slice(0, 4) : '',
            }));
          }
        } catch (subErr) {
          console.warn('Sub-items sync partial error:', subErr);
        }
      }

      const loc = profile?.location as any;
      const cityName = loc?.city?.name || (typeof loc?.city === 'string' ? loc.city : '') || '';
      const districtName = loc?.district?.name || (typeof loc?.district === 'string' ? loc.district : '') || '';
      const fullAddress = [loc?.address, districtName, cityName].filter(Boolean).join(', ');

      const updatedSyncedData: CVData = {
        ...cvData,
        personalInfo: {
          fullName: currentUser.fullName || (profile as any)?.user?.fullName || cvData.personalInfo.fullName,
          title: (profile as any)?.title || cvData.personalInfo.title,
          email: currentUser.email || cvData.personalInfo.email,
          phoneNumber: profile?.phone || (currentUser as any)?.phoneNumber || cvData.personalInfo.phoneNumber,
          address: fullAddress || cvData.personalInfo.address,
          dob: profile?.birthday ? String(profile.birthday).slice(0, 10) : cvData.personalInfo.dob,
          avatarUrl:
            currentUser.avatarUrl ||
            cvData.personalInfo.avatarUrl ||
            '/images/cv-avatars/avatar-modern.jpg',
          bio: (profile as any)?.bio || (profile as any)?.description || cvData.personalInfo.bio,
          website: cvData.personalInfo.website,
          linkedin: cvData.personalInfo.linkedin,
          github: cvData.personalInfo.github,
        },
        experiences: experiencesData,
        educations: educationsData,
        skills: skillsData,
        languages: languagesData,
        certificates: certificatesData,
      };

      handleDataChange(updatedSyncedData);
      toastMessages.success('Đã đồng bộ thông tin từ Hồ sơ cá nhân thành công!');
    } catch (err) {
      console.error('Error syncing profile:', err);
      toastMessages.error('Không thể đồng bộ hồ sơ. Vui lòng thử lại!');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectTemplate = (templateId: string, color?: string) => {
    setCvData((prev) => ({
      ...prev,
      templateId,
      theme: {
        ...prev.theme,
        ...(color ? { primaryColor: color } : {}),
      },
    }));
    toastMessages.success('Đã áp dụng mẫu CV mới thành công!');
  };

  const handleChangeColor = (color: string) => {
    setCvData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: color,
      },
    }));
  };

  return (
    <Box
      className="cv-editor-root"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f1f5f9',
        overflow: 'hidden',
        '@media print': {
          height: 'auto !important',
          overflow: 'visible !important',
          bgcolor: '#ffffff !important',
        },
      }}
    >
      {/* ── Top Navbar (Material UI AppBar standard) ──────────────────────── */}
      <Paper
        elevation={0}
        className="cv-editor-header-bar no-print"
        sx={{
          height: 64,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          shrink: 0,
          '@media print': {
            display: 'none !important',
          },
        }}
      >
        {/* Left: Back & Title input */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            onClick={() => router.push(localizeRoutePath('/danh-sach-mau-cv', i18n.language))}
            size="small"
            sx={{
              color: '#64748b',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              p: 0.75,
              '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
            }}
            title="Quay lại danh sách mẫu"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: 24, bgcolor: '#e2e8f0' }} />

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <input
                type="text"
                value={cvData.title}
                onChange={(e) => handleDataChange({ ...cvData, title: e.target.value })}
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  outline: 'none',
                }}
                title="Bấm để đổi tên CV"
              />
              <EditOutlinedIcon sx={{ fontSize: 15, color: '#94a3b8', pointerEvents: 'none' }} />
            </Stack>

            {/* Auto-Save & Status Badge */}
            <Box sx={{ px: 0.75 }}>
              {saveStatus === 'saving' ? (
                <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                  <CloudSyncOutlinedIcon sx={{ fontSize: 13 }} />
                  Đang tự động lưu...
                </Typography>
              ) : saveStatus === 'saved' ? (
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                  <CloudDoneOutlinedIcon sx={{ fontSize: 13 }} />
                  Đã lưu {lastSavedAt && `lúc ${lastSavedAt}`}
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  Chỉnh sửa để tự động lưu
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>

        {/* Center: Mobile Toggle Tabs (Editor / Preview) */}
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: '#f1f5f9', p: 0.5, borderRadius: '10px' }}>
          <Button
            size="small"
            variant={mobileView === 'editor' ? 'contained' : 'text'}
            onClick={() => setMobileView('editor')}
            sx={{
              py: 0.5,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              ...(mobileView === 'editor' ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#64748b' }),
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            size="small"
            variant={mobileView === 'preview' ? 'contained' : 'text'}
            onClick={() => setMobileView('preview')}
            sx={{
              py: 0.5,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              ...(mobileView === 'preview' ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#64748b' }),
            }}
          >
            Xem trước
          </Button>
        </Stack>

        {/* Right: Actions (Share, Word, JSON, Save, PDF) */}
        <Stack direction="row" spacing={1} alignItems="center">
          {cvSlug && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ShareOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleSharePublicLink}
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                borderRadius: '10px',
                borderColor: '#e2e8f0',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.775rem',
                textTransform: 'none',
                px: 1.75,
                py: 0.75,
                '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
              }}
            >
              Link trực tuyến
            </Button>
          )}

          {/* Export Word (.doc) */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />}
            onClick={() => exportCVToDocx(cvData, undefined, i18n.language === 'en' ? 'en' : 'vi')}
            sx={{
              display: { xs: 'none', xl: 'inline-flex' },
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.775rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.75,
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
            }}
          >
            Xuất Word (.doc)
          </Button>

          {/* Backup JSON */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<CodeOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />}
            onClick={() => exportCVToJSON(cvData)}
            sx={{
              display: { xs: 'none', '2xl': 'inline-flex' },
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.775rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.75,
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
            }}
          >
            Sao lưu JSON
          </Button>

          {/* Save Button */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.775rem',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
            }}
          >
            Lưu ngay
          </Button>

          {/* Primary Download PDF Button */}
          <Button
            size="small"
            variant="contained"
            startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleDownloadPDF}
            sx={{
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8rem',
              borderRadius: '10px',
              textTransform: 'none',
              px: 2.5,
              py: 0.85,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Tải PDF A4
          </Button>
        </Stack>
      </Paper>

      {/* ── Main Studio Body ─────────────────────────────────────────────── */}
      <Box
        className="cv-editor-main-body"
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          '@media print': {
            display: 'block !important',
            overflow: 'visible !important',
            height: 'auto !important',
          },
        }}
      >
        {/* Left Side: Form Controls Sidebar (460px fixed) */}
        <Box
          className="cv-editor-sidebar-container no-print"
          sx={{
            width: { xs: '100%', md: 450, lg: 480 },
            shrink: 0,
            height: '100%',
            overflow: 'hidden',
            display: { xs: mobileView === 'editor' ? 'block' : 'none', md: 'block' },
            '@media print': {
              display: 'none !important',
            },
          }}
        >
          <CVEditorSidebar
            data={cvData}
            candidateCvId={activeCVId}
            onChangeData={handleDataChange}
            onSyncFromProfile={handleSyncFromProfile}
            isSyncing={isSyncing}
          />
        </Box>

        {/* Right Side: Live A4 Visual Canvas */}
        <Box
          className="cv-preview-container"
          sx={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            display: { xs: mobileView === 'preview' ? 'block' : 'none', md: 'block' },
            '@media print': {
              display: 'block !important',
              width: '100% !important',
              height: 'auto !important',
              overflow: 'visible !important',
            },
          }}
        >
          <CVLivePreview
            data={cvData}
            onOpenTemplateSwitcher={() => setIsTemplateModalOpen(true)}
            onChangeColor={handleChangeColor}
            onDownloadPDF={handleDownloadPDF}
          />
        </Box>
      </Box>

      {/* ── Template Switcher Dialog ─────────────────────────────────────── */}
      <TemplateSwitcherModal
        open={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplateId={cvData.templateId}
        currentColor={cvData.theme.primaryColor}
        onSelectTemplate={handleSelectTemplate}
      />
    </Box>
  );
};
