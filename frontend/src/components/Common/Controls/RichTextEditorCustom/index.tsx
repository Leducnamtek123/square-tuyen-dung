'use client';

import React from 'react';
import { Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';
import ModernRichEditor from '../ModernRichEditor';
import { AIContentType } from '../ModernRichEditor/aiAssistantEngine';
import TypedController from '../TypedController';

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
  title?: string;
  showRequired?: boolean;
  minHeight?: number | string;
  placeholder?: string;
  contextType?: AIContentType;
}

const resolveContextTypeFromName = (name: string): AIContentType => {
  const lower = name.toLowerCase();
  if (lower.includes('company') || lower.includes('description') || lower.includes('about')) {
    return 'company';
  }
  if (lower.includes('jobdesc') || lower.includes('job_desc') || lower.includes('jobdescription')) {
    return 'job_desc';
  }
  if (lower.includes('jobreq') || lower.includes('job_req') || lower.includes('jobrequirement') || lower.includes('requirement')) {
    return 'job_req';
  }
  if (lower.includes('benefit') || lower.includes('welfare') || lower.includes('benefitenjoyed')) {
    return 'benefits';
  }
  if (lower.includes('mail') || lower.includes('email') || lower.includes('letter') || lower.includes('content')) {
    return 'email';
  }
  if (lower.includes('blog') || lower.includes('article') || lower.includes('news')) {
    return 'blog';
  }
  return 'general';
};

const RichTextEditorCustom = <T extends FieldValues = FieldValues>({
  control,
  name,
  title = '',
  showRequired = false,
  minHeight = 240,
  placeholder,
  contextType,
}: Props<T>) => {
  const resolvedContext = contextType || resolveContextTypeFromName(name);

  return (
    <Box sx={{ width: '100%' }}>
      <TypedController
        control={control}
        name={name as Path<T>}
        defaultValue={createEditorStateFromHTMLString('') as PathValue<T, Path<T>>}
        render={({ field, fieldState }) => {
          return (
            <>
              <ModernRichEditor
                value={field.value}
                onChange={field.onChange}
                title={title}
                showRequired={showRequired}
                minHeight={minHeight}
                placeholder={placeholder}
                contextType={resolvedContext}
              />

              {fieldState.invalid && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'error.main',
                    fontSize: '0.82rem',
                    mt: 0.8,
                    ml: 0.5,
                  }}
                >
                  <ErrorOutlineIcon fontSize="small" />
                  <span>{fieldState.error?.message}</span>
                </Box>
              )}
            </>
          );
        }}
      />
    </Box>
  );
};

export default RichTextEditorCustom;
