import React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';

import dayjs from '@/configs/moment-config';

import { Typography } from "@mui/material";
import { SxProps, Theme } from '@mui/material/styles';
import type { Dayjs } from 'dayjs';
import ValidationError from '../ValidationError';

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
  sx = {},
}: Props<T>) => {

  const parseDate = (date: Dayjs | string | null | undefined) => {
    if (!date) return undefined;
    try {
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
                  ...sx,
                  '& .MuiOutlinedInput-root': {
                    height: '1.4375em',
                    py: 2.5,
                  },
                  width: '100%',
                }}

                value={parseDate(field.value)}

                onChange={(newValue) => {

                  const date = parseDate(newValue);

                  const localDate = date ? dayjs.tz(date, 'Asia/Ho_Chi_Minh').startOf('day') : null;

                  field.onChange(localDate ? localDate.format('YYYY-MM-DD') : null);

                }}

                slotProps={{

                  textField: {

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
