import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import Grid from "@mui/material/Grid2";

import BasicDropzone from '../../../../components/Common/Controls/BasicDropzone';

import { useTranslation } from 'react-i18next';

interface FormValues {
  files: any;
}

interface CVFormProps {
  handleUpdate: (data: any) => void;
}



const CVForm = ({ handleUpdate }: CVFormProps) => {

  const { t } = useTranslation(['jobSeeker']);



  const schema = yup.object().shape({



    files: yup



      .mixed()



      .test(



        'files empty',



        t('jobSeeker:profile.validation.fileRequired'),



        (value: any) =>



          !(



            value === undefined ||



            value === null ||



            value === '' ||



            value.length === 0



          )



      ),



  });



  const { control, handleSubmit } = useForm<FormValues>({



    resolver: yupResolver(schema) as any,



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
