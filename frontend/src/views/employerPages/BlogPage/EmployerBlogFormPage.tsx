'use client';
import React, { useState, useEffect, useRef } from 'react';
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

const EmployerBlogFormPage = ({ mode, articleId }: Props) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && articleId) {
      setLoading(true);
      contentService.employerGetBlog(articleId)
        .then((article) => {
          setTitle(article.title);
          setExcerpt(article.excerpt);
          setContent(article.content || '');
          setTags(article.tags || '');
          setTagList(article.tagList || []);
          setExistingThumbnailUrl(article.thumbnailUrl || null);
        })
        .catch(() => toastMessages.error('Không thể tải bài viết'))
        .finally(() => setLoading(false));
    }
  }, [mode, articleId]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tagList.includes(t)) {
      const newList = [...tagList, t];
      setTagList(newList);
      setTags(newList.join(','));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    const newList = tagList.filter(t => t !== tag);
    setTagList(newList);
    setTags(newList.join(','));
  };

  const handleSave = async (submitForReview = false) => {
    if (!title.trim()) { toastMessages.error('Vui lòng nhập tiêu đề'); return; }
    if (!content.trim()) { toastMessages.error('Vui lòng nhập nội dung'); return; }

    setSaving(true);
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
        router.push('/employer/blog');
      } else if (articleId) {
        await contentService.employerUpdateBlog(articleId, payload, thumbnailFile || undefined);
        toastMessages.success(submitForReview ? 'Đã gửi bài viết chờ duyệt!' : 'Đã lưu thay đổi!');
      }
    } catch {
      toastMessages.error('Không thể lưu bài viết');
    } finally {
      setSaving(false);
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
        <IconButton onClick={() => router.push('/employer/blog')} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chia sẻ kinh nghiệm tuyển dụng của bạn..."
              sx={{ mb: 2 }}
              inputProps={{ style: { fontSize: '1.1rem', fontWeight: 700 } }}
            />
            <TextField
              fullWidth
              label="Mô tả ngắn"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
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
            <SimpleRichEditor value={content} onChange={setContent} minHeight={350} />
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
                  onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); setExistingThumbnailUrl(null); }}>
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
                onChange={(e) => setTagInput(e.target.value)}
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
