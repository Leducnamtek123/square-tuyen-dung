import React from 'react';
import { TextField, MenuItem, Box, Typography, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { confirmModal, errorModal } from '../../../../utils/sweetalert2Modal';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import { SelectOption } from '@/types/models';

interface AppliedStatusComponentProps {
  options: SelectOption[];
  defaultStatus: number;
  id: string;
  handleChangeApplicationStatus: (id: string | number, value: string | number, callback: (result: boolean) => void) => void;
}

const AppliedStatusComponent: React.FC<AppliedStatusComponentProps> = ({
  options,
  defaultStatus,
  id,
  handleChangeApplicationStatus,
}) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  const theme = useTheme();
  const applyStatus = defaultStatus;
  const allowedTransitions: Record<number, number[]> = {
    1: [2, 6],
    2: [3, 6],
    3: [4, 6],
    4: [5, 6],
    5: [],
    6: [],
  };

  const canChooseStatus = (statusId: number) => {
    if (statusId === applyStatus) return true;
    return (allowedTransitions[applyStatus] || []).includes(statusId);
  };

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chooseValue = parseInt(e.target.value, 10);
    
    if (!canChooseStatus(chooseValue)) {
      errorModal(
        t('appliedResume.status.errorTitle'),
        t('appliedResume.status.errorMsg', {
          fromStatus: tConfig(allConfig?.applicationStatusDict?.[applyStatus]) || '---',
          toStatus: tConfig(allConfig?.applicationStatusDict?.[chooseValue]) || '---',
        })
      );
      return;
    }

    if (chooseValue === applyStatus) return;

    confirmModal(
      () => handleChangeApplicationStatus(id, chooseValue, () => undefined),
      t('appliedResume.status.updateTitle'),
      t('appliedResume.status.updateConfirm', { 
        statusName: tConfig(allConfig?.applicationStatusDict?.[chooseValue]) || '---' 
      }),
      'question'
    );
  };

  const getStatusColor = () => {
    if (applyStatus >= 4) return theme.palette.success; // Hired/Selected
    if (applyStatus === 3) return theme.palette.warning; // Interviewing
    if (applyStatus === 2) return theme.palette.info; // Pre-screened
    return { main: theme.palette.text.secondary, light: theme.palette.divider };
  };

  const statusColor = getStatusColor();

  return (
    <Box sx={{ minWidth: 140 }}>
        <TextField
            id={`status-select-${id}`}
            size="small"
            fullWidth
            select
            value={applyStatus}
            onChange={handleChangeValue}
            disabled={(allowedTransitions[applyStatus] || []).length === 0}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: alpha(statusColor.main, 0.08),
                    color: statusColor.main,
                    '& fieldset': {
                        borderColor: alpha(statusColor.main, 0.2),
                        borderWidth: '1px'
                    },
                    '&:hover fieldset': {
                        borderColor: statusColor.main,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: statusColor.main,
                    }
                },
                '& .MuiSelect-select': {
                    py: 0.75,
                    px: 1.5,
                    display: 'flex',
                    alignItems: 'center'
                }
            }}
        >
            {options.map((option) => {
              const optionId = Number(option.id);
              return (
                <MenuItem key={option.id as string | number} value={option.id as string | number} disabled={!canChooseStatus(optionId)}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8125rem' }}>
                        {tConfig(option.name as string)}
                    </Typography>
                </MenuItem>
              );
            })}
        </TextField>
    </Box>
  );
};

export default AppliedStatusComponent;

