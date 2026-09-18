import React from 'react';
import dayjs from 'dayjs';
import { alpha, type Theme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faCircleDollarToSlot,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { formatLocalizedSalaryRange } from '@/utils/customData';

type JobPostLargeInfoChipsProps = {
  theme: Theme;
  salaryMin?: number;
  salaryMax?: number;
  salaryLanguage?: string;
  cityLabel: React.ReactNode;
  deadline: string | Date;
};

const chipSx = (theme: Theme, colorKey: 'primary' | 'info' | 'success') => ({
  backgroundColor: theme.palette[colorKey].background,
  borderRadius: 1.5,
  px: { xs: 1.25, sm: 1.5 },
  py: { xs: 0.5, sm: 0.75 },
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
});

const labelSx = (theme: Theme, colorKey: 'primary' | 'info' | 'success') => ({
  fontWeight: 600,
  fontSize: { xs: 12, sm: 13 },
  color: theme.palette[colorKey].main,
});

export const JobPostLargeInfoChips = ({
  theme,
  salaryMin,
  salaryMax,
  salaryLanguage,
  cityLabel,
  deadline,
}: JobPostLargeInfoChipsProps) => {
  const salaryText = formatLocalizedSalaryRange(salaryMin, salaryMax, salaryLanguage);
  const displaySalary = salaryText && salaryText !== '---' ? `${salaryText} VNĐ` : 'Thoả thuận';

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      <Box sx={chipSx(theme, 'primary')}>
        <FontAwesomeIcon
          icon={faCircleDollarToSlot}
          style={{ fontSize: '16px', color: theme.palette.primary.main }}
        />
        <Typography sx={{ ...labelSx(theme, 'primary'), fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {displaySalary}
        </Typography>
      </Box>

    <Box sx={chipSx(theme, 'info')}>
      <FontAwesomeIcon
        icon={faLocationDot}
        style={{ fontSize: '16px', color: theme.palette.info.main }}
      />
      <Typography sx={labelSx(theme, 'info')}>
        {cityLabel}
      </Typography>
    </Box>

    <Box sx={chipSx(theme, 'success')}>
      <FontAwesomeIcon
        icon={faCalendarDays}
        style={{ fontSize: '16px', color: theme.palette.success.main }}
      />
      <Typography sx={labelSx(theme, 'success')}>
        {dayjs(deadline).format('DD/MM/YYYY')}
      </Typography>
    </Box>
  </Box>
);
};
