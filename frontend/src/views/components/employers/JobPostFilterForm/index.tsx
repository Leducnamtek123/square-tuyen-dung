import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Tooltip, IconButton, Theme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import { useConfig } from '@/hooks/useConfig';
import { filterControlSx } from '@/components/Common/FilterBar';

interface JobPostFilterFormValues {
  kw: string;
  isUrgent: string;
  statusId: string;
}

interface JobPostFilterFormProps {
  handleFilter: (data: JobPostFilterFormValues) => void;
}

const JobPostFilterForm = ({ handleFilter }: JobPostFilterFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();

  const {
    control,
    handleSubmit,
    reset,
    formState: { defaultValues },
  } = useForm<JobPostFilterFormValues>({
    defaultValues: {
      kw: '',
      isUrgent: '',
      statusId: '',
    },
  });

  const inputSx = filterControlSx;

  return (
    <form onSubmit={handleSubmit(handleFilter)}>
      <Grid container spacing={1.5} alignItems="center">
        <Grid size={{ xs: 12, sm: 12, md: 5 }}>
          <TextFieldCustom
            name="kw"
            placeholder={t('jobPost.filters.keywordsPlaceholder')}
            control={control}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <SingleSelectCustom
            name="isUrgent"
            control={control}
            options={[
              { id: 1, name: t('jobPost.filters.urgent') },
              { id: 2, name: t('jobPost.filters.notUrgent') },
            ]}
            showRequired={false}
            placeholder={t('jobPost.filters.urgentPlaceholder')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <SingleSelectCustom
            name="statusId"
            control={control}
            options={(allConfig?.jobPostStatusOptions || []) as React.ComponentProps<typeof SingleSelectCustom>['options']}
            showRequired={false}
            placeholder={t('jobPost.filters.statusPlaceholder')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 'auto' }}>
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent={{ xs: 'flex-end', md: 'center' }}
            alignItems="center"
          >
            <Tooltip title={t('jobPost.filters.reset')} arrow>
              <IconButton
                aria-label={t('jobPostFilterForm.label.refresh', 'refresh')}
                onClick={() => {
                  reset();
                  handleFilter(defaultValues as JobPostFilterFormValues);
                }}
                sx={{ 
                  width: 42,
                  height: 42,
                  
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <RefreshIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              startIcon={<SearchIcon />}
              sx={{ 
                
                px: 3,
                fontWeight: 900,
                textTransform: 'none',
                boxShadow: (theme: Theme) => theme.customShadows?.secondary,
                minWidth: 120,
                minHeight: 42,
              }}
            >
              {t('jobPost.filters.search')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default JobPostFilterForm;
