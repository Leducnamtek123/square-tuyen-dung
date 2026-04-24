'use client';

import React from 'react';
import { Button, Chip, Select, MenuItem, Stack, type SelectChangeEvent } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompanyMember, CompanyRole } from '../../../types/models';
import type { TFunction } from 'i18next';

type Params = {
  t: TFunction;
  roles: CompanyRole[];
  deleteRolePending: boolean;
  deleteMemberPending: boolean;
  onDeleteRole: (id: number) => void;
  onDeleteMember: (id: number) => void;
  onUpdateMemberRole: (args: { id: number; roleId: number }) => void;
};

export const useEmployeesPageColumns = ({
  t,
  roles,
  deleteRolePending,
  deleteMemberPending,
  onDeleteRole,
  onDeleteMember,
  onUpdateMemberRole,
}: Params) => {
  const roleColumns = React.useMemo<ColumnDef<CompanyRole>[]>(() => [
    { accessorKey: 'id', header: t('employees.table.id') as string, enableSorting: true },
    { accessorKey: 'code', header: t('employees.table.code') as string, enableSorting: true },
    { accessorKey: 'name', header: t('employees.table.roleName') as string, enableSorting: true },
    {
      accessorKey: 'permissions',
      header: t('employees.table.permissions') as string,
      cell: (info) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {((info.getValue() as string[]) || []).length === 0 && <Chip size="small" label={t('employees.table.noPermissions')} />}
          {((info.getValue() as string[]) || []).map((p) => (
            <Chip size="small" key={`${info.row.original.id}-${p}`} label={p} />
          ))}
        </Stack>
      ),
    },
    { accessorKey: 'is_system', header: t('employees.table.system') as string, cell: (info) => (info.getValue() ? t('employees.table.yes') : t('employees.table.no')) },
    {
      id: 'actions',
      header: t('employees.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Button color="error" size="small" startIcon={<DeleteOutlineIcon />} disabled={info.row.original.is_system || deleteRolePending} onClick={() => onDeleteRole(info.row.original.id)}>
          {t('employees.table.delete')}
        </Button>
      ),
    },
  ], [deleteRolePending, onDeleteRole, t]);

  const memberColumns = React.useMemo<ColumnDef<CompanyMember>[]>(() => [
    { accessorKey: 'id', header: t('employees.table.id') as string, enableSorting: true },
    { accessorKey: 'userDict.fullName', header: t('employees.table.user') as string, enableSorting: true, cell: (info) => (info.getValue() as string) || '-' },
    { id: 'email', header: t('employees.table.email') as string, cell: (info) => info.row.original.userDict?.email || info.row.original.invited_email || '-' },
    {
      accessorKey: 'roleId',
      header: t('employees.table.role') as string,
      cell: (info) => (
        <Select
          size="small"
          fullWidth
          value={(info.getValue() as string || info.row.original.role?.id || '').toString()}
          onChange={(e: SelectChangeEvent) => {
            const nextRoleId = Number(e.target.value);
            if (!nextRoleId || nextRoleId === ((info.getValue() as number) || info.row.original.role?.id)) return;
            onUpdateMemberRole({ id: info.row.original.id, roleId: nextRoleId });
          }}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id.toString()}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    { accessorKey: 'status', header: t('employees.table.status') as string, cell: (info) => <Chip size="small" label={(info.getValue() as string) || 'UNKNOWN'} color={info.getValue() === 'ACTIVE' ? 'success' : 'default'} /> },
    {
      id: 'actions',
      header: t('employees.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Button color="error" size="small" startIcon={<DeleteOutlineIcon />} disabled={deleteMemberPending} onClick={() => onDeleteMember(info.row.original.id)}>
          {t('employees.table.delete')}
        </Button>
      ),
    },
  ], [deleteMemberPending, onDeleteMember, onUpdateMemberRole, roles, t]);

  return { roleColumns, memberColumns };
};
