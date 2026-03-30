import React from 'react';
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import TextFieldAutoCompleteCustom from '../../../../components/Common/Controls/TextFieldAutoCompleteCustom';
import RichTextEditorCustom from '../../../../components/Common/Controls/RichTextEditorCustom';
import type { Control } from "react-hook-form";
import type { TFunction } from "i18next";
import type { SystemConfig, SelectOption } from "../../../../types/models";

interface CompanyFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  t: TFunction<any, any>;
  allConfig: SystemConfig | null;
  districtOptions: SelectOption[];
  locationOptions: Record<string, unknown>[];
  handleSelectLocation: (e: React.SyntheticEvent, value: Record<string, unknown> | SelectOption | string | null | any) => void;
}

const CompanyFormFields: React.FC<CompanyFormFieldsProps> = ({
  control,
  t,
  allConfig,
  districtOptions,
  locationOptions,
  handleSelectLocation,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
        <TextFieldCustom name="companyName" title={t('companyForm.title.companyname', 'Company Name')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyname', 'Enter company name')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="taxCode" title={t('companyForm.title.taxcode', 'Tax Code')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanytaxcode', 'Enter company tax code')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <SingleSelectCustom name="employeeSize" control={control} options={allConfig?.employeeSizeOptions || []} title={t('companyForm.title.companysize', 'Company Size')} showRequired={true} placeholder={t('companyForm.placeholder.selectcompanysize', 'Select company size')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="fieldOperation" title={t('companyForm.title.fieldofoperation', 'Field of Operation')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyfieldofoperation', 'Enter company field of operation')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <DatePickerCustom name="since" control={control} title={t('companyForm.title.foundeddate', 'Founded Date')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="websiteUrl" title={t('companyForm.title.websiteurl', 'Website URL')} placeholder={t('companyForm.placeholder.entercompanywebsiteurl', 'Enter company website URL')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="facebookUrl" title={t('companyForm.title.facebookurl', 'Facebook URL')} placeholder={t('companyForm.placeholder.enterfacebookurl', 'Enter Facebook URL')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="youtubeUrl" title={t('companyForm.title.youtubeurl', 'Youtube URL')} placeholder={t('companyForm.placeholder.enteryoutubeurl', 'Enter Youtube URL')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="linkedinUrl" title={t('companyForm.title.linkedinurl', 'Linkedin URL')} placeholder={t('companyForm.placeholder.enterlinkedinurl', 'Enter Linkedin URL')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="companyEmail" title={t('companyForm.title.companyemail', 'Company Email')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyemail', 'Enter company email')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="companyPhone" title={t('companyForm.title.phonenumber', 'Phone Number')} showRequired={true} placeholder={t('companyForm.placeholder.entercompanyphonenumber', 'Enter company phone number')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <SingleSelectCustom name="location.city" control={control} options={allConfig?.cityOptions || []} title={t('companyForm.title.cityprovince', 'City/Province')} showRequired={true} placeholder={t('companyForm.placeholder.selectcityprovince', 'Select city/province')} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <SingleSelectCustom options={districtOptions} name="location.district" control={control} title={t('companyForm.title.district', 'Ward/Commune')} showRequired={true} placeholder={t('companyForm.placeholder.selectdistrict', 'Select ward/commune')} />
      </Grid>
      <Grid size={12}>
        <TextFieldAutoCompleteCustom name="location.address" title={t('companyForm.title.address', 'Address')} showRequired={true} placeholder={t('companyForm.placeholder.enteraddress', 'Enter address')} control={control} options={locationOptions} handleSelect={handleSelectLocation} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="location.lat" title={t('companyForm.title.latitude', 'Latitude')} showRequired={true} placeholder={t('companyForm.placeholder.enterlatitudecoordinateonthemap', 'Enter latitude coordinate on the map.')} helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
        <TextFieldCustom name="location.lng" title={t('companyForm.title.longitude', 'Longitude')} showRequired={true} placeholder={t('companyForm.placeholder.enterlongitudecoordinateonthemap', 'Enter longitude coordinate on the map.')} helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')} control={control} />
      </Grid>
      <Grid size={12}>
        <RichTextEditorCustom name="description" control={control} title={t('companyForm.title.additionaldescription', 'Additional Description')} />
      </Grid>
    </Grid>
  );
};

export default CompanyFormFields;
