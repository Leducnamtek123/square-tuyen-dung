/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Grid from "@mui/material/Grid2";

import BasicDropzone from '../../../../components/controls/BasicDropzone';

const CVForm = ({ handleUpdate }) => {
  const schema = yup.object().shape({
    files: yup
      .mixed()
      .test(
        'files empty',
        'File is required.',
        (value) =>
          !(
            value === undefined ||
            value === null ||
            value === '' ||
            value.length === 0
          )
      ),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <BasicDropzone
            control={control}
            name="files"
            title="Choose your CV file"
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
