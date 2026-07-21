import React from 'react';
import { Rating, IconButton, Stack, Typography } from '@mui/material';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { tConfig } from '../../../../utils/tConfig';
import type { LanguageSkill } from '../../../../types/models';

interface Args {
  languageDict?: Record<string, string>;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

export const useLanguageSkillCardColumns = ({ languageDict, onEdit, onDelete }: Args) => {
  const { t } = useTranslation(['jobSeeker', 'common']);

  return React.useMemo<ColumnDef<LanguageSkill>[]>(
    () => [
      {
        header: t('jobSeeker:profile.fields.language'),
        accessorKey: 'language',
        cell: (info) => tConfig(languageDict?.[String(info.getValue() ?? '')]),
      },
      {
        header: t('jobSeeker:profile.fields.level'),
        accessorKey: 'level',
        cell: (info) => <Rating name="level-read-only" value={(info.getValue() as number) || 0} size="large" readOnly />,
      },
      {
        header: t('jobSeeker:profile.fields.actions'),
        id: 'actions',
        meta: { align: 'right' },
        cell: (info) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              size="small"
              sx={{
                color: 'secondary.main',
                bgcolor: 'secondary.background',
                '&:hover': {
                  bgcolor: 'secondary.light',
                  color: 'white',
                },
              }}
              onClick={() => onEdit(info.row.original.id)}
            >
              <ModeEditOutlineOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: 'error.main',
                bgcolor: 'error.background',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
              onClick={() => onDelete(info.row.original.id)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [languageDict, onDelete, onEdit, t]
  );
};
