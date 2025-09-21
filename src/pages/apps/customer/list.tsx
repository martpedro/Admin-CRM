import { useMemo, useState, MouseEvent } from 'react';

// material-ui
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
import AlertCustomerDelete from 'sections/apps/customer/AlertCustomerDelete';
import AddressModal from 'sections/apps/customer/AddressModal';
import CustomerModal from 'sections/apps/customer/CustomerModal';

import { useGetCustomer } from 'api/customer';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// types
import { CustomerList } from 'types/customer';
import { Address } from 'types/customer';

// assets
import { Add, Edit, Trash, Location } from 'iconsax-react';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
  modalToggler: () => void;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'FirstName', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const sortBy = { id: 'id', desc: false };

  const table = useReactTable({
    data: data,
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
  
  // Headers personalizados para CSV
  const customHeaders: LabelKeyObject[] = [
    { label: 'ID', key: 'Id' },
    { label: 'Nombre', key: 'FirstName' },
    { label: 'Apellido', key: 'LastName' },
    { label: 'Segundo Nombre', key: 'MiddleName' },
    { label: 'Email', key: 'Email' },
    { label: 'Teléfono', key: 'Phone' },
    { label: 'Clasificación', key: 'ClassCustomer' },
    { label: 'Empresa', key: 'CompanyName' },
    { label: 'Asesor Asignado', key: 'SupportSales' },
    { label: 'Fecha de Creación', key: 'CreatedAt' }
  ];

  headers = customHeaders;

  // Función para transformar los datos para CSV
  const getCSVData = () => {
    const selectedRows = table.getSelectedRowModel().flatRows.map((row) => row.original);
    const dataToExport = selectedRows.length === 0 ? data : selectedRows;
    
    return dataToExport.map((customer) => ({
      ...customer,
      // Transformar el objeto SupportSales a texto legible
      SupportSales: customer.SupportSales 
        ? `${customer.SupportSales.Name || 'Sin nombre'} (${customer.SupportSales.Email || 'Sin email'})`
        : 'Sin asesor asignado',
      // Formatear la fecha de creación
      CreatedAt: customer.CreatedAt 
        ? new Date(customer.CreatedAt).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Sin fecha'
    }));
  };

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

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, alignItems: 'center' }}>
        <SelectColumnSorting sortBy={sortBy.id} {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
        <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
          Agregar cliente
        </Button>
        <CSVExport
          {...{
          data: getCSVData(),
          headers,
          filename: 'lista-clientes.csv'
          }}
        />
        </Stack>
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

export default function CustomerListPage() {
  const { usersLoading: loading, customers: lists } = useGetCustomer();

  const [open, setOpen] = useState<boolean>(false);

  const [customerModal, setCustomerModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerList | null>(null);
  const [customerDeleteId, setCustomerDeleteId] = useState<any>('');
  
  // Estados para el modal de direcciones
  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
  const [selectedCustomerForAddress, setSelectedCustomerForAddress] = useState<CustomerList | null>(null);

  const handleClose = () => {
    setOpen(!open);
  };

  // Funciones para el modal de direcciones
  const handleAddressModalOpen = (customer: CustomerList) => {
    setSelectedCustomerForAddress(customer);
    setAddressModalOpen(true);
  };

  const handleAddressModalClose = () => {
    setAddressModalOpen(false);
    setSelectedCustomerForAddress(null);
  };

  const handleAddressSave = async (address: Address, isNew: boolean) => {
    // Aquí implementarías la lógica para guardar/actualizar la dirección
    // Por ejemplo, una llamada a la API
    console.log('Guardando dirección:', address, 'Es nueva:', isNew);
    
    // Simular guardado exitoso
    return Promise.resolve();
  };

  const columns = useMemo<ColumnDef<CustomerList>[]>(
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
        },
        size: 80
      },
      {
        header: 'Nombre Completo',
        accessorKey: 'FirstName',
        cell: ({ row }) => (
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {`${row.original.FirstName || ''} ${row.original.LastName || ''}`.trim()}
            </Typography>
            {row.original.MiddleName && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {row.original.MiddleName}
              </Typography>
            )}
          </Stack>
        ),
        size: 200
      },
      {
        header: 'Email',
        accessorKey: 'Email',
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {getValue() as string}
          </Typography>
        ),
        size: 200
      },
      {
        header: 'Teléfono',
        accessorKey: 'Phone',
        cell: ({ getValue }) => {
          const phone = getValue() as string;
          if (!phone) return '-';
          return (
            <PatternFormat 
              displayType="text" 
              format="+52 (##) ####-####" 
              mask="_" 
              value={phone}
            />
          );
        },
        size: 150
      },
      {
        header: 'Clasificación',
        accessorKey: 'ClassCustomer',
        cell: ({ getValue }) => {
          const classValue = getValue() as string;
          let label = 'Sin clasificar';
          let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
          
          switch (classValue) {
            case 'A':
              label = 'Clase A';
              color = 'success';
              break;
            case 'B':
              label = 'Clase B';
              color = 'info';
              break;
            case 'C':
              label = 'Clase C';
              color = 'warning';
              break;
            case 'D':
              label = 'Clase D';
              color = 'error';
              break;
          }
          
          return <Chip color={color} label={label} size="small" variant="light" />;
        },
        size: 120
      },
      {
        header: 'Empresa',
        accessorKey: 'CompanyName',
        cell: ({ getValue }) => (
          <Typography variant="body2">
            {(getValue() as string) || '-'}
          </Typography>
        ),
        size: 150
      },
      {
        header: 'Asesor Asignado',
        accessorKey: 'SupportSales',
        cell: ({ getValue }) => {
          const supportSales = getValue() as any;
          if (!supportSales) return '-';
          
          return (
            <Stack sx={{ gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {supportSales.Name || '-'}
              </Typography>
              {supportSales.Email && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {supportSales.Email}
                </Typography>
              )}
            </Stack>
          );
        },
        size: 160
      },
      {
        header: 'Fecha Creación',
        accessorKey: 'CreatedAt',
        cell: ({ getValue }) => {
          const date = getValue() as string;
          if (!date) return '-';
          
          const formattedDate = new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formattedDate}
            </Typography>
          );
        },
        size: 120
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
              <Tooltip title="Direcciones">
                <IconButton
                  color="info"
                  sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleAddressModalOpen(row.original);
                  }}
                >
                  <Location />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  color="primary"
                  sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedCustomer(row.original);
                    setCustomerModal(true);
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
                    setCustomerDeleteId(Number(row.original.Id));
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
        size: 120
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (loading) return <EmptyReactTable />;

  return (
    <>
      <ReactTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setCustomerModal(true);
            setSelectedCustomer(null);
          }
        }}
      />
      <AlertCustomerDelete id={Number(customerDeleteId)} title={customerDeleteId} open={open} handleClose={handleClose} />
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} customer={selectedCustomer} />
      
      {/* Modal de direcciones */}
      {selectedCustomerForAddress && (
        <AddressModal
          open={addressModalOpen}
          onClose={handleAddressModalClose}
          customerId={selectedCustomerForAddress.Id || 0}
          customerName={selectedCustomerForAddress.Name || selectedCustomerForAddress.name || 'Cliente'}
          addresses={selectedCustomerForAddress.Address || selectedCustomerForAddress.address || []}
          onSave={handleAddressSave}
        />
      )}
    </>
  );
}
