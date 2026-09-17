import React from 'react';
import { Box, Typography } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import dayjs from '@/configs/dayjs-config';

type JobPostLargeFooterProps = {
  theme: Theme;
  deadline: string | Date;
};

export const JobPostLargeFooter = ({ theme, deadline }: JobPostLargeFooterProps) => {
  const { i18n } = useTranslation(['public', 'common']);
  const isEn = i18n.language && i18n.language.startsWith('en');

  const daysLeftText = React.useMemo(() => {
    if (!deadline) return isEn ? '30 days left' : 'Còn 30 ngày';
    const diffDays = dayjs(deadline).diff(dayjs(), 'day');
    if (diffDays > 0) {
      return isEn ? `${diffDays} days left` : `Còn ${diffDays} ngày`;
    }
    const diffHours = dayjs(deadline).diff(dayjs(), 'hour');
    if (diffHours > 0) {
      return isEn ? `${diffHours} hours left` : `Còn ${diffHours} giờ`;
    }
    return isEn ? 'Expired' : 'Hết hạn';
  }, [deadline, isEn]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          color: theme.palette.grey[600],
        }}
      >
        <FontAwesomeIcon
          icon={faClock}
          style={{ fontSize: '14px' }}
          color={theme.palette.grey[400]}
        />
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 13,
            color: theme.palette.grey[600],
          }}
          variant="body2"
        >
          {daysLeftText}
        </Typography>
      </Box>
    </Box>
  );
};
