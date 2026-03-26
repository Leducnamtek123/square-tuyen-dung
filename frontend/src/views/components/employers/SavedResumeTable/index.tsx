import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useTranslation } from 'react-i18next';

import { useRouter } from 'next/navigation';

import dayjs from 'dayjs';

import { Button, IconButton, Stack, TableBody, TableCell, TableRow, Tooltip } from "@mui/material";

import FavoriteIcon from '@mui/icons-material/Favorite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

import {CV_TYPES, ROUTES} from '../../../../configs/constants';

import NoDataCard from '../../../../components/Common/NoDataCard';

import DataTableCustom from '../../../../components/Common/DataTableCustom';

import { salaryString } from '../../../../utils/customData';

import { faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';

import { formatRoute } from '../../../../utils/funcUtils';
import { tConfig } from '../../../../utils/tConfig';

interface SavedResumeTableProps {
  rows: any[];
  isLoading: boolean;
  handleUnsave: (slug: string) => void;
  [key: string]: any;
}

const SavedResumeTable: React.FC<SavedResumeTableProps> = (props) => {

  const { t } = useTranslation('employer');

  const nav = useRouter();

  const { rows, isLoading, handleUnsave } = props;

  const rowsSafe = Array.isArray(rows) ? rows : [];

  const { allConfig } = useAppSelector((state) => state.config);

  return (

    <DataTableCustom {...props}>

      <TableBody>

        {!isLoading && rowsSafe.length === 0 ? (

          <TableRow>

            <TableCell colSpan={7}>

              <NoDataCard

                title={t('savedResumeTable.title.youhaventsavedanycandidatesyet')}

                svgKey="ImageSvg12"

              />

            </TableCell>

          </TableRow>

        ) : (

          rowsSafe.map((row: any) => (

            <TableRow key={row.id}>

              <TableCell component="th" scope="row" padding="none">

                {row?.resume?.type === CV_TYPES.cvWebsite ? (

                  <Tooltip title={t('savedResumeTable.title.onlineresume')} arrow>

                    <FontAwesomeIcon

                      icon={faFile}

                      style={{ marginRight: 1 }}

                      color="#441da0"

                    />

                  </Tooltip>

                ) : (

                  <Tooltip title={t('savedResumeTable.title.attachedresume')} arrow>

                    <FontAwesomeIcon

                      icon={faFilePdf}

                      style={{ marginRight: 1 }}

                      color="red"

                    />

                  </Tooltip>

                )}{' '}

                {row?.resume?.title || (

                  <span

                    style={{

                      color: '#e0e0e0',

                      fontStyle: 'italic',

                      fontSize: 13,

                    }}

                  >

                    {t('common.notUpdated')}

                  </span>

                )}{' '}

              </TableCell>

              <TableCell align="left">

                {row?.resume?.userDict?.fullName}

              </TableCell>

              <TableCell align="left">

                {salaryString(

                  row?.resume?.salaryMin,

                  row?.resume?.salaryMax

                ) || (

                  <span

                    style={{

                      color: '#e0e0e0',

                      fontStyle: 'italic',

                      fontSize: 13,

                    }}

                  >

                    {t('common.notUpdated')}

                  </span>

                )}

              </TableCell>

              <TableCell align="left">

                {tConfig(allConfig?.experienceDict[row?.resume?.experience]) || (

                  <span

                    style={{

                      color: '#e0e0e0',

                      fontStyle: 'italic',

                      fontSize: 13,

                    }}

                  >

                    {t('common.notUpdated')}

                  </span>

                )}

              </TableCell>

              <TableCell align="left">

                {tConfig(allConfig?.cityDict[row?.resume?.city]) || (

                  <span

                    style={{

                      color: '#e0e0e0',

                      fontStyle: 'italic',

                      fontSize: 13,

                    }}

                  >

                    {t('common.notUpdated')}

                  </span>

                )}

              </TableCell>

              <TableCell align="left">

                {dayjs(row?.createAt).format('DD/MM/YYYY')}

              </TableCell>

              <TableCell align="right">

                <Stack direction="row" spacing={1} justifyContent="flex-end">

                  <Tooltip title={t('savedResumeTable.title.viewprofile')} arrow>

                    <IconButton

                      aria-label={t('savedResumeTable.label.view')}

                      size="small"

                      onClick={() =>

                        nav.push(

                          `/${formatRoute(

                            ROUTES.EMPLOYER.PROFILE_DETAIL,

                            row?.resume?.slug

                          )}`

                        )

                      }

                    >

                      <RemoveRedEyeOutlinedIcon fontSize="small" color="primary" />

                    </IconButton>

                  </Tooltip>

                  <Button

                    size="small"

                    variant="outlined"

                    color="error"

                    sx={{ textTransform: 'inherit', width: 110 }}

                    startIcon={<FavoriteIcon />}

                    onClick={() => handleUnsave(row?.resume?.slug)}

                  >

                    {t('savedResumeTable.label.unsave')}

                  </Button>

                </Stack>

              </TableCell>

            </TableRow>

          ))

        )}

      </TableBody>

    </DataTableCustom>

  );

};

export default SavedResumeTable;
