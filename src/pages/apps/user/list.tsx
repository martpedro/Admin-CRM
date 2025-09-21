import { useMemo, useState, Fragment, MouseEvent } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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
import { LabelKeyObject } from 'react-csv/lib/core';
import { PatternFormat } from 'react-number-format';
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
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

import EmptyReactTable from 'components/EmptyReactTable';
import AlertUserDelete from 'sections/apps/user/AlertUserDelete';
import UserModal from 'sections/apps/user/UserModal';
import UserView from 'sections/apps/user/UserView';

import { useGetUser as useGetUser } from 'api/user';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { UserList } from 'types/user';

// assets
import { Add, Edit, Eye, Trash } from 'iconsax-react';

interface Props {
  columns: ColumnDef<UserList>[];
  data: UserList[];
  modalToggler: () => void;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Id', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  let headers: LabelKeyObject[] = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={(theme) => ({
          gap: 2,
          justifyContent: 'space-between',
          p: 3,
          [theme.breakpoints.down('sm')]: { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }
        })}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Buscar en ${data.length} registros...`}
        />
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
            Agregar usuario
          </Button>
          <CSVExport
            {...{
              data:
                table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                  ? data
                  : table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers,
              filename: 'lista-clientes.csv'
            }}
          />
        </Stack>
      </Stack>
      <Stack>
      <RowSelection selected={Object.keys(rowSelection).length} />
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
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
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
            <TableRow key={row.id}>
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
      <>
        <Divider />
        <Box sx={{ p: 2 }}>
        <TablePagination
          {...{
          setPageSize: table.setPageSize,
          setPageIndex: table.setPageIndex,
          getState: table.getState,
          getPageCount: table.getPageCount
          }}
        />
        </Box>
      </>
      </Stack>
    </MainCard>
  );
}
// ==============================|| CUSTOMER LIST ||============================== //

export default function UserListPage() {
  const { usersLoading: loading, users: lists } = useGetUser();

  const [open, setOpen] = useState<boolean>(false);

  const [userModal, setUserModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserList | null>(null);
  const [userDeleteId, setUserDeleteId] = useState<any>('');

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<UserList>[]>(
    () => [
      {
        id: 'Row Selection',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: 'ID',
        accessorKey: 'Id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Nombre',
        accessorKey: 'name'
      },
      {
        header: 'Apellido Paterno',
        accessorKey: 'LastName'
      },
      {
        header: 'Apellido Materno',
        accessorKey: 'MotherLastName'
      },
      {
        header: 'Teléfono',
        accessorKey: 'Phone'
      },
      {
        header: 'Letra Asignada',
        accessorKey: 'LetterAsign'
      },
      {
        header: 'Perfil',
        accessorKey: 'profile'
      },
      {
        header: 'Correo',
        accessorKey: 'email'
      },
      {
        header: 'Activo',
        accessorKey: 'isActive',
        cell: ({ getValue }) => getValue() ? 'Sí' : 'No'
      },
      {
        header: 'Acciones',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Editar">
                <IconButton
                  color="primary"
                  sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedUser(row.original);
                    setUserModal(true);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                  color="error"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleClose();
                    setUserDeleteId(Number((row.original as any).Id ?? (row.original as any).id));
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

  if (loading) return <EmptyReactTable />;

  return (
    <>
      <ReactTable
        {...{
          data: lists as any[], // Temporal cast para evitar error de tipos
          columns,
          modalToggler: () => {
            setUserModal(true);
            setSelectedUser(null);
          }
        }}
      />
      <AlertUserDelete id={Number(userDeleteId)} title={userDeleteId} open={open} handleClose={handleClose} />
      <UserModal open={userModal} modalToggler={setUserModal} user={selectedUser} />
    </>
  );
}
