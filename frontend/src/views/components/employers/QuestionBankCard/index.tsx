'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Stack, 
  Tooltip,
  Paper,
  Chip,
  InputAdornment,
  alpha,
  useTheme,
  Grid2 as Grid,
  Theme
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import errorHandling from '@/utils/errorHandling';
import DataTable from '@/components/Common/DataTable';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { useDataTable } from '@/hooks';
import { useEmployerQuestions, useQuestionMutations } from '../hooks/useEmployerQueries';
import type { Question } from '@/types/models';
import pc from '@/utils/muiColors';

interface QuestionBankCardProps {
  title?: string;
}

const getQuestionMeta = (text: string) => {
  const lower = (text || '').toLowerCase();
  if (
    lower.includes('kỹ sư') ||
    lower.includes('kết cấu') ||
    lower.includes('giám sát') ||
    lower.includes('chuyên môn') ||
    lower.includes('kỹ thuật') ||
    lower.includes('phần mềm') ||
    lower.includes('kinh nghiệm') ||
    lower.includes('chính sách') ||
    lower.includes('đãi ngộ')
  ) {
    return {
      category: 'Chuyên môn',
      categoryKey: 'technical',
      color: '#0284c7',
      bgcolor: alpha('#0284c7', 0.1),
      borderColor: alpha('#0284c7', 0.25),
      difficulty: 'Trung bình',
      duration: '3 phút',
    };
  }
  if (
    lower.includes('tình huống') ||
    lower.includes('xử lý') ||
    lower.includes('vấn đề') ||
    lower.includes('khi xảy ra') ||
    lower.includes('trách nhiệm') ||
    lower.includes('áp lực') ||
    lower.includes('nghĩ gì') ||
    lower.includes('góp ý')
  ) {
    return {
      category: 'Tình huống',
      categoryKey: 'situational',
      color: '#16a34a',
      bgcolor: alpha('#16a34a', 0.1),
      borderColor: alpha('#16a34a', 0.25),
      difficulty: 'Nâng cao',
      duration: '3 - 5 phút',
    };
  }
  if (
    lower.includes('văn hóa') ||
    lower.includes('square') ||
    lower.includes('gắn bó') ||
    lower.includes('tương lai') ||
    lower.includes('ước mơ') ||
    lower.includes('mục tiêu') ||
    lower.includes('gia đình') ||
    lower.includes('đồng nghiệp') ||
    lower.includes('tính cách')
  ) {
    return {
      category: 'Văn hóa & Động lực',
      categoryKey: 'culture',
      color: '#d97706',
      bgcolor: alpha('#d97706', 0.1),
      borderColor: alpha('#d97706', 0.25),
      difficulty: 'Cơ bản',
      duration: '2 phút',
    };
  }
  return {
    category: 'Tổng quát',
    categoryKey: 'general',
    color: '#6366f1',
    bgcolor: alpha('#6366f1', 0.1),
    borderColor: alpha('#6366f1', 0.25),
    difficulty: 'Tiêu chuẩn',
    duration: '2 - 3 phút',
  };
};

const QuestionBankCard: React.FC<QuestionBankCardProps> = ({ title }) => {
    const theme = useTheme();
    const { t } = useTranslation(['interview', 'common']);
    const resolvedTitle = title || t('interview:employer.questionBank.title');

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: pc.actionDisabled( 0.03),
            '&:hover': { bgcolor: pc.actionDisabled( 0.06) },
            '& fieldset': { borderColor: pc.divider( 0.8) }
        }
    };

    const {
        page,
        pageSize,
        pagination,
        onPaginationChange,
    } = useDataTable({ initialPageSize: 10 });

    const [open, setOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<{ text?: string; id?: number | null }>({ text: '', id: null });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Data Fetching Hook
    const { data: questionData, isLoading } = useEmployerQuestions({
        page: page + 1,
        pageSize,
    });

    const { createQuestion, updateQuestion, deleteQuestion, isMutating } = useQuestionMutations();

    const rawQuestions = questionData?.results || [];
    const count = questionData?.count || 0;

    // Filter questions based on search query and category filter
    const displayQuestions = useMemo(() => {
        return rawQuestions.filter((q) => {
            const textMatch = !searchQuery.trim() || (q.text && q.text.toLowerCase().includes(searchQuery.toLowerCase().trim()));
            if (!textMatch) return false;
            if (selectedCategory === 'all') return true;
            const meta = getQuestionMeta(q.text || '');
            return meta.categoryKey === selectedCategory;
        });
    }, [rawQuestions, searchQuery, selectedCategory]);

    // Statistical counts for header cards
    const stats = useMemo(() => {
        let techCount = 0;
        let situationCount = 0;
        let cultureCount = 0;
        rawQuestions.forEach((q) => {
            const meta = getQuestionMeta(q.text || '');
            if (meta.categoryKey === 'technical') techCount += 1;
            else if (meta.categoryKey === 'situational') situationCount += 1;
            else if (meta.categoryKey === 'culture') cultureCount += 1;
        });
        return {
            total: count || rawQuestions.length,
            tech: techCount,
            situation: situationCount,
            culture: cultureCount,
        };
    }, [rawQuestions, count]);

    const handleOpen = useCallback((q: { text?: string; id?: number | null } = { text: '' }) => {
        setCurrentQuestion(q);
        setIsEdit(!!q.id);
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setCurrentQuestion({ text: '', id: null });
        setIsEdit(false);
    }, []);

    const handleSubmit = async () => {
        const text = currentQuestion.text?.trim() || '';
        if (!text) {
            toastMessages.error(t('interview:employer.questionBank.textRequired'));
            return;
        }

        try {
            if (isEdit && currentQuestion.id) {
                await updateQuestion({ id: currentQuestion.id, data: { text } });
                toastMessages.success(t('interview:employer.questionBank.updateSuccess'));
            } else {
                await createQuestion({ text });
                toastMessages.success(t('interview:employer.questionBank.createSuccess'));
            }
            handleClose();
        } catch (error) {
            errorHandling(error);
        }
    };

    const handleDelete = useCallback((id: string | number) => {
        confirmModal(
            async () => {
                try {
                    await deleteQuestion(id);
                    toastMessages.success(t('interview:employer.questionBank.deleteSuccess'));
                } catch (error) {
                    // Error handled by mutation hook
                }
            },
            t('interview:employer.questionBank.deleteTitle'),
            t('interview:employer.questionBank.deleteConfirm'),
            'warning'
        );
    }, [deleteQuestion, t]);

    const columns = useMemo(() => [
        {
            header: '#',
            id: 'index',
            size: 60,
            cell: ({ row }: { row: { index: number } }) => {
                const itemNumber = page * pageSize + row.index + 1;
                const padded = itemNumber < 10 ? `0${itemNumber}` : String(itemNumber);
                return (
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 1,
                            py: 0.35,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            letterSpacing: 0.5,
                        }}
                    >
                        #{padded}
                    </Box>
                );
            },
        },
        {
            header: t('interview:employer.questionBank.columns.text'),
            accessorKey: 'text',
            cell: ({ getValue }: { getValue: () => unknown }) => {
                const text = String(getValue() ?? '---');
                return (
                    <Typography
                        variant="body2"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1.6,
                            fontSize: '0.875rem',
                        }}
                    >
                        {text}
                    </Typography>
                );
            },
        },
        {
            header: 'Phân loại',
            id: 'category',
            size: 180,
            cell: ({ row }: { row: { original: Question } }) => {
                const meta = getQuestionMeta(row.original.text || '');
                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={meta.category}
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                bgcolor: meta.bgcolor,
                                color: meta.color,
                                border: '1px solid',
                                borderColor: meta.borderColor,
                                borderRadius: '8px',
                            }}
                        />
                        <Chip
                            label={meta.difficulty}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                borderColor: alpha(theme.palette.text.secondary, 0.2),
                                color: 'text.secondary',
                                borderRadius: '6px',
                            }}
                        />
                    </Stack>
                );
            },
        },
        {
            header: 'Thời lượng',
            id: 'duration',
            size: 130,
            cell: ({ row }: { row: { original: Question } }) => {
                const meta = getQuestionMeta(row.original.text || '');
                return (
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                            {meta.duration}
                        </Typography>
                    </Stack>
                );
            },
        },
        {
            header: '',
            id: 'actions',
            size: 110,
            cell: ({ row }: { row: { original: Question } }) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('common:actions.edit')} arrow>
                        <span>
                            <IconButton 
                                aria-label="Sửa câu hỏi"
                                size="small"
                                onClick={() => handleOpen(row.original)}
                                sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.08), 
                                    color: 'primary.main',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18), transform: 'scale(1.05)' } 
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete')} arrow>
                        <span>
                            <IconButton 
                                aria-label="Xóa câu hỏi"
                                size="small"
                                onClick={() => handleDelete(row.original.id)}
                                sx={{ 
                                    bgcolor: alpha(theme.palette.error.main, 0.08), 
                                    color: 'error.main',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.18), transform: 'scale(1.05)' } 
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, page, pageSize, theme, handleOpen, handleDelete]);

    return (
        <Stack spacing={3}>
            {/* Top KPI Metrics Row */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.25,
                            borderRadius: 3.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                bgcolor: alpha('#0284c7', 0.1),
                                color: '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <HelpOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
                                Tổng câu hỏi hệ thống
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.25,
                            borderRadius: 3.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                bgcolor: alpha('#6366f1', 0.1),
                                color: '#6366f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <PsychologyOutlinedIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                {stats.tech}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
                                Kỹ năng chuyên môn
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.25,
                            borderRadius: 3.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                bgcolor: alpha('#16a34a', 0.1),
                                color: '#16a34a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <FactCheckOutlinedIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                {stats.situation}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
                                Tình huống & Phản xạ
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.25,
                            borderRadius: 3.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                bgcolor: alpha('#d97706', 0.1),
                                color: '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Diversity3OutlinedIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                {stats.culture}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
                                Văn hóa & Động lực
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Main Management Card */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: { xs: 2.5, sm: 3.5 }, 
                    borderRadius: 4, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 24px -2px rgba(15, 23, 42, 0.04)',
                }}
            >
                {/* Header Title and Primary Action */}
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    alignItems={{ xs: 'flex-start', sm: 'center' }} 
                    justifyContent="space-between" 
                    spacing={2} 
                    mb={3}
                >
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
                                {resolvedTitle}
                            </Typography>
                            <Chip
                                label={`${stats.total} câu hỏi`}
                                size="small"
                                sx={{
                                    height: 24,
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    borderRadius: '8px',
                                }}
                            />
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                            Quản lý kho câu hỏi phỏng vấn chuẩn mực dành cho các phiên đánh giá năng lực ứng viên
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        sx={{ px: 3, py: 1, boxShadow: 'none', fontWeight: 700, textTransform: 'none' }}
                    >
                        {t('interview:employer.questionBank.add')}
                    </Button>
                </Stack>

                {/* Filter and Search Bar */}
                <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={2} 
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    justifyContent="space-between"
                    sx={{ 
                        mb: 3,
                        p: 1.75,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.action.hover, 0.5),
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Tìm nhanh nội dung câu hỏi hoặc từ khóa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                                sx: {
                                    borderRadius: '10px',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.85rem',
                                    '& fieldset': { borderColor: 'divider' },
                                }
                            }
                        }}
                        sx={{ minWidth: { xs: '100%', md: 340 } }}
                    />

                    {/* Category Filter Pills */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'technical', label: 'Chuyên môn' },
                            { key: 'situational', label: 'Tình huống' },
                            { key: 'culture', label: 'Văn hóa' },
                        ].map((cat) => {
                            const isSelected = selectedCategory === cat.key;
                            return (
                                <Chip
                                    key={cat.key}
                                    label={cat.label}
                                    size="small"
                                    onClick={() => setSelectedCategory(cat.key)}
                                    sx={{
                                        cursor: 'pointer',
                                        height: 32,
                                        px: 0.75,
                                        borderRadius: '10px',
                                        fontWeight: isSelected ? 800 : 600,
                                        fontSize: '0.78rem',
                                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                                        color: isSelected ? '#ffffff' : 'text.primary',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isSelected ? 'primary.dark' : alpha(theme.palette.primary.main, 0.06),
                                        },
                                    }}
                                />
                            );
                        })}
                    </Stack>
                </Stack>

                {/* Question Data Table */}
                <DataTable
                    columns={columns}
                    data={displayQuestions}
                    isLoading={isLoading}
                    rowCount={displayQuestions.length}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    emptyMessage={t('interview:employer.questionBank.noData')}
                />

                {/* Add / Edit Question Dialog */}
                <Dialog 
                    open={open} 
                    onClose={handleClose} 
                    fullWidth 
                    maxWidth="sm"
                    slotProps={{ 
                        paper: { 
                            sx: { 
                                borderRadius: 4, 
                                p: 1,
                                boxShadow: '0 20px 60px rgba(15, 23, 42, 0.16)',
                            } 
                        } 
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3, fontSize: '1.35rem', letterSpacing: '-0.01em' }}>
                        {isEdit ? t('interview:employer.questionBank.editTitle') : t('interview:employer.questionBank.createTitle')}
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, pb: 0 }}>
                        <Box sx={{ pt: 1.5 }}>
                            <TextField
                                margin="dense"
                                label={t('interview:employer.questionBank.textLabel')}
                                fullWidth
                                multiline
                                rows={5}
                                variant="outlined"
                                value={currentQuestion.text || ''}
                                onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, text: e.target.value }))}
                                sx={inputSx}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, px: 0.5, fontWeight: 500, lineHeight: 1.6 }}>
                                {t('interview:employer.questionBank.hint')}
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
                        <Button 
                            onClick={handleClose} 
                            color="inherit" 
                            sx={{ fontWeight: 700, textTransform: 'none', px: 3 }}
                        >
                            {t('common:actions.cancel')}
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            color="primary"
                            sx={{ px: 4, py: 1.25, fontWeight: 700, boxShadow: 'none', textTransform: 'none' }}
                        >
                            {t('common:actions.save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {isMutating && <BackdropLoading />}
            </Paper>
        </Stack>
    );
};

export default QuestionBankCard;
