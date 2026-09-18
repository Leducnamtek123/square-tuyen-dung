'use client';

import React, { useContext, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import type { OperationPayload } from './types';
import { OperationContext } from './OperationProvider';

export interface OperationCenterDockProps {
  className?: string;
  operations?: Record<string, OperationPayload>;
  activeOperations?: OperationPayload[];
  onDismissOperation?: (id: string) => void;
  onClearCompleted?: () => void;
  onOpenDetail?: (id: string) => void;
  defaultExpanded?: boolean;
}

export const OperationCenterDock: React.FC<OperationCenterDockProps> = (props) => {
  const { className, defaultExpanded = false } = props;
  const theme = useTheme();
  const context = useContext(OperationContext);

  const operations = props.operations ?? context?.operations ?? {};
  const activeOperations = props.activeOperations ?? context?.activeOperations ?? [];
  const onDismissOperation = props.onDismissOperation ?? context?.dismissOperation;
  const onClearCompleted = props.onClearCompleted ?? context?.clearCompletedOperations;
  const onOpenDetail = props.onOpenDetail ?? context?.openOperationDetail;

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  // If no active operations exist, hide the dock
  if (activeOperations.length === 0) {
    return null;
  }

  const allOps = Object.values(operations);
  const displayList = allOps.length > 0 ? allOps : activeOperations;

  const hasCompletedOrFailed = displayList.some(
    (op) => op.status === 'completed' || op.status === 'failed' || op.status === 'cancelled'
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
      }}
      className={className}
    >
      {!expanded ? (
        /* Collapsed Mode: Pill Badge */
        <Paper
          elevation={4}
          component="button"
          onClick={() => setExpanded(true)}
          aria-label="Mở trung tâm tác vụ"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.25,
            py: 1.25,
            borderRadius: '9999px',
            border: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(37, 99, 235, 0.2)'
            }`,
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(15, 23, 42, 0.85)'
                : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            color: 'text.primary',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8],
              borderColor: '#2563EB',
            },
          }}
        >
          <CircularProgress
            size={18}
            thickness={4.5}
            sx={{
              color: '#2563EB',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {activeOperations.length} tác vụ đang chạy...
          </Typography>
        </Paper>
      ) : (
        /* Expanded Mode: Floating Tray Card */
        <Paper
          elevation={8}
          sx={{
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxWidth: 400,
            maxHeight: 480,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.08)'
            }`,
            bgcolor: 'background.paper',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 20px 40px -15px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.1)'
                : '0 20px 40px -15px rgba(0,0,0,0.15), 0 0 1px 1px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                }}
              >
                Trung tâm tác vụ (Operation Center)
              </Typography>
              <Chip
                label={activeOperations.length}
                size="small"
                color="primary"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  px: 0.5,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {hasCompletedOrFailed && onClearCompleted && (
                <Button
                  size="small"
                  variant="text"
                  onClick={onClearCompleted}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1,
                    py: 0.25,
                  }}
                >
                  Xóa đã xong
                </Button>
              )}
              <IconButton
                size="small"
                aria-label="Thu gọn"
                onClick={() => setExpanded(false)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
              >
                <KeyboardArrowDownRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Operation List */}
          <Box
            sx={{
              overflowY: 'auto',
              maxHeight: 380,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {displayList.map((op) => {
              const isRunning = op.status === 'running';
              const isQueued = op.status === 'queued';
              const isCompleted = op.status === 'completed';
              const isFailed = op.status === 'failed';
              const isCancelled = op.status === 'cancelled';

              const currentStep =
                op.steps?.find((s) => s.key === op.currentStepKey) ||
                op.steps?.find((s) => s.status === 'running') ||
                op.steps?.[0];

              const stepText =
                currentStep?.label ||
                (isRunning
                  ? 'Đang thực hiện...'
                  : isCompleted
                  ? 'Hoàn tất'
                  : isFailed
                  ? op.error?.message || 'Thất bại'
                  : isCancelled
                  ? 'Đã hủy'
                  : 'Đang chờ...');

              return (
                <Box
                  key={op.id}
                  sx={{
                    p: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.01)',
                    },
                  }}
                >
                  {/* Top row: Icon + Title + Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    {/* Status icon */}
                    <Box
                      sx={{
                        mt: 0.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isRunning && (
                        <CircularProgress size={16} thickness={4.5} sx={{ color: '#2563EB' }} />
                      )}
                      {isQueued && (
                        <CircularProgress size={16} thickness={4.5} sx={{ color: '#94A3B8' }} />
                      )}
                      {isCompleted && (
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#10B981' }} />
                      )}
                      {isFailed && <ErrorRoundedIcon sx={{ fontSize: 18, color: '#EF4444' }} />}
                      {isCancelled && (
                        <CancelRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                      )}
                    </Box>

                    {/* Title & Step */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: 'text.primary',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {op.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: isFailed ? 'error.main' : 'text.secondary',
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mt: 0.25,
                        }}
                      >
                        {stepText}
                      </Typography>
                    </Box>

                    {/* Actions: Chi tiết + Dismiss */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      {onOpenDetail && (
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            aria-label="Chi tiết"
                            onClick={() => onOpenDetail(op.id)}
                            sx={{
                              p: 0.5,
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            <OpenInNewRoundedIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {(isCompleted || isFailed || isCancelled) && onDismissOperation && (
                        <Tooltip title="Xóa tác vụ">
                          <IconButton
                            size="small"
                            aria-label="Xóa"
                            onClick={() => onDismissOperation(op.id)}
                            sx={{
                              p: 0.5,
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' },
                            }}
                          >
                            <CloseRoundedIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Progress bar and percentage */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, op.progress || 0))}
                      sx={{
                        flex: 1,
                        height: 5,
                        borderRadius: 2.5,
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2.5,
                          bgcolor: isFailed ? '#EF4444' : isCompleted ? '#10B981' : '#2563EB',
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: isFailed
                          ? 'error.main'
                          : isCompleted
                          ? 'success.main'
                          : 'text.secondary',
                        minWidth: 32,
                        textAlign: 'right',
                      }}
                    >
                      {op.progress}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default OperationCenterDock;
