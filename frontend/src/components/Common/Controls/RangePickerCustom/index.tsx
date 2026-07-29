'use client';

import React from 'react';
import { Box, Button, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import EastIcon from '@mui/icons-material/East';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface Props {
  allowSubmit: boolean;
  setAllowSubmit: (allow: boolean) => void;
  selectedDateRange: [Dayjs | null, Dayjs | null] | null;
  setSelectedDateRange: (range: [Dayjs | null, Dayjs | null]) => void;
  maxRangeMonths?: number;
  resetRangeMonths?: number;
}

const RangePickerCustom = ({
  allowSubmit,
  setAllowSubmit,
  selectedDateRange,
  setSelectedDateRange,
  maxRangeMonths = 1,
  resetRangeMonths = maxRangeMonths,
}: Props) => {
  const { t } = useTranslation('common');

  const getMaxEndDate = React.useCallback((startValue: Dayjs | null) => {
    const today = dayjs();
    if (!startValue) return today;

    const rangeLimit = startValue.add(maxRangeMonths, 'month');
    return rangeLimit.isAfter(today, 'day') ? today : rangeLimit;
  }, [maxRangeMonths]);

  const handleDateRangeChange = (startValue: Dayjs | null, endValue: Dayjs | null) => {
    let nextEndValue = endValue;

    if (startValue && nextEndValue) {
      const maxEndDate = getMaxEndDate(startValue);

      if (nextEndValue.isAfter(maxEndDate, 'day')) {
        nextEndValue = maxEndDate;
      }
      if (nextEndValue.isBefore(startValue, 'day')) {
        nextEndValue = startValue;
      }
    }
    setSelectedDateRange([startValue, nextEndValue]);
  };

  const refreshFilter = () => {
    setSelectedDateRange([dayjs().subtract(resetRangeMonths, 'month'), dayjs()]);
    setAllowSubmit(!allowSubmit);
  };

  const startValue = selectedDateRange?.[0] || null;
  const endValue = selectedDateRange?.[1] || null;

  const maxEndDate = React.useMemo(() => {
    if (!startValue) return dayjs();
    return getMaxEndDate(startValue);
  }, [getMaxEndDate, startValue]);

  const handlePresetSelect = (months: number) => {
    setSelectedDateRange([dayjs().subtract(months, 'month'), dayjs()]);
    setAllowSubmit(!allowSubmit);
  };

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
      <Paper
        elevation={0}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.25,
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          '&:hover': {
            borderColor: 'primary.main',
          },
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
          },
        }}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
        
        <DatePicker
          value={startValue}
          onChange={(newValue) => handleDateRangeChange(newValue, endValue)}
          format="DD/MM/YYYY"
          maxDate={dayjs()}
          slotProps={{
            textField: {
              size: 'small',
              placeholder: 'Từ ngày',
              sx: {
                width: 105,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiOutlinedInput-root': {
                  p: 0,
                  bgcolor: 'transparent',
                },
                '& .MuiInputBase-input': {
                  p: '4px 0',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'text.primary',
                },
              },
            },
          }}
        />

        <EastIcon sx={{ fontSize: 14, color: 'text.disabled', mx: 0.75 }} />

        <DatePicker
          value={endValue}
          onChange={(newValue) => handleDateRangeChange(startValue, newValue)}
          format="DD/MM/YYYY"
          minDate={startValue || undefined}
          maxDate={maxEndDate}
          slotProps={{
            textField: {
              size: 'small',
              placeholder: 'Đến ngày',
              sx: {
                width: 105,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiOutlinedInput-root': {
                  p: 0,
                  bgcolor: 'transparent',
                },
                '& .MuiInputBase-input': {
                  p: '4px 0',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'text.primary',
                },
              },
            },
          }}
        />
      </Paper>

      <Stack direction="row" spacing={0.75} alignItems="center">
        <Chip
          label="30 ngày"
          size="small"
          clickable
          onClick={() => handlePresetSelect(1)}
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.75rem', 
            borderRadius: '6px',
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'primary.extralight', color: 'primary.main' } 
          }}
        />
        <Chip
          label="90 ngày"
          size="small"
          clickable
          onClick={() => handlePresetSelect(3)}
          sx={{ 
            fontWeight: 700, 
            fontSize: '0.75rem', 
            borderRadius: '6px',
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'primary.extralight', color: 'primary.main' }
          }}
        />
      </Stack>

      <Tooltip title={t('actions.refresh')} arrow>
        <IconButton aria-label={t('actions.refresh')} size="small" onClick={refreshFilter}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Button
        size="small"
        variant="contained"
        color="primary"
        disabled={!selectedDateRange}
        onClick={() => setAllowSubmit(!allowSubmit)}
        sx={{
          textTransform: 'none',
          fontWeight: 800,
          borderRadius: '8px',
          px: 2,
          py: 0.5,
          fontSize: '0.8125rem',
        }}
      >
        {t('actions.apply')}
      </Button>
    </Stack>
  );
};

export default RangePickerCustom;
