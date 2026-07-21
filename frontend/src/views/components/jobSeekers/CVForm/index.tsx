import React from 'react';

import { useForm } from 'react-hook-form';

import { typedYupResolver } from '../../../../utils/formHelpers';

import * as yup from 'yup';

import { Grid2 as Grid } from "@mui/material";

import BasicDropzone from '../../../../components/Common/Controls/BasicDropzone';

import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const MAX_CV_FILE_SIZE = 10 * 1024 * 1024;
const PDF_CONTENT_TYPES = new Set(['application/pdf', 'application/x-pdf']);

export interface FormValues {
  files: File[] | null;
}

interface CVFormProps {
  handleUpdate: (data: FormValues) => void;
}

type CvFileValue = File[] | null | undefined;

const getFirstCvFile = (value: CvFileValue) => (
  Array.isArray(value) ? value[0] : undefined
);

const hasCvFile = (value: CvFileValue) => Boolean(getFirstCvFile(value));

const isPdfCvFile = (value: CvFileValue) => {
  const file = getFirstCvFile(value);
  if (!file) return true;

  const fileName = (file.name || '').toLowerCase();
  const contentType = (file.type || '').toLowerCase();

  return fileName.endsWith('.pdf') && (!contentType || PDF_CONTENT_TYPES.has(contentType));
};

const isAllowedCvFileSize = (value: CvFileValue) => {
  const file = getFirstCvFile(value);
  return !file || (file.size || 0) <= MAX_CV_FILE_SIZE;
};

export const createCVFormSchema = (t: TFunction<'jobSeeker', undefined>) =>
  yup.object().shape({
    files: yup
      .mixed<File[]>()
      .nullable()
      .test(
        'files empty',
        t('jobSeeker:profile.validation.fileRequired'),
        hasCvFile,
      )
      .test('file-is-pdf', t('jobSeeker:profile.validation.filePdfOnly'), isPdfCvFile)
      .test('file-max-size', t('jobSeeker:profile.validation.fileTooLarge'), isAllowedCvFileSize),
  });

const CVForm = ({ handleUpdate }: CVFormProps) => {

  const { t } = useTranslation(['jobSeeker']);

  const schema = React.useMemo(() => createCVFormSchema(t), [t]);



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
