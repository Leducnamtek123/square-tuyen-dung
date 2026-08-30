'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid2 as Grid,
  IconButton,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import { getSafeExternalOpenUrl, getSafeResourceUrl } from '@/utils/safeExternalUrl';
import type { ExtendedResume, CVDocExperience, CVDocEducation, CVDocAdvancedSkill, CVDocCertificate } from '@/components/Features/CVDoc';

interface CandidateResumePreviewModalProps {
  open: boolean;
  onClose: () => void;
  resume?: ExtendedResume | null;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  avatarUrl?: string;
}

const CandidateResumePreviewModal: React.FC<CandidateResumePreviewModalProps> = ({
  open,
  onClose,
  resume,
  candidateName = '',
  candidateEmail = '',
  candidatePhone = '',
  avatarUrl,
}) => {
  const displayName = candidateName || resume?.user?.fullName || resume?.userDict?.fullName || 'Ứng viên';
  const displayEmail = candidateEmail || resume?.user?.email || resume?.userDict?.email || '';
  const displayPhone = candidatePhone || resume?.jobSeekerProfileDict?.phone || '';
  const resumeTitle = resume?.title || 'Hồ sơ ứng viên';
  const updatedAt = resume?.updateAt || resume?.createAt;

  const cityName =
    typeof resume?.city === 'object' && resume.city?.name
      ? resume.city.name
      : resume?.locationChooseData?.name || '';

  const positionName =
    resume?.positionChooseData?.name || '';

  const experienceLabel =
    resume?.experienceChooseData?.name ||
    (resume?.experience ? `${resume.experience} năm` : '');

  const educationLabel =
    resume?.academicLevelChooseData?.name ||
    (resume?.academicLevel ? String(resume.academicLevel) : '');

  const objectiveText = resume?.description || resume?.careerObjective || '';

  const formatSalary = () => {
    if (resume?.salaryMin && resume?.salaryMax) {
      return `${(resume.salaryMin / 1000000).toLocaleString('vi-VN')} - ${(resume.salaryMax / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
    }
    if (resume?.salaryMin) {
      return `Từ ${(resume.salaryMin / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
    }
    if (resume?.salaryMax) {
      return `Lên đến ${(resume.salaryMax / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
    }
    if (resume?.expectedSalary) {
      return `${(resume.expectedSalary / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
    }
    if (typeof resume?.salary === 'string') {
      return resume.salary;
    }
    return '';
  };
  const salaryText = formatSalary();

  const experiences: CVDocExperience[] = resume?.experienceDetails || [];
  const educations: CVDocEducation[] = resume?.educationDetails || [];
  const advancedSkills: CVDocAdvancedSkill[] = resume?.advancedSkills || [];
  const certificates: CVDocCertificate[] = resume?.certificates || [];

  const rawPdfUrl = resume?.fileUrl || resume?.file?.url || resume?.file?.fileUrl;
  const safePdfUrl = getSafeExternalOpenUrl(rawPdfUrl);
  const safeResourcePdfUrl = getSafeResourceUrl(rawPdfUrl);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="candidate-resume-preview-title"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
        },
      }}
    >
      {/* Header Modal */}
      <DialogTitle
        id="candidate-resume-preview-title"
        sx={{
          m: 0,
          p: 2.5,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={avatarUrl || undefined}
            sx={{ width: 48, height: 48, bgcolor: '#2563eb', fontWeight: 700, fontSize: '1.25rem' }}
          >
            {displayName.trim().charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                Bản xem trước: {resumeTitle}
              </Typography>
              <Chip label="Sẵn sàng ứng tuyển" size="small" sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.675rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Ứng viên: {displayName} • Cập nhật lần cuối: {updatedAt && dayjs(updatedAt).isValid() ? dayjs(updatedAt).format('DD/MM/YYYY') : 'Chưa cập nhật'}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" className="no-print">
          <Button
            size="small"
            variant="outlined"
            aria-label="In bản CV này"
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#cbd5e1', color: '#0f172a' }}
          >
            In CV
          </Button>
          <IconButton aria-label="Đóng bản xem trước CV" onClick={onClose} size="small" sx={{ color: '#64748b', backgroundColor: '#f1f5f9', '&:hover': { backgroundColor: '#e2e8f0' } }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={3}>
          {/* Section: Tệp CV đính kèm (nếu có) */}
          {safePdfUrl ? (
            <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsertDriveFileOutlinedIcon sx={{ color: '#2563eb' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Tệp CV đính kèm
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  href={safePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở tệp PDF gốc trong tab mới"
                  startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, backgroundColor: '#2563eb' }}
                >
                  Mở tệp PDF gốc
                </Button>
              </Box>
              <Box sx={{ width: '100%', height: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <iframe
                  src={safeResourcePdfUrl ? `${safeResourcePdfUrl}#toolbar=0` : undefined}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  title={`Bản xem trước tệp CV - ${resumeTitle}`}
                  style={{ border: 'none' }}
                />
              </Box>
            </Box>
          ) : null}

          {/* Section 1: Thông tin cá nhân */}
          <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
              <PersonOutlineIcon sx={{ color: '#2563eb' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Thông tin cá nhân
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Họ và tên</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: displayName ? '#0f172a' : '#94a3b8' }}>
                  {displayName || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Tỉnh / Thành phố</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: cityName ? '#0f172a' : '#94a3b8' }}>
                  {cityName || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Số điện thoại</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: displayPhone ? '#0f172a' : '#94a3b8' }}>
                  {displayPhone || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Email liên hệ</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: displayEmail ? '#0f172a' : '#94a3b8' }}>
                  {displayEmail || 'Chưa cập nhật'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Thông tin chung & Mục tiêu nghề nghiệp */}
          <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
              <WorkOutlineIcon sx={{ color: '#2563eb' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Thông tin chung & Mục tiêu nghề nghiệp
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {objectiveText && (
                <Grid size={12}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Mục tiêu nghề nghiệp</Typography>
                  <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, lineHeight: 1.6 }}>
                    {objectiveText}
                  </Typography>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Vị trí mong muốn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: positionName || resumeTitle ? '#2563eb' : '#94a3b8' }}>
                  {positionName || resumeTitle || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Kinh nghiệm làm việc</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: experienceLabel ? '#0f172a' : '#94a3b8' }}>
                  {experienceLabel || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Trình độ học vấn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: educationLabel ? '#0f172a' : '#94a3b8' }}>
                  {educationLabel || 'Chưa cập nhật'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Mức lương mong muốn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: salaryText ? '#16a34a' : '#94a3b8' }}>
                  {salaryText || 'Thỏa thuận'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Section 3: Kinh nghiệm làm việc */}
          <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
              <WorkOutlineIcon sx={{ color: '#2563eb' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Kinh nghiệm làm việc
              </Typography>
            </Box>

            {experiences.length > 0 ? (
              <Stack spacing={2}>
                {experiences.map((exp, idx) => (
                  <Box key={idx} sx={{ pl: 2, borderLeft: '3px solid #2563eb' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {exp.jobName} {exp.companyName ? `- ${exp.companyName}` : ''}
                    </Typography>
                    {(exp.startDate || exp.endDate) && (
                      <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, display: 'block', my: 0.25 }}>
                        {exp.startDate || '-'} - {exp.endDate || 'Hiện tại'}
                      </Typography>
                    )}
                    {exp.description && (
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {exp.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                Chưa có thông tin kinh nghiệm làm việc
              </Typography>
            )}
          </Box>

          {/* Section 4: Học vấn & Kỹ năng */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
                  <SchoolOutlinedIcon sx={{ color: '#2563eb' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Trình độ học vấn
                  </Typography>
                </Box>
                {educations.length > 0 ? (
                  <Stack spacing={1.5}>
                    {educations.map((edu, idx) => (
                      <Box key={idx}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {edu.degreeName || edu.major || 'Học vấn'}
                        </Typography>
                        {edu.trainingPlaceName && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            {edu.trainingPlaceName} {(edu.startDate || edu.completedDate) ? `(${edu.startDate || ''} - ${edu.completedDate || ''})` : ''}
                          </Typography>
                        )}
                        {edu.description && (
                          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem', mt: 0.5 }}>
                            {edu.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    {educationLabel || 'Chưa cập nhật thông tin học vấn'}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
                  <StarOutlineIcon sx={{ color: '#2563eb' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Kỹ năng & Chứng chỉ
                  </Typography>
                </Box>
                {advancedSkills.length > 0 || certificates.length > 0 ? (
                  <Stack spacing={2}>
                    {advancedSkills.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {advancedSkills.map((skill, idx) => (
                          <Chip key={idx} label={skill.name} size="small" sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700 }} />
                        ))}
                      </Box>
                    )}
                    {certificates.length > 0 && (
                      <Stack spacing={1}>
                        {certificates.map((cert, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CardMembershipIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {cert.name} {cert.trainingPlace ? `(${cert.trainingPlace})` : ''}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    Chưa cập nhật kỹ năng & chứng chỉ
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2.5, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
          Đóng bản xem trước
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateResumePreviewModal;
