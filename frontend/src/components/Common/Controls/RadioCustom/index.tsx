'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import Radio from '@mui/material/Radio';

import RadioGroup from '@mui/material/RadioGroup';

import FormControlLabel from '@mui/material/FormControlLabel';
import type { SelectOption } from '@/types/models';

import { FormLabel, Typography } from "@mui/material";

import FormControl from '@mui/material/FormControl';
import ValidationError from '../ValidationError';

const EMPTY_OPTIONS: SelectOption[] = [];

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  title?: string;
  showRequired?: boolean;
  options?: SelectOption[];
}

const RadioCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  title = '',
  showRequired = false,
  options = EMPTY_OPTIONS,
}: Props<T>) => {
  const { t } = useTranslation('common');

  return (

    <div>

      <Controller

        name={name as Path<T>}

        control={control}

        render={({ field, fieldState }) => (

          <>

            <FormControl>

              <FormLabel id={name}>

                <Typography variant="subtitle2" gutterBottom color="black">

                  {title}{' '}

                  {showRequired && <span style={{ color: 'red' }}>*</span>}

                </Typography>

              </FormLabel>

              <RadioGroup

                row

                aria-labelledby={name}

                name={name}

                value={field.value}

                onChange={(e) => field.onChange(e.target.value)}

              >

                {options.map((value) => (

                  <FormControlLabel

                    key={value.id}

                    value={value.id}

                    control={<Radio />}

                    label={typeof value.name === 'string' ? t(`choices.${value.name}`, { defaultValue: value.name }) : value.name}

                  />

                ))}

              </RadioGroup>

              {fieldState.invalid && (
                <ValidationError message={fieldState.error?.message} />
              )}

            </FormControl>

          </>

        )}

      />

    </div>

  );

};

export default RadioCustom;
