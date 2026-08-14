'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EastIcon from '@mui/icons-material/East';
import CheckIcon from '@mui/icons-material/Check';
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

const RangePickerCustom: React.FC<Props> = ({
  allowSubmit,
  setAllowSubmit,
  selectedDateRange,
  setSelectedDateRange,
  maxRangeMonths = 6,
  resetRangeMonths = maxRangeMonths,
}) => {
  const { t } = useTranslation('common');

  // Popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const startValue = selectedDateRange?.[0] || null;
  const endValue = selectedDateRange?.[1] || null;

  // Temp state for popover editing
  const [tempStart, setTempStart] = useState<Dayjs | null>(startValue);
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(endValue);

  // Sync temp values when selectedDateRange changes or popover opens
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setTempStart(startValue || dayjs().subtract(1, 'month'));
    setTempEnd(endValue || dayjs());
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleApplyPopover = () => {
    let nextStart = tempStart;
    let nextEnd = tempEnd;

    if (nextStart && nextEnd && nextEnd.isBefore(nextStart)) {
      const swap = nextStart;
      nextStart = nextEnd;
      nextEnd = swap;
    }

    setSelectedDateRange([nextStart, nextEnd]);
    setAllowSubmit(!allowSubmit);
    handleClosePopover();
  };

  const handlePresetSelect = (days: number) => {
    const end = dayjs();
    const start = dayjs().subtract(days, 'day');
    setSelectedDateRange([start, end]);
    setAllowSubmit(!allowSubmit);
  };

  const is30DaysActive = React.useMemo(() => {
    if (!startValue || !endValue) return false;
    const diff = Math.abs(endValue.diff(startValue, 'day'));
    return diff >= 28 && diff <= 32 && endValue.isSame(dayjs(), 'day');
  }, [startValue, endValue]);

  const is90DaysActive = React.useMemo(() => {
    if (!startValue || !endValue) return false;
    const diff = Math.abs(endValue.diff(startValue, 'day'));
    return diff >= 88 && diff <= 93 && endValue.isSame(dayjs(), 'day');
  }, [startValue, endValue]);

  const openPopover = Boolean(anchorEl);

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: '20px' }}>
      {/* ── 1. Single Unified Date Range Trigger Control ──────────────── */}
      <Box
        onClick={handleOpenPopover}
        sx={{
          height: '40px',
          minWidth: '290px',
          px: '12px',
          borderRadius: '10px',
          border: '1px solid',
          borderColor: openPopover ? '#2563EB' : '#E5EAF2',
          bgcolor: '#FFFFFF',
          color: '#344054',
          fontSize: '13px',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: openPopover ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
          transition: 'all 0.15s ease-in-out',
          userSelect: 'none',
          '&:hover': {
            borderColor: openPopover ? '#2563EB' : '#B8C7E0',
          },
        }}
      >
        <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#667085', mr: 1, flexShrink: 0 }} />

        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#344054', whiteSpace: 'nowrap' }}>
          {startValue ? startValue.format('DD/MM/YYYY') : '30/06/2025'}
        </Typography>

        <EastIcon sx={{ fontSize: 14, color: '#667085', mx: 1.5, flexShrink: 0 }} />

        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#344054', whiteSpace: 'nowrap' }}>
          {endValue ? endValue.format('DD/MM/YYYY') : '30/07/2025'}
        </Typography>

        <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#667085', ml: 'auto', flexShrink: 0 }} />
      </Box>

      {/* ── 2. Calendar Popover ────────────────────────────────────────── */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
            border: '1px solid #E5EAF2',
            p: 2.5,
            mt: 1,
            minWidth: 320,
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="#101828" mb={2}>
          Chọn khoảng thời gian
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
          <DatePicker
            label="Từ ngày"
            value={tempStart}
            onChange={(val) => setTempStart(val)}
            format="DD/MM/YYYY"
            maxDate={dayjs()}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  width: 145,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    fontSize: '13px',
                  },
                },
              },
            }}
          />

          <EastIcon sx={{ fontSize: 16, color: '#667085' }} />

          <DatePicker
            label="Đến ngày"
            value={tempEnd}
            onChange={(val) => setTempEnd(val)}
            format="DD/MM/YYYY"
            minDate={tempStart || undefined}
            maxDate={dayjs()}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  width: 145,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    fontSize: '13px',
                  },
                },
              },
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} pt={1} borderTop="1px solid #F1F5F9">
          <Button
            size="small"
            onClick={handleClosePopover}
            sx={{
              height: '36px',
              px: 2,
              borderRadius: '8px',
              color: '#475467',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Hủy
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleApplyPopover}
            sx={{
              height: '36px',
              px: 2.5,
              borderRadius: '8px',
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
            }}
          >
            Áp dụng
          </Button>
        </Stack>
      </Popover>

      {/* ── 3. Quick Filter Preset Group (30 ngày & 90 ngày) ──────────── */}
      <Box
        onClick={() => handlePresetSelect(30)}
        sx={{
          height: '40px',
          px: '14px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: is30DaysActive ? 600 : 500,
          color: is30DaysActive ? '#175CD3' : '#475467',
          bgcolor: is30DaysActive ? '#EEF4FF' : '#FFFFFF',
          border: '1px solid',
          borderColor: is30DaysActive ? '#B2CCFF' : '#E5EAF2',
          transition: 'all 0.15s ease-in-out',
          userSelect: 'none',
          '&:hover': {
            bgcolor: is30DaysActive ? '#EEF4FF' : '#F8FAFC',
            borderColor: is30DaysActive ? '#B2CCFF' : '#B8C7E0',
          },
        }}
      >
        30 ngày
      </Box>

      <Box
        onClick={() => handlePresetSelect(90)}
        sx={{
          height: '40px',
          px: '14px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: is90DaysActive ? 600 : 500,
          color: is90DaysActive ? '#175CD3' : '#475467',
          bgcolor: is90DaysActive ? '#EEF4FF' : '#FFFFFF',
          border: '1px solid',
          borderColor: is90DaysActive ? '#B2CCFF' : '#E5EAF2',
          transition: 'all 0.15s ease-in-out',
          userSelect: 'none',
          '&:hover': {
            bgcolor: is90DaysActive ? '#EEF4FF' : '#F8FAFC',
            borderColor: is90DaysActive ? '#B2CCFF' : '#B8C7E0',
          },
        }}
      >
        90 ngày
      </Box>

      {/* ── 4. Apply Button (#0F1B3D) ─────────────────────────────────── */}
      <Button
        disableElevation
        variant="contained"
        disabled={!selectedDateRange}
        onClick={() => setAllowSubmit(!allowSubmit)}
        startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
        sx={{
          height: '40px',
          px: '18px',
          borderRadius: '10px',
          bgcolor: '#0F1B3D',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#172554',
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            bgcolor: '#94A3B8',
            color: '#FFFFFF',
          },
        }}
      >
        {t('actions.apply')}
      </Button>
    </Stack>
  );
};

export default RangePickerCustom;
