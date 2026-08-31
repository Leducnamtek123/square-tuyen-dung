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
import { useTranslation } from 'react-i18next';

import commonService from '@/services/commonService';
import {
  createEditorStateFromHTMLString,
  convertEditorStateToHTMLString,
} from '@/utils/editorUtils';
import { AIContentType } from './aiAssistantEngine';
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
        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {title} {showRequired && <span style={{ color: '#ef4444' }}>*</span>}
        </Typography>
      )}

      {/* Main Editor Card Container */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1.5px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          flex: isFullscreen ? 1 : undefined,
          boxShadow: isDark
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 2px 12px rgba(0, 0, 0, 0.04)',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
          },
        }}
      >
        {/* Modern Top Header Toolbar */}
        <Box
          sx={{
            p: 1,
            px: 1.5,
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {/* Left Group: AI Sparkle Button + Smart Templates Hub */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {/* AI Assistant Button */}
            <Button
              size="small"
              onClick={() => setOpenAIModal(true)}
              startIcon={<AutoAwesomeIcon sx={{ fontSize: '1.1rem !important' }} />}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: 2,
                px: 1.8,
                py: 0.6,
                boxShadow: '0 3px 10px rgba(99, 102, 241, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                },
              }}
            >
              {t('editor.toolbar.aiAssistant', 'Trợ Lý AI')}
            </Button>

            {/* Smart Templates Button */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => setOpenTemplatesModal(true)}
              startIcon={<MenuBookIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              {t('editor.toolbar.templates', 'Mẫu Nội Dung')}
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 22 }} />

            {/* Headings Dropdown */}
            <Button
              size="small"
              onClick={(e) => setHeadingAnchor(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                textTransform: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'text.primary',
                minWidth: 100,
                justifyContent: 'space-between',
                px: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                bgcolor: 'background.paper',
              }}
            >
              {t('editor.toolbar.heading', 'Định dạng')}
            </Button>
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

            {/* Inline Styles Group */}
            <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
              <Tooltip title={t('editor.toolbar.bold', 'In đậm (Ctrl+B)')}>
                <IconButton size="small" onClick={() => applyInlineStyle('BOLD')}>
                  <FormatBoldIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.italic', 'In nghiêng (Ctrl+I)')}>
                <IconButton size="small" onClick={() => applyInlineStyle('ITALIC')}>
                  <FormatItalicIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.underline', 'Gạch chân (Ctrl+U)')}>
                <IconButton size="small" onClick={() => applyInlineStyle('UNDERLINE')}>
                  <FormatUnderlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.strike', 'Gạch ngang')}>
                <IconButton size="small" onClick={() => applyInlineStyle('STRIKETHROUGH')}>
                  <StrikethroughSIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.code', 'Mã inline')}>
                <IconButton size="small" onClick={() => applyInlineStyle('CODE')}>
                  <CodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            {/* Color & Highlight Dropdown */}
            <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
              <Tooltip title={t('editor.toolbar.textColor', 'Màu chữ')}>
                <IconButton size="small" onClick={(e) => setColorAnchor(e.currentTarget)}>
                  <FormatColorTextIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.highlightColor', 'Màu nền highlight')}>
                <IconButton size="small" onClick={(e) => setHighlightAnchor(e.currentTarget)}>
                  <FormatColorFillIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Popover
              open={Boolean(colorAnchor)}
              anchorEl={colorAnchor}
              onClose={() => setColorAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {TEXT_COLORS.map((item) => (
                  <Tooltip key={item.color} title={item.label}>
                    <Box
                      onClick={() => {
                        applyHTMLContent(`<span style="color: ${item.color};">${t('editor.sampleText', 'Văn bản màu')}</span>`, 'append');
                        setColorAnchor(null);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        cursor: 'pointer',
                        border: '2px solid #fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        '&:hover': { transform: 'scale(1.15)' },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Popover>

            <Popover
              open={Boolean(highlightAnchor)}
              anchorEl={highlightAnchor}
              onClose={() => setHighlightAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {BG_HIGHLIGHTS.map((item) => (
                  <Tooltip key={item.label} title={item.label}>
                    <Box
                      onClick={() => {
                        applyHTMLContent(`<mark style="background-color: ${item.color}; padding: 2px 4px; border-radius: 3px;">${t('editor.sampleHighlight', 'Văn bản highlight')}</mark>`, 'append');
                        setHighlightAnchor(null);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: item.color === 'transparent' ? '#f1f5f9' : item.color,
                        cursor: 'pointer',
                        border: '1px solid #cbd5e1',
                        '&:hover': { transform: 'scale(1.15)' },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Popover>

            {/* Lists & Alignment */}
            <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
              <Tooltip title={t('editor.toolbar.bulletList', 'Danh sách chấm tròn')}>
                <IconButton size="small" onClick={() => applyBlockType('unordered-list-item')}>
                  <FormatListBulletedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.orderedList', 'Danh sách số thứ tự')}>
                <IconButton size="small" onClick={() => applyBlockType('ordered-list-item')}>
                  <FormatListNumberedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 22 }} />

            {/* Insert Controls: Image, Link, Table, Callout, Divider */}
            <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
              <Tooltip title={t('editor.toolbar.uploadImage', 'Tải ảnh lên (Upload ảnh / Kéo thả)')}>
                <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.link', 'Chèn liên kết (Link)')}>
                <IconButton size="small" onClick={() => setOpenLinkModal(true)}>
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.table', 'Chèn bảng dữ liệu')}>
                <IconButton size="small" onClick={() => setOpenTableModal(true)}>
                  <TableChartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.callout', 'Chèn khối ghi chú (Callout box)')}>
                <IconButton size="small" onClick={() => setOpenCalloutModal(true)}>
                  <LightbulbOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.horizontalRule', 'Chèn đường phân cách ngang')}>
                <IconButton size="small" onClick={handleInsertDivider}>
                  <HorizontalRuleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            {/* Hidden image file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </Box>

          {/* Right Group: Undo/Redo, Preview, Fullscreen */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}>
              <Tooltip title={t('editor.toolbar.undo', 'Hoàn tác (Undo)')}>
                <IconButton size="small" onClick={handleUndo}>
                  <UndoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('editor.toolbar.redo', 'Làm lại (Redo)')}>
                <IconButton size="small" onClick={handleRedo}>
                  <RedoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <Tooltip title={t('editor.toolbar.livePreview', 'Xem trước bản in / hiển thị thực tế')}>
              <IconButton
                size="small"
                onClick={() => setOpenPreviewModal(true)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? t('actions.zoomOut', 'Thu nhỏ') : t('actions.zoomIn', 'Toàn màn hình')}>
              <IconButton
                size="small"
                onClick={() => setIsFullscreen(!isFullscreen)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                }}
              >
                {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

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
            '& h1': { fontSize: '1.6rem', fontWeight: 800, mt: 2, mb: 1, color: 'text.primary' },
            '& h2': { fontSize: '1.3rem', fontWeight: 700, mt: 2, mb: 1, color: 'text.primary' },
            '& h3': { fontSize: '1.1rem', fontWeight: 700, mt: 1.5, mb: 0.8, color: 'primary.main' },
            '& h4': { fontSize: '0.98rem', fontWeight: 700, mt: 1.2, mb: 0.6, color: 'text.primary' },
            '& p': { mb: 1.2, lineHeight: 1.7 },
            '& ul, & ol': { pl: 3, mb: 1.2 },
            '& li': { mb: 0.5, lineHeight: 1.6 },
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
    </Box>
  );
};

export default ModernRichEditor;
