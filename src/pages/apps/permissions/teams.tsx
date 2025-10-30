import { useMemo, useState } from 'react';
import { useEffect } from 'react';

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
import TeamModal from '../../../sections/apps/permissions/TeamModal';
import AlertTeamDelete from '../../../sections/apps/permissions/AlertTeamDelete';

import { useGetTeams } from 'api/teams';
import teamApi from 'api/teams';

// types
import { Team } from 'types/permission';

// assets
import { Add, Edit, Eye, Trash, Profile2User, UserOctagon } from 'iconsax-react';

interface Props {
  columns: ColumnDef<Team>[];
  data: Team[];
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
          placeholder={`Buscar ${data.length} equipos...`}
        />

        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          <CSVExport
            {...{
              data: table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers: table.getAllColumns().map((d) => d.id),
              filename: 'equipos.csv'
            }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
            Crear Equipo
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
                  console.log('Team clicked:', row.original);
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

// ==============================|| TEAM LIST PAGE ||============================== //

export default function TeamListPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  useEffect(() => {
    setTeamsLoading(true);
    teamApi.getAll().then((result: Team[]) => {
      setTeams(result);
      setTeamsLoading(false);
      console.log('Resultado directo teamApi.getAll:', result);
    });
  }, []);
  const [teamModal, setTeamModal] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDeleteId, setTeamDeleteId] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<Team>[]>(
    () => [
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: ({ getValue, row }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar color="primary" size="sm">
              <Profile2User />
            </Avatar>
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue() as string}</Typography>
              <Typography variant="caption" color="text.secondary">
                {row.original.members?.length || 0} miembros
              </Typography>
            </Stack>
          </Stack>
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
        header: 'Líder',
        accessorKey: 'leader',
        cell: ({ row }) => {
          const leader = row.original.leader;
          return leader ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar size="sm">
                <UserOctagon />
              </Avatar>
              <Typography variant="body2">
                {leader.name || leader.firstName + ' ' + leader.lastName || 'Líder'}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sin líder asignado
            </Typography>
          );
        }
      },
      {
        header: 'Miembros',
        accessorKey: 'members',
        meta: {
          className: 'cell-center'
        },
        cell: ({ getValue }) => {
          const members = getValue() as any[] || [];
          return (
            <Chip
              variant="outlined"
              color="primary"
              label={members.length}
              size="small"
            />
          );
        }
      },
      {
        header: 'Estado',
        accessorKey: 'isActive',
        cell: ({ getValue }) => (
          <Chip
            variant="outlined"
            color={getValue() ? 'success' : 'error'}
            label={getValue() ? 'Activo' : 'Inactivo'}
            size="small"
          />
        )
      },
      {
        header: 'Fecha Creación',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return date ? new Date(date).toLocaleDateString() : '';
        }
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
              <Tooltip title="Ver detalles">
                <IconButton
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    console.log('View team:', row.original);
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
                    setSelectedTeam(row.original);
                    setTeamModal(true);
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
                    setTeamDeleteId(Number(row.original.id));
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

  if (teamsLoading) return <EmptyReactTable />;
console.log('Teams data:', teams);
  return (
    <>
      <ReactTable
        {...{
          data: teams,
          columns,
          modalToggler: () => {
            setTeamModal(true);
            setSelectedTeam(null);
          }
        }}
      />
      <TeamModal 
        open={teamModal} 
        modalToggler={() => setTeamModal(false)} 
        team={selectedTeam} 
      />
      <AlertTeamDelete 
        id={Number(teamDeleteId)} 
        title={teams.find((t: any) => t.id === teamDeleteId)?.name || teamDeleteId.toString()} 
        open={open} 
        handleClose={handleClose} 
      />
    </>
  );
}
