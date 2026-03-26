import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { TableBody, TableCell, TableRow, Tooltip, Typography, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import AIAnalysisDrawer from '../AIAnalysisDrawer';
import { CV_TYPES, ROUTES } from '../../../../configs/constants';
import DataTableCustom from '../../../../components/Common/DataTableCustom';
import { faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';
import NoDataCard from '../../../../components/Common/NoDataCard';
import { formatRoute } from '../../../../utils/funcUtils';

import SendEmailComponent from './SendEmailComponent';
import AppliedStatusComponent from './AppliedStatusComponent';
import AIAnalysisComponent from './AIAnalysisComponent';
import { useConfig } from '@/hooks/useConfig';

interface AppliedResumeTableProps {
  rows: any[];
  isLoading: boolean;
  handleChangeApplicationStatus: (id: string, value: any, callback: (result: boolean) => void) => void;
  handleDelete: (id: string) => void;
  [key: string]: any;
}

const AppliedResumeTable: React.FC<AppliedResumeTableProps> = (props) => {
  const { t } = useTranslation(['employer', 'common']);
  const nav = useRouter();
  const { rows, isLoading, handleChangeApplicationStatus, handleDelete } = props;
  const rowsSafe = Array.isArray(rows) ? rows : [];
  const { allConfig } = useConfig();
  const [openDrawerId, setOpenDrawerId] = React.useState<string | number | null>(null);

  const selectedActivityInfo = React.useMemo(() => {
    if (!openDrawerId) return null;
    return rowsSafe.find(r => r.id === openDrawerId);
  }, [openDrawerId, rowsSafe]);

  return (
    <>
      <AIAnalysisDrawer
        open={Boolean(openDrawerId)}
        onClose={() => setOpenDrawerId(null)}
        activityId={openDrawerId}
        initialData={selectedActivityInfo}
      />
      <DataTableCustom {...props}>
        <TableBody>
          {!isLoading && rowsSafe.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <NoDataCard
                  title={t('appliedResume.table.noCandidates')}
                  svgKey="ImageSvg13"
                />
              </TableCell>
            </TableRow>
          ) : (
            rowsSafe.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row" padding="none">
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {row?.fullName}
                  </Typography>
                  {row?.type === CV_TYPES.cvWebsite ? (
                    <Tooltip title={t('appliedResume.table.onlineResume')} arrow>
                      <FontAwesomeIcon
                        icon={faFile}
                        style={{ marginRight: 1 }}
                        color="#441da0"
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('appliedResume.table.attachedResume')} arrow>
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        style={{ marginRight: 1 }}
                        color="red"
                      />
                    </Tooltip>
                  )}{' '}
                  {row?.title || (
                    <span
                      style={{
                        color: '#e0e0e0',
                        fontStyle: 'italic',
                        fontSize: 13,
                      }}
                    >
                      {t('appliedResume.table.notUpdated')}
                    </span>
                  )}{' '}
                </TableCell>
                <TableCell align="left">{row?.jobName}</TableCell>
                <TableCell align="left">
                  {dayjs(row?.createAt).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell align="left">
                  {row?.type === CV_TYPES.cvWebsite
                    ? t('appliedResume.table.onlineResume')
                    : t('appliedResume.table.attachedResume')}
                </TableCell>
                <TableCell align="center">
                  <AIAnalysisComponent row={row} onOpenDrawer={() => setOpenDrawerId(row.id)} />
                </TableCell>
                <TableCell align="right">
                  <AppliedStatusComponent
                    options={(allConfig?.applicationStatusOptions as any[]) || []}
                    defaultStatus={row?.status}
                    id={row?.id}
                    handleChangeApplicationStatus={handleChangeApplicationStatus}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('appliedResume.table.tooltips.view')} arrow>
                      <IconButton
                        color="primary"
                        aria-label={t('sendEmailComponent.label.view', 'view')}
                        size="small"
                        onClick={() =>
                          nav.push(
                            `/${formatRoute(
                              ROUTES.EMPLOYER.PROFILE_DETAIL,
                              row?.resumeSlug
                            )}`
                          )
                        }
                      >
                        <RemoveRedEyeOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('sendEmailComponent.label.delete', 'delete')}
                        onClick={() => handleDelete(row?.id)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <SendEmailComponent
                      jobPostActivityId={row.id}
                      isSentEmail={row?.isSentEmail}
                      email={row?.email}
                      fullName={row?.fullName}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </DataTableCustom>
    </>
  );
};

export default AppliedResumeTable;
