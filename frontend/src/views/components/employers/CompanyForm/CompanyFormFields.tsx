import React from 'react';
import { Grid2 as Grid, Paper } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import TextFieldAutoCompleteCustom from '../../../../components/Common/Controls/TextFieldAutoCompleteCustom';
import RichTextEditorCustom from '../../../../components/Common/Controls/RichTextEditorCustom';
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
        <TextFieldCustom name="companyName" title={t('companyForm.title.companyname', 'Company Name')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyname', 'Enter company name')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="taxCode" title={t('companyForm.title.taxcode', 'Tax Code')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanytaxcode', 'Enter company tax code')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="employeeSize" control={control} options={allConfig?.employeeSizeOptions || []} title={t('companyForm.title.companysize', 'Company Size')} showRequired={true} placeholder={t('companyForm.placeholder.selectcompanysize', 'Select company size')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="fieldOperation" title={t('companyForm.title.fieldofoperation', 'Field of Operation')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyfieldofoperation', 'Enter company field of operation')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <DatePickerCustom name="since" control={control} title={t('companyForm.title.foundeddate', 'Founded Date')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="websiteUrl" title={t('companyForm.title.websiteurl', 'Website URL')} placeholder={t('companyForm.placeholder.entercompanywebsiteurl', 'Enter company website URL')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="facebookUrl" title={t('companyForm.title.facebookurl', 'Facebook URL')} placeholder={t('companyForm.placeholder.enterfacebookurl', 'Enter Facebook URL')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="youtubeUrl" title={t('companyForm.title.youtubeurl', 'Youtube URL')} placeholder={t('companyForm.placeholder.enteryoutubeurl', 'Enter Youtube URL')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="linkedinUrl" title={t('companyForm.title.linkedinurl', 'Linkedin URL')} placeholder={t('companyForm.placeholder.enterlinkedinurl', 'Enter Linkedin URL')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="companyEmail" title={t('companyForm.title.companyemail', 'Company Email')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyemail', 'Enter company email')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="companyPhone" title={t('companyForm.title.phonenumber', 'Phone Number')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyphonenumber', 'Enter company phone number')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom name="location.city" control={control} options={allConfig?.cityOptions || []} title={t('companyForm.title.cityprovince', 'City/Province')} showRequired={true} placeholder={t('companyForm.placeholder.selectcityprovince', 'Select city/province')} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SingleSelectCustom options={districtOptions} name="location.district" control={control} title={t('companyForm.title.district', 'Ward/Commune')} showRequired={true} placeholder={t('companyForm.placeholder.selectdistrict', 'Select ward/commune')} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <TextFieldAutoCompleteCustom name="location.address" title={t('companyForm.title.address', 'Address')} showRequired={true} placeholder={t('companyForm.placeholder.enteraddress', 'Enter address')} control={control} options={locationOptions} handleSelect={handleSelectLocation} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="location.lat" title={t('companyForm.title.latitude', 'Latitude')} showRequired={true} placeholder={t('companyForm.placeholder.enterlatitudecoordinateonthemap', 'Enter latitude coordinate on the map.')} helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextFieldCustom name="location.lng" title={t('companyForm.title.longitude', 'Longitude')} showRequired={true} placeholder={t('companyForm.placeholder.enterlongitudecoordinateonthemap', 'Enter longitude coordinate on the map.')} helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')} control={control} sx={inputSx} />
      </Grid>
      <Grid size={12}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2.5, border: '1px solid', borderColor: pc.divider(0.95), bgcolor: 'background.paper' }}>
          <RichTextEditorCustom name="description" control={control} title={t('companyForm.title.additionaldescription', 'Additional Description')} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CompanyFormFields;
