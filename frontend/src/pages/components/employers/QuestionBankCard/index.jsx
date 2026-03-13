import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Divider, LinearProgress } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';

import AddIcon from '@mui/icons-material/Add';

import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

import questionService from '../../../../services/questionService';

import { transformQuestion } from '../../../../utils/transformers';

import DataTable from '../../../../components/DataTable';

const QuestionBankCard = ({ title }) => {

  const { t } = useTranslation(['interview', 'common']);

  const resolvedTitle = title || t('employer.questionBank.title');

  const [questions, setQuestions] = useState([]);

  const [count, setCount] = useState(0);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState({ text: '' });

  const [isEdit, setIsEdit] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {

      const data = await questionService.getQuestions({

        page: page + 1,

        pageSize: rowsPerPage,

      });

      const rawQuestions = Array.isArray(data?.results)

        ? data.results

        : Array.isArray(data)

        ? data

        : [];

      setQuestions(rawQuestions.map(transformQuestion).filter(Boolean));

      setCount(typeof data?.count === 'number' ? data.count : rawQuestions.length);

    } catch (error) {

      console.error('Error fetching questions', error);

    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleChangePage = (event, newPage) => {

    setPage(newPage);

  };

  const handleChangeRowsPerPage = (event) => {

    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);

  };

  const handleOpen = useCallback((q = { text: '' }) => {
    setCurrentQuestion(q);
    setIsEdit(!!q.id);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = async () => {

    const payload = {

      text: currentQuestion.text?.trim() || '',

    };

    if (!payload.text) {

      toast.error(t('employer.questionBank.textRequired'));

      return;

    }

    try {

      if (isEdit) {

        await questionService.updateQuestion(currentQuestion.id, payload);

        toast.success(t('employer.questionBank.updateSuccess'));

      } else {

        await questionService.createQuestion(payload);

        toast.success(t('employer.questionBank.createSuccess'));

      }

      fetchQuestions();

      handleClose();

    } catch (error) {

      toast.error(t('employer.questionBank.saveError'));

    }

  };

  const handleDelete = useCallback(async (id) => {
    if (window.confirm(t('employer.questionBank.deleteConfirm'))) {
      try {
        await questionService.deleteQuestion(id);
        toast.success(t('employer.questionBank.deleteSuccess'));
        fetchQuestions();
      } catch (error) {
        toast.error(t('employer.questionBank.deleteError'));
      }
    }
  }, [fetchQuestions, t]);

  const columns = useMemo(
    () => [
      {

        header: t('employer.questionBank.columns.text'),

        accessorKey: 'text',

        cell: ({ getValue }) => (

          <Typography

            variant="body2"

            sx={{

              display: '-webkit-box',

              WebkitLineClamp: 2,

              WebkitBoxOrient: 'vertical',

              overflow: 'hidden',

              textOverflow: 'ellipsis',

            }}

          >

            {getValue()}

          </Typography>

        ),

      },

      {

        header: '',

        id: 'actions',

        cell: ({ row }) => (

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

            <IconButton

              size="small"

              onClick={() => handleOpen(row.original)}

              color="primary"

            >

              <EditIcon fontSize="small" />

            </IconButton>

            <IconButton

              size="small"

              onClick={() => handleDelete(row.original.id)}

              color="error"

            >

              <DeleteIcon fontSize="small" />

            </IconButton>

          </Box>

        ),

      },

    ],
    [t, handleOpen, handleDelete]
  );

  return (

    <Box

      sx={{

        px: { xs: 1, sm: 2 },

        py: { xs: 2, sm: 2 },

        backgroundColor: 'background.paper',

        borderRadius: 2,

      }}

    >

      <Stack

        direction={{ xs: 'column', sm: 'row' }}

        alignItems={{ xs: 'flex-start', sm: 'center' }}

        justifyContent="space-between"

        spacing={{ xs: 2, sm: 0 }}

        mb={4}

      >

        <Typography

          variant="h5"

          sx={{

            fontWeight: 600,

            background: (theme) =>

              theme.palette.primary.gradient || theme.palette.primary.main,

            WebkitBackgroundClip: 'text',

            WebkitTextFillColor: 'transparent',

            fontSize: { xs: '1.25rem', sm: '1.5rem' },

          }}

        >

          {resolvedTitle}

        </Typography>

        <Button

          variant="contained"

          color="primary"

          startIcon={<AddIcon />}

          onClick={() => handleOpen()}

          sx={{

            borderRadius: 2,

            px: 3,

            background: (theme) => theme.palette.primary.gradient,

            boxShadow: (theme) => theme.customShadows?.small || 1,

            '&:hover': {

              boxShadow: (theme) => theme.customShadows?.medium || 2,

            },

          }}

        >

          {t('employer.questionBank.add')}

        </Button>

      </Stack>

      {loading ? (

        <Box sx={{ width: '100%', mb: 2 }}>

          <LinearProgress

            color="primary"

            sx={{

              height: { xs: 4, sm: 6 },

              borderRadius: 3,

              backgroundColor: 'primary.background',

            }}

          />

        </Box>

      ) : (

        <Divider sx={{ mb: 2 }} />

      )}

      <Box

        sx={{

          backgroundColor: 'background.paper',

          borderRadius: 2,

          boxShadow: (theme) => theme.customShadows?.card || 1,

          overflow: 'hidden',

          width: '100%',

          '& .MuiTableContainer-root': {

            overflowX: 'auto',

          },

        }}

      >

        <DataTable

          columns={columns}

          data={questions}

          isLoading={loading}

          count={count}

          page={page}

          rowsPerPage={rowsPerPage}

          onPageChange={handleChangePage}

          onRowsPerPageChange={handleChangeRowsPerPage}

        />

      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">

        <DialogTitle sx={{ fontWeight: 600 }}>

          {isEdit

            ? t('employer.questionBank.editTitle')

            : t('employer.questionBank.createTitle')}

        </DialogTitle>

        <DialogContent>

          <Box sx={{ pt: 1 }}>

            <TextField

              autoFocus

              margin="dense"

              label={t('employer.questionBank.textLabel')}

              fullWidth

              multiline

              rows={4}

              variant="outlined"

              value={currentQuestion.text || ''}

              onChange={(e) =>

                setCurrentQuestion({ ...currentQuestion, text: e.target.value })

              }

              sx={{ mb: 3 }}

            />

          </Box>

        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>

          <Button onClick={handleClose} color="inherit">

            {t('common:actions.cancel')}

          </Button>

          <Button

            onClick={handleSubmit}

            variant="contained"

            sx={{ px: 4, borderRadius: 2 }}

          >

            {t('common:actions.save')}

          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

};

export default QuestionBankCard;
