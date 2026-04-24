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
    alpha,
    useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { tConfig } from '../../../../utils/tConfig';
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

import type { JobPostActivity } from '@/types/models';
import { useConfig } from '@/hooks/useConfig';
import { ROUTES, CV_TYPES } from '../../../../configs/constants';
import { formatRoute } from '@/utils/funcUtils';

import AIAnalysisDrawer, { AIAnalysisData } from '../AIAnalysisDrawer';
import SendEmailComponent from '../AppliedResumeTable/SendEmailComponent';
import pc from '@/utils/muiColors';

interface AppliedResumeKanbanProps {
    rows: JobPostActivity[];
    isLoading: boolean;
    handleChangeApplicationStatus: (id: string | number, value: string | number, callback: (result: boolean) => void) => void;
    handleDelete: (id: string | number) => void;
    onAnalysisStateChange?: (id: string | number, nextState: Pick<JobPostActivity, 'aiAnalysisStatus' | 'aiAnalysisProgress'>) => void;
}

const AppliedResumeKanban: React.FC<AppliedResumeKanbanProps> = ({ rows, isLoading, handleChangeApplicationStatus, handleDelete, onAnalysisStateChange }) => {
    const { t } = useTranslation(['employer', 'common']);
    const { allConfig } = useConfig();
    const nav = useRouter();
    const theme = useTheme();

    const [openDrawerId, setOpenDrawerId] = useState<string | number | null>(null);

    const statuses = useMemo(() => {
        return allConfig?.applicationStatusOptions || [];
    }, [allConfig]);

    // Group rows by status ID
    const columns = useMemo(() => {
        const board: Record<string, JobPostActivity[]> = {};
        statuses.forEach((status) => {
            if (status?.id != null) {
                board[String(status.id)] = [];
            }
        });

        rows.forEach((row) => {
            const statusKey = String(row.status || statuses[0]?.id || '1');
            if (!board[statusKey]) {
                board[statusKey] = [];
            }
            board[statusKey].push(row);
        });
        return board;
    }, [rows, statuses]);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newStatusId = destination.droppableId;
        const candidateId = draggableId;

        // Optimistically update or just trigger the API
        // In this implementation, the API triggers a refetch from Tanstack Query which will auto-update the UI.
        handleChangeApplicationStatus(candidateId, newStatusId, () => {
            // Callback fired after mutation. UI sync handled by react-query.
        });
    };

    const selectedActivityInfo = useMemo(() => {
        if (!openDrawerId) return null;
        return rows.find((r) => r.id === openDrawerId);
    }, [openDrawerId, rows]);

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
                    onAnalysisStateChange={(nextState) => {
                        if (!openDrawerId || !onAnalysisStateChange) return;
                        onAnalysisStateChange(openDrawerId, nextState);
                    }}
                    initialData={
                        {
                            ...selectedActivityInfo,
                            aiAnalysisSummary: selectedActivityInfo.aiAnalysisSummary ?? undefined,
                        } as AIAnalysisData
                    }
                />
            )}

            <Box sx={{ width: '100%', overflowX: 'auto', pb: 2, minHeight: '600px' }}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Stack direction="row" spacing={3} sx={{ minWidth: statuses.length * 320 + 'px', alignItems: 'flex-start' }}>
                        {statuses.map((status) => {
                            const safeStatusId = String(status.id);
                            const columnCount = columns[safeStatusId]?.length || 0;
                            return (
                                <Droppable key={safeStatusId} droppableId={safeStatusId}>
                                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            sx={{
                                                width: 320,
                                                bgcolor: snapshot.isDraggingOver ? pc.primary( 0.05) : 'background.neutral',
                                                borderRadius: 3,
                                                p: 2,
                                                border: '1px dashed',
                                                borderColor: snapshot.isDraggingOver ? 'primary.main' : 'divider',
                                                transition: 'all 0.2s',
                                                minHeight: 150,
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                                                    {tConfig(status.name as string)}
                                                </Typography>
                                                <Chip label={columnCount} size="small" sx={{ fontWeight: 900, bgcolor: 'background.paper', boxShadow: theme.customShadows?.z1 }} />
                                            </Stack>

                                            <Stack spacing={2}>
                                                {columns[safeStatusId]?.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                                            (() => {
                                                                const resumeType = item.type || item.resume?.type;
                                                                const isOnlineResume = resumeType === CV_TYPES.cvWebsite;
                                                                return (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                elevation={snapshot.isDragging ? 8 : 0}
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: 2,
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    bgcolor: snapshot.isDragging ? 'background.paper' : 'background.paper',
                                                                    boxShadow: snapshot.isDragging ? theme.customShadows?.z24 : theme.customShadows?.z1,
                                                                    transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                                                    transition: snapshot.isDragging ? 'none' : 'transform 0.2s',
                                                                }}
                                                            >
                                                                <Stack spacing={1.5}>
                                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                        <Typography variant="subtitle2" fontWeight={800}>
                                                                            {item.fullName}
                                                                        </Typography>
                                                                        <Chip 
                                                                            label={isOnlineResume ? 'Online' : 'File'} 
                                                                            size="small" 
                                                                            sx={{ height: 20, fontSize: '10px', fontWeight: 800, bgcolor: isOnlineResume ? pc.primary( 0.1) : pc.error( 0.1), color: isOnlineResume ? 'primary.main' : 'error.main' }}
                                                                        />
                                                                    </Stack>
                                                                    
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }} noWrap>
                                                                        {item.jobName || 'N/A'}
                                                                    </Typography>

                                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                                                        {dayjs(item.createAt).format('DD/MM/YYYY HH:mm')}
                                                                    </Typography>

                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" pt={1} sx={{ borderTop: '1px dashed', borderColor: 'divider' }}>
                                                                         <Box>
                                                                            <Tooltip title={t('appliedResume.table.aiAnalysis')} arrow>
                                                                                <IconButton 
                                                                                    size="small" 
                                                                                    onClick={() => setOpenDrawerId(item.id)}
                                                                                    sx={{ color: item.aiAnalysisStatus === 'completed' ? 'warning.main' : 'text.disabled' }}
                                                                                >
                                                                                    <AutoAwesomeIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                         </Box>
                                                                         <Stack direction="row" spacing={0.5}>
                                                                             <Tooltip title={t('appliedResume.table.tooltips.view')} arrow>
                                                                                <IconButton size="small" onClick={() => nav.push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, item.resumeSlug || item.resume?.slug || '')}`)}>
                                                                                    <RemoveRedEyeIcon fontSize="small" />
                                                                                </IconButton>
                                                                             </Tooltip>
                                                                             <Tooltip title={t('appliedResume.table.tooltips.scheduleInterview', 'Schedule Interview')} arrow>
                                                                                 <IconButton size="small" onClick={() => nav.push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}/create?candidate=${item.userId ?? ''}&jobPost=${item.jobPost?.id ?? ''}`)}>
                                                                                     <EventIcon fontSize="small" sx={{ color: 'info.main' }} />
                                                                                 </IconButton>
                                                                             </Tooltip>
                                                                             <SendEmailComponent jobPostActivityId={String(item.id)} isSentEmail={item.isSentEmail || false} email={item.email || ''} fullName={item.fullName || ''} />
                                                                             <Tooltip title={t('appliedResume.table.tooltips.delete')} arrow>
                                                                                <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                                                                                    <DeleteIcon fontSize="small" />
                                                                                </IconButton>
                                                                             </Tooltip>
                                                                         </Stack>
                                                                    </Stack>
                                                                </Stack>
                                                            </Card>
                                                                );
                                                            })()
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </Stack>
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