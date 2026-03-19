import React from 'react';

import { useTheme } from '@mui/material/styles';

import { Control, Controller } from 'react-hook-form';

import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';

interface Props {
  name: string;
  control: Control<any>;
  placeholder?: string;
  options?: any[];
}

const SingleSelectSearchCustom = ({
  placeholder = '',
  name,
  control,
  options = [],
}: Props) => {

  const theme = useTheme();

  return (

    <Controller

      name={name}

      control={control}

      render={({ field }) => (

        <Autocomplete

          fullWidth

          id={field.name}

          options={options}

          autoHighlight={false}

          getOptionLabel={(option) => option.name}

          value={options.find((o) => o.id === field.value) || null}

          onChange={(e, value) => field.onChange(value?.id || '')}

          renderInput={(params) => (

            <TextField

              {...params}

              size="small"

              placeholder={placeholder}

              sx={{ backgroundColor: theme.palette.mode === 'light' ? 'white' : '#121212', borderRadius: 1 }}

            />

          )}

        />

      )}

    />

  );

};

export default SingleSelectSearchCustom;
