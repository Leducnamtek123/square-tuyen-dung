'use client';
import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';

import dayjs from '@/configs/moment-config';

import { Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import type { Dayjs } from 'dayjs';
import ValidationError from '../ValidationError';

const EMPTY_SX: SxProps<Theme> = {};

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string | null;
  showRequired?: boolean;
  minDate?: Dayjs | string | null;
  maxDate?: Dayjs | string | null;
  sx?: SxProps<Theme>;
}

const DatePickerCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  title = null,
  showRequired = false,
  minDate = null,
  maxDate = null,
  sx = EMPTY_SX,
}: Props<T>) => {

  const parseDate = (date: Dayjs | string | null | undefined) => {
    if (!date) return undefined;
    if (dayjs.isDayjs(date)) {
      return date.isValid() ? date : undefined;
    }
    try {
      if (typeof date === 'string') {
        const normalized = date.trim();
        if (!normalized) return undefined;

        const parsedByKnownFormat = dayjs(normalized, [
          'YYYY-MM-DD',
          'DD-MM-YYYY',
          'YYYY/MM/DD',
          'DD/MM/YYYY',
          'YYYY-MM-DDTHH:mm',
          'YYYY-MM-DDTHH:mm:ss',
          'YYYY-MM-DDTHH:mm:ssZ',
          'YYYY-MM-DDTHH:mm:ss.SSSZ',
        ], true);

        if (parsedByKnownFormat.isValid()) return parsedByKnownFormat;

        const parsedDate = dayjs(normalized);
        return parsedDate.isValid() ? parsedDate : undefined;
      }

      const parsedDate = dayjs(date);
      return parsedDate.isValid() ? parsedDate : undefined;
    } catch {
      return undefined;
    }
  };

  return (

    <div>

      {title && (

        <Typography variant="subtitle2" gutterBottom>

          {title} {showRequired && <span style={{ color: 'red' }}>*</span>}

        </Typography>

      )}

      <Controller

        name={name as Path<T>}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <div>

              <DatePicker

                maxDate={parseDate(maxDate)}

                minDate={parseDate(minDate)}

                format="DD-MM-YYYY"

                sx={{
                  width: '100%',
                  ...sx,
                }}

                value={parseDate(field.value)}

                onChange={(newValue) => {

                  const date = parseDate(newValue);

                  const localDate = date ? dayjs.tz(date, 'Asia/Ho_Chi_Minh').startOf('day') : null;

                  field.onChange(localDate ? localDate.format('YYYY-MM-DD') : null);

                }}

                slotProps={{

                  textField: {

                    size: 'small',

                    error: fieldState.invalid,

                    helperText: fieldState.error?.message,

                  },

                }}

                timezone="Asia/Ho_Chi_Minh"

                referenceDate={dayjs().tz('Asia/Ho_Chi_Minh')}

              />

            </div>

            {fieldState.invalid && (
              <ValidationError message={fieldState.error?.message} />
            )}

          </>

        )}

      />

    </div>

  );

};

export default DatePickerCustom;
