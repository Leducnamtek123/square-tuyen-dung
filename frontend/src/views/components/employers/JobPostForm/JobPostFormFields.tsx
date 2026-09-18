import React from 'react';
import { Alert, Typography, Box, Divider, Stack, Paper, alpha, useTheme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '@/components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '@/components/Common/Controls/DatePickerCustom';
import CheckboxCustom from '@/components/Common/Controls/CheckboxCustom';
import RichTextEditorCustom from '@/components/Common/Controls/RichTextEditorCustom';
import TextFieldAutoCompleteCustom from '@/components/Common/Controls/TextFieldAutoCompleteCustom';
import { DATE_OPTIONS } from '@/configs/constants';
import { useWatch, type Control } from 'react-hook-form';
import { TFunction } from 'i18next';
import type { Theme } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { Switch, FormControlLabel, Slider, Tooltip } from '@mui/material';
import TypedController from '@/components/Common/Controls/TypedController';
import ValidationError from '@/components/Common/Controls/ValidationError';
import type { JobPostFormValues } from './JobPostSchema';
import type { SelectOption, SystemConfig } from '@/types/models';
import pc from '@/utils/muiColors';

import LocationPicker, { LocationValue } from '@/components/Common/LocationPicker';

interface PlaceOption extends SelectOption {
  place_id: string;
}

const EMPTY_SELECT_OPTIONS: SelectOption[] = [];

type SectionHeaderProps = {
  theme: Theme;
  icon: React.ReactNode;
  title: string;
};

const SectionHeader = ({ theme, icon, title }: SectionHeaderProps) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
    <Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>
      {icon}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.5px' }}>
      {title.toUpperCase()}
    </Typography>
  </Stack>
);

interface JobPostFormFieldsProps {
  control: Control<JobPostFormValues>;
  allConfig: SystemConfig | null;
  t: TFunction;
  districtOptions: SelectOption[];
  locationOptions?: PlaceOption[];
  interviewTemplateOptions?: SelectOption[];
  handleSelectLocation?: (e: React.SyntheticEvent, value: unknown) => void;
  locationValue?: LocationValue;
  onLocationChange?: (val: LocationValue) => void;
}

function JobPostFormFields({
  control,
  allConfig,
  t,
  districtOptions,
  locationOptions,
  interviewTemplateOptions = EMPTY_SELECT_OPTIONS,
  handleSelectLocation,
  locationValue,
  onLocationChange,
}: JobPostFormFieldsProps) {
  const theme = useTheme();
  const cityId = useWatch({ control, name: 'location.city' });
  const autoInterviewEnabled = useWatch({ control, name: 'autoInterviewEnabled' }) ?? true;
  const jobName = useWatch({ control, name: 'jobName' });

  const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2.5,
        backgroundColor: pc.actionDisabled( 0.03),
        '&:hover': { bgcolor: pc.actionDisabled( 0.06) },
        '& fieldset': { borderColor: pc.divider( 0.8) }
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid size={12}>
        <Alert 
          severity="warning" 
          icon={<InfoOutlinedIcon sx={{ color: 'warning.main' }} />}
          sx={{ 
            borderRadius: 2.5, 
            fontWeight: 700,
            border: '1px solid',
            borderColor: pc.warning( 0.3),
            bgcolor: pc.warning( 0.05),
            '& .MuiAlert-message': { color: 'warning.dark' }
          }}
        >
          {t('jobPostForm.warning')}
        </Alert>
      </Grid>

      <Grid size={12}>
        <SectionHeader theme={theme} icon={<BusinessCenterIcon sx={{ fontSize: 20 }} />} title={t('jobPostForm.section.basicInfo')} />
      </Grid>

      <Grid size={12}>
        <TextFieldCustom name="jobName" title={t('jobPostForm.title.jobtitle')} showRequired={true} placeholder={t('jobPostForm.placeholder.enterjobtitle')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <SingleSelectCustom name="career" control={control} options={(allConfig?.careerOptions || []) as SelectOption[]} title={t('jobPostForm.title.career')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectcareer')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="position" control={control} options={(allConfig?.positionOptions || []) as SelectOption[]} title={t('jobPostForm.title.position')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectposition')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="experience" control={control} options={(allConfig?.experienceOptions || []) as SelectOption[]} title={t('jobPostForm.title.experience')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectrequiredexperience')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="typeOfWorkplace" control={control} options={(allConfig?.typeOfWorkplaceOptions || []) as SelectOption[]} title={t('jobPostForm.title.workplace')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectworkplace')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="jobType" control={control} options={(allConfig?.jobTypeOptions || []) as SelectOption[]} title={t('jobPostForm.title.jobtype')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectjobtype')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="quantity" title={t('jobPostForm.title.numberofvacancies')} placeholder={t('jobPostForm.placeholder.enternumberofvacancies')} showRequired={true} control={control} type="number" sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="genderRequired" control={control} options={(allConfig?.genderOptions || []) as SelectOption[]} title={t('jobPostForm.title.genderrequirement')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectgenderrequirement')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="salaryMin" title={t('jobPostForm.title.minimumsalary')} showRequired={true} placeholder={t('jobPostForm.placeholder.enterminimumsalary')} control={control} type="number" sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="salaryMax" title={t('jobPostForm.title.maximumsalary')} showRequired={true} placeholder={t('jobPostForm.placeholder.entermaximumsalary')} control={control} type="number" sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="academicLevel" control={control} options={(allConfig?.academicLevelOptions || []) as SelectOption[]} title={t('jobPostForm.title.academiclevel')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectacademiclevel')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <DatePickerCustom name="deadline" control={control} showRequired={true} title={t('jobPostForm.title.applicationdeadline')} minDate={DATE_OPTIONS.today()} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <Box sx={{ mt: 1 }}>
          <SectionHeader
            theme={theme}
            icon={<SmartToyOutlinedIcon sx={{ fontSize: 20 }} />}
            title={t('jobPostForm.section.aiPipeline')}
          />
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.18),
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <SingleSelectCustom
                name="interviewTemplate"
                control={control}
                options={interviewTemplateOptions}
                title={t('jobPostForm.title.interviewtemplate')}
                showRequired={false}
                placeholder={t('jobPostForm.placeholder.selectinterviewtemplate')}
                sx={inputSx}
              />
            </Grid>

            <Grid size={12}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: '#ffffff',
                  border: '1px solid #E2E8F0',
                }}
              >
                <TypedController
                  name="autoInterviewEnabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                      control={
                        <Switch
                          checked={field.value !== false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                          sx={{ mr: 1, mt: 0.25 }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                            {t('jobPostForm.title.autointerview')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25 }}>
                            {t('jobPostForm.title.autointerviewdesc')}
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                />
              </Box>
            </Grid>

            {autoInterviewEnabled && (
              <Grid size={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: '#ffffff',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75} mb={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {t('jobPostForm.title.minscreeningscore')}
                    </Typography>
                    <Tooltip title={t('jobPostForm.tooltip.minscreeningscore')} arrow placement="top">
                      <HelpOutlineIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
                    </Tooltip>
                  </Stack>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TypedController
                        name="minScreeningScore"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Box sx={{ px: 1 }}>
                            <Slider
                              value={typeof field.value === 'number' ? field.value : 70}
                              onChange={(_, val) => field.onChange(val)}
                              min={0}
                              max={100}
                              step={5}
                              marks={[
                                { value: 50, label: '50' },
                                { value: 70, label: '70' },
                                { value: 85, label: '85' },
                                { value: 100, label: '100' },
                              ]}
                              valueLabelDisplay="auto"
                              sx={{
                                color: '#2563EB',
                                '& .MuiSlider-thumb': {
                                  width: 18,
                                  height: 18,
                                },
                              }}
                            />
                            {fieldState.invalid && (
                              <ValidationError message={fieldState.error?.message} />
                            )}
                          </Box>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextFieldCustom
                        name="minScreeningScore"
                        control={control}
                        type="number"
                        placeholder={t('jobPostForm.placeholder.enterminscreeningscore')}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>

                  <Alert
                    severity="info"
                    icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      mt: 2,
                      fontSize: '0.8125rem',
                      py: 0.75,
                      px: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      color: '#1E40AF',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.15),
                      '& .MuiAlert-icon': {
                        color: '#2563EB',
                        mr: 1,
                      },
                    }}
                  >
                    {t('jobPostForm.title.aiPipelineHelp')}
                  </Alert>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Box sx={{ mt: 1 }}>
          <SectionHeader
            theme={theme}
            icon={<ArticleOutlinedIcon sx={{ fontSize: 20 }} />}
            title={t('jobPostForm.section.content')}
          />
        </Box>
      </Grid>
      
      <Grid size={12}>
        <RichTextEditorCustom
          name="jobDescription"
          control={control}
          title={t('jobPostForm.title.jobdescription')}
          showRequired={true}
          contextType="job_desc"
          jobTitle={jobName}
        />
      </Grid>
      <Grid size={12}>
        <RichTextEditorCustom
          name="jobRequirement"
          control={control}
          title={t('jobPostForm.title.jobrequirement')}
          showRequired={true}
          contextType="job_req"
          jobTitle={jobName}
        />
      </Grid>
      <Grid size={12}>
        <RichTextEditorCustom
          name="benefitsEnjoyed"
          control={control}
          title={t('jobPostForm.title.benefits')}
          showRequired={true}
          contextType="benefits"
          jobTitle={jobName}
        />
      </Grid>

      <Grid size={12}>
        <Box sx={{ mt: 2 }}>
          <SectionHeader theme={theme} icon={<LocationOnIcon sx={{ fontSize: 20 }} />} title={t('jobPostForm.section.location')} />
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="location.city" control={control} options={(allConfig?.cityOptions || []) as SelectOption[]} title={t('jobPostForm.title.cityprovince')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectcityprovince')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom
          name="location.district"
          control={control}
          disabled={!cityId}
          disabledPlaceholder={t('jobPostForm.placeholder.selectCityFirst')}
          options={(districtOptions || []) as SelectOption[]}
          title={t('jobPostForm.title.district')}
          showRequired={true}
          placeholder={t('jobPostForm.placeholder.selectdistrict')}
          sx={inputSx}
        />
      </Grid>
      <Grid size={12}>
        <TextFieldCustom name="location.address" title={t('jobPostForm.title.address')} showRequired={true} placeholder={t('jobPostForm.placeholder.enteraddress')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <LocationPicker
          value={locationValue}
          onChange={onLocationChange}
          label="Định vị địa điểm làm việc trên bản đồ"
          height="350px"
        />
      </Grid>
      <Grid size={12}>
        <Box sx={{ 
          p: 2.5, 
          borderRadius: 2.5, 
          bgcolor: pc.primary( 0.05),
          border: '1px solid',
          borderColor: pc.primary( 0.1)
        }}>
          <CheckboxCustom name="isUrgent" control={control} title={t('jobPostForm.label.isUrgent')} />
        </Box>
      </Grid>

      <Grid size={12}>
        <Box sx={{ mt: 2 }}>
          <SectionHeader theme={theme} icon={<ContactPhoneIcon sx={{ fontSize: 20 }} />} title={t('jobPostForm.section.contact')} />
        </Box>
      </Grid>

      <Grid size={12}>
        <TextFieldCustom name="contactPersonName" title={t('jobPostForm.title.contactpersonname')} showRequired={true} placeholder={t('jobPostForm.placeholder.entercontactpersonname')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="contactPersonPhone" title={t('jobPostForm.title.contactpersonphone')} showRequired={true} placeholder={t('jobPostForm.placeholder.entercontactpersonphone')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="contactPersonEmail" title={t('jobPostForm.title.contactpersonemail')} showRequired={true} placeholder={t('jobPostForm.placeholder.entercontactpersonemail')} control={control} sx={inputSx} />
      </Grid>
    </Grid>
  );
}

export default JobPostFormFields;
