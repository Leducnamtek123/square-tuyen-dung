'use client';

/**
 * SimpleRichEditor - Modern Rich Text Editor with AI Assistant
 * accepts value (HTML string) / onChange (HTML string).
 * Used by Admin article form and Employer blog form.
 */
import React from 'react';
import { Box } from '@mui/material';
import ModernRichEditor from '../ModernRichEditor';
import { convertEditorStateToHTMLString } from '@/utils/editorUtils';
import { AIContentType } from '../ModernRichEditor/aiAssistantEngine';

interface SimpleRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number | string;
  placeholder?: string;
  title?: string;
  contextType?: AIContentType;
}

const SimpleRichEditor = ({
  value,
  onChange,
  minHeight = 320,
  placeholder = 'Soạn thảo nội dung bài viết hoặc sử dụng Trợ lý AI...',
  title,
  contextType = 'blog',
}: SimpleRichEditorProps) => {
  const handleChange = (editorStateOrVal: any) => {
    if (editorStateOrVal && typeof editorStateOrVal.getCurrentContent === 'function') {
      const html = convertEditorStateToHTMLString(editorStateOrVal);
      onChange(html);
    } else if (typeof editorStateOrVal === 'string') {
      onChange(editorStateOrVal);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ModernRichEditor
        value={value || ''}
        onChange={handleChange}
        minHeight={minHeight}
        placeholder={placeholder}
        title={title}
        contextType={contextType}
      />
    </Box>
  );
};

export default SimpleRichEditor;
