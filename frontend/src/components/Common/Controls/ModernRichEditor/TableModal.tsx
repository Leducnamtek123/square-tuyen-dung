import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useTranslation } from 'react-i18next';

interface TableModalProps {
  open: boolean;
  onClose: () => void;
  onInsertTable: (rows: number, cols: number, hasHeader: boolean) => void;
}

export const TableModal: React.FC<TableModalProps> = ({ open, onClose, onInsertTable }) => {
  const { t } = useTranslation('common');
  const [selectedRows, setSelectedRows] = useState(3);
  const [selectedCols, setSelectedCols] = useState(3);
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);

  const maxRows = 6;
  const maxCols = 6;

  const activeRows = hoverRows || selectedRows;
  const activeCols = hoverCols || selectedCols;

  const handleApply = () => {
    onInsertTable(selectedRows, selectedCols, hasHeader);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableChartIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            {t('editor.table.modalTitle', 'Chèn Bảng Dữ Liệu')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('editor.table.gridSize', 'Kích thước:')} <strong>{t('editor.table.sizeReadout', '{{rows}} hàng x {{cols}} cột', { rows: activeRows, cols: activeCols })}</strong>
        </Typography>

        {/* Matrix Grid Selector */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxCols}, 28px)`,
            gap: '4px',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
          onMouseLeave={() => {
            setHoverRows(0);
            setHoverCols(0);
          }}
        >
          {Array.from({ length: maxRows }).map((_, rIdx) =>
            Array.from({ length: maxCols }).map((_, cIdx) => {
              const r = rIdx + 1;
              const c = cIdx + 1;
              const isHovered = r <= activeRows && c <= activeCols;
              return (
                <Box
                  key={`${r}-${c}`}
                  onMouseEnter={() => {
                    setHoverRows(r);
                    setHoverCols(c);
                  }}
                  onClick={() => {
                    setSelectedRows(r);
                    setSelectedCols(c);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: isHovered ? 'primary.main' : 'divider',
                    bgcolor: isHovered ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                />
              );
            })
          )}
        </Box>

        <FormControlLabel
          control={<Switch checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} size="small" />}
          label={<Typography variant="body2">{t('editor.table.headerRow', 'Có hàng tiêu đề nổi bật (Header row)')}</Typography>}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          {t('editor.table.cancel', 'Hủy')}
        </Button>
        <Button onClick={handleApply} variant="contained">
          {t('editor.table.insertButton', 'Chèn Bảng ({{rows}}x{{cols}})', { rows: selectedRows, cols: selectedCols })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableModal;
