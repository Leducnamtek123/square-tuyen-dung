import React from 'react';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { ColumnDef } from '@tanstack/react-table';

import { CV_TYPES, ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { salaryString } from '../../../../utils/customData';
import { faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';
import { formatRoute } from '../../../../utils/funcUtils';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';

interface SavedResumeTableProps {
  rows: any[];
  isLoading: boolean;
  handleUnsave: (slug: string) => void;
  count?: number;
  page?: number;
  rowsPerPage?: number;
  handleChangePage?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const SavedResumeTable: React.FC<SavedResumeTableProps> = (props) => {
  const { t } = useTranslation('employer');
  const nav = useRouter();
  const { rows, isLoading, handleUnsave } = props;
  const rowsSafe = React.useMemo(() => Array.isArray(rows) ? rows : [], [rows]);
  const { allConfig } = useConfig();

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'resume.title',
      header: (t('savedResumeTable.title.onlineattachedresume') || 'Resume') as string,
      cell: (info) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {info.row.original.resume?.type === CV_TYPES.cvWebsite ? (
            <Tooltip title={t('savedResumeTable.title.onlineresume')} arrow>
              <FontAwesomeIcon icon={faFile} color="#441da0" size="xs" />
            </Tooltip>
          ) : (
            <Tooltip title={t('savedResumeTable.title.attachedresume')} arrow>
              <FontAwesomeIcon icon={faFilePdf} color="red" size="xs" />
            </Tooltip>
          )}
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {info.getValue() as string || (
              <span style={{ color: '#e0e0e0', fontStyle: 'italic', fontSize: 13 }}>
                {t('common.notUpdated')}
              </span>
            )}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'resume.userDict.fullName',
      header: (t('savedResumeTable.title.candidateName') || 'Candidate') as string,
    },
    {
      id: 'salary',
      header: (t('savedResumeTable.title.expectedSalary') || 'Salary') as string,
      cell: (info) => salaryString(info.row.original.resume?.salaryMin, info.row.original.resume?.salaryMax) || (
        <span style={{ color: '#e0e0e0', fontStyle: 'italic', fontSize: 13 }}>{t('common.notUpdated')}</span>
      ),
    },
    {
      accessorKey: 'resume.experience',
      header: (t('savedResumeTable.title.experience') || 'Experience') as string,
      cell: (info) => tConfig((allConfig as any)?.experienceDict?.[info.getValue() as string]) || (
        <span style={{ color: '#e0e0e0', fontStyle: 'italic', fontSize: 13 }}>{t('common.notUpdated')}</span>
      ),
    },
    {
      accessorKey: 'resume.city',
      header: (t('savedResumeTable.title.location') || 'Location') as string,
      cell: (info) => tConfig((allConfig as any)?.cityDict?.[info.getValue() as string]) || (
        <span style={{ color: '#e0e0e0', fontStyle: 'italic', fontSize: 13 }}>{t('common.notUpdated')}</span>
      ),
    },
    {
      accessorKey: 'createAt',
      header: (t('savedResumeTable.title.savedAt') || 'Saved At') as string,
      cell: (info) => dayjs(info.getValue() as string).format('DD/MM/YYYY'),
    },
    {
      id: 'actions',
      header: (t('savedResumeTable.title.actions') || 'Actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title={t('savedResumeTable.title.viewprofile')} arrow>
            <IconButton
              size="small"
              onClick={() => nav.push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, info.row.original.resume?.slug)}`)}
            >
              <RemoveRedEyeOutlinedIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            color="error"
            sx={{ textTransform: 'inherit', minWidth: 100 }}
            startIcon={<FavoriteIcon fontSize="small" />}
            onClick={() => handleUnsave(info.row.original.resume?.slug)}
          >
            {t('savedResumeTable.label.unsave')}
          </Button>
        </Stack>
      ),
    },
  ], [allConfig, handleUnsave, nav, t]);

  return (
    <DataTable
      columns={columns}
      data={rowsSafe}
      isLoading={isLoading}
      rowCount={props.count || 0}
      pagination={{
        pageIndex: props.page || 0,
        pageSize: props.rowsPerPage || 10,
      }}
      onPaginationChange={(pagination) => {
        if (props.handleChangePage && pagination.pageIndex !== props.page) {
          props.handleChangePage(null, pagination.pageIndex);
        }
        if (props.handleChangeRowsPerPage && pagination.pageSize !== props.rowsPerPage) {
          const event = { target: { value: String(pagination.pageSize) } } as React.ChangeEvent<HTMLInputElement>;
          props.handleChangeRowsPerPage?.(event);
        }
      }}
      emptyMessage={t('savedResumeTable.title.youhaventsavedanycandidatesyet')}
    />
  );
};

export default SavedResumeTable;
