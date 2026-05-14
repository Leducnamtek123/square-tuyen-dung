'use client';

import React from 'react';

import { Box, Button, IconButton, Stack } from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';

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

  return (

    <>

      <Stack direction="row" spacing={1} alignItems="center">

        <Box width={160}>

          <DatePicker

            value={startValue}

            onChange={(newValue) => {

              handleDateRangeChange(newValue, endValue);

            }}

            format="DD/MM/YYYY"

            maxDate={dayjs()}

            slotProps={{ textField: { size: 'small' } }}

          />

        </Box>

        <Box width={160}>

          <DatePicker

            value={endValue}

            onChange={(newValue) => handleDateRangeChange(startValue, newValue)}

            format="DD/MM/YYYY"

            minDate={startValue || undefined}

            maxDate={maxEndDate}

            slotProps={{ textField: { size: 'small' } }}

          />

        </Box>

      </Stack>

      <IconButton aria-label="refresh" size="small" onClick={refreshFilter}>

        <RefreshIcon fontSize="small" />

      </IconButton>

      <Box>

        <Button

          size="small"

          variant="contained"

          color="primary"

          style={{ textTransform: 'inherit' }}

          disabled={!selectedDateRange}

          onClick={() => setAllowSubmit(!allowSubmit)}

        >

          {t('actions.apply')}

        </Button>

      </Box>

    </>

  );

};

export default RangePickerCustom;
