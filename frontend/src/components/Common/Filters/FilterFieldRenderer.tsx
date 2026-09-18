'use client';

import React from 'react';
import { Stack, Typography } from '@mui/material';
import SingleSelectCustom from '../Controls/SingleSelectCustom';
import TextFieldCustom from '../Controls/TextFieldCustom';
import type { FilterFieldConfig } from './types';
import type { useForm } from 'react-hook-form';
import type { SxProps, Theme } from '@mui/material/styles';

const sidebarFilterControlSx = {
  '& .MuiOutlinedInput-root': {
    height: 38,
    fontSize: '0.8125rem',
    borderRadius: '6px',
    backgroundColor: '#F8FAFC',
  },
} as SxProps<Theme>;

interface FilterFieldRendererProps {
  field: FilterFieldConfig;
  control: ReturnType<typeof useForm<any>>['control'];
  allConfig: any;
}

export const FilterFieldRenderer: React.FC<FilterFieldRendererProps> = ({
  field,
  control,
  allConfig,
}) => {
  const Icon = field.icon;
  const options = field.getOptions ? field.getOptions(null, allConfig) : field.options || [];

  return (
    <Stack spacing={0.75} key={field.key}>
      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: '#64748B',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          fontSize: '0.72rem',
        }}
      >
        {Icon && <Icon sx={{ mr: 0.75, color: 'primary.main', fontSize: 15 }} />}
        {field.label}
      </Typography>

      {field.type === 'SELECT' && (
        <SingleSelectCustom
          name={field.key}
          control={control}
          options={options}
          placeholder={field.placeholder || ''}
          sx={sidebarFilterControlSx}
        />
      )}

      {(field.type === 'TEXT' || field.type === 'NUMBER') && (
        <TextFieldCustom
          name={field.key}
          control={control}
          type={field.type === 'NUMBER' ? 'number' : 'text'}
          placeholder={field.placeholder || ''}
          sx={sidebarFilterControlSx}
        />
      )}
    </Stack>
  );
};

export default FilterFieldRenderer;
