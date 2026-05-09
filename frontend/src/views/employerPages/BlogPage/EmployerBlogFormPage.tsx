'use client';
import React, { useEffect, useReducer, useRef } from 'react';
import {
  Box, Button, TextField, Stack, Typography, Chip, Paper,
  CircularProgress, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import contentService, { ArticlePayload } from '@/services/contentService';
import toastMessages from '@/utils/toastMessages';
import SimpleRichEditor from '@/components/Common/Controls/SimpleRichEditor';

interface Props {
  mode: 'create' | 'edit';
  articleId?: number;
}

type BlogFormState = {
  loading: boolean;
  saving: boolean;
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  tagInput: string;
  tagList: string[];
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  existingThumbnailUrl: string | null;
};

type BlogFormAction =
  | { type: 'patch'; patch: Partial<BlogFormState> }
  | {
      type: 'loaded';
      article: {
        title: string;
        excerpt: string;
        content?: string | null;
        tags?: string | null;
        tagList?: string[];
        thumbnailUrl?: string | null;
      };
    }
  | { type: 'loadFailed' }
  | { type: 'addTag'; tag: string }
  | { type: 'removeTag'; tag: string }
  | { type: 'clearThumbnail' };

const initialBlogFormState: BlogFormState = {
  loading: false,
  saving: false,
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  tagInput: '',
  tagList: [],
  thumbnailFile: null,
  thumbnailPreview: null,
  existingThumbnailUrl: null,
};

const blogFormReducer = (state: BlogFormState, action: BlogFormAction): BlogFormState => {
  switch (action.type) {
    case 'patch':
      return {
        ...state,
        ...action.patch,
      };
    case 'loaded':
      return {
        ...state,
        loading: false,
        title: action.article.title,
        excerpt: action.article.excerpt,
        content: action.article.content || '',
        tags: action.article.tags || '',
        tagList: action.article.tagList || [],
        existingThumbnailUrl: action.article.thumbnailUrl || null,
      };
    case 'loadFailed':
      return {
        ...state,
        loading: false,
      };
    case 'addTag': {
      const tag = action.tag.trim();
      const tagList = tag && !state.tagList.includes(tag) ? [...state.tagList, tag] : state.tagList;

      return {
        ...state,
        tagInput: '',
        tagList,
        tags: tagList.join(','),
      };
    }
    case 'removeTag': {
      const tagList = state.tagList.filter((tag) => tag !== action.tag);

      return {
        ...state,
        tagList,
        tags: tagList.join(','),
      };
    }
    case 'clearThumbnail':
      return {
        ...state,
        thumbnailFile: null,
        thumbnailPreview: null,
        existingThumbnailUrl: null,
      };
    default:
      return state;
  }
};

const EmployerBlogFormPage = ({ mode, articleId }: Props) => {
  const { push } = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(blogFormReducer, initialBlogFormState);
  const {
    loading,
    saving,
    title,
    excerpt,
    content,
    tags,
    tagInput,
    tagList,
    thumbnailFile,
    thumbnailPreview,
    existingThumbnailUrl,
  } = state;

  useEffect(() => {
    if (mode === 'edit' && articleId) {
      dispatch({ type: 'patch', patch: { loading: true } });
      contentService.employerGetBlog(articleId)
        .then((article) => {
          dispatch({ type: 'loaded', article });
        })
        .catch(() => toastMessages.error('Không thể tải bài viết'))
        .finally(() => dispatch({ type: 'loadFailed' }));
    }
  }, [mode, articleId]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'patch', patch: { thumbnailFile: file } });
    const reader = new FileReader();
    reader.onload = (ev) => dispatch({ type: 'patch', patch: { thumbnailPreview: ev.target?.result as string } });
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    dispatch({ type: 'addTag', tag: tagInput });
  };

  const removeTag = (tag: string) => {
    dispatch({ type: 'removeTag', tag });
  };

  const handleSave = async (submitForReview = false) => {
    if (!title.trim()) { toastMessages.error('Vui lòng nhập tiêu đề'); return; }
    if (!content.trim()) { toastMessages.error('Vui lòng nhập nội dung'); return; }

    dispatch({ type: 'patch', patch: { saving: true } });
    const payload: ArticlePayload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      tags,
    };

    try {
      if (mode === 'create') {
        await contentService.employerCreateBlog(payload, thumbnailFile || undefined);
        toastMessages.success(submitForReview ? 'Đã gửi bài viết chờ duyệt!' : 'Đã lưu bản nháp!');
        push('/employer/blog');
      } else if (articleId) {
        await contentService.employerUpdateBlog(articleId, payload, thumbnailFile || undefined);
        toastMessages.success(submitForReview ? 'Đã gửi bài viết chờ duyệt!' : 'Đã lưu thay đổi!');
      }
    } catch {
      toastMessages.error('Không thể lưu bài viết');
    } finally {
      dispatch({ type: 'patch', patch: { saving: false } });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => push('/employer/blog')} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={900}>
            {mode === 'create' ? 'Viết bài blog' : 'Chỉnh sửa bài blog'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bài viết sẽ được Admin duyệt trước khi hiển thị công khai
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Lưu nháp
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => handleSave(true)}
            disabled={saving}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {saving ? 'Đang gửi...' : 'Gửi duyệt'}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Main */}
        <Box flex={1}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Tiêu đề bài viết"
              value={title}
              onChange={(e) => dispatch({ type: 'patch', patch: { title: e.target.value } })}
              placeholder="Chia sẻ kinh nghiệm tuyển dụng của bạn..."
              sx={{ mb: 2 }}
              inputProps={{ style: { fontSize: '1.1rem', fontWeight: 700 } }}
            />
            <TextField
              fullWidth
              label="Mô tả ngắn"
              value={excerpt}
              onChange={(e) => dispatch({ type: 'patch', patch: { excerpt: e.target.value } })}
              placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
              multiline
              rows={2}
              inputProps={{ maxLength: 500 }}
              helperText={`${excerpt.length}/500`}
            />
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
              NỘI DUNG BÀI VIẾT
            </Typography>
            <SimpleRichEditor value={content} onChange={(nextContent) => dispatch({ type: 'patch', patch: { content: nextContent } })} minHeight={350} />
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: { xs: '100%', lg: 300 } }}>
          {/* Thumbnail */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>ẢNH ĐẠI DIỆN</Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbnailChange}
            />
            {(thumbnailPreview || existingThumbnailUrl) ? (
              <Box sx={{ position: 'relative' }}>
                <Box component="img" src={thumbnailPreview || existingThumbnailUrl!} alt="thumbnail"
                  sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 1.5 }} />
                <IconButton size="small"
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={() => dispatch({ type: 'clearThumbnail' })}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Button size="small" fullWidth startIcon={<ImageIcon />} onClick={() => fileInputRef.current?.click()} sx={{ mt: 1 }}>
                  Đổi ảnh
                </Button>
              </Box>
            ) : (
              <Button variant="outlined" fullWidth startIcon={<ImageIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ height: 100, borderStyle: 'dashed', borderRadius: 1.5 }}>
                Chọn ảnh đại diện
              </Button>
            )}
          </Paper>

          {/* Tags */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>TAGS</Typography>
            <Stack direction="row" spacing={1} mb={1.5}>
              <TextField
                size="small" placeholder="Nhập tag..." value={tagInput}
                onChange={(e) => dispatch({ type: 'patch', patch: { tagInput: e.target.value } })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                fullWidth
              />
              <Button size="small" variant="outlined" onClick={addTag}>Thêm</Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {tagList.map((tag) => (
                <Chip key={tag} label={tag} size="small" onDelete={() => removeTag(tag)} />
              ))}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default EmployerBlogFormPage;
