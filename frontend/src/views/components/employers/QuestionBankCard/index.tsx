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
  Divider,
  Tooltip,
  Paper,
  alpha,
  useTheme,
  Theme
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import errorHandling from '../../../../utils/errorHandling';
import DataTable from '../../../../components/Common/DataTable';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import { useDataTable } from '../../../../hooks';
import { useEmployerQuestions, useQuestionMutations } from '../hooks/useEmployerQueries';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { Question } from '../../../../types/models';
import pc from '@/utils/muiColors';

interface QuestionBankCardProps {
  title?: string;
}

const QuestionBankCard: React.FC<QuestionBankCardProps> = ({ title }) => {
    const { t } = useTranslation(['interview', 'common']);
    const theme = useTheme();
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

    // Data Fetching Hook
    const { data: questionData, isLoading } = useEmployerQuestions({
        page: page + 1,
        pageSize,
    });

    const { createQuestion, updateQuestion, deleteQuestion, isMutating } = useQuestionMutations();

    const questions = questionData?.results || [];
    const count = questionData?.count || 0;

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
            t('interview:employer.questionBank.deleteTitle', 'Delete Question'),
            t('interview:employer.questionBank.deleteConfirm'),
            'warning'
        );
    }, [deleteQuestion, t]);

    const columns = useMemo(() => [
        {
            header: t('interview:employer.questionBank.columns.text'),
            accessorKey: 'text',
            cell: ({ getValue }: { getValue: () => unknown }) => (
                <Typography
                    variant="body2"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        color: 'text.primary'
                    }}
                >
                    {String(getValue() ?? '---')}
                </Typography>
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }: { row: { original: Question } }) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={t('common:actions.edit')} arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => handleOpen(row.original)} 
                            color="primary"
                            sx={{ bgcolor: pc.primary( 0.08), '&:hover': { bgcolor: pc.primary( 0.15) } }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete')} arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => handleDelete(row.original.id)} 
                            color="error"
                            sx={{ bgcolor: pc.error( 0.08), '&:hover': { bgcolor: pc.error( 0.15) } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [t, handleOpen, handleDelete, theme]);

    return (
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, boxShadow: (theme: Theme) => theme.customShadows?.z1, border: '1px solid', borderColor: 'divider' }}>
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                justifyContent="space-between" 
                spacing={2} 
                mb={4}
            >
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {resolvedTitle}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ borderRadius: 1.5, px: 3, py: 1, boxShadow: 'none', fontWeight: 700, textTransform: 'none' }}
                >
                    {t('interview:employer.questionBank.add')}
                </Button>
            </Stack>

            <DataTable
                columns={columns}
                data={questions}
                isLoading={isLoading}
                rowCount={count}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                emptyMessage={t('interview:employer.questionBank.noData')}
            />

            <Dialog 
                open={open} 
                onClose={handleClose} 
                fullWidth 
                maxWidth="sm"
                slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3, fontSize: '1.5rem' }}>
                    {isEdit ? t('interview:employer.questionBank.editTitle') : t('interview:employer.questionBank.createTitle')}
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 0 }}>
                    <Box sx={{ pt: 2 }}>
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
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, px: 1, fontWeight: 500 }}>
                            {t('interview:employer.questionBank.hint', 'Enter clear and concise question content.')}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 3, gap: 2 }}>
                    <Button 
                        onClick={handleClose} 
                        color="inherit" 
                        sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 3 }}
                    >
                        {t('common:actions.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        sx={{ px: 4, py: 1.25, borderRadius: 1.5, fontWeight: 900, boxShadow: 'none', textTransform: 'none' }}
                    >
                        {t('common:actions.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {isMutating && <BackdropLoading />}
        </Paper>
    );
};

export default QuestionBankCard;
