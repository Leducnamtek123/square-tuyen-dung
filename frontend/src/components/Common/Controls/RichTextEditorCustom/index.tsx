'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import { Box, CircularProgress, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';
import commonService from '@/services/commonService';
import type { EditorProps } from 'react-draft-wysiwyg';

type DraftJsModule = typeof import('draft-js');
type EditorState = import('draft-js').EditorState;

const loadDraftJs = () => import('draft-js') as Promise<DraftJsModule>;

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
  const editorStateRef = React.useRef<EditorState>(createEditorStateFromHTMLString(''));
  const isMountedRef = React.useRef(true);
  const [uploadState, setUploadState] = React.useState<{
    active: boolean;
    progress: number;
    fileName: string;
  }>({
    active: false,
    progress: 0,
    fileName: '',
  });

  React.useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const uploadImageToMinio = async (
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string> => {
    const uploadResult = await commonService.uploadFile(file, 'OTHER', {
      onUploadProgress: onProgress,
    });
    if (!uploadResult?.url) {
      throw new Error('Image upload failed');
    }
    return uploadResult.url;
  };

  const insertImageBlock = async (editorState: EditorState, imageUrl: string, altText = ''): Promise<EditorState> => {
    const { AtomicBlockUtils, EditorState: DraftEditorState } = await loadDraftJs();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('IMAGE', 'MUTABLE', {
      src: imageUrl,
      alt: altText,
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const nextEditorState = DraftEditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });

    return AtomicBlockUtils.insertAtomicBlock(nextEditorState, entityKey, ' ');
  };

  const isImageFile = (file: Blob): file is File => file instanceof File && file.type.startsWith('image/');

  const uploadAndInsertImages = async (
    files: Blob[],
    getEditorState: () => EditorState,
    onChange: (state: EditorState) => void,
  ): Promise<boolean> => {
    const imageFiles = files.filter(isImageFile);

    if (!imageFiles.length) {
      return false;
    }

    setUploadState({
      active: true,
      progress: 0,
      fileName: imageFiles[0]?.name || '',
    });

    try {
      for (const file of imageFiles) {
        if (!isMountedRef.current) return true;

        const imageUrl = await uploadImageToMinio(file, (progress) => {
          if (!isMountedRef.current) return;
          setUploadState({
            active: true,
            progress,
            fileName: file.name,
          });
        });

        const latestEditorState = getEditorState();
        const nextEditorState = await insertImageBlock(latestEditorState, imageUrl, file.name);
        onChange(nextEditorState);
      }

      return true;
    } catch (error) {
      console.error('Image upload failed:', error);
      return true;
    } finally {
      if (isMountedRef.current) {
        setUploadState({
          active: false,
          progress: 0,
          fileName: '',
        });
      }
    }
  };

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
        defaultValue={createEditorStateFromHTMLString('') as PathValue<T, Path<T>>}
        render={({ field, fieldState }) => {
          const safeEditorState = field.value?.getCurrentContent
            ? field.value
            : typeof field.value === 'string'
            ? createEditorStateFromHTMLString(field.value)
            : createEditorStateFromHTMLString('');
          editorStateRef.current = safeEditorState;

          const handleImageUpload = async (file: File) => {
            setUploadState({
              active: true,
              progress: 0,
              fileName: file.name,
            });

            try {
              const imageUrl = await uploadImageToMinio(file, (progress) => {
                if (!isMountedRef.current) return;
                setUploadState({
                  active: true,
                  progress,
                  fileName: file.name,
                });
              });

              const nextEditorState = await insertImageBlock(editorStateRef.current, imageUrl, file.name);
              field.onChange(nextEditorState);
              return { data: { link: imageUrl } };
            } finally {
              if (isMountedRef.current) {
                setUploadState({
                  active: false,
                  progress: 0,
                  fileName: '',
                });
              }
            }
          };

          const handlePastedFiles = (files: Blob[]) => {
            void uploadAndInsertImages(files, () => editorStateRef.current, field.onChange);
            return 'handled' as const;
          };

          const handleDroppedFiles = (_selection: unknown, files: Blob[]) => {
            const handled = files.some(isImageFile);
            if (!handled) {
              return 'not-handled' as const;
            }

            void uploadAndInsertImages(files, () => editorStateRef.current, field.onChange);
            return 'handled' as const;
          };

          return (
            <>
              <Box sx={{ position: 'relative' }}>
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
                  handlePastedFiles={handlePastedFiles}
                  handleDroppedFiles={handleDroppedFiles}
                  toolbar={{
                    options: ['inline', 'list', 'image', 'history'],
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
                    image: {
                      uploadEnabled: true,
                      uploadCallback: handleImageUpload,
                      previewImage: true,
                      alignmentEnabled: false,
                      urlEnabled: false,
                      inputAccept: 'image/*',
                      alt: { present: true, mandatory: false },
                    },
                  }}
                />

                {uploadState.active && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.72)',
                      backdropFilter: 'blur(1px)',
                      border: '1px solid',
                      borderColor: '#e0e0e0',
                      borderRadius: 1,
                      pointerEvents: 'none',
                    }}
                  >
                    <CircularProgress size={26} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Đang tải ảnh {uploadState.fileName ? `: ${uploadState.fileName}` : ''} ({uploadState.progress}%)
                    </Typography>
                  </Box>
                )}
              </Box>

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
