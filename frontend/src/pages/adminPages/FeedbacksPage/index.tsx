import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Chip, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tooltip, Rating
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import adminManagementService from '../../../services/adminManagementService';

const FeedbacksPage = () => {
  const { t } = useTranslation('admin');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await adminManagementService.getFeedbacks();
      setFeedbacks(res?.data || res?.results || res || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleToggleActive = async (fb: any) => {
    try {
      await adminManagementService.updateFeedback(fb.id, { is_active: !fb.is_active });
      fetchFeedbacks();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await adminManagementService.deleteFeedback(current.id);
      setOpenDelete(false);
      fetchFeedbacks();
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('pages.feedbacks.title')}</Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/">{t('pages.feedbacks.breadcrumbAdmin')}</Link>
          <Typography color="text.primary">{t('pages.feedbacks.breadcrumb')}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={0}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('pages.feedbacks.table.id')}</TableCell>
                <TableCell>{t('pages.feedbacks.table.user')}</TableCell>
                <TableCell>{t('pages.feedbacks.table.content')}</TableCell>
                <TableCell>{t('pages.feedbacks.table.rating')}</TableCell>
                <TableCell>{t('pages.feedbacks.table.status')}</TableCell>
                <TableCell>{t('pages.feedbacks.table.createdAt')}</TableCell>
                <TableCell align="right">{t('pages.feedbacks.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbacks.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">{t('pages.feedbacks.empty')}</TableCell></TableRow>
              ) : feedbacks.map((fb: any) => (
                <TableRow key={fb.id} hover>
                  <TableCell>{fb.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {fb.userDict?.avatarUrl && (
                        <Box component="img" src={fb.userDict.avatarUrl} alt=""
                          sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{fb.userDict?.fullName || 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">{fb.userDict?.email || ''}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {fb.content}
                  </TableCell>
                  <TableCell>
                    <Rating value={fb.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={!!fb.is_active}
                      onChange={() => handleToggleActive(fb)}
                      size="small"
                      color="success"
                    />
                    <Chip label={fb.is_active ? t('pages.feedbacks.show') : t('pages.feedbacks.hide')} size="small"
                      color={fb.is_active ? 'success' : 'default'} sx={{ ml: 0.5 }} />
                  </TableCell>
                  <TableCell>
                    {fb.create_at ? new Date(fb.create_at).toLocaleDateString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('pages.feedbacks.table.deleteTooltip')}>
                      <IconButton size="small" color="error" onClick={() => { setCurrent(fb); setOpenDelete(true); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.feedbacks.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.feedbacks.deleteConfirm', { name: current?.userDict?.fullName || 'N/A' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.feedbacks.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isSaving}>
            {isSaving ? t('pages.feedbacks.deleting') : t('pages.feedbacks.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbacksPage;
