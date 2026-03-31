import * as React from 'react';

import { useTheme } from '@mui/material/styles';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import Checkbox from '@mui/material/Checkbox';

import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/types/models';

import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  placeholder?: string;
  options?: SelectOption[];
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;

const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectSearchCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  placeholder = '',
  options = [],
}: Props<T>) => {

  const theme = useTheme();
  const { t } = useTranslation('common');

  return (

    <Controller

      name={name as Path<T>}

      control={control}

      render={({ field }) => (

        <Autocomplete

          multiple

          limitTags={1}

          id={name}

          options={options}

          disableCloseOnSelect

          onChange={(e, value) =>

            field.onChange(value.map((value) => value?.id))

          }

          getOptionLabel={(option) => typeof option.name === 'string' ? t(`choices.${option.name}`, option.name) : option.name}

          renderOption={(props, option, { selected }) => (

            <li {...props}>

              <Checkbox

                icon={icon}

                checkedIcon={checkedIcon}

                style={{ marginRight: 8 }}

                checked={selected}

              />

              {typeof option.name === 'string' ? t(`choices.${option.name}`, option.name) : option.name}

            </li>

          )}

          renderInput={(params) => (

            <TextField

              {...params}

              placeholder={placeholder}

              size="small"

              sx={{

                backgroundColor:

                  theme.palette.mode === 'light' ? 'white' : '#121212',

                borderRadius: 1,

              }}

            />

          )}

        />

      )}

    />

  );

};

export default MultiSelectSearchCustom;
