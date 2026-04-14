import React from 'react';

import { useForm } from 'react-hook-form';

import { typedYupResolver } from '../../../../utils/formHelpers';

import * as yup from 'yup';

import { Grid2 as Grid } from "@mui/material";

import BasicDropzone from '../../../../components/Common/Controls/BasicDropzone';

import { useTranslation } from 'react-i18next';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface FormValues {
  files: File[] | null;
}

interface CVFormProps {
  handleUpdate: (data: FormValues) => void;
}



const CVForm = ({ handleUpdate }: CVFormProps) => {

  const { t } = useTranslation(['jobSeeker']);



  const schema = yup.object().shape({



    files: yup
      .mixed<File[]>()
      .nullable()
      .test(
        'files empty',
        t('jobSeeker:profile.validation.fileRequired'),
        (value) =>
          !(
            value === undefined ||
            value === null ||
            value.length === 0
          )
      ),



  });



  const { control, handleSubmit } = useForm<FormValues>({



    resolver: typedYupResolver(schema),



  });



  return (



    <form id="modal-form" onSubmit={handleSubmit(handleUpdate)}>



      <Grid container spacing={2}>



        <Grid size={12}>



          <BasicDropzone



            control={control}



            name="files"



            title={t('jobSeeker:profile.fields.cvFile')}



            showRequired={true}



          />



        </Grid>



        <Grid size={12}>



        </Grid>



      </Grid>



    </form>



  );



};



export default CVForm;
