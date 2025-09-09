import { useMemo, useState, Fragment, MouseEvent } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  HeaderGroup,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
import TeamModal from './TeamModal';
import AlertTeamDelete from './AlertTeamDelete';

// assets
import { Add, Edit, Eye, Trash } from 'iconsax-react';

// types
import { Team } from 'types/permission';

// api
import { useGetTeams } from 'api/permissions';

// ==============================|| REACT TABLE ||============================== //

interface Props {
  data: Team[];
  columns: ColumnDef<Team>[];
  modalToggler: () => void;
}

function ReactTable({ data, columns, modalToggler }: Props) {
  const theme = useTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
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
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  let headers: HeaderGroup<Team>[] = [];
  table.getHeaderGroups().map((headerGroup: HeaderGroup<Team>) => {
    headers.push(headerGroup);
    return headerGroup.headers.map((header) => header);
  });

  return (
    <MainCard content={false}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 3 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Buscar ${data.length} equipos...`}
        />

        <Stack direction="row" alignItems="center" spacing={2}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button variant="contained" startIcon={<Add />} onClick={modalToggler}>
            Agregar Equipo
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table>
              <TableHead>
                {headers.map((headerGroup: HeaderGroup<Team>) => (
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
                    onClick={() => row.toggleSelected()}
                    selected={row.getIsSelected()}
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
      </Box>
    </MainCard>
  );
}

// ==============================|| TEAMS LIST ||============================== //

export default function Teams() {
  const theme = useTheme();
  const { teams, teamsLoading: isLoading } = useGetTeams();

  const [open, setOpen] = useState<boolean>(false);
  const [teamModal, setTeamModal] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDeleteId, setTeamDeleteId] = useState<number | null>(null);

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<Team>[]>(
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
        header: 'Nombre del Equipo',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              alt={getValue() as string}
              size="sm"
              sx={{
                bgcolor: theme.palette.primary.lighter,
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            >
              {String(getValue()).charAt(0).toUpperCase()}
            </Avatar>
            <Stack>
              <Typography variant="subtitle1">{getValue() as string}</Typography>
              <Typography variant="caption" color="secondary">
                {row.original.description || 'Sin descripción'}
              </Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Líder del Equipo',
        accessorKey: 'leader.name',
        cell: ({ row }) => {
          const leader = row.original.leader;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                alt={leader ? `${leader.name} ${leader.lastName}` : ''}
                size="sm"
              >
                {leader ? `${leader.name.charAt(0)}${leader.lastName.charAt(0)}` : '?'}
              </Avatar>
              <Stack>
                <Typography variant="subtitle1">
                  {leader ? `${leader.name} ${leader.lastName}` : 'Sin asignar'}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {leader?.email || ''}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Miembros',
        accessorKey: 'members',
        cell: ({ row }) => {
          const members = row.original.members || [];
          return (
            <Stack direction="row" spacing={0.5}>
              {members.slice(0, 3).map((member, index) => (
                <Tooltip key={member.userId} title={`${member.user?.name || ''} ${member.user?.lastName || ''}`}>
                  <Avatar
                    alt={`${member.user?.name || ''} ${member.user?.lastName || ''}`}
                    size="sm"
                    sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                  >
                    {member.user ? `${member.user.name.charAt(0)}${member.user.lastName.charAt(0)}` : '??'}
                  </Avatar>
                </Tooltip>
              ))}
              {members.length > 3 && (
                <Chip
                  label={`+${members.length - 3}`}
                  size="small"
                  sx={{ height: 24, minWidth: 24 }}
                />
              )}
              {members.length === 0 && (
                <Typography variant="caption" color="secondary">
                  Sin miembros
                </Typography>
              )}
            </Stack>
          );
        }
      },
      {
        header: 'Estado',
        accessorKey: 'isActive',
        cell: ({ getValue }) => {
          const isActive = getValue() as boolean;
          return (
            <Chip
              color={isActive ? 'success' : 'error'}
              label={isActive ? 'Activo' : 'Inactivo'}
              size="small"
              variant="light"
            />
          );
        }
      },
      {
        header: 'Acciones',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon = row.getIsExpanded() ? (
            <Add style={{ transform: 'rotate(45deg)' }} />
          ) : (
            <Eye />
          );
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="Ver">
                <IconButton
                  color="secondary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    row.toggleExpanded();
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  color="primary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
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
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    if (row.original.id) {
                      setTeamDeleteId(row.original.id);
                    }
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
    [theme]
  );

  if (isLoading) return <div>Cargando equipos...</div>;

  return (
    <>
      <ReactTable
        {...{
          data: teams || [],
          columns,
          modalToggler: () => {
            setSelectedTeam(null);
            setTeamModal(true);
          }
        }}
      />
      <TeamModal open={teamModal} modalToggler={() => setTeamModal(false)} team={selectedTeam} />
      <AlertTeamDelete
        id={teamDeleteId!}
        title={teams?.find((t: Team) => t.id === teamDeleteId)?.name || ''}
        open={teamDeleteId !== null}
        handleClose={() => setTeamDeleteId(null)}
      />
    </>
  );
}
