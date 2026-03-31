import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { Grid2 as Grid } from "@mui/material";

import BasicDropzone from '../../../../components/Common/Controls/BasicDropzone';

import { useTranslation } from 'react-i18next';

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



    resolver: yupResolver(schema) as unknown as import('react-hook-form').Resolver<FormValues>,



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
