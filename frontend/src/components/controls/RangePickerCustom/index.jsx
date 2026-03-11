/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';

import { Box, Button, IconButton, Stack } from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';

function getMonthDiff(dateA, dateB) {
  const msPerDay = 86400000; // so milisecond trong mot ngay

  // tinh so ngay giua hai ngay
  const daysDiff = Math.round((dateB - dateA) / msPerDay);

  // tinh so thang va ngay con lai
  const monthDiff = Math.floor(daysDiff / 30);
  const daysRemaining = daysDiff % 30;

  return { months: monthDiff, days: daysRemaining };
}

const RangePickerCustom = ({
  allowSubmit,
  setAllowSubmit,
  selectedDateRange,
  setSelectedDateRange,
}) => {
  const [maxDate, setMaxDate] = React.useState(dayjs());

  const handleDateRangeChange = (startValue, endValue) => {
    if (startValue && endValue) {
      const startDate = new Date(dayjs(startValue).format('YYYY-MM-DD'));
      const endDate = new Date(dayjs(endValue).format('YYYY-MM-DD'));
      const { months, days } = getMonthDiff(startDate, endDate);

      if (months > 1 || (months === 1 && days > 1)) {
        const capped = dayjs(startValue).add(1, 'month');
        setSelectedDateRange([startValue, capped]);
        return;
      }
    }

    setSelectedDateRange([startValue, endValue]);
  };

  function handleCalendarChange(dates) {
    if (
      dates !== null &&
      Array.isArray(dates) &&
      dates.length > 0 &&
      dates[0] !== null
    ) {
      const startDateString = dayjs(dates[0]).format('YYYY-MM-DD');
      const startDate = new Date(startDateString);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      if (endDate < new Date()) {
        setMaxDate(dayjs(endDate));
      } else {
        setMaxDate(dayjs());
      }
    }
  }

  const refreshFilter = () => {
    setSelectedDateRange([dayjs().subtract(1, 'month'), dayjs()]);
    setMaxDate(dayjs());
    setAllowSubmit(!allowSubmit);
  };

  const startValue = selectedDateRange?.[0] || null;
  const endValue = selectedDateRange?.[1] || null;
  const maxEndDate = React.useMemo(() => {
    if (!startValue) return dayjs();
    const capped = dayjs(startValue).add(1, 'month');
    return capped.isAfter(dayjs()) ? dayjs() : capped;
  }, [startValue]);

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box width={120}>
          <DatePicker
            value={startValue}
            onChange={(newValue) => {
              handleCalendarChange([newValue]);
              handleDateRangeChange(newValue, endValue);
            }}
            format="DD/MM/YYYY"
            maxDate={maxDate}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box>
        <Box width={120}>
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
          Ap dung
        </Button>
      </Box>
    </>
  );
};

export default RangePickerCustom;
