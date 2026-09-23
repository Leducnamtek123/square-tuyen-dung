import React from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import type { NativeDepartment } from '@/services/hrmService';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: pc.divider(0.85) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1.5,
    },
  },
  '& .MuiInputBase-input': {
    py: '8.5px',
    fontSize: '0.875rem',
  },
};

export const ONBOARDING_STAGE_CONFIG: Record<
  string,
  { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; bg: string; text: string; border: string }
> = {
  OFFER_ACCEPTED: {
    label: 'Đã ký Offer',
    color: 'info',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  PREBOARDING_DOCS: {
    label: 'Chờ nộp hồ sơ',
    color: 'warning',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
  },
  INTERNAL_PREP: {
    label: 'Chuẩn bị nội bộ',
    color: 'primary',
    bg: '#f5f3ff',
    text: '#6d28d9',
    border: '#ddd6fe',
  },
  DAY_ONE_WELCOME: {
    label: 'Ngày đầu nhận việc',
    color: 'info',
    bg: '#ecfeff',
    text: '#0e7490',
    border: '#a5f3fc',
  },
  PROBATION_EVALUATION: {
    label: 'Đang thử việc',
    color: 'warning',
    bg: '#fefce8',
    text: '#a16207',
    border: '#fef08a',
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    color: 'success',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'error',
    bg: '#fef2f2',
    text: '#b91c1c',
    border: '#fecaca',
  },
};

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  stage: string;
  onStageChange: (value: string) => void;
  department: string | number;
  onDepartmentChange: (value: string | number) => void;
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  departments: NativeDepartment[];
  onReset?: () => void;
}

export const OnboardingFilters: React.FC<Props> = ({
  search,
  onSearchChange,
  stage,
  onStageChange,
  department,
  onDepartmentChange,
  viewMode,
  onViewModeChange,
  departments,
  onReset,
}) => {
  const isFiltered = Boolean(search || stage || department);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: pc.divider(0.85),
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ flexGrow: 1, alignItems: 'center' }}
      >
        <TextField
          placeholder="Tìm theo họ tên, mã NV, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ ...inputSx, minWidth: { xs: '100%', sm: 260 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          select
          value={stage}
          onChange={(e) => onStageChange(e.target.value)}
          sx={{ ...inputSx, minWidth: { xs: '100%', sm: 190 } }}
          slotProps={{
            select: { displayEmpty: true },
          }}
        >
          <MenuItem value="">
            <em>Tất cả chặng ({Object.keys(ONBOARDING_STAGE_CONFIG).length})</em>
          </MenuItem>
          {Object.entries(ONBOARDING_STAGE_CONFIG).map(([key, cfg]) => (
            <MenuItem key={key} value={key}>
              {cfg.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          sx={{ ...inputSx, minWidth: { xs: '100%', sm: 190 } }}
          slotProps={{
            select: { displayEmpty: true },
          }}
        >
          <MenuItem value="">
            <em>Tất cả phòng ban</em>
          </MenuItem>
          {departments.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>

        {isFiltered && onReset && (
          <Button
            size="small"
            variant="text"
            startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
            onClick={onReset}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            Đặt lại lọc
          </Button>
        )}
      </Stack>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, newMode) => {
          if (newMode) onViewModeChange(newMode);
        }}
        size="small"
        sx={{
          bgcolor: pc.bgDefault(0.6),
          p: 0.5,
          borderRadius: 2,
          '& .MuiToggleButton-root': {
            px: 1.5,
            py: 0.6,
            borderRadius: 1.5,
            border: 'none',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: 'text.secondary',
            '&.Mui-selected': {
              bgcolor: '#ffffff',
              color: 'primary.main',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                bgcolor: '#ffffff',
              },
            },
          },
        }}
      >
        <ToggleButton value="table">
          <TableRowsIcon sx={{ fontSize: 18, mr: 0.8 }} />
          Bảng chi tiết
        </ToggleButton>
        <ToggleButton value="kanban">
          <ViewKanbanIcon sx={{ fontSize: 18, mr: 0.8 }} />
          Kanban Board
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
