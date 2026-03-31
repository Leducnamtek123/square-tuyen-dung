import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { 
  Button, 
  Stack, 
  IconButton, 
  Tooltip, 
  Grid2 as Grid, 
  alpha, 
  useTheme 
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import { useConfig } from '@/hooks/useConfig';

export interface SavedResumeFilterValues {
  kw: string;
  salaryMax: string | number;
  experienceId: string | number;
  cityId: string | number;
}

interface SavedResumeFilterFormProps {
  handleFilter: (data: Partial<SavedResumeFilterValues>) => void;
}

const SavedResumeFilterForm: React.FC<SavedResumeFilterFormProps> = ({ handleFilter }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();
  const theme = useTheme();

  const {
    control,
    reset,
    handleSubmit,
    formState: { defaultValues },
  } = useForm<SavedResumeFilterValues>({
    defaultValues: {
      kw: '',
      salaryMax: '',
      experienceId: '',
      cityId: '',
    },
  });

  const onReset = () => {
    reset();
    handleFilter(defaultValues as Partial<SavedResumeFilterValues>);
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2.5,
        backgroundColor: alpha(theme.palette.action.disabled, 0.03),
        '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFilter)}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 3 }}>
          <TextFieldCustom
            name="kw"
            placeholder={t('employer:savedResumeFilterForm.placeholder.enterjobpostorcandidatename')}
            control={control}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 2 }}>
          <TextFieldCustom
            name="salaryMax"
            placeholder={t('employer:savedResumeFilterForm.placeholder.entermaximumsalary')}
            control={control}
            type="number"
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 2 }}>
          <SingleSelectCustom
            name="experienceId"
            control={control}
            options={allConfig?.experienceOptions || []}
            placeholder={t('employer:savedResumeFilterForm.placeholder.selectexperience')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 2 }}>
          <SingleSelectCustom
            name="cityId"
            control={control}
            options={allConfig?.cityOptions || []}
            placeholder={t('employer:savedResumeFilterForm.placeholder.selectlocation')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3 }}>
          <Stack direction="row" spacing={2}>
            <Tooltip title={t('employer:savedResumeFilterForm.title.reset')} arrow>
              <IconButton 
                aria-label={t('employer:savedResumeFilterForm.label.refresh')} 
                onClick={onReset}
                sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              startIcon={<SearchIcon />}
              sx={{ 
                color: 'white', 
                flex: 1,
                borderRadius: 2.5,
                fontWeight: 900,
                textTransform: 'none',
                boxShadow: (theme: any) => theme.customShadows?.secondary,
                '&:hover': { bgcolor: 'secondary.dark' }
              }}
            >
              {t('employer:savedResumeFilterForm.label.search')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default SavedResumeFilterForm;
