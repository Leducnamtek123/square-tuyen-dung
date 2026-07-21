import React from 'react';
import { IconButton, Rating, Stack } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import DataTable from '../../../../components/Common/DataTable';
import type { AdvancedSkill } from '../../../../types/models';

type Props = {
  data: AdvancedSkill[];
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const AdvancedSkillCardTable = ({ data, onEdit, onDelete, t }: Props) => (
  <DataTable
    columns={[
      {
        header: t('jobSeeker:profile.fields.skill'),
        accessorKey: 'name',
      },
      {
        header: t('jobSeeker:profile.fields.level'),
        accessorKey: 'level',
        cell: (info: { getValue: () => unknown }) => (
          <Rating name="level-read-only" value={(info.getValue() as number) || 0} size="large" readOnly />
        ),
      },
      {
        header: t('jobSeeker:profile.fields.actions'),
        id: 'actions',
        meta: { align: 'right' },
        cell: (info: { row: { original: AdvancedSkill } }) => (
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
    ]}
    data={data}
    isLoading={false}
    paginationMode="hidden"
    emptyMessage={t('jobSeeker:profile.messages.noSkillData')}
  />
);

export default AdvancedSkillCardTable;
