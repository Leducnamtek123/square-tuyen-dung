'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import ShortTextIcon from '@mui/icons-material/ShortText';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TuneIcon from '@mui/icons-material/Tune';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useTranslation } from 'react-i18next';

import commonService from '@/services/commonService';
import {
  createEditorStateFromHTMLString,
  convertEditorStateToHTMLString,
} from '@/utils/editorUtils';
import { AIContentType, AIActionType, generateWithAI } from './aiAssistantEngine';
import AIAssistantModal from './AIAssistantModal';
import TemplatesModal from './TemplatesModal';
import PreviewModal from './PreviewModal';
import LinkModal from './LinkModal';
import TableModal from './TableModal';
import CalloutModal, { CalloutType } from './CalloutModal';

type DraftJsModule = typeof import('draft-js');
type EditorState = import('draft-js').EditorState;

const loadDraftJs = () => import('draft-js') as Promise<DraftJsModule>;

const DraftEditor: any = dynamic(
  (async () => {
    const mod: any = await import('react-draft-wysiwyg');
    const Editor: any = mod.Editor || mod.default || mod;
    return { default: Editor };
  }) as any,
  { ssr: false }
) as any;

export interface ModernRichEditorProps {
  value?: EditorState | string;
  onChange?: (val: any) => void;
  placeholder?: string;
  minHeight?: number | string;
  title?: string;
  showRequired?: boolean;
  contextType?: AIContentType;
  disabled?: boolean;
  jobTitle?: string;
}

export const ModernRichEditor: React.FC<ModernRichEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = 260,
  title,
  showRequired = false,
  contextType = 'general',
  disabled = false,
  jobTitle,
}) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const defaultPlaceholder = placeholder || t('editor.status.markdownShortcutsSupported', 'Bắt đầu soạn thảo nội dung hoặc sử dụng Trợ lý AI để tạo tự động...');

  const TEXT_COLORS = [
    { label: t('editor.colors.default', 'Mặc định'), color: '#1e293b' },
    { label: t('editor.colors.blue', 'Xanh Indigo'), color: '#4f46e5' },
    { label: t('editor.colors.skyBlue', 'Xanh Lam'), color: '#0284c7' },
    { label: t('editor.colors.green', 'Xanh Lá'), color: '#16a34a' },
    { label: t('editor.colors.rubyRed', 'Đỏ Ruby'), color: '#dc2626' },
    { label: t('editor.colors.violet', 'Tím Violet'), color: '#9333ea' },
    { label: t('editor.colors.peach', 'Cam Amber'), color: '#d97706' },
    { label: t('editor.colors.slate', 'Xám Slate'), color: '#64748b' },
  ];

  const BG_HIGHLIGHTS = [
    { label: t('editor.colors.none', 'Không màu'), color: 'transparent' },
    { label: t('editor.colors.lemonYellow', 'Vàng chanh'), color: '#fef08a' },
    { label: t('editor.colors.mintGreen', 'Xanh bạc hà'), color: '#bbf7d0' },
    { label: t('editor.colors.skyBlue', 'Xanh mây'), color: '#bae6fd' },
    { label: t('editor.colors.lavender', 'Tím hoa cà'), color: '#e9d5ff' },
    { label: t('editor.colors.peach', 'Hồng phấn'), color: '#fbcfe8' },
    { label: t('editor.colors.peach', 'Cam nhạt'), color: '#fed7aa' },
  ];

  // Editor state management
  const getInitialState = (): EditorState => {
    if (value && typeof (value as any)?.getCurrentContent === 'function') {
      return value as EditorState;
    }
    if (typeof value === 'string') {
      return createEditorStateFromHTMLString(value);
    }
    return createEditorStateFromHTMLString('');
  };

  const [editorState, setEditorState] = useState<EditorState>(getInitialState);
  const editorStateRef = useRef<EditorState>(editorState);
  const isMountedRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [openAIModal, setOpenAIModal] = useState(false);
  const [openTemplatesModal, setOpenTemplatesModal] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [openTableModal, setOpenTableModal] = useState(false);
  const [openCalloutModal, setOpenCalloutModal] = useState(false);

  // Popover menus state
  const [headingAnchor, setHeadingAnchor] = useState<null | HTMLElement>(null);
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);
  const [highlightAnchor, setHighlightAnchor] = useState<null | HTMLElement>(null);
  const [aiMenuAnchor, setAiMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreToolsAnchor, setMoreToolsAnchor] = useState<null | HTMLElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccessSnackbar, setAiSuccessSnackbar] = useState<string | null>(null);
  const lastContentBeforeAIRef = useRef<string>('');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Upload state
  const [uploadState, setUploadState] = useState<{
    active: boolean;
    progress: number;
    fileName: string;
  }>({
    active: false,
    progress: 0,
    fileName: '',
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Synchronize when external value prop changes
  useEffect(() => {
    if (value) {
      if (typeof (value as any)?.getCurrentContent === 'function') {
        setEditorState(value as EditorState);
        editorStateRef.current = value as EditorState;
      } else if (typeof value === 'string') {
        const currentHtml = convertEditorStateToHTMLString(editorStateRef.current);
        if (currentHtml !== value) {
          const nextState = createEditorStateFromHTMLString(value);
          setEditorState(nextState);
          editorStateRef.current = nextState;
        }
      }
    }
  }, [value]);

  const handleEditorStateChange = useCallback((nextState: EditorState) => {
    editorStateRef.current = nextState;
    setEditorState(nextState);
    if (onChange) {
      onChange(nextState);
    }
  }, [onChange]);

  // Calculate stats
  const htmlContent = useMemo(() => {
    return convertEditorStateToHTMLString(editorState);
  }, [editorState]);

  const plainText = useMemo(() => {
    return htmlContent.replace(/<[^>]*>?/gm, ' ').trim();
  }, [htmlContent]);

  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Direct formatting helpers
  const applyInlineStyle = async (style: string) => {
    const { RichUtils } = await loadDraftJs();
    const nextState = RichUtils.toggleInlineStyle(editorStateRef.current as any, style);
    handleEditorStateChange(nextState as any);
  };

  const applyBlockType = async (blockType: string) => {
    const { RichUtils } = await loadDraftJs();
    const nextState = RichUtils.toggleBlockType(editorStateRef.current as any, blockType);
    handleEditorStateChange(nextState as any);
    setHeadingAnchor(null);
  };

  const handleUndo = async () => {
    const draftMod: any = await loadDraftJs();
    const DraftEditorState = draftMod.EditorState;
    if (typeof DraftEditorState?.undo === 'function') {
      const nextState = DraftEditorState.undo(editorStateRef.current as any);
      if (nextState) handleEditorStateChange(nextState);
    }
  };

  const handleRedo = async () => {
    const draftMod: any = await loadDraftJs();
    const DraftEditorState = draftMod.EditorState;
    if (typeof DraftEditorState?.redo === 'function') {
      const nextState = DraftEditorState.redo(editorStateRef.current as any);
      if (nextState) handleEditorStateChange(nextState);
    }
  };

  const applyAlignment = async (alignment: 'left' | 'justify' | 'center' | 'right') => {
    try {
      const { Modifier, EditorState }: any = await loadDraftJs();
      const { Map } = await import('immutable');
      const currentContent = (editorStateRef.current as any).getCurrentContent();
      const selection = (editorStateRef.current as any).getSelection();
      const contentWithData = Modifier.setBlockData(
        currentContent,
        selection,
        Map({ 'text-align': alignment })
      );
      const nextState = EditorState.push(editorStateRef.current, contentWithData, 'change-block-data');
      handleEditorStateChange(nextState);
    } catch (err) {
      console.error('Error applying alignment:', err);
    }
  };

  const customBlockStyleFn = (contentBlock: any) => {
    try {
      const align = contentBlock?.getData?.()?.get?.('text-align');
      if (align === 'justify') return 'editor-align-justify';
      if (align === 'center') return 'editor-align-center';
      if (align === 'right') return 'editor-align-right';
      return 'editor-align-left';
    } catch {
      return '';
    }
  };

  // Active state indicators
  const currentInlineStyle = useMemo(() => {
    try {
      return (editorState as any)?.getCurrentInlineStyle?.() || null;
    } catch {
      return null;
    }
  }, [editorState]);

  const isBold = currentInlineStyle ? currentInlineStyle.has('BOLD') : false;
  const isItalic = currentInlineStyle ? currentInlineStyle.has('ITALIC') : false;
  const isUnderline = currentInlineStyle ? currentInlineStyle.has('UNDERLINE') : false;

  const currentBlockType = useMemo(() => {
    try {
      const selection = (editorState as any)?.getSelection?.();
      if (!selection) return 'unstyled';
      const content = (editorState as any)?.getCurrentContent?.();
      return content?.getBlockForKey(selection.getStartKey())?.getType() || 'unstyled';
    } catch {
      return 'unstyled';
    }
  }, [editorState]);

  const isBulletList = currentBlockType === 'unordered-list-item';
  const isNumberedList = currentBlockType === 'ordered-list-item';

  const currentAlignment = useMemo(() => {
    try {
      const selection = (editorState as any)?.getSelection?.();
      if (!selection) return 'left';
      const content = (editorState as any)?.getCurrentContent?.();
      const block = content?.getBlockForKey(selection.getStartKey());
      return block?.getData()?.get('text-align') || 'left';
    } catch {
      return 'left';
    }
  }, [editorState]);

  const handleQuickAI = async (action: AIActionType) => {
    setAiMenuAnchor(null);
    const currentHtml = convertEditorStateToHTMLString(editorStateRef.current);
    lastContentBeforeAIRef.current = currentHtml;
    setAiLoading(true);

    try {
      const generated = await generateWithAI({
        action,
        contentType: contextType,
        currentContent: currentHtml,
        jobTitle,
        tone: 'professional',
        length: 'medium',
      });

      if (generated) {
        applyHTMLContent(generated, 'replace');
        setAiSuccessSnackbar('✨ Đã tối ưu hóa nội dung thành công với AI!');
      }
    } catch (err) {
      console.error('Quick AI error:', err);
    } finally {
      if (isMountedRef.current) {
        setAiLoading(false);
      }
    }
  };

  // Insert Image helper via MinIO
  const insertImageBlock = async (state: EditorState, imageUrl: string, altText = ''): Promise<EditorState> => {
    const { AtomicBlockUtils, EditorState: DraftEditorState }: any = await loadDraftJs();
    const contentState = (state as any).getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('IMAGE', 'MUTABLE', {
      src: imageUrl,
      alt: altText,
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const nextEditorState = DraftEditorState.set(state, {
      currentContent: contentStateWithEntity,
    });
    return AtomicBlockUtils.insertAtomicBlock(nextEditorState, entityKey, ' ');
  };

  const handleUploadImageFile = async (file: File) => {
    setUploadState({ active: true, progress: 0, fileName: file.name });
    try {
      const uploadResult = await commonService.uploadFile(file, 'OTHER', {
        onUploadProgress: (progress) => {
          if (!isMountedRef.current) return;
          setUploadState({ active: true, progress, fileName: file.name });
        },
      });
      if (!uploadResult?.url) throw new Error('Upload failed');
      const nextState = await insertImageBlock(editorStateRef.current, uploadResult.url, file.name);
      handleEditorStateChange(nextState);
      return { data: { link: uploadResult.url } };
    } catch (e) {
      console.error('Image upload failed:', e);
      return { data: { link: '' } };
    } finally {
      if (isMountedRef.current) {
        setUploadState({ active: false, progress: 0, fileName: '' });
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      void handleUploadImageFile(files[0]);
    }
    e.target.value = '';
  };

  // Helper to replace or append HTML content into Draft EditorState
  const applyHTMLContent = (newHtml: string, mode: 'replace' | 'insert' | 'append') => {
    if (mode === 'replace') {
      const nextState = createEditorStateFromHTMLString(newHtml);
      handleEditorStateChange(nextState);
    } else if (mode === 'append') {
      const current = convertEditorStateToHTMLString(editorStateRef.current);
      const merged = `${current}<br/>${newHtml}`;
      const nextState = createEditorStateFromHTMLString(merged);
      handleEditorStateChange(nextState);
    } else {
      // insert
      const current = convertEditorStateToHTMLString(editorStateRef.current);
      const merged = current ? `${current}<br/>${newHtml}` : newHtml;
      const nextState = createEditorStateFromHTMLString(merged);
      handleEditorStateChange(nextState);
    }
  };

  // Link insertion
  const handleInsertLink = async (url: string, text: string) => {
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    applyHTMLContent(linkHtml, 'append');
  };

  // Table insertion
  const handleInsertTable = (rows: number, cols: number, hasHeader: boolean) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">\n';
    if (hasHeader) {
      tableHtml += '  <thead>\n    <tr style="background-color: #f1f5f9;">\n';
      for (let c = 1; c <= cols; c++) {
        tableHtml += `      <th style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-weight: 600;">${t('editor.table.headerCell', 'Tiêu đề')} ${c}</th>\n`;
      }
      tableHtml += '    </tr>\n  </thead>\n';
    }
    tableHtml += '  <tbody>\n';
    for (let r = 1; r <= rows; r++) {
      tableHtml += '    <tr>\n';
      for (let c = 1; c <= cols; c++) {
        tableHtml += `      <td style="border: 1px solid #cbd5e1; padding: 10px 14px;">${t('editor.table.dataCell', 'Dữ liệu')} (${r}, ${c})</td>\n`;
      }
      tableHtml += '    </tr>\n';
    }
    tableHtml += '  </tbody>\n</table>';
    applyHTMLContent(tableHtml, 'append');
  };

  // Callout insertion
  const handleInsertCallout = (type: CalloutType, boxTitle: string, boxContent: string) => {
    const colors: Record<CalloutType, { bg: string; border: string; text: string }> = {
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
      tip: { bg: '#faf5ff', border: '#a855f7', text: '#6b21a8' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
      success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
    };
    const c = colors[type];
    const calloutHtml = `<div style="background-color: ${c.bg}; border-left: 4px solid ${c.border}; padding: 14px 18px; border-radius: 6px; margin: 14px 0;">
  <strong style="color: ${c.text}; font-size: 1rem;">${boxTitle}</strong>
  <p style="margin: 6px 0 0 0; color: #334155; font-size: 0.92rem; line-height: 1.5;">${boxContent || ''}</p>
</div>`;
    applyHTMLContent(calloutHtml, 'append');
  };

  // Divider insertion
  const handleInsertDivider = () => {
    applyHTMLContent('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />', 'append');
  };

  return (
    <Box
      sx={{
        width: '100%',
        ...(isFullscreen && {
          position: 'fixed',
          inset: 0,
          zIndex: 1400,
          bgcolor: 'background.paper',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      {/* Optional Title */}
      {title && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {title} {showRequired && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        </Typography>
      )}

      {/* Main Editor Card Container */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          flex: isFullscreen ? 1 : undefined,
          boxShadow: isDark
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px rgba(0, 0, 0, 0.04)',
          '&:hover': {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#94A3B8',
          },
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
          },
        }}
      >
        {/* Modern Top Header Toolbar */}
        <Box
          sx={{
            py: 0.75,
            px: 1.5,
            bgcolor: isDark ? '#0F172A' : '#FAFAFC',
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {/* Left Side: Standard formatting buttons matching user's sample image */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {/* Bold */}
            <Tooltip title={t('editor.toolbar.bold', 'In đậm (Ctrl+B)')}>
              <IconButton
                size="small"
                onClick={() => applyInlineStyle('BOLD')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: isBold ? '#4F46E5' : '#334155',
                  bgcolor: isBold ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: isBold ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                B
              </IconButton>
            </Tooltip>

            {/* Italic */}
            <Tooltip title={t('editor.toolbar.italic', 'In nghiêng (Ctrl+I)')}>
              <IconButton
                size="small"
                onClick={() => applyInlineStyle('ITALIC')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  fontFamily: 'Georgia, serif',
                  color: isItalic ? '#4F46E5' : '#334155',
                  bgcolor: isItalic ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: isItalic ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                I
              </IconButton>
            </Tooltip>

            {/* Underline */}
            <Tooltip title={t('editor.toolbar.underline', 'Gạch chân (Ctrl+U)')}>
              <IconButton
                size="small"
                onClick={() => applyInlineStyle('UNDERLINE')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  fontWeight: 600,
                  textDecoration: 'underline',
                  fontSize: '1rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: isUnderline ? '#4F46E5' : '#334155',
                  bgcolor: isUnderline ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: isUnderline ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                U
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

            {/* Bullet List */}
            <Tooltip title={t('editor.toolbar.bulletList', 'Danh sách gạch đầu dòng')}>
              <IconButton
                size="small"
                onClick={() => applyBlockType('unordered-list-item')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: isBulletList ? '#4F46E5' : '#334155',
                  bgcolor: isBulletList ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: isBulletList ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <FormatListBulletedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Numbered List */}
            <Tooltip title={t('editor.toolbar.orderedList', 'Danh sách số')}>
              <IconButton
                size="small"
                onClick={() => applyBlockType('ordered-list-item')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: isNumberedList ? '#4F46E5' : '#334155',
                  bgcolor: isNumberedList ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: isNumberedList ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <FormatListNumberedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

            {/* Align Left */}
            <Tooltip title={t('editor.toolbar.alignLeft', 'Căn lề trái')}>
              <IconButton
                size="small"
                onClick={() => applyAlignment('left')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: currentAlignment === 'left' ? '#4F46E5' : '#334155',
                  bgcolor: currentAlignment === 'left' ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: currentAlignment === 'left' ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <FormatAlignLeftIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Align Justify */}
            <Tooltip title={t('editor.toolbar.alignJustify', 'Căn đều hai bên')}>
              <IconButton
                size="small"
                onClick={() => applyAlignment('justify')}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: currentAlignment === 'justify' ? '#4F46E5' : '#334155',
                  bgcolor: currentAlignment === 'justify' ? '#EEF2FF' : 'transparent',
                  '&:hover': { bgcolor: currentAlignment === 'justify' ? '#E0E7FF' : 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <FormatAlignJustifyIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

            {/* Undo */}
            <Tooltip title={t('editor.toolbar.undo', 'Hoàn tác (Ctrl+Z)')}>
              <IconButton
                size="small"
                onClick={handleUndo}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: '#475569',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <UndoIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Redo */}
            <Tooltip title={t('editor.toolbar.redo', 'Làm lại (Ctrl+Y)')}>
              <IconButton
                size="small"
                onClick={handleRedo}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: '#475569',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <RedoIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* More options button (Heading, Image, Link, Table) */}
            <Tooltip title={t('editor.toolbar.moreTools', 'Thêm công cụ...')}>
              <IconButton
                size="small"
                onClick={(e) => setMoreToolsAnchor(e.currentTarget)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  color: '#64748B',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Right Side: ✨ Sửa với AI Button & Quick Actions Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Button
              size="small"
              onClick={(e) => setAiMenuAnchor(e.currentTarget)}
              disabled={aiLoading}
              startIcon={
                aiLoading ? (
                  <CircularProgress size={16} sx={{ color: '#4F46E5' }} />
                ) : (
                  <AutoAwesomeIcon sx={{ fontSize: '1.15rem !important', color: '#4F46E5' }} />
                )
              }
              sx={{
                color: '#4F46E5',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: 'transparent',
                border: '1px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(79, 70, 229, 0.08)',
                  borderColor: 'rgba(79, 70, 229, 0.2)',
                },
              }}
            >
              {aiLoading ? 'Đang viết với AI...' : 'Sửa với AI'}
            </Button>
          </Box>
        </Box>

        {/* Quick AI Actions Menu */}
        <Menu
          anchorEl={aiMenuAnchor}
          open={Boolean(aiMenuAnchor)}
          onClose={() => setAiMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1,
              minWidth: 320,
              maxWidth: 380,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              p: 0.75,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Box sx={{ px: 1.5, py: 1, mb: 0.5, bgcolor: '#F8FAFC', borderRadius: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F46E5', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              ✨ TRỢ LÝ AI TUYỂN DỤNG
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
              {jobTitle ? `Tối ưu cho vị trí: "${jobTitle}"` : 'Tối ưu hóa nội dung thông minh với 1 chạm'}
            </Typography>
          </Box>

          <MenuItem onClick={() => handleQuickAI('improve')} sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}>
            <AutoAwesomeIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Viết lại chuyên nghiệp hơn
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Nâng cấp câu từ, mượt mà chuẩn văn phong doanh nghiệp
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => handleQuickAI('fix_spelling')} sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}>
            <SpellcheckIcon sx={{ color: '#059669', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Sửa lỗi chính tả & câu từ
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Khắc phục lỗi gõ tiếng Việt, dấu câu, ngắt đoạn
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => handleQuickAI('format_bullets')} sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}>
            <FormatListBulletedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Định dạng danh sách gạch đầu dòng
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Tự động cấu trúc bullet points & in đậm từ khóa chính
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => handleQuickAI('expand')} sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}>
            <AddCircleOutlineIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Mở rộng & bổ sung chi tiết
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Bổ sung tiêu chuẩn thị trường & quy định chi tiết
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => handleQuickAI('shorten')} sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}>
            <ShortTextIcon sx={{ color: '#D97706', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Rút gọn súc tích
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Tóm tắt các ý cốt lõi, ngắn gọn và cuốn hút
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={() => handleQuickAI('generate')} sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}>
            <LightbulbOutlinedIcon sx={{ color: '#EA580C', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Tạo mới nội dung chuẩn theo vị trí
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {jobTitle ? `Tự động sinh nội dung hoàn chỉnh cho "${jobTitle}"` : 'Tạo mẫu nội dung chuẩn ngành đầy đủ'}
              </Typography>
            </Box>
          </MenuItem>

          <Divider sx={{ my: 0.75 }} />

          <MenuItem
            onClick={() => {
              setAiMenuAnchor(null);
              setOpenAIModal(true);
            }}
            sx={{ borderRadius: 1.5, py: 1, gap: 1.5 }}
          >
            <TuneIcon sx={{ color: '#475569', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                Trợ lý AI nâng cao...
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Tùy chỉnh câu lệnh prompt, giọng điệu & độ dài
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* More Tools Menu */}
        <Menu
          anchorEl={moreToolsAnchor}
          open={Boolean(moreToolsAnchor)}
          onClose={() => setMoreToolsAnchor(null)}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, minWidth: 220, p: 0.5 },
          }}
        >
          <MenuItem onClick={(e) => { setMoreToolsAnchor(null); setHeadingAnchor(e.currentTarget); }}>
            <KeyboardArrowDownIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.heading', 'Định dạng Tiêu đề (H1 - H4)')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); fileInputRef.current?.click(); }}>
            <ImageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.uploadImage', 'Tải ảnh lên')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); setOpenLinkModal(true); }}>
            <LinkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.link', 'Chèn liên kết')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); setOpenTableModal(true); }}>
            <TableChartIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.table', 'Chèn bảng dữ liệu')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); setOpenCalloutModal(true); }}>
            <LightbulbOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.callout', 'Chèn ghi chú nổi bật')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); handleInsertDivider(); }}>
            <HorizontalRuleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.horizontalRule', 'Đường phân cách')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); setOpenTemplatesModal(true); }}>
            <MenuBookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.templates', 'Mẫu nội dung có sẵn')}</Typography>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { setMoreToolsAnchor(null); setOpenPreviewModal(true); }}>
            <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{t('editor.toolbar.livePreview', 'Xem trước hiển thị')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setMoreToolsAnchor(null); setIsFullscreen(!isFullscreen); }}>
            {isFullscreen ? <FullscreenExitIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> : <FullscreenIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
            <Typography variant="body2">{isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}</Typography>
          </MenuItem>
        </Menu>

        {/* Headings Menu */}
        <Menu anchorEl={headingAnchor} open={Boolean(headingAnchor)} onClose={() => setHeadingAnchor(null)}>
          <MenuItem onClick={() => applyBlockType('unstyled')}>
            <Typography variant="body2">{t('editor.toolbar.normalText', 'Đoạn văn thường (Normal)')}</Typography>
          </MenuItem>
          <MenuItem onClick={() => applyBlockType('header-one')}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('editor.toolbar.heading1', 'Tiêu đề 1 (H1)')}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => applyBlockType('header-two')}>
            <Typography variant="subtitle2" fontWeight={700}>
              {t('editor.toolbar.heading2', 'Tiêu đề 2 (H2)')}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => applyBlockType('header-three')}>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {t('editor.toolbar.heading3', 'Tiêu đề 3 (H3)')}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => applyBlockType('header-four')}>
            <Typography variant="body2" fontWeight={700}>
              {t('editor.toolbar.heading4', 'Tiêu đề 4 (H4)')}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => applyBlockType('blockquote')}>
            <Typography variant="body2" fontStyle="italic">
              {t('editor.toolbar.blockquote', 'Khối trích dẫn (Quote)')}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => applyBlockType('code-block')}>
            <Typography variant="body2" fontFamily="monospace">
              {t('editor.toolbar.codeBlock', 'Khối mã nguồn (Code)')}
            </Typography>
          </MenuItem>
        </Menu>

        {/* Hidden image file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        {/* Editor Content Area */}
        <Box
          sx={{
            position: 'relative',
            flex: isFullscreen ? 1 : undefined,
            p: 2.5,
            minHeight: isFullscreen ? 'calc(100vh - 200px)' : minHeight,
            bgcolor: 'background.paper',
            overflowY: 'auto',
            cursor: 'text',
            '& .rdw-editor-main': {
              minHeight: isFullscreen ? 'calc(100vh - 220px)' : minHeight,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'text.primary',
            },
            '& .rdw-editor-toolbar': {
              display: 'none !important',
            },
            '& .public-DraftEditor-content': {
              minHeight: isFullscreen ? 'calc(100vh - 220px)' : minHeight,
            },
            '& .editor-align-justify': { textAlign: 'justify !important' },
            '& .editor-align-center': { textAlign: 'center !important' },
            '& .editor-align-right': { textAlign: 'right !important' },
            '& .editor-align-left': { textAlign: 'left !important' },
            '& h1': { fontSize: '1.6rem', fontWeight: 800, mt: 2, mb: 1, color: 'text.primary' },
            '& h2': { fontSize: '1.3rem', fontWeight: 700, mt: 2, mb: 1, color: 'text.primary' },
            '& h3': { fontSize: '1.1rem', fontWeight: 700, mt: 1.5, mb: 0.8, color: 'primary.main' },
            '& h4': { fontSize: '0.98rem', fontWeight: 700, mt: 1.2, mb: 0.6, color: 'text.primary' },
            '& p': { mb: 1.2, lineHeight: 1.7 },
            '& ul': { pl: 3, mb: 1.2, listStyleType: 'disc !important' },
            '& ol': { pl: 3, mb: 1.2, listStyleType: 'decimal !important' },
            '& li': { mb: 0.6, lineHeight: 1.6 },
            '& li strong': { fontWeight: 700, color: 'text.primary' },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2,
              py: 0.5,
              my: 1.5,
              fontStyle: 'italic',
              bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.04)',
              borderRadius: '0 6px 6px 0',
            },
            '& img': {
              maxWidth: '100%',
              borderRadius: 2,
              my: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            },
          }}
        >
          <DraftEditor
            editorState={editorState}
            onEditorStateChange={handleEditorStateChange}
            placeholder={defaultPlaceholder}
            readOnly={disabled}
            blockStyleFn={customBlockStyleFn}
            handlePastedFiles={(files: Blob[]) => {
              const img = files.find((f) => f.type.startsWith('image/'));
              if (img instanceof File) {
                void handleUploadImageFile(img);
                return 'handled' as const;
              }
              return 'not-handled' as const;
            }}
            handleDroppedFiles={(_sel: unknown, files: Blob[]) => {
              const img = files.find((f) => f.type.startsWith('image/'));
              if (img instanceof File) {
                void handleUploadImageFile(img);
                return 'handled' as const;
              }
              return 'not-handled' as const;
            }}
            toolbarHidden
          />

          {/* Uploading Spinner Overlay */}
          {uploadState.active && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1.5,
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(3px)',
              }}
            >
              <CircularProgress size={32} />
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {t('editor.uploadingImage', 'Đang tải ảnh lên máy chủ')} {uploadState.fileName ? `(${uploadState.fileName})` : ''}: {uploadState.progress}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status Bar Footer */}
        <Box
          sx={{
            px: 2,
            py: 0.8,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>
              <strong>{wordCount}</strong> {t('editor.status.wordsUnit', 'từ')}
            </span>
            <span>•</span>
            <span>
              <strong>{charCount}</strong> {t('editor.status.charactersUnit', 'ký tự')}
            </span>
            <span>•</span>
            <span>{t('editor.status.readingTimeEst', 'Ước tính:')} <strong>~{readingTime}</strong> {t('editor.status.minutesRead', 'phút đọc')}</span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              onClick={() => setOpenAIModal(true)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 13 }} />
              {t('editor.status.aiReady', 'AILA AI Ready')}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Interactive Modals */}
      <AIAssistantModal
        open={openAIModal}
        onClose={() => setOpenAIModal(false)}
        currentContent={htmlContent}
        onApplyContent={applyHTMLContent}
        detectedContext={contextType}
      />

      <TemplatesModal
        open={openTemplatesModal}
        onClose={() => setOpenTemplatesModal(false)}
        onSelectTemplate={(html) => applyHTMLContent(html, 'replace')}
        defaultCategory={contextType === 'company' ? 'company' : contextType === 'job_desc' ? 'job_desc' : contextType === 'benefits' ? 'benefits' : contextType === 'email' ? 'email' : 'all'}
      />

      <PreviewModal
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        htmlContent={htmlContent}
        title={title ? `${t('actions.preview', 'Xem trước')}: ${title}` : t('editor.preview.modalTitle', 'Xem Trước Nội Dung')}
      />

      <LinkModal
        open={openLinkModal}
        onClose={() => setOpenLinkModal(false)}
        onInsertLink={handleInsertLink}
      />

      <TableModal
        open={openTableModal}
        onClose={() => setOpenTableModal(false)}
        onInsertTable={handleInsertTable}
      />

      <CalloutModal
        open={openCalloutModal}
        onClose={() => setOpenCalloutModal(false)}
        onInsertCallout={handleInsertCallout}
      />

      {/* AI Success Feedback Toast */}
      <Snackbar
        open={Boolean(aiSuccessSnackbar)}
        autoHideDuration={6000}
        onClose={() => setAiSuccessSnackbar(null)}
        message={aiSuccessSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={
          <Button
            size="small"
            onClick={() => {
              if (lastContentBeforeAIRef.current !== undefined) {
                applyHTMLContent(lastContentBeforeAIRef.current, 'replace');
                setAiSuccessSnackbar(null);
              }
            }}
            sx={{ fontWeight: 700, color: '#818CF8', textTransform: 'none' }}
          >
            {t('actions.undo', 'Hoàn tác')}
          </Button>
        }
      />
    </Box>
  );
};

export default ModernRichEditor;
