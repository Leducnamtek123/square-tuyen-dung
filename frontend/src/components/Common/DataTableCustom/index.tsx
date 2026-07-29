import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { visuallyHidden } from '@mui/utils';
const visuallyHiddenAny = visuallyHidden as any;

const EMPTY_HEAD_CELLS: HeadCell[] = [];
const EMPTY_ROWS: unknown[] = [];

interface HeadCell {
  id: string;
  label: string;
  numeric?: boolean;
  disablePadding?: boolean;
  showOrder?: boolean;
}

interface EnhancedTableHeadProps {
  headCells: HeadCell[];
  order: 'asc' | 'desc';
  orderBy: string;
  onRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
}

function EnhancedTableHead({ headCells = EMPTY_HEAD_CELLS, order, orderBy, onRequestSort }: EnhancedTableHeadProps) {
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    if (!onRequestSort) return;
    onRequestSort(event, property);
  };

  return (
    <TableHead
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#F8FAFC',
      }}
    >
      <TableRow sx={{ height: 44 }}>
        {headCells.map((headCell: HeadCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              backgroundColor: '#F8FAFC',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.8125rem',
              py: '10px',
              borderBottom: '1px solid #E5E7EB',
              whiteSpace: 'nowrap',
            }}
          >
            {(() => {
              const sortable = Boolean(onRequestSort) && Boolean(headCell.showOrder);
              return (
                <TableSortLabel
                  disabled={!sortable}
                  active={sortable && orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                  sx={{
                    '&.Mui-active': { color: '#2563EB' },
                    '&:hover': { color: '#2563EB' },
                  }}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHiddenAny}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              );
            })()}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
};

interface DataTableCustomProps {
  headCells?: HeadCell[];
  rows?: unknown[];
  order?: 'asc' | 'desc';
  orderBy?: string;
  page?: number;
  rowsPerPage?: number;
  count?: number;
  handleRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
  handleChangePage?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDelete?: (id: string | number) => void;
  handleUpdate?: (id: string | number) => void;
  children?: React.ReactNode;
}

const DataTableCustom = ({
  headCells = EMPTY_HEAD_CELLS,
  rows = EMPTY_ROWS,
  order,
  orderBy,
  page = 0,
  rowsPerPage = 10,
  count = 0,
  handleRequestSort,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDelete,
  handleUpdate,
  children,
}: DataTableCustomProps) => {
  const resolvedOrder = order ?? 'asc';
  const resolvedOrderBy = orderBy ?? (headCells?.[0]?.id || '');
  const resolvedRequestSort = handleRequestSort || undefined;

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
        boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px -1px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
      }}
    >
      <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)', minHeight: 300 }}>
        <Table
          sx={{
            minWidth: 750,
            '& .MuiTableRow-root': {
              minHeight: 48,
              maxHeight: 52,
              transition: 'background-color 100ms ease-in-out',
              '&:hover': {
                backgroundColor: '#F8FAFC',
              },
            },
            '& .MuiTableCell-root': {
              borderBottom: '1px solid #F1F5F9',
              py: '10px',
              px: '16px',
              fontSize: '0.875rem',
              color: '#111827',
            },
          }}
          aria-labelledby="tableTitle"
          size="small"
        >
          <EnhancedTableHead
            headCells={headCells}
            order={resolvedOrder}
            orderBy={resolvedOrderBy}
            onRequestSort={resolvedRequestSort}
          />
          {children}
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage || (() => { })}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: '1px solid #E5E7EB',
          color: '#6B7280',
          '.MuiTablePagination-select': {
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            py: 0.5,
          },
        }}
      />
    </Box>
  );
};

// Candidate Avatar + Name + Subtitle Layout helper component for rows
export const CandidateCell: React.FC<{ name: string; subtitle?: string; avatarUrl?: string }> = ({
  name,
  subtitle,
  avatarUrl,
}) => (
  <Stack direction="row" alignItems="center" spacing={1.5}>
    <Avatar
      src={avatarUrl}
      alt={name}
      sx={{
        width: 32,
        height: 32,
        fontSize: '0.8125rem',
        bgcolor: '#2563EB',
        color: '#FFFFFF',
        fontWeight: 600,
      }}
    >
      {name?.charAt(0)?.toUpperCase()}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: '#111827',
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: '#6B7280',
            fontSize: '0.75rem',
            lineHeight: 1.2,
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Stack>
);

const Loading = () => {
  const loadingKeys = [
    'loading-row-1',
    'loading-row-2',
    'loading-row-3',
    'loading-row-4',
    'loading-row-5',
    'loading-row-6',
  ];

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {loadingKeys.map((key) => (
        <Skeleton key={key} height={44} sx={{ borderRadius: '8px', bgcolor: '#F1F5F9' }} />
      ))}
    </Stack>
  );
};

DataTableCustom.Loading = Loading;

export default React.memo(DataTableCustom);


