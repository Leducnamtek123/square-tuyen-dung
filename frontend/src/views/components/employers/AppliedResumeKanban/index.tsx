'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Typography,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Button,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { tConfig } from '../../../../utils/tConfig';
import { errorModal } from '../../../../utils/sweetalert2Modal';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AddIcon from '@mui/icons-material/Add';

import type { JobPostActivity } from '@/types/models';
import { useConfig } from '@/hooks/useConfig';
import { ROUTES, CV_TYPES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { openExternalUrlSafely } from '@/utils/safeExternalUrl';
import { canTransitionApplicationStatus } from '../applicationStatusTransitions';

import AIAnalysisDrawer, { AIAnalysisData } from '../AIAnalysisDrawer';
import SendEmailComponent from '../AppliedResumeTable/SendEmailComponent';
import { getAppliedResumeJobPostId } from '../appliedResumeUtils';

interface AppliedResumeKanbanProps {
  rows: JobPostActivity[];
  isLoading: boolean;
  handleChangeApplicationStatus: (
    id: string | number,
    value: string | number,
    callback: (result: boolean) => void
  ) => void;
  handleDelete: (id: string | number) => void;
  onCreateEmployee?: (activity: JobPostActivity) => void;
  onAnalysisStateChange?: (id: string | number, nextState: Partial<JobPostActivity>) => void;
  onAddCandidate?: () => void;
  blindMode?: boolean;
}

const getInitials = (name?: string) => {
  if (!name) return 'NV';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getStatusStyle = (statusId: string) => {
  switch (statusId) {
    case '1': // Chờ xác nhận
      return {
        badgeBg: '#FEF3C7',
        textColor: '#D97706',
        borderColor: '#FDE68A',
        icon: <AccessTimeIcon sx={{ fontSize: 28, color: '#D97706' }} />,
      };
    case '2': // Đã liên hệ
      return {
        badgeBg: '#D1FAE5',
        textColor: '#059669',
        borderColor: '#A7F3D0',
        icon: <PhoneInTalkIcon sx={{ fontSize: 28, color: '#059669' }} />,
      };
    case '3': // Đã làm bài test
      return {
        badgeBg: '#DBEAFE',
        textColor: '#2563EB',
        borderColor: '#BFDBFE',
        icon: <AssignmentOutlinedIcon sx={{ fontSize: 28, color: '#2563EB' }} />,
      };
    case '4': // Đã phòng vấn
      return {
        badgeBg: '#F3E8FF',
        textColor: '#7C3AED',
        borderColor: '#E9D5FF',
        icon: <PeopleAltOutlinedIcon sx={{ fontSize: 28, color: '#7C3AED' }} />,
      };
    case '5': // Đã tuyển dụng
      return {
        badgeBg: '#FEE2E2',
        textColor: '#DC2626',
        borderColor: '#FECACA',
        icon: <WorkOutlineIcon sx={{ fontSize: 28, color: '#DC2626' }} />,
      };
    default:
      return {
        badgeBg: '#F1F5F9',
        textColor: '#475467',
        borderColor: '#E2E8F0',
        icon: <AssignmentOutlinedIcon sx={{ fontSize: 28, color: '#475467' }} />,
      };
  }
};

const AppliedResumeKanban: React.FC<AppliedResumeKanbanProps> = ({
  rows,
  isLoading,
  handleChangeApplicationStatus,
  handleDelete,
  onCreateEmployee,
  onAnalysisStateChange,
  onAddCandidate,
  blindMode = false,
}) => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();
  const { push } = useRouter();

  const [localRows, setLocalRows] = useState<JobPostActivity[]>(rows);

  React.useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const [openDrawerId, setOpenDrawerId] = useState<string | number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileSelectedStatus, setMobileSelectedStatus] = useState<string>('');

  const statuses = useMemo(() => {
    return allConfig?.applicationStatusOptions || [];
  }, [allConfig]);

  React.useEffect(() => {
    if (statuses.length > 0 && !mobileSelectedStatus) {
      setMobileSelectedStatus(String(statuses[0].id));
    }
  }, [statuses, mobileSelectedStatus]);

  const displayedStatuses = useMemo(() => {
    if (isMobile && mobileSelectedStatus) {
      const match = statuses.find((s) => String(s.id) === mobileSelectedStatus);
      return match ? [match] : statuses.slice(0, 1);
    }
    return statuses;
  }, [isMobile, mobileSelectedStatus, statuses]);

  // Group rows by status ID
  const columns = useMemo(() => {
    const board: Record<string, JobPostActivity[]> = {};
    statuses.forEach((status) => {
      if (status?.id != null) {
        board[String(status.id)] = [];
      }
    });

    (localRows || []).forEach((row) => {
      const statusKey = String(row.status || statuses[0]?.id || '1');
      if (!board[statusKey]) {
        board[statusKey] = [];
      }
      board[statusKey].push(row);
    });
    return board;
  }, [localRows, statuses]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatusId = destination.droppableId;
    const candidateId = draggableId;
    const currentStatusId = Number(source.droppableId);
    const nextStatusId = Number(newStatusId);

    if (!canTransitionApplicationStatus(currentStatusId, nextStatusId)) {
      errorModal(
        t('appliedResume.status.errorTitle'),
        t('appliedResume.status.errorMsg', {
          fromStatus: tConfig(allConfig?.applicationStatusDict?.[currentStatusId]) || '---',
          toStatus: tConfig(allConfig?.applicationStatusDict?.[nextStatusId]) || '---',
        })
      );
      return;
    }

    // Optimistic local state update
    const previousRows = [...localRows];
    setLocalRows((prev) =>
      prev.map((item) =>
        String(item.id) === String(candidateId)
          ? { ...item, status: Number(newStatusId) }
          : item
      )
    );

    handleChangeApplicationStatus(candidateId, newStatusId, (success: boolean) => {
      if (!success) {
        // Rollback to original state on failure
        setLocalRows(previousRows);
        errorModal(
          t('appliedResume.status.errorTitle', 'Cập nhật thất bại'),
          t('appliedResume.status.rollbackMsg', 'Không thể cập nhật trạng thái ứng viên. Đã khôi phục vị trí ban đầu.')
        );
      }
    });
  };

  const selectedActivityInfo = useMemo(() => {
    if (!openDrawerId) return null;
    return rows.find((r) => r.id === openDrawerId);
  }, [openDrawerId, rows]);

  const handleDrawerAnalysisStateChange = React.useCallback(
    (nextState: Partial<JobPostActivity>) => {
      if (!openDrawerId || !onAnalysisStateChange) return;
      onAnalysisStateChange(openDrawerId, nextState);
    },
    [openDrawerId, onAnalysisStateChange]
  );

  if (isLoading) {
    return <LinearProgress sx={{ my: 4, borderRadius: 2 }} />;
  }

  return (
    <>
      {openDrawerId && selectedActivityInfo && (
        <AIAnalysisDrawer
          open={Boolean(openDrawerId)}
          onClose={() => setOpenDrawerId(null)}
          activityId={openDrawerId}
          onAnalysisStateChange={handleDrawerAnalysisStateChange}
          initialData={
            {
              ...selectedActivityInfo,
              aiAnalysisSummary: selectedActivityInfo.aiAnalysisSummary ?? undefined,
            } as AIAnalysisData
          }
        />
      )}

      {/* Mobile Status Tabs Switcher */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        <Tabs
          value={mobileSelectedStatus || (statuses[0]?.id ? String(statuses[0].id) : false)}
          onChange={(_, val) => setMobileSelectedStatus(String(val))}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderRadius: '12px',
              mr: 1,
              px: 1.5,
              py: 0.5,
            },
          }}
        >
          {statuses.map((status) => {
            const count = columns[String(status.id)]?.length || 0;
            return (
              <Tab
                key={String(status.id)}
                value={String(status.id)}
                label={`${tConfig(status.name as string)} (${count})`}
              />
            );
          })}
        </Tabs>
      </Box>

      <Box sx={{ width: '100%', overflowX: isMobile ? 'visible' : 'auto', pb: 2, minHeight: '500px' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Stack
            direction="row"
            spacing={2.5}
            sx={{
              minWidth: { xs: '100%', md: statuses.length * 320 + 'px' },
              alignItems: 'flex-start',
            }}
          >
            {displayedStatuses.map((status) => {
              const safeStatusId = String(status.id);
              const columnCount = columns[safeStatusId]?.length || 0;
              const statusStyle = getStatusStyle(safeStatusId);

              return (
                <Droppable key={safeStatusId} droppableId={safeStatusId}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        width: { xs: '100%', md: 320 },
                        bgcolor: snapshot.isDraggingOver ? '#F1F5F9' : '#F8FAFC',
                        borderRadius: '16px',
                        p: 2,
                        border: '1px solid',
                        borderColor: snapshot.isDraggingOver ? '#2563EB' : '#E2E8F0',
                        transition: 'all 0.2s ease',
                        minHeight: 280,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Column Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                          {tConfig(status.name as string)}
                        </Typography>

                        <Chip
                          label={columnCount}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: statusStyle.badgeBg,
                            color: statusStyle.textColor,
                            borderRadius: '12px',
                            height: '22px',
                            fontSize: '12px',
                            px: 0.5,
                          }}
                        />
                      </Stack>

                      {/* Cards Container */}
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        {columnCount === 0 ? (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              py: 6,
                              px: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                bgcolor: statusStyle.badgeBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                              }}
                            >
                              {statusStyle.icon}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#64748B',
                                fontWeight: 500,
                                textAlign: 'center',
                                fontSize: '13px',
                              }}
                            >
                              Chưa có ứng viên ở trạng thái này
                            </Typography>
                          </Box>
                        ) : (
                          columns[safeStatusId]?.map((item, index) => (
                            <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                              {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => {
                                const resumeType = item.type || item.resume?.type;
                                const detailSlug = item.resumeSlug || item.resume?.slug || '';
                                const isManualCandidate = Boolean(item.isManualCandidate);
                                const isOnlineResume = resumeType === CV_TYPES.cvWebsite;
                                const jobPostId = getAppliedResumeJobPostId(item);
                                const canScheduleInterview =
                                  !blindMode && Boolean(item.userId) && Boolean(jobPostId);
                                const detailHref = detailSlug
                                  ? localizeRoutePath(
                                      `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, detailSlug)}`,
                                      i18n.language
                                    )
                                  : undefined;
                                const scheduleHref = canScheduleInterview
                                  ? localizeRoutePath(
                                      `/${ROUTES.EMPLOYER.INTERVIEW_CREATE}?candidate=${item.userId}&jobPost=${jobPostId}`,
                                      i18n.language
                                    )
                                  : undefined;

                                return (
                                  <Card
                                    ref={providedDraggable.innerRef}
                                    {...providedDraggable.draggableProps}
                                    {...providedDraggable.dragHandleProps}
                                    style={providedDraggable.draggableProps.style as React.CSSProperties}
                                    elevation={0}
                                    sx={{
                                      p: '16px',
                                      borderRadius: '14px',
                                      border: '1px solid #E7ECF3',
                                      bgcolor: '#FFFFFF',
                                      boxShadow: snapshotDraggable.isDragging
                                        ? '0 12px 32px rgba(16, 24, 40, 0.15)'
                                        : '0 4px 16px rgba(16, 24, 40, 0.06)',
                                      transform: snapshotDraggable.isDragging ? 'rotate(2deg)' : 'none',
                                      transition: snapshotDraggable.isDragging
                                        ? 'none'
                                        : 'all 0.2s ease',
                                      '&:hover': {
                                        borderColor: '#CBD5E1',
                                        boxShadow: '0 8px 24px rgba(16, 24, 40, 0.1)',
                                      },
                                    }}
                                  >
                                    <Stack spacing={1.5}>
                                      {/* Top Row: Avatar Initials + Name + Source Badge */}
                                      <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                          sx={{
                                            width: 38,
                                            height: 38,
                                            bgcolor: '#E0E7FF',
                                            color: '#3730A3',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                          }}
                                        >
                                          {getInitials(item.fullName)}
                                        </Avatar>

                                        <Box flex={1} minWidth={0}>
                                          <Typography
                                            fontWeight={700}
                                            fontSize="14px"
                                            color="#0F172A"
                                            noWrap
                                          >
                                            {item.fullName || 'Ứng viên'}
                                          </Typography>
                                          <Chip
                                            label={
                                              isManualCandidate
                                                ? t('manualCandidate.badge')
                                                : isOnlineResume
                                                ? t('appliedResume.table.onlineResume')
                                                : t('appliedResume.table.attachedResume')
                                            }
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: '10px',
                                              fontWeight: 600,
                                              mt: 0.25,
                                              bgcolor: isManualCandidate
                                                ? '#F3E8FF'
                                                : isOnlineResume
                                                ? '#EFF6FF'
                                                : '#E6F4EA',
                                              color: isManualCandidate
                                                ? '#7C3AED'
                                                : isOnlineResume
                                                ? '#1D4ED8'
                                                : '#137333',
                                              borderRadius: '6px',
                                            }}
                                          />
                                        </Box>
                                      </Stack>

                                      {/* Applied Position */}
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: '#1E293B',
                                          fontWeight: 700,
                                          fontSize: '13px',
                                          mt: 0.5,
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {item.jobName || 'N/A'}
                                      </Typography>

                                      {/* Applied Date */}
                                      <Stack direction="row" spacing={0.75} alignItems="center">
                                        <CalendarMonthOutlinedIcon
                                          sx={{ fontSize: 15, color: '#64748B' }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}
                                        >
                                          {dayjs(item.createAt).format('DD/MM/YYYY HH:mm')}
                                        </Typography>
                                      </Stack>

                                      {/* Action Bar */}
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        pt={1.25}
                                        mt={0.5}
                                        sx={{ borderTop: '1px solid #F1F5F9' }}
                                      >
                                        <Tooltip title={t('appliedResume.table.aiAnalysis')} arrow>
                                          <IconButton aria-label="Thao tác"
                                            size="small"
                                            onClick={() => setOpenDrawerId(item.id)}
                                            sx={{
                                              color:
                                                item.aiAnalysisStatus === 'completed'
                                                  ? '#F59E0B'
                                                  : '#94A3B8',
                                              '&:hover': { bgcolor: '#FEF3C7' },
                                            }}
                                          >
                                            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                                          </IconButton>
                                        </Tooltip>

                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <Tooltip title={t('appliedResume.table.tooltips.view')} arrow>
                                            <span>
                                              <IconButton aria-label="Xem chi tiết"
                                                size="small"
                                                disabled={blindMode || !detailSlug}
                                                onClick={() => {
                                                  if (blindMode || !detailHref) return;
                                                  push(detailHref);
                                                }}
                                                sx={{
                                                  color: '#64748B',
                                                  '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' },
                                                }}
                                              >
                                                <RemoveRedEyeIcon sx={{ fontSize: 18 }} />
                                              </IconButton>
                                            </span>
                                          </Tooltip>

                                          <Tooltip
                                            title={t('appliedResume.table.tooltips.scheduleInterview')}
                                            arrow
                                          >
                                            <span>
                                              <IconButton aria-label="Xem chi tiết"
                                                size="small"
                                                disabled={!canScheduleInterview}
                                                onClick={() => {
                                                  if (!scheduleHref) return;
                                                  push(scheduleHref);
                                                }}
                                                sx={{
                                                  color: '#2563EB',
                                                  '&:hover': { bgcolor: '#EFF6FF' },
                                                }}
                                              >
                                                <EventIcon sx={{ fontSize: 18 }} />
                                              </IconButton>
                                            </span>
                                          </Tooltip>

                                          {!blindMode && (
                                            <SendEmailComponent
                                              jobPostActivityId={String(item.id)}
                                              isSentEmail={item.isSentEmail || false}
                                              email={item.email || ''}
                                              fullName={item.fullName || ''}
                                            />
                                          )}

                                          {!blindMode && item.hrmEmployeeId ? (
                                            <Tooltip title={t('employees.hrm.convert.openEmployee')} arrow>
                                              <IconButton aria-label="Thao tác"
                                                size="small"
                                                onClick={() => {
                                                  if (item.hrmEmployeeUrl) {
                                                    openExternalUrlSafely(item.hrmEmployeeUrl);
                                                  }
                                                }}
                                                sx={{
                                                  color: '#10B981',
                                                  '&:hover': { bgcolor: '#D1FAE5' },
                                                }}
                                              >
                                                <PersonAddAltIcon sx={{ fontSize: 18 }} />
                                              </IconButton>
                                            </Tooltip>
                                          ) : (
                                            !blindMode &&
                                            [4, 5].includes(Number(item.status)) &&
                                            onCreateEmployee && (
                                              <Tooltip
                                                title={t('employees.hrm.convert.action')}
                                                arrow
                                              >
                                                <IconButton aria-label="Thao tác"
                                                  size="small"
                                                  onClick={() => onCreateEmployee(item)}
                                                  sx={{
                                                    color: '#10B981',
                                                    '&:hover': { bgcolor: '#D1FAE5' },
                                                  }}
                                                >
                                                  <PersonAddAltIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                              </Tooltip>
                                            )
                                          )}

                                          <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
                                            <IconButton aria-label="Thao tác"
                                              size="small"
                                              onClick={() => handleDelete(item.id)}
                                              sx={{
                                                color: '#EF4444',
                                                '&:hover': { bgcolor: '#FEE2E2' },
                                              }}
                                            >
                                              <DeleteIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                          </Tooltip>
                                        </Stack>
                                      </Stack>
                                    </Stack>
                                  </Card>
                                );
                              }}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </Stack>

                      {/* Column Footer Action Button */}
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        onClick={() => onAddCandidate?.()}
                        sx={{
                          width: '100%',
                          height: '38px',
                          mt: 2,
                          borderRadius: '10px',
                          borderColor: '#E2E8F0',
                          bgcolor: '#FFFFFF',
                          color: '#2563EB',
                          fontSize: '13px',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#EFF6FF',
                            borderColor: '#BFDBFE',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        {columnCount > 0 ? t('common:viewMore', 'Xem thêm') : t('employer:manualCandidate.actions.add', 'Thêm ứng viên')}
                      </Button>
                    </Box>
                  )}
                </Droppable>
              );
            })}
          </Stack>
        </DragDropContext>
      </Box>
    </>
  );
};

export default AppliedResumeKanban;
