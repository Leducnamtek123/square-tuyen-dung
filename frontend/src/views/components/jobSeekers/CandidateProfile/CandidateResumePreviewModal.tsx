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
  Divider,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import TranslateIcon from '@mui/icons-material/Translate';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import type { ExtendedResume } from '@/components/Features/CVDoc';

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
  candidateName = 'Đức Nam Lê',
  candidateEmail = 'leducnamtek123@gmail.com',
  candidatePhone = '0901 234 567',
  avatarUrl,
}) => {
  const resumeTitle = resume?.title || 'Kế toán / Kỹ sư Cơ điện MEP';

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            {candidateName.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                Bản xem trước: {resumeTitle}
              </Typography>
              <Chip label="Sẵn sàng ứng tuyển" size="small" sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.675rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Ứng viên: {candidateName} • Cập nhật lần cuối: 01/08/2026
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#cbd5e1', color: '#0f172a' }}
          >
            In CV
          </Button>
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748b', backgroundColor: '#f1f5f9', '&:hover': { backgroundColor: '#e2e8f0' } }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={3}>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{candidateName}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Tỉnh / Thành phố</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Thành phố Hà Nội</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Số điện thoại</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{candidatePhone}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Quận / Huyện</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Quận Cầu Giấy</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Email liên hệ</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{candidateEmail}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Tình trạng hôn nhân</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Độc thân</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Thông tin chung */}
          <Box sx={{ p: 3, borderRadius: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #2563eb' }}>
              <WorkOutlineIcon sx={{ color: '#2563eb' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Thông tin chung & Mục tiêu nghề nghiệp
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={12}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Mục tiêu nghề nghiệp</Typography>
                <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, lineHeight: 1.6 }}>
                  Mong muốn cống hiến năng lực chuyên môn trong lĩnh vực Kỹ thuật / Kế toán, áp dụng kiến thức thực tế để tối ưu hóa quy trình, mang lại giá trị bền vững cho doanh nghiệp và thăng tiến lên vị trí Quản lý.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Vị trí mong muốn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2563eb' }}>{resumeTitle}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Địa điểm làm việc mong muốn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Thành phố Hà Nội / TP. Hồ Chí Minh</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Cấp bậc mong muốn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Chuyên viên / Giám sát</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem', display: 'block' }}>Mức lương mong muốn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a' }}>15.000.000 - 25.000.000 VNĐ</Typography>
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

            <Stack spacing={2}>
              <Box sx={{ pl: 2, borderLeft: '3px solid #2563eb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Giám sát Cơ điện MEP — Công ty Cổ phần Xây dựng Square
                </Typography>
                <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, display: 'block', my: 0.25 }}>
                  01/2024 — Hiện tại (1 năm 7 tháng)
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  • Trực tiếp giám sát thi công hệ thống Điện, Nước, HVAC tại các dự án tòa nhà văn phòng và khu căn hộ cao cấp.<br />
                  • Khảo sát mặt bằng, kiểm tra chất lượng vật tư đầu vào và nghiệm thu công trình theo đúng thiết kế bản vẽ.<br />
                  • Phối hợp chặt chẽ với Chủ đầu tư và các Nhà thầu phụ đảm bảo tiến độ và an toàn lao động.
                </Typography>
              </Box>
            </Stack>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Cử nhân Kỹ thuật / Kinh tế
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                  Trường Đại học Bách Khoa / Đại học Quốc Gia (2019 - 2023)
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem' }}>
                  Tốt nghiệp loại Giỏi. Điểm trung bình GPA: 3.4/4.0.
                </Typography>
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['AutoCAD', 'Revit MEP', 'Bóc tách khối lượng', 'MS Project', 'Tiếng Anh Giao tiếp B2'].map((skill) => (
                    <Chip key={skill} label={skill} size="small" sx={{ borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700 }} />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
          Đóng bản xem trước
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateResumePreviewModal;
