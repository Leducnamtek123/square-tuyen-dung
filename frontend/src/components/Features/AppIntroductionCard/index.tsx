'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import { ABOUT_IMAGES, HOST_NAME, ROUTES } from '@/configs/constants';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import type { Theme as StylesTheme } from '@mui/material/styles';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { openExternalUrlSafely } from '@/utils/safeExternalUrl';
import toastMessages from '@/utils/toastMessages';

interface AppIntroductionCardProps {
  // Add specific props if needed, otherwise use an empty interface or React.FC
}

const AppIntroductionCard = (_props: AppIntroductionCardProps) => {
  const { t, i18n } = useTranslation('common');
  const { push } = useRouter();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  const handleSendSmsLink = () => {
    if (!phoneNumber.trim()) return;
    toastMessages.success(t('common:appDownload.smsSuccess', 'Đã gửi liên kết tải ứng dụng qua SMS!'));
    setPhoneNumber('');
  };

  return (
    <Card sx={{ p: 4, position: 'relative', overflow: 'hidden' }}>
      <Stack spacing={3} alignItems="flex-start">
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Sẵn sàng bứt phá nhân sự?
          </Typography>
        </Box>
        <Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            Tham gia cộng đồng tuyển dụng hiện đại, nơi doanh nghiệp và nhân tài kết nối 
            thông qua quy trình xác thực minh bạch và công nghệ phỏng vấn tiên tiến.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => push(jobsHref)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Tìm việc ngay
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => openExternalUrlSafely(`https://${HOST_NAME.EMPLOYER_PROJECT}`)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Dành cho Nhà tuyển dụng
          </Button>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', maxWidth: 480, pt: 1 }}>
          <TextField
            size="small"
            placeholder="Nhập số điện thoại nhận link tải app..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            sx={{ flex: 1, bgcolor: '#FFFFFF', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            color="success"
            disabled={!phoneNumber.trim()}
            onClick={handleSendSmsLink}
            sx={{ borderRadius: 1.5, px: 2.5, whiteSpace: 'nowrap' }}
          >
            Gửi link tải app
          </Button>
        </Stack>
        <Box sx={{ width: '100%', pt: 2 }}>
           <MuiImageCustom 
            src={ABOUT_IMAGES.LIVE_INTERVIEW} 
            sx={{ 
              borderRadius: 2, 
              maxHeight: 300, 
              objectFit: 'cover',
              boxShadow: (theme: StylesTheme) => theme.shadows[1]
            }} 
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default AppIntroductionCard;

