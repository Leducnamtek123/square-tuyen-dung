import React from 'react';

import { Control, Controller } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';

import dayjs from '../../../configs/moment-config';

import { Typography } from "@mui/material";
import ValidationError from '../ValidationError';

interface Props {
  name: string;
  control: Control<any>;
  title?: string | null;
  showRequired?: boolean;
  minDate?: any;
  maxDate?: any;
  sx?: any;
}

const DatePickerCustom = ({
  name,
  control,
  title = null,
  showRequired = false,
  minDate = null,
  maxDate = null,
  sx = {},
}: Props) => {

  const parseDate = (date: any) => {
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

        name={name}

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
