import { useMemo, useState, Fragment } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import {
  ColumnDef,
  HeaderGroup,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  TablePagination
} from 'components/third-party/react-table';

import EmptyReactTable from 'components/EmptyReactTable';
import PermissionModal from 'sections/apps/permissions/PermissionModal';
import AlertPermissionDelete from 'sections/apps/permissions/AlertPermissionDelete';
import PermissionAssignmentTool from 'components/PermissionAssignmentTool';

import { useGetPermissions } from 'api/permissions';

// types
import { PermissionAdvanced, PermissionType, DataScope } from 'types/permission';

// assets
import { Add, Edit, Eye, Trash, Key, Shield, Menu, Setting } from 'iconsax-react';

interface Props {
  columns: ColumnDef<PermissionAdvanced>[];
  data: PermissionAdvanced[];
  modalToggler: () => void;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns, modalToggler }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  const backColor = alpha('#1890ff', 0.1);

  return (
    <MainCard content={false}>
      <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'space-between'} sx={{ padding: 3 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Buscar ${data.length} permisos...`}
        />

        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          <CSVExport
            {...{
              data: table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers: table.getAllColumns().map((d) => d.id),
              filename: 'permisos.csv'
            }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
            Agregar Permiso
          </Button>
        </Stack>
      </Stack>
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                    Object.assign(header.column.columnDef.meta, {
                      className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                    });
                  }
                  return (
                    <TableCell
                      key={header.id}
                      {...header.column.columnDef.meta}
                      onClick={header.column.getToggleSortingHandler()}
                      {...(header.column.getCanSort() &&
                        header.column.columnDef.meta === undefined && {
                          className: 'cursor-pointer prevent-select'
                        })}
                    >
                      {header.isPlaceholder ? null : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          {header.column.getCanSort() && <HeaderSort column={header.column} />}
                        </Stack>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => {
                  console.log('Permission clicked:', row.original);
                }}
                sx={{ cursor: 'pointer', bgcolor: row.getIsSelected() ? backColor : 'inherit' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination
          {...{
            setPageSize: table.setPageSize,
            setPageIndex: table.setPageIndex,
            getState: table.getState,
            getPageCount: table.getPageCount,
            previousPage: table.previousPage,
            nextPage: table.nextPage
          }}
        />
      </Box>
    </MainCard>
  );
}

// ==============================|| PERMISSION TYPE CHIP ||============================== //

function PermissionTypeChip({ type }: { type: PermissionType }) {
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let icon = <Key size={16} />;

  switch (type) {
    case PermissionType.BASIC_CRUD:
      color = 'primary';
      icon = <Key size={16} />;
      break;
    case PermissionType.DATA_SCOPE:
      color = 'info';
      icon = <Shield size={16} />;
      break;
    case PermissionType.MENU_ACCESS:
      color = 'secondary';
      icon = <Menu size={16} />;
      break;
    case PermissionType.ACTION_PERMISSION:
      color = 'warning';
      icon = <Setting size={16} />;
      break;
  }

  return (
    <Chip
      variant="light"
      color={color}
      icon={icon}
      label={type.replace('_', ' ')}
      size="small"
    />
  );
}

// ==============================|| DATA SCOPE CHIP ||============================== //

function DataScopeChip({ scope }: { scope?: DataScope }) {
  if (!scope) return null;

  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

  switch (scope) {
    case DataScope.ALL:
      color = 'success';
      break;
    case DataScope.TEAM_ONLY:
      color = 'primary';
      break;
    case DataScope.OWN_ONLY:
      color = 'warning';
      break;
    case DataScope.DEPARTMENT:
      color = 'info';
      break;
    case DataScope.REGIONAL:
      color = 'secondary';
      break;
  }

  return (
    <Chip
      variant="light"
      color={color}
      label={scope.replace('_', ' ')}
      size="small"
    />
  );
}

// ==============================|| PERMISSION LIST PAGE ||============================== //

export default function PermissionListPage() {
  const { permissions, permissionsLoading } = useGetPermissions();
  const [permissionModal, setPermissionModal] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionAdvanced | null>(null);
  const [permissionDeleteId, setPermissionDeleteId] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<PermissionAdvanced>[]>(
    () => [
      {
        header: 'Clave',
        accessorKey: 'permissionKey',
        cell: ({ getValue }) => (
          <Typography variant="body2" fontFamily="monospace">
            {getValue() as string}
          </Typography>
        )
      },
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: ({ getValue }) => (
          <Typography variant="body2" fontWeight={500}>
            {getValue() as string}
          </Typography>
        )
      },
      {
        header: 'Módulo',
        accessorKey: 'module',
        cell: ({ getValue }) => (
          <Chip
            variant="outlined"
            label={getValue() as string}
            size="small"
            color="default"
          />
        )
      },
      {
        header: 'Tipo',
        accessorKey: 'type',
        cell: ({ getValue }) => <PermissionTypeChip type={getValue() as PermissionType} />
      },
      {
        header: 'Alcance de Datos',
        accessorKey: 'dataScope',
        cell: ({ getValue }) => <DataScopeChip scope={getValue() as DataScope} />
      },
      {
        header: 'Estado',
        accessorKey: 'isActive',
        cell: ({ getValue }) => (
          <Chip
            variant="light"
            color={getValue() ? 'success' : 'error'}
            label={getValue() ? 'Activo' : 'Inactivo'}
            size="small"
          />
        )
      },
      {
        header: 'Descripción',
        accessorKey: 'description',
        cell: ({ getValue }) => (
          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
            {(getValue() as string) || 'Sin descripción'}
          </Typography>
        )
      },
      {
        header: 'Acciones',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="Ver">
                <IconButton
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    console.log('View permission:', row.original);
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  color="primary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setSelectedPermission(row.original);
                    setPermissionModal(true);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  color="error"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleClose();
                    setPermissionDeleteId(Number(row.original.id));
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  if (permissionsLoading) return <EmptyReactTable />;

  return (
    <>
      <ReactTable
        {...{
          data: permissions as any[], // Cast temporal para evitar problemas de tipo
          columns,
          modalToggler: () => {
            setPermissionModal(true);
            setSelectedPermission(null);
          }
        }}
      />
      <PermissionModal 
        open={permissionModal} 
        modalToggler={() => setPermissionModal(false)} 
        permission={selectedPermission} 
      />
      <AlertPermissionDelete 
        id={Number(permissionDeleteId)} 
        title={permissionDeleteId.toString()} 
        open={open} 
        handleClose={handleClose} 
      />
    </>
  );
}
