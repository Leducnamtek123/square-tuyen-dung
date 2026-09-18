'use client';

import React from 'react';
import { Box, Chip, Stack, Typography, Button } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useTranslation } from 'react-i18next';
import type { ActiveFilterTag } from './types';

interface ActiveFilterChipsProps {
  tags: ActiveFilterTag[];
  onRemoveTag: (key: string) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  tags,
  onRemoveTag,
  onClearAll,
}) => {
  const { t } = useTranslation('common');
  if (!tags || tags.length === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      sx={{
        py: 1,
        px: 1.5,
        bgcolor: '#F8FAFC',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        width: '100%',
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 1 }}>
        <FilterAltIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem' }}
        >
          {t('filters.filtering', 'Đang lọc ({{count}}):', { count: tags.length })}
        </Typography>
      </Stack>

      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
        {tags.map((tag) => (
          <Chip
            key={tag.key}
            label={`${tag.label}: ${tag.valueLabel}`}
            onDelete={() => onRemoveTag(tag.key)}
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1E40AF',
              borderColor: '#BFDBFE',
              borderWidth: 1,
              borderStyle: 'solid',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-deleteIcon': {
                color: '#3B82F6',
                fontSize: 14,
                '&:hover': {
                  color: '#1D4ED8',
                },
              },
            }}
          />
        ))}

        <Button
          variant="text"
          color="error"
          size="small"
          onClick={onClearAll}
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            px: 0.75,
            py: 0.25,
            minWidth: 'auto',
          }}
        >
          {t('filters.clearAll', 'Xóa tất cả')}
        </Button>
      </Box>
    </Stack>
  );
};

export default ActiveFilterChips;
