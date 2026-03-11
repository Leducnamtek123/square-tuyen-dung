/*

MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.

*/

import React from 'react';

import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';

import { Button, IconButton, Stack, TableBody, TableCell, TableRow, Tooltip } from "@mui/material";

import FavoriteIcon from '@mui/icons-material/Favorite';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

import { CV_TYPES, SVG_IMAGES, ROUTES } from '../../../../configs/constants';

import NoDataCard from '../../../../components/NoDataCard';

import DataTableCustom from '../../../../components/DataTableCustom';

import { salaryString } from '../../../../utils/customData';

import { faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';

import { formatRoute } from '../../../../utils/funcUtils';

const SavedResumeTable = (props) => {

  const nav = useNavigate();

  const { rows, isLoading, handleUnsave } = props;
  const rowsSafe = Array.isArray(rows) ? rows : [];

  const { allConfig } = useSelector((state) => state.config);

  return (

    <DataTableCustom {...props}>
      <TableBody>
        {!isLoading && rowsSafe.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7}>
              <NoDataCard
                title="You haven't saved any candidates yet"
                imgComponentSgv={<SVG_IMAGES.ImageSvg12 />}
              />
            </TableCell>
          </TableRow>
        ) : (
          rowsSafe.map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row" padding="none">
                {row?.resume?.type === CV_TYPES.cvWebsite ? (
                  <Tooltip title="Online Resume" arrow>
                    <FontAwesomeIcon
                      icon={faFile}
                      style={{ marginRight: 1 }}
                      color="#441da0"
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Attached Resume" arrow>
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
                    Not updated
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
                    Not updated
                  </span>
                )}
              </TableCell>
              <TableCell align="left">
                {allConfig?.experienceDict[row?.resume?.experience] || (
                  <span
                    style={{
                      color: '#e0e0e0',
                      fontStyle: 'italic',
                      fontSize: 13,
                    }}
                  >
                    Not updated
                  </span>
                )}
              </TableCell>
              <TableCell align="left">
                {allConfig?.cityDict[row?.resume?.city] || (
                  <span
                    style={{
                      color: '#e0e0e0',
                      fontStyle: 'italic',
                      fontSize: 13,
                    }}
                  >
                    Not updated
                  </span>
                )}
              </TableCell>
              <TableCell align="left">
                {dayjs(row?.createAt).format('DD/MM/YYYY')}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="View profile" arrow>
                    <IconButton
                      aria-label="view"
                      size="small"
                      onClick={() =>
                        nav(
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
                    Unsave
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

