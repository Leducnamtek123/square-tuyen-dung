import React from 'react';
import { Box, Button, Stack, Typography, Divider, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { TFunction } from 'i18next';

type Props = {
  t: TFunction;
  tab: 'roles' | 'members';
  onChangeTab: (tab: 'roles' | 'members') => void;
  onAddRole: () => void;
  onAddMember: () => void;
};

const EmployeesPageHeader = ({ t, tab, onChangeTab, onAddRole, onAddMember }: Props) => {
  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'start', md: 'center' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t('employees.pageTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('employees.pageDescription')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddRole}>
            {t('employees.addRole')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddMember}>
            {t('employees.addMember')}
          </Button>
        </Stack>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Tabs value={tab} onChange={(_, value: 'roles' | 'members') => onChangeTab(value)}>
        <Tab value="roles" label={t('employees.tabs.roles')} />
        <Tab value="members" label={t('employees.tabs.members')} />
      </Tabs>
    </>
  );
};

export default EmployeesPageHeader;
