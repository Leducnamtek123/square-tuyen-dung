'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/redux/hooks';
import {
  Box,
  Pagination,
  Stack,
  Typography,
  Paper,
  Chip,
  Button,
  Tooltip,
  Grid,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import { ProfileSearchBar, ProfileFilterDrawer } from '../ProfileSearch';
import MasterCandidateItem from './components/MasterCandidateItem';
import CandidateDetailPreviewPanel from './components/CandidateDetailPreviewPanel';
import { useProfileCardState } from './hooks/useProfileCardState';

/* ─── ProfileCard Master-Detail View ────────────────────────────────────────── */
const ProfileCardContent: React.FC = () => {
  const {
    t,
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    formattedJobPostOptions,
    activeTab,
    sortOption,
    handleTabChange,
    handleSortChange,
    isLoading,
    resumes,
    count,
    selectedSlug,
    setSelectedSlug,
    selectedResume,
    handleSave,
    page,
    totalPages,
    handleChangePage,
  } = useProfileCardState();

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. High-End Segmented AI Match & Search Mode Switcher */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          p: 1.5,
          boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          {/* Segmented Mode Switcher */}
          <Box
            sx={{
              display: 'inline-flex',
              p: '4px',
              borderRadius: '12px',
              bgcolor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              gap: '4px',
            }}
          >
            {/* Standard Search Button */}
            <Button
              onClick={(e) => handleTabChange(e, 'all')}
              disableRipple
              startIcon={
                <PersonSearchIcon
                  sx={{
                    fontSize: '18px !important',
                    color: activeTab === 'all' ? 'primary.main' : '#64748B',
                    transition: 'color 0.2s',
                  }}
                />
              }
              sx={{
                px: 2.25,
                py: 1,
                borderRadius: '9px',
                textTransform: 'none',
                fontWeight: activeTab === 'all' ? 800 : 600,
                fontSize: '0.875rem',
                color: activeTab === 'all' ? '#0F172A' : '#64748B',
                bgcolor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                boxShadow: activeTab === 'all' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                border: activeTab === 'all' ? '1px solid #E2E8F0' : '1px solid transparent',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: activeTab === 'all' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  color: '#0F172A',
                },
              }}
            >
              {t('employer:profileCard.tabs.findNewCandidates', 'Tìm kiếm ứng viên')}
            </Button>

            {/* AI Match Button */}
            <Button
              onClick={(e) => handleTabChange(e, 'ai')}
              disableRipple
              startIcon={
                <AutoAwesomeIcon
                  sx={{
                    fontSize: '18px !important',
                    color: activeTab === 'ai' ? '#2563EB' : '#6366F1',
                    filter: activeTab === 'ai' ? 'drop-shadow(0 0 6px rgba(37,99,235,0.4))' : 'none',
                    transition: 'all 0.2s',
                  }}
                />
              }
              sx={{
                px: 2.25,
                py: 1,
                borderRadius: '9px',
                textTransform: 'none',
                fontWeight: activeTab === 'ai' ? 800 : 600,
                fontSize: '0.875rem',
                color: activeTab === 'ai' ? '#1E3A8A' : '#475569',
                bgcolor: activeTab === 'ai' ? '#FFFFFF' : 'transparent',
                boxShadow: activeTab === 'ai' ? '0 2px 10px rgba(37, 99, 235, 0.12)' : 'none',
                border: activeTab === 'ai' ? '1px solid #BFDBFE' : '1px solid transparent',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: activeTab === 'ai' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  color: '#1E3A8A',
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t('employer:profileCard.tabs.aiSuggestedCandidates', 'Ứng viên AI gợi ý')}</span>
                <Chip
                  label="AI MATCH PRO"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    background:
                      activeTab === 'ai'
                        ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                        : '#E0E7FF',
                    color: activeTab === 'ai' ? '#FFFFFF' : '#4338CA',
                    border: 'none',
                    boxShadow: activeTab === 'ai' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                  }}
                />
              </Stack>
            </Button>
          </Box>

          {/* Quick Pool Status Indicator */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10B981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.78rem' }}>
              Kho dữ liệu:{' '}
              <Box component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
                {count > 0 ? `${count} hồ sơ sẵn sàng` : 'Hồ sơ đã kiểm duyệt'}
              </Box>
            </Typography>
          </Stack>
        </Stack>

        {/* Dynamic Contextual AI Insight Bar when in AI Mode */}
        {activeTab === 'ai' && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(245, 243, 255, 0.7) 100%)',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <AutoAwesomeIcon sx={{ color: '#2563EB', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 600, fontSize: '0.8125rem' }}>
                Thuật toán AI tự động chấm điểm tương đồng dựa trên JD vị trí tuyển dụng (Ngành nghề, Tỉnh thành, Kinh nghiệm & Kỹ năng).
              </Typography>
            </Stack>
            <Chip
              label="Bộ lọc tối ưu AI"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 700,
                bgcolor: '#DBEAFE',
                color: '#1D4ED8',
                border: '1px solid #93C5FD',
              }}
            />
          </Box>
        )}
      </Paper>

      {/* 2. Top Search Bar with Job Post Selector & Filter Button */}
      <ProfileSearchBar
        control={control}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        primaryFieldName="jobPostId"
        primaryFieldOptions={formattedJobPostOptions}
        primaryFieldPlaceholder={t('employer:profileCard.aiMatch.jobPostSelector', 'Khớp theo tin tuyển dụng...')}
        t={t}
        onOpenFilterDrawer={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 3. Slide-in Right Filter Drawer Modal */}
      <ProfileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        control={control}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        t={t}
      />

      {/* 4. Vieclam24h Master-Detail 2-Column Split View */}
      <Box sx={{ width: '100%', minWidth: 0 }}>
        {isLoading ? (
          <Grid container spacing={2}>
            <Grid item xs={12} lg={4}>
              <Stack spacing={1.5}>
                {Array.from({ length: 10 }, (_, idx) => (
                  <Skeleton key={idx} variant="rounded" height={100} sx={{ borderRadius: '12px' }} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rounded" height={500} sx={{ borderRadius: '12px' }} />
            </Grid>
          </Grid>
        ) : resumes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 10,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            }}
          >
            <SearchOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {t('profileCard.title.noresultsfound')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontWeight: 500, maxWidth: 360, mx: 'auto', opacity: 0.7 }}
            >
              Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc để phát hiện thêm các ứng viên tài năng.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5} alignItems="flex-start">
            {/* LEFT COLUMN: Master Candidate List (~360px - 400px) */}
            <Grid item xs={12} lg={4.5} xl={4}>
              <Stack spacing={1.5}>
                {/* Result count & Sort dropdown bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 0.5,
                    px: 0.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                      Kết quả:{' '}
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>
                        {count} ứng viên
                      </Box>
                    </Typography>
                    <Tooltip title="Dùng phím mũi tên ↑/↓ để chuyển ứng viên, phím S để lưu/bỏ lưu, Enter để xem chi tiết" arrow>
                      <Chip
                        label="↑/↓ duyệt nhanh"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #E2E8F0',
                          cursor: 'help',
                          display: { xs: 'none', sm: 'inline-flex' },
                        }}
                      />
                    </Tooltip>
                  </Stack>

                  {/* Sort Selection */}
                  <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
                    <Select
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value)}
                      disableUnderline
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'primary.main',
                        '& .MuiSelect-select': {
                          py: 0.5,
                          pr: '24px !important',
                        },
                      }}
                    >
                      <MenuItem value="suitable" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {t('employer:profileCard.sort.mostSuitable', 'Phù hợp nhất')}
                      </MenuItem>
                      <MenuItem value="newest" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {t('employer:profileCard.sort.newest', 'Mới nhất')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Candidate List */}
                <Stack spacing={1.25}>
                  {resumes.map((resume) => (
                    <MasterCandidateItem
                      key={resume.id}
                      resume={resume}
                      isSelected={selectedSlug === resume.slug}
                      onSelect={() => setSelectedSlug(resume.slug)}
                      onSave={handleSave}
                    />
                  ))}
                </Stack>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      color="primary"
                      shape="rounded"
                      variant="outlined"
                      count={totalPages}
                      page={page}
                      onChange={handleChangePage}
                      size="small"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          backgroundColor: 'background.paper',
                          fontWeight: 700,
                          borderRadius: '6px',
                          height: 32,
                          minWidth: 32,
                          fontSize: '0.8rem',
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* RIGHT COLUMN: Candidate Detail Preview Panel */}
            <Grid item xs={12} lg={7.5} xl={8}>
              <CandidateDetailPreviewPanel
                resumeSlug={selectedSlug || selectedResume?.slug}
                initialResume={selectedResume}
                onSave={handleSave}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export const ProfileCard: React.FC = () => {
  const { resumeFilter } = useAppSelector((state) => state.filter);
  const filterKey = useMemo(() => JSON.stringify(resumeFilter), [resumeFilter]);

  return <ProfileCardContent key={filterKey} />;
};

export default ProfileCard;
