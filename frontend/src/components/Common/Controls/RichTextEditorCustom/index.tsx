'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { EditorState } from 'draft-js';
import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';
import type { EditorProps } from 'react-draft-wysiwyg';

const DraftEditor = dynamic(
  async () => {
    const mod = await import('react-draft-wysiwyg');
    // Handle ESM/CJS interop: in production builds the named export
    // "Editor" may live under mod.default.Editor or just mod.default
    const Editor = mod.Editor || (mod as { default?: { Editor?: React.ComponentType<EditorProps> } | React.ComponentType<EditorProps> }).default || mod;
    return Editor as React.ComponentType<EditorProps>;
  },
  { ssr: false }
);

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: string;
  title?: string;
  showRequired?: boolean;
}

const RichTextEditorCustom = <T extends FieldValues = FieldValues>({
  control,
  name,
  title = '',
  showRequired = false,
}: Props<T>) => {
  return (
    <div>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title} {showRequired && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}

      <Controller
        control={control}
        name={name as Path<T>}
        defaultValue={EditorState.createEmpty() as unknown as PathValue<T, Path<T>>}
        render={({ field, fieldState }) => {
          const safeEditorState = field.value?.getCurrentContent
            ? field.value
            : typeof field.value === 'string'
            ? createEditorStateFromHTMLString(field.value)
            : EditorState.createEmpty();

          return (
            <>
              <DraftEditor
                editorStyle={{
                  border: '1px solid',
                  borderColor: '#e0e0e0',
                  marginTop: -1,
                  minHeight: 200,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                }}
                editorState={safeEditorState}
                onEditorStateChange={field.onChange}
                toolbar={{
                  options: ['inline', 'list', 'history'],
                  inline: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                    options: ['bold', 'italic', 'underline', 'superscript', 'subscript'],
                  },
                  list: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                    options: ['unordered', 'ordered', 'indent', 'outdent'],
                  },
                  history: {
                    inDropdown: false,
                    className: undefined,
                    component: undefined,
                    dropdownClassName: undefined,
                    options: ['undo', 'redo'],
                  },
                }}
              />

              {fieldState.invalid && (
                <span
                  style={{
                    color: 'red',
                    fontSize: 13,
                    marginTop: 1,
                    marginLeft: 1,
                  }}
                >
                  <ErrorOutlineIcon fontSize="small" /> {fieldState.error?.message}
                </span>
              )}
            </>
          );
        }}
      />
    </div>
  );
};

export default RichTextEditorCustom;
