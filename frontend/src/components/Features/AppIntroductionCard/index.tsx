import React from 'react';
import Link from 'next/link';
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { ABOUT_IMAGES, HOST_NAME, ROUTES } from '@/configs/constants';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import type { Theme as StylesTheme } from '@mui/material/styles';

interface AppIntroductionCardProps {
  // Add specific props if needed, otherwise use an empty interface or React.FC
}

const AppIntroductionCard = (_props: AppIntroductionCardProps) => {
  const { t } = useTranslation('common');
  const nav = useRouter();

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
            onClick={() => nav.push(`/${ROUTES.JOB_SEEKER.JOBS}`)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Tìm việc ngay
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => window.open(`https://${HOST_NAME.EMPLOYER_PROJECT}`, '_blank')}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Dành cho Nhà tuyển dụng
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

