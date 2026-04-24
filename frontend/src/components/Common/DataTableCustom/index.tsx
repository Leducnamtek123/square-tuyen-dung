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

import { visuallyHidden } from '@mui/utils';

import { Skeleton, Stack } from "@mui/material";

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

    <TableHead>

      <TableRow>

        {headCells.map((headCell: HeadCell) => (

          <TableCell

            key={headCell.id}

            align={headCell.numeric ? 'right' : 'left'}

            padding={headCell.disablePadding ? 'none' : 'normal'}

            sortDirection={orderBy === headCell.id ? order : false}

          >

            {(() => {

              const sortable = Boolean(onRequestSort) && Boolean(headCell.showOrder);

              return (

            <TableSortLabel

              disabled={!sortable}

              active={sortable && orderBy === headCell.id}

              direction={orderBy === headCell.id ? order : 'asc'}

              onClick={createSortHandler(headCell.id)}

            >

              {headCell.label}

              {orderBy === headCell.id ? (

                <Box component="span" sx={visuallyHidden}>

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

    <Box sx={{ width: '100%' }}>

      <TableContainer>

        <Table

          sx={{ minWidth: 750 }}

          aria-labelledby="tableTitle"

          size="medium"

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

        rowsPerPageOptions={[5, 10, 25]}

        component="div"

        count={count}

        rowsPerPage={rowsPerPage}

        page={page}

        onPageChange={handleChangePage || (() => { })}

        onRowsPerPageChange={handleChangeRowsPerPage}

      />

    </Box>

  );

};

const Loading = () => {
  const loadingKeys = [
    'loading-row-1',
    'loading-row-2',
    'loading-row-3',
    'loading-row-4',
    'loading-row-5',
    'loading-row-6',
    'loading-row-7',
    'loading-row-8',
    'loading-row-9',
    'loading-row-10',
    'loading-row-11',
    'loading-row-12',
  ];

  return (

    <Stack>

      {loadingKeys.map((key) => (
        <Skeleton key={key} height={50} />
      ))}

    </Stack>

  );

};

DataTableCustom.Loading = Loading;

export default React.memo(DataTableCustom);


