import React from 'react';
import { Grid2 as Grid, Paper } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import TextFieldAutoCompleteCustom from '../../../../components/Common/Controls/TextFieldAutoCompleteCustom';
import RichTextEditorCustom from '../../../../components/Common/Controls/RichTextEditorCustom';
import { DATE_OPTIONS } from '../../../../configs/constants';
import type { Control } from "react-hook-form";
import type { TFunction } from "i18next";
import type { SystemConfig, SelectOption } from "../../../../types/models";

import type { CompanyFormValues } from './types';
import pc from '@/utils/muiColors';

interface CompanyFormFieldsProps {
  control: Control<CompanyFormValues>;
  t: TFunction<"employer", undefined>;
  allConfig: SystemConfig | null;
  districtOptions: SelectOption[];
  locationOptions: SelectOption[];
  handleSelectLocation: (e: React.SyntheticEvent, value: string | SelectOption | null) => void;
}

const CompanyFormFields: React.FC<CompanyFormFieldsProps> = ({
  control,
  t,
  allConfig,
  districtOptions,
  locationOptions,
  handleSelectLocation,
}) => {
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 42,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      '& fieldset': { borderColor: pc.divider(0.95) },
      '&:hover': { backgroundColor: pc.bgDefault(0.45) },
      '&:hover fieldset': { borderColor: pc.primary(0.35) },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
        borderWidth: 1,
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '0.875rem',
      py: '10px',
    },
    '& .MuiFormHelperText-root': {
      mx: 0,
      mt: 0.75,
    },
  };

  return (
    <Grid
      container
      spacing={{ xs: 2.25, md: 2.75 }}
      columnSpacing={{ xs: 2, md: 3 }}
      sx={{
        '& > .MuiGrid2-root > div > .MuiTypography-root': {
          mb: 0.75,
          color: 'primary.main',
          fontSize: '0.8125rem',
          fontWeight: 800,
          lineHeight: 1.35,
        },
      }}
    >
      <Grid size={12}>
        <TextFieldCustom name="companyName" title={t('companyForm.title.companyname')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyname')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="taxCode" title={t('companyForm.title.taxcode')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanytaxcode')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="employeeSize" control={control} options={allConfig?.employeeSizeOptions || []} title={t('companyForm.title.companysize')} showRequired={true} placeholder={t('companyForm.placeholder.selectcompanysize')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="fieldOperation" title={t('companyForm.title.fieldofoperation')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyfieldofoperation')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <DatePickerCustom name="since" control={control} title={t('companyForm.title.foundeddate')} maxDate={DATE_OPTIONS.today()} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="websiteUrl" title={t('companyForm.title.websiteurl')} placeholder={t('companyForm.placeholder.entercompanywebsiteurl')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="facebookUrl" title={t('companyForm.title.facebookurl')} placeholder={t('companyForm.placeholder.enterfacebookurl')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="youtubeUrl" title={t('companyForm.title.youtubeurl')} placeholder={t('companyForm.placeholder.enteryoutubeurl')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="linkedinUrl" title={t('companyForm.title.linkedinurl')} placeholder={t('companyForm.placeholder.enterlinkedinurl')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="companyEmail" title={t('companyForm.title.companyemail')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyemail')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="companyPhone" title={t('companyForm.title.phonenumber')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyphonenumber')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="location.city" control={control} options={allConfig?.cityOptions || []} title={t('companyForm.title.cityprovince')} showRequired={true} placeholder={t('companyForm.placeholder.selectcityprovince')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom options={districtOptions} name="location.district" control={control} title={t('companyForm.title.district')} showRequired={true} placeholder={t('companyForm.placeholder.selectdistrict')} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <TextFieldAutoCompleteCustom name="location.address" title={t('companyForm.title.address')} showRequired={true} placeholder={t('companyForm.placeholder.enteraddress')} control={control} options={locationOptions} handleSelect={handleSelectLocation} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="location.lat" title={t('companyForm.title.latitude')} placeholder={t('companyForm.placeholder.enterlatitudecoordinateonthemap')} helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="location.lng" title={t('companyForm.title.longitude')} placeholder={t('companyForm.placeholder.enterlongitudecoordinateonthemap')} helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2.5, border: '1px solid', borderColor: pc.divider(0.95), bgcolor: 'background.paper' }}>
          <RichTextEditorCustom name="description" control={control} title={t('companyForm.title.additionaldescription')} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CompanyFormFields;
