import { useEffect, useMemo, useState } from 'react';
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
import Chip from '@mui/material/Chip';

import { ColumnDef, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table';

import MainCard from 'components/MainCard';
import { CSVExport, TablePagination, HeaderSort } from 'components/third-party/react-table';
import EmptyReactTable from 'components/EmptyReactTable';
import IconButton from 'components/@extended/IconButton';
import { Add, Edit, Trash, ShieldTick } from 'iconsax-react';

import roleApi, { RoleItem } from 'api/role';
import { permissionApi } from 'api/permission';
import RoleModal from 'sections/apps/roles/RoleModal';

export default function RoleListPage() {
  const [rows, setRows] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await roleApi.getAll(true);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = useMemo<ColumnDef<RoleItem>[]>(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Estado', accessorKey: 'isActive',
      cell: ({ getValue }) => <Chip variant="light" color={getValue() ? 'success' : 'error'} label={getValue() ? 'Activo' : 'Inactivo'} size="small" />
    },
    {
      header: 'Permisos',
      cell: ({ row }) => (
        <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', maxWidth: 480 }}>
          {(row.original.permissions || []).slice(0, 8).map((p) => (
            <Chip key={p.id} size="small" variant="outlined" label={p.name} />
          ))}
          {(row.original.permissions || []).length > 8 && (
            <Chip size="small" variant="light" color="primary" label={`+${(row.original.permissions || []).length - 8}`} />
          )}
        </Stack>
      )
    },
    {
      header: 'Acciones',
      cell: ({ row }) => (
        <Stack direction="row" sx={{ gap: 1 }}>
          <Tooltip title="Editar"><IconButton onClick={async () => {
            // Si el rol no tiene permisos, obtener por id
            if (!row.original.permissions || row.original.permissions.length === 0) {
              setPendingId(row.original.id);
            } else {
              setEditing(row.original);
              setOpen(true);
            }
          }}><Edit /></IconButton></Tooltip>
          <Tooltip title="Eliminar"><IconButton color="error" onClick={async () => {
            const ok = window.confirm('¿Eliminar rol?');
            if (!ok) return;
            await roleApi.remove(row.original.id);
            await load();
          }}><Trash /></IconButton></Tooltip>
        </Stack>
      )
    }
  ], []);
  // Efecto para obtener el rol por id si es necesario
  useEffect(() => {
    if (pendingId) {
      (async () => {
        const role = await roleApi.getById(pendingId);
        console.log('Loaded role for editing:', role);
        setEditing(role);
        setOpen(true);
        setPendingId(null);
      })();
    }
  }, [pendingId]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  const handleSubmit = async (vals: { name: string; isActive: boolean; permissions: number[] }) => {
    if (editing) await roleApi.update(editing.id, vals);
    else await roleApi.create(vals);
    setOpen(false);
    setEditing(null);
    await load();
  };

  if (loading) return <EmptyReactTable />;

  return (
    <MainCard content={false}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', p: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setOpen(true); }}>Agregar Rol</Button>
        <CSVExport data={rows} headers={[{ label: 'ID', key: 'id' }, { label: 'Nombre', key: 'name' }]} filename="roles.csv" />
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
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell ?? ((ctx: any) => ctx.getValue?.()), cell.getContext())}</TableCell>
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
      <RoleModal open={open} onClose={() => setOpen(false)} initial={editing || undefined} onSubmit={handleSubmit} />
    </MainCard>
  );
}
