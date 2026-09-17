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
  Theme,
  Alert,
} from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PublicIcon from '@mui/icons-material/Public';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toastMessages from '@/utils/toastMessages';
import { confirmModal } from '@/utils/sweetalert2Modal';
import errorHandling from '@/utils/errorHandling';
import DataTable from '@/components/Common/DataTable';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { ExportModal } from '@/components/Common/ExportModal';
import { ImportModal } from '@/components/Common/ImportModal';
import { useDataTable } from '@/hooks';
import { useEmployerQuestions, useQuestionMutations } from '../hooks/useEmployerQueries';
import type { Question } from '@/types/models';
import pc from '@/utils/muiColors';

interface QuestionBankCardProps {
  title?: string;
}

interface QuestionMetaInput {
  text?: string;
  category?: string;
  difficulty?: string | number;
  default_duration_seconds?: number;
  defaultDurationSeconds?: number;
}

const CATEGORY_OPTIONS = [
  {
    key: 'technical',
    i18nKey: 'interview:employer.questionBank.categories.technical',
    color: '#0284c7',
    icon: PsychologyOutlinedIcon,
  },
  {
    key: 'situational',
    i18nKey: 'interview:employer.questionBank.categories.situational',
    color: '#16a34a',
    icon: FactCheckOutlinedIcon,
  },
  {
    key: 'culture_fit',
    i18nKey: 'interview:employer.questionBank.categories.culture',
    color: '#d97706',
    icon: Diversity3OutlinedIcon,
  },
  {
    key: 'general',
    i18nKey: 'interview:employer.questionBank.categories.general',
    color: '#6366f1',
    icon: QuizOutlinedIcon,
  },
];

const DIFFICULTY_OPTIONS = [
  { value: 1, i18nKey: 'interview:employer.questionBank.difficulties.easy', color: '#16a34a' },
  { value: 2, i18nKey: 'interview:employer.questionBank.difficulties.medium', color: '#0284c7' },
  { value: 3, i18nKey: 'interview:employer.questionBank.difficulties.hard', color: '#d97706' },
];

const DURATION_OPTIONS = [
  { value: 60, label: '1 phút' },
  { value: 120, label: '2 phút' },
  { value: 180, label: '3 phút' },
  { value: 300, label: '5 phút' },
];

const getQuestionMeta = (input: string | QuestionMetaInput) => {
  const item: QuestionMetaInput = typeof input === 'string' ? { text: input } : (input || {});
  const text = item.text || '';
  const lower = text.toLowerCase();

  let categoryKey = 'general';
  let categoryLabel = 'Tổng quát';
  let color = '#6366f1';

  const rawCat = (item.category || '').toLowerCase();
  if (rawCat === 'technical') {
    categoryKey = 'technical';
    categoryLabel = 'Chuyên môn';
    color = '#0284c7';
  } else if (rawCat === 'situational') {
    categoryKey = 'situational';
    categoryLabel = 'Tình huống';
    color = '#16a34a';
  } else if (rawCat === 'culture_fit' || rawCat === 'culture') {
    categoryKey = 'culture';
    categoryLabel = 'Văn hóa & Động lực';
    color = '#d97706';
  } else if (rawCat === 'general') {
    categoryKey = 'general';
    categoryLabel = 'Tổng quát';
    color = '#6366f1';
  } else {
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
      categoryKey = 'technical';
      categoryLabel = 'Chuyên môn';
      color = '#0284c7';
    } else if (
      lower.includes('tình huống') ||
      lower.includes('xử lý') ||
      lower.includes('vấn đề') ||
      lower.includes('khi xảy ra') ||
      lower.includes('trách nhiệm') ||
      lower.includes('áp lực') ||
      lower.includes('nghĩ gì') ||
      lower.includes('góp ý')
    ) {
      categoryKey = 'situational';
      categoryLabel = 'Tình huống';
      color = '#16a34a';
    } else if (
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
      categoryKey = 'culture';
      categoryLabel = 'Văn hóa & Động lực';
      color = '#d97706';
    } else {
      categoryKey = 'general';
      categoryLabel = 'Tổng quát';
      color = '#6366f1';
    }
  }

  let difficultyLabel = 'Tiêu chuẩn';
  let difficultyLevel = 2;
  const rawDiff = item.difficulty;
  if (rawDiff === 1 || rawDiff === '1' || rawDiff === 'easy' || rawDiff === 'Dễ' || rawDiff === 'Cơ bản') {
    difficultyLabel = 'Cơ bản';
    difficultyLevel = 1;
  } else if (rawDiff === 3 || rawDiff === '3' || rawDiff === 'hard' || rawDiff === 'Khó' || rawDiff === 'Nâng cao') {
    difficultyLabel = 'Nâng cao';
    difficultyLevel = 3;
  } else if (rawDiff === 2 || rawDiff === '2' || rawDiff === 'medium' || rawDiff === 'Trung bình' || rawDiff === 'Tiêu chuẩn') {
    difficultyLabel = 'Tiêu chuẩn';
    difficultyLevel = 2;
  } else {
    if (categoryKey === 'situational') {
      difficultyLabel = 'Nâng cao';
      difficultyLevel = 3;
    } else if (categoryKey === 'culture') {
      difficultyLabel = 'Cơ bản';
      difficultyLevel = 1;
    } else {
      difficultyLabel = 'Tiêu chuẩn';
      difficultyLevel = 2;
    }
  }

  let durationSeconds = Number(item.default_duration_seconds || item.defaultDurationSeconds || 0);
  let durationLabel = '';
  if (durationSeconds > 0) {
    const mins = Math.max(1, Math.round(durationSeconds / 60));
    durationLabel = `${mins} phút`;
  } else {
    if (categoryKey === 'technical') {
      durationLabel = '3 phút';
      durationSeconds = 180;
    } else if (categoryKey === 'situational') {
      durationLabel = '3 - 5 phút';
      durationSeconds = 180;
    } else if (categoryKey === 'culture') {
      durationLabel = '2 phút';
      durationSeconds = 120;
    } else {
      durationLabel = '2 - 3 phút';
      durationSeconds = 120;
    }
  }

  const difficultyColor = difficultyLevel === 1 ? '#16a34a' : difficultyLevel === 3 ? '#d97706' : '#0284c7';

  return {
    category: categoryLabel,
    categoryKey,
    rawCategoryKey: rawCat || (categoryKey === 'culture' ? 'culture_fit' : categoryKey),
    color,
    bgcolor: alpha(color, 0.1),
    borderColor: alpha(color, 0.25),
    difficulty: difficultyLabel,
    difficultyLevel,
    difficultyColor,
    duration: durationLabel,
    durationSeconds,
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

    interface QuestionFormState {
        id?: number | null;
        text: string;
        category: string;
        difficulty: number;
        default_duration_seconds: number;
        isCategoryManuallySet: boolean;
        canWrite?: boolean;
        company?: number | null;
        is_public?: boolean;
        isPublic?: boolean;
    }

    const isSystemQuestion = useCallback((q?: Question | QuestionFormState | null) => {
        if (!q) return false;
        return q.canWrite === false || !q.company;
    }, []);

    const [open, setOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionFormState>({
        id: null,
        text: '',
        category: 'general',
        difficulty: 2,
        default_duration_seconds: 120,
        isCategoryManuallySet: false,
    });
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const queryClient = useQueryClient();

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
            const meta = getQuestionMeta(q);
            return meta.categoryKey === selectedCategory;
        });
    }, [rawQuestions, searchQuery, selectedCategory]);

    // Statistical counts for header cards
    const stats = useMemo(() => {
        let techCount = 0;
        let situationCount = 0;
        let cultureCount = 0;
        rawQuestions.forEach((q) => {
            const meta = getQuestionMeta(q);
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

    const handleOpen = useCallback((q?: Question) => {
        if (q && q.id) {
            const meta = getQuestionMeta(q);
            const catKey = q.category || (meta.categoryKey === 'culture' ? 'culture_fit' : meta.categoryKey);
            const diff = typeof q.difficulty === 'number' ? q.difficulty : (meta.difficultyLevel || 2);
            const dur = q.default_duration_seconds || meta.durationSeconds || 120;
            setCurrentQuestion({
                id: q.id,
                text: q.text || '',
                category: catKey,
                difficulty: diff,
                default_duration_seconds: dur,
                isCategoryManuallySet: true,
                canWrite: q.canWrite,
                company: q.company,
                is_public: Boolean(q.is_public ?? q.isPublic ?? false),
            });
            setIsEdit(true);
        } else {
            setCurrentQuestion({
                id: null,
                text: '',
                category: 'general',
                difficulty: 2,
                default_duration_seconds: 120,
                isCategoryManuallySet: false,
                canWrite: true,
                company: undefined,
                is_public: false,
            });
            setIsEdit(false);
        }
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setCurrentQuestion({
            id: null,
            text: '',
            category: 'general',
            difficulty: 2,
            default_duration_seconds: 120,
            isCategoryManuallySet: false,
        });
        setIsEdit(false);
    }, []);

    const handleTextChange = useCallback((newText: string) => {
        setCurrentQuestion((prev) => {
            if (!prev.isCategoryManuallySet) {
                const meta = getQuestionMeta({ text: newText });
                const autoCat = meta.categoryKey === 'culture' ? 'culture_fit' : meta.categoryKey;
                return {
                    ...prev,
                    text: newText,
                    category: autoCat,
                    difficulty: meta.difficultyLevel,
                    default_duration_seconds: meta.durationSeconds,
                };
            }
            return {
                ...prev,
                text: newText,
            };
        });
    }, []);

    const handleCategorySelect = useCallback((catKey: string) => {
        setCurrentQuestion((prev) => ({
            ...prev,
            category: catKey,
            isCategoryManuallySet: true,
        }));
    }, []);

    const handleDifficultySelect = useCallback((diff: number) => {
        setCurrentQuestion((prev) => ({
            ...prev,
            difficulty: diff,
        }));
    }, []);

    const handleDurationSelect = useCallback((durationSeconds: number) => {
        setCurrentQuestion((prev) => ({
            ...prev,
            default_duration_seconds: durationSeconds,
        }));
    }, []);

    const handleSubmit = async () => {
        const text = currentQuestion.text?.trim() || '';
        if (!text) {
            toastMessages.error(t('interview:employer.questionBank.textRequired'));
            return;
        }

        const payload = {
            text,
            category: currentQuestion.category,
            difficulty: currentQuestion.difficulty,
            default_duration_seconds: currentQuestion.default_duration_seconds,
        };

        const isSystem = Boolean(isEdit && isSystemQuestion(currentQuestion));

        try {
            if (isEdit && currentQuestion.id && !isSystem) {
                await updateQuestion({ id: currentQuestion.id, data: payload });
                toastMessages.success(t('interview:employer.questionBank.updateSuccess'));
            } else if (isEdit && isSystem) {
                await createQuestion(payload);
                toastMessages.success('Đã nhân bản câu hỏi cho doanh nghiệp thành công!');
            } else {
                await createQuestion(payload);
                toastMessages.success(t('interview:employer.questionBank.createSuccess'));
            }
            handleClose();
        } catch (error) {
            errorHandling(error);
        }
    };

    const handleDelete = useCallback((idOrQuestion: Question | string | number) => {
        const questionId = typeof idOrQuestion === 'object' && idOrQuestion !== null ? idOrQuestion.id : idOrQuestion;
        const target = typeof idOrQuestion === 'object' && idOrQuestion !== null
            ? idOrQuestion
            : rawQuestions.find((item) => item.id === questionId);

        if (target && isSystemQuestion(target)) {
            toastMessages.warn('Câu hỏi chuẩn hệ thống không thể xóa');
            return;
        }

        confirmModal(
            async () => {
                try {
                    await deleteQuestion(questionId);
                    toastMessages.success(t('interview:employer.questionBank.deleteSuccess'));
                } catch (error) {
                    // Error handled by mutation hook
                }
            },
            t('interview:employer.questionBank.deleteTitle'),
            t('interview:employer.questionBank.deleteConfirm'),
            'warning'
        );
    }, [deleteQuestion, isSystemQuestion, rawQuestions, t]);

    const handleTogglePublic = useCallback(async (question: Question) => {
        if (isSystemQuestion(question)) {
            toastMessages.warn('Câu hỏi chuẩn hệ thống không thể thay đổi trạng thái');
            return;
        }
        const currentStatus = Boolean(question.is_public ?? question.isPublic ?? false);
        const nextStatus = !currentStatus;
        try {
            await updateQuestion({ id: question.id, data: { is_public: nextStatus } as Partial<Question> });
            toastMessages.success(
                nextStatus
                    ? 'Đã chuyển sang trạng thái công khai cho ứng viên'
                    : 'Đã chuyển sang trạng thái riêng tư nội bộ'
            );
        } catch (error) {
            errorHandling(error);
        }
    }, [isSystemQuestion, updateQuestion]);

    const columns = useMemo(() => [
        {
            header: 'STT',
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
                        {padded}
                    </Box>
                );
            },
        },
        {
            header: t('interview:employer.questionBank.columns.text'),
            accessorKey: 'text',
            cell: ({ row }: { row: { original: Question } }) => {
                const text = row.original.text || '---';
                const isSystem = isSystemQuestion(row.original);
                return (
                    <Stack spacing={0.5} alignItems="flex-start">
                        {isSystem && (
                            <Chip
                                label="Mẫu hệ thống"
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    bgcolor: '#e0f2fe',
                                    color: '#0369a1',
                                    border: '1px solid #bae6fd',
                                }}
                            />
                        )}
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
                    </Stack>
                );
            },
        },
        {
            header: 'Phân loại',
            id: 'category',
            size: 180,
            cell: ({ row }: { row: { original: Question } }) => {
                const meta = getQuestionMeta(row.original);
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
                            sx={{
                                height: 22,
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                bgcolor: alpha(meta.difficultyColor, 0.08),
                                color: meta.difficultyColor,
                                border: '1px solid',
                                borderColor: alpha(meta.difficultyColor, 0.25),
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
                const meta = getQuestionMeta(row.original);
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
            header: 'Trạng thái',
            id: 'is_public',
            size: 130,
            cell: ({ row }: { row: { original: Question } }) => {
                const isPublic = Boolean(row.original.is_public ?? row.original.isPublic);
                const isSystem = isSystemQuestion(row.original);
                return (
                    <Tooltip
                        title={
                            isSystem
                                ? 'Câu hỏi chuẩn hệ thống không thể thay đổi trạng thái'
                                : isPublic
                                ? 'Bấm để chuyển sang riêng tư nội bộ'
                                : 'Bấm để công khai cho ứng viên'
                        }
                        arrow
                    >
                        <span>
                            <Chip
                                icon={isPublic ? <PublicIcon sx={{ fontSize: '15px !important' }} /> : <LockOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                                label={isPublic ? 'Công khai' : 'Riêng tư'}
                                size="small"
                                disabled={isSystem}
                                onClick={
                                    isSystem
                                        ? undefined
                                        : (e) => {
                                            e.stopPropagation();
                                            handleTogglePublic(row.original);
                                        }
                                }
                                sx={{
                                    cursor: isSystem ? 'not-allowed' : 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    color: isPublic ? '#047857' : '#334155',
                                    bgcolor: isPublic ? '#d1fae5' : '#f1f5f9',
                                    border: '1px solid',
                                    borderColor: isPublic ? '#a7f3d0' : '#cbd5e1',
                                    transition: 'all 0.2s ease',
                                    '&.Mui-disabled': {
                                        opacity: 0.85,
                                        color: isPublic ? '#047857' : '#334155',
                                        bgcolor: isPublic ? '#d1fae5' : '#f1f5f9',
                                        borderColor: isPublic ? '#a7f3d0' : '#cbd5e1',
                                    },
                                    '&:hover': isSystem
                                        ? undefined
                                        : {
                                            bgcolor: isPublic ? '#a7f3d0' : '#e2e8f0',
                                            transform: 'scale(1.04)',
                                        },
                                }}
                            />
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            header: '',
            id: 'actions',
            size: 110,
            cell: ({ row }: { row: { original: Question } }) => {
                const isSystem = isSystemQuestion(row.original);
                return (
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
                                    <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip
                            title={
                                isSystem
                                    ? 'Câu hỏi chuẩn hệ thống không thể xóa'
                                    : t('common:actions.delete')
                            }
                            arrow
                        >
                            <span>
                                <IconButton 
                                    aria-label="Xóa câu hỏi"
                                    size="small"
                                    disabled={isSystem}
                                    onClick={() => handleDelete(row.original)}
                                    sx={{ 
                                        bgcolor: isSystem
                                            ? alpha(theme.palette.action.disabledBackground, 0.1)
                                            : alpha(theme.palette.error.main, 0.08), 
                                        color: isSystem ? theme.palette.action.disabled : 'error.main',
                                        borderRadius: '10px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': isSystem
                                            ? undefined
                                            : { bgcolor: alpha(theme.palette.error.main, 0.18), transform: 'scale(1.05)' } 
                                    }}
                                >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [t, page, pageSize, theme, handleOpen, handleDelete, handleTogglePublic, isSystemQuestion]);

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
                            <QuizOutlinedIcon sx={{ fontSize: 24 }} />
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

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button
                            variant="outlined"
                            startIcon={<UploadFileOutlinedIcon />}
                            onClick={() => setImportModalOpen(true)}
                            sx={{ px: 2, py: 1, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                        >
                            Nhập câu hỏi (Excel/CSV)
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadOutlinedIcon />}
                            onClick={() => setExportModalOpen(true)}
                            sx={{ px: 2, py: 1, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                        >
                            Xuất kho câu hỏi
                        </Button>
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
                </Stack>

                {/* Filter and Search Bar */}
                <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={2} 
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    justifyContent="space-between"
                    sx={{ 
                        mb: 3,
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
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
                                    bgcolor: '#ffffff',
                                    fontSize: '0.85rem',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                }
                            }
                        }}
                        sx={{ minWidth: { xs: '100%', md: 360 } }}
                    />

                    {/* Category Filter Pills */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'technical', label: 'Chuyên môn' },
                            { key: 'situational', label: 'Tình huống' },
                            { key: 'culture', label: 'Văn hóa & Động lực' },
                            { key: 'general', label: 'Tổng quát' },
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
                                        height: 34,
                                        px: 1,
                                        borderRadius: '10px',
                                        fontWeight: isSelected ? 800 : 600,
                                        fontSize: '0.8rem',
                                        bgcolor: isSelected ? 'primary.main' : '#ffffff',
                                        color: isSelected ? '#ffffff' : 'text.primary',
                                        border: '1px solid',
                                        borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                                        boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isSelected ? 'primary.dark' : '#f1f5f9',
                                            borderColor: isSelected ? 'primary.dark' : '#cbd5e1',
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
                    <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3, pb: 1, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '10px',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <QuizOutlinedIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
                                {isEdit ? t('interview:employer.questionBank.editTitle') : t('interview:employer.questionBank.createTitle')}
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, pb: 1 }}>
                        <Stack spacing={2.5} sx={{ pt: 1.5 }}>
                            {isEdit && isSystemQuestion(currentQuestion) && (
                                <Alert
                                    severity="info"
                                    icon={<AutoAwesomeRoundedIcon fontSize="inherit" />}
                                    sx={{
                                        borderRadius: 2.5,
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        bgcolor: '#eff6ff',
                                        color: '#1e40af',
                                        border: '1px solid #bfdbfe',
                                        '& .MuiAlert-icon': { color: '#2563eb' },
                                    }}
                                >
                                    Câu hỏi chuẩn hệ thống. Lưu thay đổi sẽ tự động nhân bản thành câu hỏi của doanh nghiệp.
                                </Alert>
                            )}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                    {t('interview:employer.questionBank.textLabel')} *
                                </Typography>
                                <TextField
                                    margin="dense"
                                    placeholder="Nhập nội dung chi tiết của câu hỏi phỏng vấn..."
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    value={currentQuestion.text || ''}
                                    onChange={(e) => handleTextChange(e.target.value)}
                                    sx={inputSx}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, px: 0.5, fontWeight: 500, lineHeight: 1.6 }}>
                                    {t('interview:employer.questionBank.hint')}
                                </Typography>
                            </Box>

                            {/* Category Selector */}
                            <Box>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {t('interview:employer.questionBank.categoryLabel')}
                                    </Typography>
                                    {!currentQuestion.isCategoryManuallySet && currentQuestion.text.trim().length > 0 && (
                                        <Chip
                                            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '14px !important', color: '#6366f1 !important' }} />}
                                            label="AI gợi ý phân loại"
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                bgcolor: alpha('#6366f1', 0.08),
                                                color: '#6366f1',
                                                border: '1px solid',
                                                borderColor: alpha('#6366f1', 0.2),
                                                borderRadius: '6px',
                                            }}
                                        />
                                    )}
                                </Stack>

                                <Grid container spacing={1.25}>
                                    {CATEGORY_OPTIONS.map((cat) => {
                                        const IconComponent = cat.icon;
                                        const isSelected = currentQuestion.category === cat.key || 
                                            (cat.key === 'culture_fit' && currentQuestion.category === 'culture');
                                        const labelText = t(cat.i18nKey);

                                        return (
                                            <Grid size={{ xs: 6, sm: 6 }} key={cat.key}>
                                                <Box
                                                    onClick={() => handleCategorySelect(cat.key)}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        border: '1.5px solid',
                                                        borderColor: isSelected ? cat.color : '#e2e8f0',
                                                        bgcolor: isSelected ? alpha(cat.color, 0.08) : '#ffffff',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.25,
                                                        '&:hover': {
                                                            borderColor: cat.color,
                                                            bgcolor: alpha(cat.color, 0.04),
                                                            transform: 'translateY(-1px)',
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '8px',
                                                            bgcolor: isSelected ? cat.color : alpha(cat.color, 0.1),
                                                            color: isSelected ? '#ffffff' : cat.color,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        <IconComponent sx={{ fontSize: 18 }} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: isSelected ? 800 : 600,
                                                                fontSize: '0.82rem',
                                                                color: isSelected ? cat.color : 'text.primary',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {labelText}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>

                            {/* Difficulty and Duration */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                        {t('interview:employer.questionBank.difficultyLabel')}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {DIFFICULTY_OPTIONS.map((diff) => {
                                            const isSelected = currentQuestion.difficulty === diff.value;
                                            const labelText = t(diff.i18nKey);
                                            return (
                                                <Chip
                                                    key={diff.value}
                                                    label={labelText}
                                                    onClick={() => handleDifficultySelect(diff.value)}
                                                    sx={{
                                                        flex: 1,
                                                        height: 34,
                                                        cursor: 'pointer',
                                                        borderRadius: '10px',
                                                        fontWeight: isSelected ? 800 : 600,
                                                        fontSize: '0.78rem',
                                                        bgcolor: isSelected ? diff.color : '#ffffff',
                                                        color: isSelected ? '#ffffff' : 'text.primary',
                                                        border: '1px solid',
                                                        borderColor: isSelected ? diff.color : '#e2e8f0',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: isSelected ? diff.color : alpha(diff.color, 0.08),
                                                            borderColor: diff.color,
                                                        },
                                                    }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                        {t('interview:employer.questionBank.durationLabel')}
                                    </Typography>
                                    <Stack direction="row" spacing={0.75}>
                                        {DURATION_OPTIONS.map((dur) => {
                                            const isSelected = currentQuestion.default_duration_seconds === dur.value;
                                            return (
                                                <Chip
                                                    key={dur.value}
                                                    icon={<AccessTimeIcon sx={{ fontSize: '13px !important', color: isSelected ? '#ffffff !important' : 'text.secondary !important' }} />}
                                                    label={dur.label}
                                                    onClick={() => handleDurationSelect(dur.value)}
                                                    sx={{
                                                        flex: 1,
                                                        height: 34,
                                                        px: 0.5,
                                                        cursor: 'pointer',
                                                        borderRadius: '10px',
                                                        fontWeight: isSelected ? 800 : 600,
                                                        fontSize: '0.76rem',
                                                        bgcolor: isSelected ? 'primary.main' : '#ffffff',
                                                        color: isSelected ? '#ffffff' : 'text.primary',
                                                        border: '1px solid',
                                                        borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: isSelected ? 'primary.main' : '#f1f5f9',
                                                            borderColor: isSelected ? 'primary.main' : '#cbd5e1',
                                                        },
                                                    }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 2, gap: 1.5 }}>
                        <Button 
                            onClick={handleClose} 
                            color="inherit" 
                            sx={{ fontWeight: 700, textTransform: 'none', px: 2.5, borderRadius: '10px' }}
                        >
                            {t('common:actions.cancel')}
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            color="primary"
                            startIcon={<SaveRoundedIcon />}
                            sx={{ px: 3.5, py: 1.1, fontWeight: 700, boxShadow: 'none', textTransform: 'none', borderRadius: '10px' }}
                        >
                            {t('common:actions.save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {isMutating && <BackdropLoading />}

                {/* Export Modal */}
                <ExportModal
                    open={exportModalOpen}
                    onClose={() => setExportModalOpen(false)}
                    defaultFileName="NganHangCauHoiPhongVan"
                    columns={[]}
                    entity="question_bank"
                    totalRecords={{
                        all: count || 0,
                        filtered: count || 0,
                        selected: 0,
                    }}
                />

                {/* Import Modal */}
                <ImportModal
                    open={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                    entity="question_bank"
                    title="Nhập ngân hàng câu hỏi (Question Bank Import)"
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['employerQuestions'] });
                    }}
                />
            </Paper>
        </Stack>
    );
};

export default QuestionBankCard;
