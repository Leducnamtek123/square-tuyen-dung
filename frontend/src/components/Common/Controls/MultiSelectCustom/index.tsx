import * as React from 'react';

import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import Checkbox from '@mui/material/Checkbox';

import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import ValidationError from '../ValidationError';
import type { SelectOption } from '@/types/models';

const EMPTY_OPTIONS: SelectOption[] = [];
interface Props<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  options?: SelectOption[];
  title?: string | null;
  showRequired?: boolean;
  placeholder?: string;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;

const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectCustom = <T extends FieldValues = FieldValues>({
  name,
  control,
  options = EMPTY_OPTIONS,
  title = null,
  showRequired = false,
  placeholder = '',
}: Props<T>) => {
  const { t } = useTranslation('common');

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

                  error={fieldState.invalid}

                  {...params}

                  placeholder={placeholder}

                  size="small"

                />

              )}

            />

            {fieldState.invalid && (
              <ValidationError message={fieldState.error?.message} />
            )}

          </>

        )}

      />

    </div>

  );

};

export default MultiSelectCustom;
