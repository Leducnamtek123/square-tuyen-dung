'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, TextField, Stack, Typography, MenuItem, Select,
  FormControl, InputLabel, Chip, Paper, CircularProgress, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import contentService, { ArticlePayload, ArticleCategory, ArticleStatus } from '@/services/contentService';
import toastMessages from '@/utils/toastMessages';

import SimpleRichEditor from '@/components/Common/Controls/SimpleRichEditor';

interface Props {
  mode: 'create' | 'edit';
  articleId?: number;
}

const AdminArticleFormPage = ({ mode, articleId }: Props) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('news');
  const [articleStatus, setArticleStatus] = useState<ArticleStatus>('draft');
  const [tags, setTags] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && articleId) {
      setLoading(true);
      contentService.adminGetArticle(articleId)
        .then((article) => {
          setTitle(article.title);
          setExcerpt(article.excerpt);
          setContent(article.content || '');
          setCategory(article.category);
          setArticleStatus(article.status);
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

  const handleSave = async (targetStatus?: ArticleStatus) => {
    if (!title.trim()) { toastMessages.error('Vui lòng nhập tiêu đề'); return; }
    if (!content.trim()) { toastMessages.error('Vui lòng nhập nội dung'); return; }

    setSaving(true);
    const payload: ArticlePayload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      category,
      status: targetStatus || articleStatus,
      tags,
    };

    try {
      if (mode === 'create') {
        const created = await contentService.adminCreateArticle(payload, thumbnailFile || undefined);
        toastMessages.success('Tạo bài viết thành công!');
        router.push(`/admin/articles/${created.id}`);
      } else if (articleId) {
        await contentService.adminUpdateArticle(articleId, payload, thumbnailFile || undefined);
        toastMessages.success('Lưu bài viết thành công!');
        if (targetStatus) setArticleStatus(targetStatus);
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => router.push('/admin/articles')} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={900}>
            {mode === 'create' ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave()}
            disabled={saving}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={() => handleSave('published')}
            disabled={saving}
            color="success"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Đăng bài
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Main Content Area */}
        <Box flex={1}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Tiêu đề bài viết"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn..."
              sx={{ mb: 2 }}
              inputProps={{ style: { fontSize: '1.1rem', fontWeight: 700 } }}
            />
            <TextField
              fullWidth
              label="Mô tả ngắn (excerpt)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tóm tắt nội dung bài viết (hiển thị trong danh sách)..."
              multiline
              rows={2}
              inputProps={{ maxLength: 500 }}
              helperText={`${excerpt.length}/500`}
            />
          </Paper>

          {/* Rich Text Editor */}
          <Paper sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
              NỘI DUNG BÀI VIẾT
            </Typography>
            <SimpleRichEditor
              value={content}
              onChange={setContent}
              minHeight={400}
            />
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: { xs: '100%', lg: 320 } }}>
          {/* Publish Settings */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              THIẾT LẬP ĐĂNG BÀI
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select value={category} label="Danh mục" onChange={(e) => setCategory(e.target.value as ArticleCategory)}>
                <MenuItem value="news" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ArticleIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> Tin tức
                </MenuItem>
                <MenuItem value="blog" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditNoteIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> Blog tuyển dụng
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select value={articleStatus} label="Trạng thái" onChange={(e) => setArticleStatus(e.target.value as ArticleStatus)}>
                <MenuItem value="draft">Bản nháp</MenuItem>
                <MenuItem value="pending">Chờ duyệt</MenuItem>
                <MenuItem value="published">Đã đăng</MenuItem>
                <MenuItem value="archived">Lưu trữ</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Thumbnail */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              ẢNH ĐẠI DIỆN
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbnailChange}
            />
            {(thumbnailPreview || existingThumbnailUrl) ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={thumbnailPreview || existingThumbnailUrl!}
                  alt="thumbnail"
                  sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 1.5 }}
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); setExistingThumbnailUrl(null); }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Button size="small" fullWidth startIcon={<ImageIcon />} onClick={() => fileInputRef.current?.click()} sx={{ mt: 1 }}>
                  Đổi ảnh
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ImageIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ height: 100, borderStyle: 'dashed', borderRadius: 1.5 }}
              >
                Chọn ảnh đại diện
              </Button>
            )}
          </Paper>

          {/* Tags */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              TAGS
            </Typography>
            <Stack direction="row" spacing={1} mb={1.5}>
              <TextField
                size="small"
                placeholder="Nhập tag..."
                value={tagInput}
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

export default AdminArticleFormPage;
