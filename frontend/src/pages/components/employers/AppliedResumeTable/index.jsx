/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  MenuItem,
  TableBody,
  TableCell,
  TextField,
  Tooltip,
  Typography,
  Button,
  IconButton,
  Stack,
  CircularProgress,
  Chip,
  Box,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { CV_TYPES, SVG_IMAGES, ROUTES } from '../../../../configs/constants';
import DataTableCustom from '../../../../components/DataTableCustom';
import { faFile, faFilePdf } from '@fortawesome/free-regular-svg-icons';
import NoDataCard from '../../../../components/NoDataCard';
import { convertEditorStateToHTMLString } from '../../../../utils/customData';
import SendMailCard from '../SendMailCard';
import BackdropLoading from '../../../../components/loading/BackdropLoading';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import { confirmModal, errorModal } from '../../../../utils/sweetalert2Modal';
import { formatRoute } from '../../../../utils/funcUtils';

const SendEmailComponent = ({
  jobPostActivityId,
  isSentEmail,
  email,
  fullName,
}) => {
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [openSendMailPopup, setOpenSendMailPopup] = React.useState(false);
  const [sendMailData, setSendMailData] = React.useState(null);
  const [sentEmail, setSentEmail] = React.useState(isSentEmail);

  const handleOpenSendMail = (email, fullName) => {
    setSendMailData({
      fullName: fullName,
      email: email,
    });
    setOpenSendMailPopup(true);
  };

  const handleSendEmail = (data) => {
    const sendEmail = async (id, data) => {
      setIsFullScreenLoading(true);
      try {
        await jobPostActivityService.sendEmail(id, data);

        if (!sentEmail) {
          setSentEmail(true);
        }
        setOpenSendMailPopup(false);
        toastMessages.success('Gửi email thành công.');
      } catch (error) {
        errorHandling(error);
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    let newData = {
      ...data,
      content: convertEditorStateToHTMLString(data.content),
    };
    // execute
    sendEmail(jobPostActivityId, newData);
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        color="secondary"
        sx={{ textTransform: 'inherit', width: 110 }}
        startIcon={
          sentEmail ? <MarkEmailReadRoundedIcon /> : <ForwardToInboxIcon />
        }
        onClick={() => handleOpenSendMail(email, fullName)}
      >
        {sentEmail ? 'Gửi lại' : 'Gửi email'}
      </Button>
      {/* Start: send mail */}
      <SendMailCard
        openPopup={openSendMailPopup}
        setOpenPopup={setOpenSendMailPopup}
        sendMailData={sendMailData}
        handleSendEmail={handleSendEmail}
      />
      {/* Start:  send mail */}
      {/* Start: full screen loading */}
      {isFullScreenLoading && <BackdropLoading />}
      {/* End: full screen loading */}
    </>
  );
};

const AppliedStatusComponent = ({
  options,
  defaultStatus,
  id,
  handleChangeApplicationStatus,
}) => {
  const { allConfig } = useSelector((state) => state.config);
  const [applyStatus, setApplyStatus] = React.useState(defaultStatus);

  const handleChangeValue = (e) => {
    const chooseValue = e.target.value;

    if (chooseValue < applyStatus) {
      errorModal(
        'Đã có lỗi',
        `Bạn không được phép chuyển trạng thái hồ sơ từ <strong style="color:red;">"${
          allConfig?.applicationStatusDict[applyStatus] || '---'
        }"</strong> sang <strong style="color:red;">"${
          allConfig?.applicationStatusDict[e.target.value] || '---'
        }"</strong>`
      );
    } else {
      confirmModal(
        () =>
          handleChangeApplicationStatus(id, chooseValue, (result) => {
            if (result) {
              setApplyStatus(chooseValue);
            }
          }),
        'Cập nhật trạng thái hồ sơ',
        `Hồ sơ sẽ được cập nhật sang trạng thái <strong style="color:red;">"${
          allConfig?.applicationStatusDict[e.target.value] || '---'
        }"</strong>. Bạn có chắc chắn?`,
        'question'
      );
    }
  };

  return (
    <TextField
      id="jobPostActivityStatus"
      size="small"
      fullWidth
      select
      value={applyStatus}
      onChange={handleChangeValue}
    >
      {options.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

const AIAnalysisComponent = ({ row }) => {
  const [status, setStatus] = React.useState(row.aiAnalysisStatus);
  const [score, setScore] = React.useState(row.aiAnalysisScore);

  const handleAnalyze = async () => {
    try {
      setStatus('processing');
      await jobPostActivityService.analyzeResume(row.id);
      toastMessages.success('Đã bắt đầu phân tích AI. Vui lòng chờ vài giây.');
    } catch (error) {
      errorHandling(error);
      setStatus('failed');
    }
  };

  if (status === 'completed') {
    return (
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Tóm tắt AI:
            </Typography>
            <Typography variant="body2">{row.aiAnalysisSummary}</Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}
            >
              Kỹ năng:
            </Typography>
            <Typography variant="body2">{row.aiAnalysisSkills || 'N/A'}</Typography>
          </Box>
        }
        arrow
      >
        <Chip
          icon={<PsychologyIcon />}
          label={`${score}%`}
          color={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error'}
          size="small"
          onClick={handleAnalyze}
          sx={{ fontWeight: 'bold' }}
        />
      </Tooltip>
    );
  }

  if (status === 'processing') {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={16} />
        <Typography variant="caption">Đang xử lý...</Typography>
      </Stack>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<AutoFixHighIcon />}
      onClick={handleAnalyze}
      sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
    >
      Phân tích
    </Button>
  );
};

const AppliedResumeTable = (props) => {
  const nav = useNavigate();
  const { rows, isLoading, handleChangeApplicationStatus, handleDelete } =
    props;
  const { allConfig } = useSelector((state) => state.config);

  return (
    <DataTableCustom {...props}>
      {!isLoading && rows.length === 0 ? (
        <TableBody>
          <TableCell colSpan={8}>
            <NoDataCard
              title="Chưa có ứng viên ứng tuyển"
              imgComponentSgv={<SVG_IMAGES.ImageSvg13 />}
            />
          </TableCell>
        </TableBody>
      ) : (
        rows.map((row, index) => {
          return (
            <TableBody key={row.id}>
              <TableCell component="th" scope="row" padding="none">
                <Typography sx={{ fontWeight: 'bold' }}>
                  {row?.fullName}
                </Typography>
                {row?.type === CV_TYPES.cvWebsite ? (
                  <Tooltip title="Hồ sơ Online" arrow>
                    <FontAwesomeIcon
                      icon={faFile}
                      style={{ marginRight: 1 }}
                      color="#441da0"
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Hồ sơ Đính kèm" arrow>
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
                    Chưa cập nhật
                  </span>
                )}{' '}
              </TableCell>
              <TableCell align="left">{row?.jobName}</TableCell>
              <TableCell align="left">
                {dayjs(row?.createAt).format('DD/MM/YYYY')}
              </TableCell>
              <TableCell align="left">
                {row?.type === CV_TYPES.cvWebsite
                  ? 'Hồ sơ Online'
                  : 'Hồ sơ đính kèm'}
              </TableCell>
              <TableCell align="center">
                <AIAnalysisComponent row={row} />
              </TableCell>
              <TableCell align="right">
                <AppliedStatusComponent
                  options={allConfig?.applicationStatusOptions || []}
                  defaultStatus={row?.status}
                  id={row?.id}
                  handleChangeApplicationStatus={handleChangeApplicationStatus}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Xem hồ sơ" arrow>
                    <IconButton
                      color="primary"
                      aria-label="view"
                      size="small"
                      onClick={() =>
                        nav(
                          `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, row?.resumeSlug)}`
                        )
                      }
                    >
                      <RemoveRedEyeOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa hồ sơ" arrow>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="delete"
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
            </TableBody>
          );
        })
      )}
    </DataTableCustom>
  );
};

export default AppliedResumeTable;
