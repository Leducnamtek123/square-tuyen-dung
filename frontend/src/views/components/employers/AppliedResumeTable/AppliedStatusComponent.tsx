import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/redux/hooks';

import { confirmModal, errorModal } from '../../../../utils/sweetalert2Modal';
import { tConfig } from '../../../../utils/tConfig';

export interface AppliedStatusComponentProps {
  options: any[];
  defaultStatus: number;
  id: string;
  handleChangeApplicationStatus: (id: string, value: any, callback: (result: boolean) => void) => void;
}

const AppliedStatusComponent: React.FC<AppliedStatusComponentProps> = ({
  options,
  defaultStatus,
  id,
  handleChangeApplicationStatus,
}) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useAppSelector((state) => state.config);
  const [applyStatus, setApplyStatus] = React.useState(defaultStatus);

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chooseValue = parseInt(e.target.value, 10);
    if (chooseValue < applyStatus) {
      errorModal(
        t('appliedResume.status.errorTitle'),
        t('appliedResume.status.errorMsg', {
          fromStatus: tConfig((allConfig as any)?.applicationStatusDict?.[applyStatus]) || '---',
          toStatus: tConfig((allConfig as any)?.applicationStatusDict?.[e.target.value]) || '---',
        })
      );
    } else {
      confirmModal(
        () =>
          handleChangeApplicationStatus(id, chooseValue, (result: boolean) => {
            if (result) {
              setApplyStatus(chooseValue);
            }
          }),
        t('appliedResume.status.updateTitle'),
        t('appliedResume.status.updateConfirm', { statusName: tConfig((allConfig as any)?.applicationStatusDict?.[e.target.value]) || '---' }),
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

export default AppliedStatusComponent;
