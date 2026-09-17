import React from 'react';
import { TextField, MenuItem, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { confirmModal, errorModal } from '@/utils/sweetalert2Modal';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import { SelectOption } from '@/types/models';
import {
  canTransitionApplicationStatus,
  getAllowedApplicationStatusTargets,
} from '../applicationStatusTransitions';
import { getAppliedStatusConfig } from './applicationStatusPresentation';

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
  const applyStatus = defaultStatus;

  const canChooseStatus = (statusId: number) => {
    return canTransitionApplicationStatus(applyStatus, statusId);
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

  const statusCfg = getAppliedStatusConfig(applyStatus);

  return (
    <Box sx={{ minWidth: 155 }}>
        <TextField
            id={`status-select-${id}`}
            size="small"
            fullWidth
            select
            value={applyStatus}
            onChange={handleChangeValue}
            disabled={getAllowedApplicationStatusTargets(applyStatus).length === 0}
            SelectProps={{
              renderValue: (val) => {
                const currentCfg = getAppliedStatusConfig(Number(val));
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: currentCfg.dot, flexShrink: 0 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        color: currentCfg.text,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tConfig(allConfig?.applicationStatusDict?.[Number(val)]) || '---'}
                    </Typography>
                  </Box>
                );
              },
            }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: statusCfg.bg,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                    '& fieldset': {
                        borderColor: statusCfg.border,
                        borderWidth: '1px'
                    },
                    '&:hover': {
                        backgroundColor: statusCfg.hoverBg,
                    },
                    '&:hover fieldset': {
                        borderColor: statusCfg.dot,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: statusCfg.dot,
                        borderWidth: '1.5px',
                    },
                    '& .MuiSvgIcon-root': {
                        color: statusCfg.text,
                        fontSize: '18px',
                    }
                },
                '& .MuiSelect-select': {
                    py: 0.65,
                    px: 1.25,
                    display: 'flex',
                    alignItems: 'center'
                }
            }}
        >
            {options.map((option) => {
              const optionId = Number(option.id);
              const itemCfg = getAppliedStatusConfig(optionId);
              return (
                <MenuItem key={option.id as string | number} value={option.id as string | number} disabled={!canChooseStatus(optionId)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: itemCfg.dot, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: itemCfg.text }}>
                          {tConfig(option.name as string)}
                      </Typography>
                    </Box>
                </MenuItem>
              );
            })}
        </TextField>
    </Box>
  );
};

export default AppliedStatusComponent;
