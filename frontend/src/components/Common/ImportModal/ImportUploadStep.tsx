import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { ExchangeDefinition, ImportMode } from '@/types/exchange';

interface ImportUploadStepProps {
  definition: ExchangeDefinition | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  mode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  matchBy: string;
  onMatchByChange: (matchBy: string) => void;
  onDownloadTemplate: () => void;
  error?: string | null;
}

export const ImportUploadStep: React.FC<ImportUploadStepProps> = ({
  definition,
  file,
  onFileChange,
  mode,
  onModeChange,
  matchBy,
  onMatchByChange,
  onDownloadTemplate,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileExtension(droppedFile.name)) {
        onFileChange(droppedFile);
      } else {
        alert('Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc file CSV (.csv)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const isValidFileExtension = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext === 'xlsx' || ext === 'xls' || ext === 'csv';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Stack spacing={3}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* Template Download Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '12px',
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0369A1', mb: 0.25 }}>
            Khuyến nghị sử dụng file mẫu chuẩn
          </Typography>
          <Typography variant="body2" sx={{ color: '#0284C7', fontSize: '0.8125rem' }}>
            File mẫu đã được thiết lập sẵn tiêu đề cột chuẩn, danh sách chọn (dropdown), và hướng dẫn nhập liệu chi tiết.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={onDownloadTemplate}
          sx={{
            backgroundColor: '#0284C7',
            '&:hover': { backgroundColor: '#0369A1' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
          }}
        >
          Tải file mẫu (.xlsx)
        </Button>
      </Paper>

      {/* File Dropzone */}
      <Box>
        <FormLabel sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block', fontSize: '0.875rem' }}>
          1. Tải lên tập tin dữ liệu (Excel hoặc CSV)
        </FormLabel>

        {!file ? (
          <Box
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: 4,
              border: '2px dashed #CBD5E1',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              '&:hover': {
                borderColor: '#0284C7',
                backgroundColor: '#F0F9FF',
              },
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: '#0284C7', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Kéo và thả file vào đây, hoặc <Box component="span" sx={{ color: '#0284C7' }}>chọn từ máy tính</Box>
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 15MB, khuyến nghị dưới 10,000 dòng mỗi lần)
            </Typography>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '8px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InsertDriveFileOutlinedIcon sx={{ color: '#0284C7', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {formatFileSize(file.size)} • Sẵn sàng kiểm tra cấu trúc
                </Typography>
              </Box>
            </Stack>

            <IconButton
              size="small"
              onClick={() => {
                onFileChange(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
              title="Xóa file đã chọn"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Paper>
        )}
      </Box>

      {/* Mode & Matching Key Configuration */}
      <Box>
        <FormLabel sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block', fontSize: '0.875rem' }}>
          2. Thiết lập chế độ nhập dữ liệu
        </FormLabel>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={mode}
            onChange={(e) => onModeChange(e.target.value as ImportMode)}
            sx={{ gap: 1.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: `1px solid ${mode === 'create' ? '#0284C7' : '#E2E8F0'}`,
                backgroundColor: mode === 'create' ? '#F0F9FF' : '#FFFFFF',
                cursor: 'pointer',
              }}
              onClick={() => onModeChange('create')}
            >
              <FormControlLabel
                value="create"
                control={<Radio size="small" sx={{ color: '#0284C7', '&.Mui-checked': { color: '#0284C7' } }} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      Chỉ thêm mới (Create only)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Tạo bản ghi mới. Nếu khóa định danh đã tồn tại trong hệ thống, dòng đó sẽ bị báo lỗi trùng lặp.
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: `1px solid ${mode === 'update' ? '#0284C7' : '#E2E8F0'}`,
                backgroundColor: mode === 'update' ? '#F0F9FF' : '#FFFFFF',
                cursor: 'pointer',
              }}
              onClick={() => onModeChange('update')}
            >
              <FormControlLabel
                value="update"
                control={<Radio size="small" sx={{ color: '#0284C7', '&.Mui-checked': { color: '#0284C7' } }} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      Chỉ cập nhật (Update only)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Cập nhật thông tin các bản ghi đã có. Dòng dữ liệu chưa có trong hệ thống sẽ bị báo lỗi không tìm thấy.
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: `1px solid ${mode === 'upsert' ? '#0284C7' : '#E2E8F0'}`,
                backgroundColor: mode === 'upsert' ? '#F0F9FF' : '#FFFFFF',
                cursor: 'pointer',
              }}
              onClick={() => onModeChange('upsert')}
            >
              <FormControlLabel
                value="upsert"
                control={<Radio size="small" sx={{ color: '#0284C7', '&.Mui-checked': { color: '#0284C7' } }} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      Thêm mới hoặc Cập nhật (Upsert)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Tự động cập nhật nếu bản ghi đã tồn tại; nếu chưa có thì tự động tạo mới.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Match By selector */}
      {definition?.matchingKeys && definition.matchingKeys.length > 0 && (
        <Box>
          <FormLabel sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block', fontSize: '0.875rem' }}>
            3. Khóa định danh nhận diện bản ghi trùng khớp
          </FormLabel>
          <Select
            size="small"
            fullWidth
            value={matchBy || definition.matchingKeys[0]}
            onChange={(e) => onMatchByChange(e.target.value)}
            sx={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
          >
            {definition.matchingKeys.map((k) => (
              <MenuItem key={k} value={k}>
                Đối chiếu theo trường: <strong>{k}</strong>
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </Stack>
  );
};
export default ImportUploadStep;
