import { useMemo, useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { ColumnDef, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table';

import MainCard from 'components/MainCard';
import { CSVExport, TablePagination, HeaderSort } from 'components/third-party/react-table';
import EmptyReactTable from 'components/EmptyReactTable';
import IconButton from 'components/@extended/IconButton';
import { Add, Edit, Trash } from 'iconsax-react';

import { companyApi } from 'api/company';
import { CompanyInfo } from 'types/company';
import CompanyModal from 'sections/apps/company/CompanyModal';

export default function CompanyListPage() {
  const [rows, setRows] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyInfo | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await companyApi.getAll();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = useMemo<ColumnDef<CompanyInfo>[]>(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Razón Social', accessorKey: 'razonSocial' },
    { header: 'Nombre Legal', accessorKey: 'nombreLegal' },
    { header: 'RFC', accessorKey: 'rfc' },
    { header: 'Teléfonos', accessorKey: 'telefonos' },
    { header: 'WhatsApp', accessorKey: 'whatsapp' },
    { header: 'Página', accessorKey: 'pagina' },
    { 
      header: 'Estado', 
      accessorKey: 'isActive',
      cell: ({ row }) => (
        <span style={{ color: row.original.isActive ? 'green' : 'red' }}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: ({ row }) => (
        <Stack direction="row" sx={{ gap: 1 }}>
          <Tooltip title="Editar"><IconButton onClick={() => { setEditing(row.original); setOpen(true); }}><Edit /></IconButton></Tooltip>
          <Tooltip title="Eliminar"><IconButton color="error" onClick={async () => {
            const ok = window.confirm('¿Eliminar empresa?');
            if (!ok) return;
            await companyApi.remove(row.original.id);
            await load();
          }}><Trash /></IconButton></Tooltip>
        </Stack>
      )
    }
  ], []);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  const handleSubmit = async (vals: Partial<CompanyInfo>) => {
  if (editing) await companyApi.update(editing.id, vals);
  else await companyApi.create(vals);
    setOpen(false);
    setEditing(null);
    await load();
  };

  if (loading) return <EmptyReactTable />;

  return (
    <MainCard content={false}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', p: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setOpen(true); }}>Agregar empresa</Button>
        <CSVExport 
          data={rows} 
          headers={[
            { label: 'ID', key: 'id' }, 
            { label: 'Razón Social', key: 'razonSocial' },
            { label: 'Nombre Legal', key: 'nombreLegal' },
            { label: 'RFC', key: 'rfc' },
            { label: 'Teléfonos', key: 'telefonos' },
            { label: 'WhatsApp', key: 'whatsapp' },
            { label: 'Página', key: 'pagina' },
            { label: 'Estado', key: 'isActive' }
          ]} 
          filename="empresas.csv" 
        />
      </Stack>
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableCell key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination {...{ setPageSize: () => {}, setPageIndex: () => {}, getState: () => table.getState(), getPageCount: () => 1 }} />
      </Box>
      <CompanyModal open={open} onClose={() => setOpen(false)} initial={editing || undefined} onSubmit={handleSubmit} />
    </MainCard>
  );
}
