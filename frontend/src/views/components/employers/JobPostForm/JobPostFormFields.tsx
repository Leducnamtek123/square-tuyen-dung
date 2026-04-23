import React from 'react';
import { Alert, Typography, Box, Divider, Stack, Paper, alpha, useTheme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import CheckboxCustom from '../../../../components/Common/Controls/CheckboxCustom';
import RichTextEditorCustom from '../../../../components/Common/Controls/RichTextEditorCustom';
import TextFieldAutoCompleteCustom from '../../../../components/Common/Controls/TextFieldAutoCompleteCustom';
import { DATE_OPTIONS } from '../../../../configs/constants';
import type { Control } from 'react-hook-form';
import { TFunction } from 'i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import type { JobPostFormValues } from './JobPostSchema';
import type { SelectOption, SystemConfig } from '@/types/models';

interface PlaceOption extends SelectOption {
  place_id: string;
}

const EMPTY_SELECT_OPTIONS: SelectOption[] = [];

interface JobPostFormFieldsProps {
  control: Control<JobPostFormValues>;
  allConfig: SystemConfig | null;
  t: TFunction;
  districtOptions: SelectOption[];
  locationOptions: PlaceOption[];
  interviewTemplateOptions?: SelectOption[];
  handleSelectLocation: (e: React.SyntheticEvent, value: PlaceOption | null) => void;
}

function JobPostFormFields({
  control,
  allConfig,
  t,
  districtOptions,
  locationOptions,
  interviewTemplateOptions = EMPTY_SELECT_OPTIONS,
  handleSelectLocation
}: JobPostFormFieldsProps) {
  const theme = useTheme();

  const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2.5,
        backgroundColor: alpha(theme.palette.action.disabled, 0.03),
        '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
    }
  };

  const renderSectionHeader = (icon: React.ReactNode, title: string) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, mt: 1 }}>
      <Box sx={{ 
        p: 0.75, 
        borderRadius: 1.25, 
        bgcolor: 'primary.extralight', 
        color: 'primary.main',
        display: 'flex',
        boxShadow: alpha(theme.palette.primary.main, 0.1)
      }}>
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '0.5px' }}>
        {title.toUpperCase()}
      </Typography>
    </Stack>
  );

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
            borderColor: alpha(theme.palette.warning.main, 0.3),
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            '& .MuiAlert-message': { color: 'warning.dark' }
          }}
        >
          {t('jobPostForm.warning', 'When you update the post, it will be pending approval!')}
        </Alert>
      </Grid>

      <Grid size={12}>
        {renderSectionHeader(<BusinessCenterIcon sx={{ fontSize: 20 }} />, t('jobPostForm.section.basicInfo', 'Basic Information'))}
      </Grid>

      <Grid size={12}>
        <TextFieldCustom name="jobName" title={t('jobPostForm.title.jobtitle', 'Job Title')} showRequired={true} placeholder={t('jobPostForm.placeholder.enterjobtitle', 'Enter job title')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <SingleSelectCustom name="career" control={control} options={(allConfig?.careerOptions || []) as SelectOption[]} title={t('jobPostForm.title.career', 'Career')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectcareer', 'Select career')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="position" control={control} options={(allConfig?.positionOptions || []) as SelectOption[]} title={t('jobPostForm.title.position', 'Position')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectposition', 'Select position')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="experience" control={control} options={(allConfig?.experienceOptions || []) as SelectOption[]} title={t('jobPostForm.title.experience', 'Experience')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectrequiredexperience', 'Select required experience')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="typeOfWorkplace" control={control} options={(allConfig?.typeOfWorkplaceOptions || []) as SelectOption[]} title={t('jobPostForm.title.workplace', 'Workplace')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectworkplace', 'Select workplace')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="jobType" control={control} options={(allConfig?.jobTypeOptions || []) as SelectOption[]} title={t('jobPostForm.title.jobtype', 'Job Type')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectjobtype', 'Select job type')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="quantity" title={t('jobPostForm.title.numberofvacancies', 'Number of Vacancies')} placeholder={t('jobPostForm.placeholder.enternumberofvacancies', 'Enter number of vacancies')} showRequired={true} control={control} type="number" sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="genderRequired" control={control} options={(allConfig?.genderOptions || []) as SelectOption[]} title={t('jobPostForm.title.genderrequirement', 'Gender Requirement')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectgenderrequirement', 'Select gender requirement')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="salaryMin" title={t('jobPostForm.title.minimumsalary', 'Minimum Salary')} showRequired={true} placeholder={t('jobPostForm.placeholder.enterminimumsalary', 'Enter minimum salary')} control={control} type="number" sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="salaryMax" title={t('jobPostForm.title.maximumsalary', 'Maximum Salary')} showRequired={true} placeholder={t('jobPostForm.placeholder.entermaximumsalary', 'Enter maximum salary')} control={control} type="number" sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <SingleSelectCustom name="academicLevel" control={control} options={(allConfig?.academicLevelOptions || []) as SelectOption[]} title={t('jobPostForm.title.academiclevel', 'Academic Level')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectacademiclevel', 'Select academic level')} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <DatePickerCustom name="deadline" control={control} showRequired={true} title={t('jobPostForm.title.applicationdeadline', 'Application Deadline')} minDate={DATE_OPTIONS.tomorrow()} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <SingleSelectCustom name="interviewTemplate" control={control} options={interviewTemplateOptions} title={t('jobPostForm.title.interviewtemplate', 'Interview Template')} showRequired={false} placeholder={t('jobPostForm.placeholder.selectinterviewtemplate', 'Select an interview template for automated preliminary assessment...')} sx={inputSx} />
      </Grid>

      <Grid size={12}>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
      </Grid>
      
      <Grid size={12}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.action.disabled, 0.03) }}>
          <RichTextEditorCustom name="jobDescription" control={control} title={t('jobPostForm.title.jobdescription', 'Job Description')} showRequired={true} />
        </Paper>
      </Grid>
      <Grid size={12}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.action.disabled, 0.03) }}>
          <RichTextEditorCustom name="jobRequirement" control={control} title={t('jobPostForm.title.jobrequirement', 'Job Requirement')} showRequired={true} />
        </Paper>
      </Grid>
      <Grid size={12}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.action.disabled, 0.03) }}>
          <RichTextEditorCustom name="benefitsEnjoyed" control={control} title={t('jobPostForm.title.benefits', 'Benefits')} showRequired={true} />
        </Paper>
      </Grid>

      <Grid size={12}>
        <Box sx={{ mt: 2 }}>
          {renderSectionHeader(<LocationOnIcon sx={{ fontSize: 20 }} />, t('jobPostForm.section.location', 'Job Location'))}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="location.city" control={control} options={(allConfig?.cityOptions || []) as SelectOption[]} title={t('jobPostForm.title.cityprovince', 'City/Province')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectcityprovince', 'Select city/province')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="location.district" control={control} options={(districtOptions || []) as SelectOption[]} title={t('jobPostForm.title.district', 'District')} showRequired={true} placeholder={t('jobPostForm.placeholder.selectdistrict', 'Select district')} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <TextFieldAutoCompleteCustom name="location.address" control={control} options={locationOptions as SelectOption[]} title={t('jobPostForm.title.address', 'Address')} showRequired={true} placeholder={t('jobPostForm.placeholder.enteraddress', 'Enter address')} handleSelect={handleSelectLocation as (e: React.SyntheticEvent, value: unknown) => void} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <Box sx={{ 
          p: 2.5, 
          borderRadius: 2.5, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1)
        }}>
          <CheckboxCustom name="isUrgent" control={control} title={t('jobPostForm.label.isUrgent', 'Is Urgent')} />
        </Box>
      </Grid>

      <Grid size={12}>
        <Box sx={{ mt: 2 }}>
          {renderSectionHeader(<ContactPhoneIcon sx={{ fontSize: 20 }} />, t('jobPostForm.section.contact', 'Contact Information'))}
        </Box>
      </Grid>

      <Grid size={12}>
        <TextFieldCustom name="contactPersonName" title={t('jobPostForm.title.contactpersonname', 'Contact Person Name')} showRequired={true} placeholder={t('jobPostForm.placeholder.entercontactpersonname', 'Enter contact person name')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="contactPersonPhone" title={t('jobPostForm.title.contactpersonphone', 'Contact Person Phone')} showRequired={true} placeholder={t('jobPostForm.placeholder.entercontactpersonphone', 'Enter contact person phone')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={6}>
        <TextFieldCustom name="contactPersonEmail" title={t('jobPostForm.title.contactpersonemail', 'Contact Person Email')} showRequired={true} placeholder={t('jobPostForm.placeholder.entercontactpersonemail', 'Enter contact person email')} control={control} sx={inputSx} />
      </Grid>
    </Grid>
  );
}

export default JobPostFormFields;
