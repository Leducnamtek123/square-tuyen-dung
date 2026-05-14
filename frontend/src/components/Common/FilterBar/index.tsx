'use client';

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';

type SxArrayItem = boolean | Exclude<SxProps<Theme>, readonly unknown[]>;

const toSxArray = (sx?: SxProps<Theme>): SxArrayItem[] => {
  if (!sx) return [];
  return Array.isArray(sx) ? ([...sx] as SxArrayItem[]) : [sx as SxArrayItem];
};

export const filterControlSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 42,
    borderRadius: '8px',
    backgroundColor: 'background.paper',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
    '& fieldset': {
      borderColor: 'rgba(26, 64, 125, 0.14)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(26, 64, 125, 0.28)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(42, 169, 225, 0.14)',
    },
  },
  '& .MuiInputBase-input': {
    fontWeight: 600,
  },
} satisfies SxProps<Theme>;

interface FilterBarProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  searchButtonLabel?: string;
  showSearchButton?: boolean;
  filtersLabel?: string;
  advancedLabel?: string;
  advancedFilters?: React.ReactNode;
  advancedDefaultOpen?: boolean;
  activeFilterCount?: number;
  onReset?: () => void;
  resetLabel?: string;
  resetDisabled?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  searchSx?: SxProps<Theme>;
}

const FilterBar = ({
  title,
  description,
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onSearchSubmit,
  searchButtonLabel = 'Search',
  showSearchButton = false,
  filtersLabel = 'Filters',
  advancedLabel = 'Advanced filters',
  advancedFilters,
  advancedDefaultOpen = false,
  activeFilterCount,
  onReset,
  resetLabel = 'Clear filters',
  resetDisabled = false,
  actions,
  children,
  sx,
  contentSx,
  searchSx,
}: FilterBarProps) => {
  const [advancedOpen, setAdvancedOpen] = React.useState(advancedDefaultOpen);
  const hasSearch = typeof searchValue === 'string' && Boolean(onSearchChange);
  const hasActiveFilters = Boolean(activeFilterCount && activeFilterCount > 0);
  const rootSx = React.useMemo(() => ([
    (theme: Theme) => ({
      mb: 3,
      p: { xs: 1.5, md: 2 },
      border: '1px solid',
      borderColor: alpha(theme.palette.primary.main, 0.14),
      borderRadius: '8px',
      background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.045)} 0%, ${alpha(
        theme.palette.background.paper,
        0.94,
      )} 100%)`,
    }),
    ...toSxArray(sx),
  ] as SxProps<Theme>), [sx]);
  const searchFieldSx = React.useMemo(() => ([
    {
      width: { xs: '100%', lg: 360 },
      flexShrink: 0,
    },
    filterControlSx,
    ...toSxArray(searchSx),
  ] as SxProps<Theme>), [searchSx]);
  const searchSlotProps = React.useMemo(() => ({
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon fontSize="small" color="action" />
        </InputAdornment>
      ),
    },
  }), []);

  return (
    <Box sx={rootSx}>
      <Stack spacing={1.5}>
        {(title || description) && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={(theme) => ({
                mt: 0.15,
                width: 32,
                height: 32,
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                flexShrink: 0,
              })}
            >
              <ManageSearchIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.35 }}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontWeight: 600 }}>
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          sx={contentSx}
        >
          {hasSearch && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSearchSubmit?.();
              }}
              sx={searchFieldSx}
              slotProps={searchSlotProps}
            />
          )}

          {children && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                flexWrap: 'wrap',
                '& > *': {
                  minWidth: { xs: '100%', sm: 180 },
                },
              }}
            >
              {children}
            </Box>
          )}

          <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-end', lg: 'flex-start' }}>
            {showSearchButton && onSearchSubmit && (
              <Button variant="contained" startIcon={<SearchIcon />} onClick={onSearchSubmit}>
                {searchButtonLabel}
              </Button>
            )}

            {onReset && (
              <Tooltip title={resetLabel} arrow>
                <span>
                  <IconButton
                    aria-label={resetLabel}
                    onClick={onReset}
                    disabled={resetDisabled}
                    sx={(theme) => ({
                      width: 42,
                      height: 42,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      
                      bgcolor: 'background.paper',
                    })}
                  >
                    <RestartAltIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {advancedFilters && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FilterAltOutlinedIcon />}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 160ms ease',
                    }}
                  />
                }
                onClick={() => setAdvancedOpen((value) => !value)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {advancedLabel}
                {hasActiveFilters && (
                  <Chip
                    size="small"
                    label={activeFilterCount}
                    color="primary"
                    sx={{ ml: 1, height: 20, minWidth: 20, '& .MuiChip-label': { px: 0.75 } }}
                  />
                )}
              </Button>
            )}

            {actions}
          </Stack>
        </Stack>

        {advancedFilters && (
          <Collapse in={advancedOpen} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
            <Box>{advancedFilters}</Box>
          </Collapse>
        )}

        {!title && !description && filtersLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'none' }}>
            {filtersLabel}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default FilterBar;
