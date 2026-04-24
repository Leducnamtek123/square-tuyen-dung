'use client';
/**
 * SimpleRichEditor — standalone wrapper around react-draft-wysiwyg
 * that accepts value (HTML string) / onChange (HTML string).
 * Used by Admin article form and Employer blog form.
 */
import React from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';
import { createEditorStateFromHTMLString, convertEditorStateToHTMLString } from '@/utils/editorUtils';
import commonService from '@/services/commonService';
import type { EditorProps } from 'react-draft-wysiwyg';

type DraftJsModule = typeof import('draft-js');
type EditorState = import('draft-js').EditorState;

const loadDraftJs = () => import('draft-js') as Promise<DraftJsModule>;

const DraftEditor = dynamic(
  async () => {
    const mod = await import('react-draft-wysiwyg');
    const Editor = mod.Editor || (mod as unknown as { default?: { Editor?: React.ComponentType<EditorProps> } | React.ComponentType<EditorProps> }).default || mod;
    return Editor as React.ComponentType<EditorProps>;
  },
  { ssr: false }
);

interface SimpleRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const SimpleRichEditor = ({ value, onChange, minHeight = 300 }: SimpleRichEditorProps) => {
  const [editorState, setEditorState] = React.useState<EditorState>(() =>
    createEditorStateFromHTMLString(value || '')
  );
  const editorStateRef = React.useRef<EditorState>(editorState);
  const isMountedRef = React.useRef(true);
  const isInitializedRef = React.useRef(false);

  React.useEffect(() => () => { isMountedRef.current = false; }, []);

  // Sync external value only on first mount (avoid loop)
  React.useEffect(() => {
    if (!isInitializedRef.current && value) {
      const state = createEditorStateFromHTMLString(value);
      setEditorState(state);
      editorStateRef.current = state;
      isInitializedRef.current = true;
    }
  }, [value]);

  const handleChange = (state: EditorState) => {
    editorStateRef.current = state;
    setEditorState(state);
    onChange(convertEditorStateToHTMLString(state));
  };

  const insertImageBlock = async (state: EditorState, imageUrl: string, altText = ''): Promise<EditorState> => {
    const { AtomicBlockUtils, EditorState: DraftEditorState } = await loadDraftJs();
    const contentState = state.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('IMAGE', 'MUTABLE', { src: imageUrl, alt: altText });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const nextState = DraftEditorState.set(state, { currentContent: contentStateWithEntity });
    return AtomicBlockUtils.insertAtomicBlock(nextState, entityKey, ' ');
  };

  const handleImageUpload = async (file: File) => {
    try {
      const uploadResult = await commonService.uploadFile(file, 'OTHER', {});
      if (!uploadResult?.url) throw new Error('Upload failed');
      const imageUrl = uploadResult.url;
      const nextState = await insertImageBlock(editorStateRef.current, imageUrl, file.name);
      handleChange(nextState);
      return { data: { link: imageUrl } };
    } catch (e) {
      console.error(e);
      return { data: { link: '' } };
    }
  };

  return (
    <Box>
      <React.Suspense fallback={<Box sx={{ height: minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
        <DraftEditor
          editorState={editorState}
          onEditorStateChange={handleChange}
          editorStyle={{
            border: '1px solid #e0e0e0',
            marginTop: -1,
            minHeight,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            padding: '0 8px',
          }}
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'image', 'history'],
            inline: { options: ['bold', 'italic', 'underline'] },
            image: {
              uploadEnabled: true,
              uploadCallback: handleImageUpload,
              previewImage: true,
              urlEnabled: false,
              inputAccept: 'image/*',
              alt: { present: false, mandatory: false },
            },
          }}
        />
      </React.Suspense>
    </Box>
  );
};

export default SimpleRichEditor;
