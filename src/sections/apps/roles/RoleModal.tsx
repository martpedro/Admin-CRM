import React, { useEffect, useMemo, useState } from 'react';
import usePermissions from 'hooks/usePermissions';
import Modal from '@mui/material/Modal';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from 'components/@extended/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Paper from '@mui/material/Paper';
import { RoleItem } from 'api/role';
import { useAllAdvancedPermissions, AdvancedPermissionItem } from 'api/permissions-advanced';
import { Edit, Shield, Menu, Data, User, ArrowDown2 } from 'iconsax-react';

type SubmitPayload = { name: string; isActive: boolean; permissions: number[] };

// Iconos por tipo de permiso
const PermissionTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'menu_access': return <Menu size={16} />;
    case 'basic_crud': return <Data size={16} />;
    case 'data_scope': return <User size={16} />;
    case 'action_permission': return <Shield size={16} />;
    default: return <Shield size={16} />;
  }
};

export default function RoleModal({ open, onClose, initial, onSubmit }: { open: boolean; onClose: () => void; initial?: Partial<RoleItem>; onSubmit: (data: SubmitPayload) => void; }) {
  const { canCreate, canUpdate } = usePermissions();
  const [name, setName] = useState<string>(initial?.name || '');
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { permissions: advancedPerms = [], permissionsLoading } = useAllAdvancedPermissions();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    setName(initial?.name || '');
    setIsActive(initial?.isActive ?? true);
  }, [initial]);

  // Precarga permisos solo cuando advancedPerms está disponible
  useEffect(() => {
    console.log('RoleModal - precargando permisos para rol', initial, open);
    if (!open || !initial?.id) return;
    const perms = initial?.permissions;
    console.log('RoleModal - precargando permisos para rol', initial.id, perms);
    let ids: number[] = [];
    if (Array.isArray(perms)) {
      // Si el array es de números (IDs)
      if (perms.every((p) => typeof p === 'number')) {
        ids = perms as number[];
      } else {
        // Si el array es de objetos, buscar la propiedad id o Id
        ids = perms.map((p: any) => p.id ?? p.Id).filter((id: any) => typeof id === 'number');
      }
    }
    // Filtrar solo los IDs que existen en advancedPerms
    const validIds = advancedPerms.length > 0 ? ids.filter(id => advancedPerms.some(p => p.id === id)) : ids;
    setSelectedPermissions(validIds);
  }, [open, initial?.id, advancedPerms]);

  // Agrupar permisos por módulo
  const permissionsByModule = useMemo(() => {
    const groups: Record<string, AdvancedPermissionItem[]> = {};
    advancedPerms.forEach(permission => {
      const module = permission.module || 'Sistema';
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(permission);
    });
    return groups;
  }, [advancedPerms]);

  // Filtrar permisos según búsqueda y módulo seleccionado
  const filteredPermissions = useMemo(() => {
    let filtered = advancedPerms;

    // Filtrar por módulo
    if (selectedModule !== 'all') {
      filtered = filtered.filter(p => (p.module || 'Sistema') === selectedModule);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.key.toLowerCase().includes(term) ||
        (p.module || '').toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [advancedPerms, selectedModule, searchTerm]);

  // Obtener módulos únicos
  const modules = useMemo(() => {
    const moduleSet = new Set<string>();
    advancedPerms.forEach(p => moduleSet.add(p.module || 'Sistema'));
    return Array.from(moduleSet).sort();
  }, [advancedPerms]);

  // Funciones de toggle
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModulePermissions = (module: string) => {
    const modulePermissions = permissionsByModule[module] || [];
    const moduleIds = modulePermissions.map(p => p.id);
    const allModuleSelected = moduleIds.every(id => selectedPermissions.includes(id));
    
    if (allModuleSelected) {
      // Deseleccionar todos los del módulo
      setSelectedPermissions(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
      // Seleccionar todos los del módulo
      setSelectedPermissions(prev => {
        const newSelected = new Set(prev);
        moduleIds.forEach(id => newSelected.add(id));
        return Array.from(newSelected);
      });
    }
  };

  const toggleAllPermissions = () => {
    const allIds = filteredPermissions.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deseleccionar todos los filtrados
      setSelectedPermissions(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      // Seleccionar todos los filtrados
      setSelectedPermissions(prev => {
        const newSelected = new Set(prev);
        allIds.forEach(id => newSelected.add(id));
        return Array.from(newSelected);
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      isActive, 
      permissions: selectedPermissions 
    });
  };

  return (
    <>
      {open && (
        <Modal open={open} onClose={onClose}>
          <MainCard
            title={initial?.id ? 'Editar Rol' : 'Nuevo Rol'}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: `calc(100% - 48px)`, md: 'calc(100% - 96px)' },
              maxWidth: { xs: 350, md: 980 },
              height: 'auto',
              maxHeight: { xs: `calc(100% - 48px)`, md: `calc(100% - 96px)` }
            }}
            modal
            content={false}
          >
            <SimpleBar sx={{ width: 1, maxHeight: `calc(100vh - 156px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              <Box component="form" onSubmit={submit} sx={{ p: 3 }}>
                {/* Información básica del rol */}
                <Stack spacing={3}>
                  <TextField 
                    label="Nombre del Rol" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    fullWidth 
                  />
                  <FormControlLabel 
                    control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} 
                    label="Rol Activo" 
                  />
                  
                  <Divider />
                  
                  {/* Sección de permisos */}
                  <Stack spacing={2}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6">
                        Permisos ({selectedPermissions.length} seleccionados)
                      </Typography>
                      <Button
                        size="small"
                        onClick={toggleAllPermissions}
                        disabled={permissionsLoading || filteredPermissions.length === 0}
                      >
                        {filteredPermissions.every(p => selectedPermissions.includes(p.id)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </Button>
                    </Stack>
                    
                    {/* Filtros */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        placeholder="Buscar permisos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Módulo</InputLabel>
                        <Select
                          value={selectedModule}
                          label="Módulo"
                          onChange={(e) => setSelectedModule(e.target.value)}
                        >
                          <MenuItem value="all">Todos los módulos</MenuItem>
                          {modules.map(module => (
                            <MenuItem key={module} value={module}>{module}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    
                    {/* Permisos agrupados por módulo */}
                    <Stack spacing={2}>
                      {permissionsLoading ? (
                        <Typography>Cargando permisos...</Typography>
                      ) : (
                        Object.entries(permissionsByModule)
                          .filter(([module]) => selectedModule === 'all' || module === selectedModule)
                          .map(([module, modulePermissions]) => {
                            const filteredModulePerms = modulePermissions.filter(p => 
                              !searchTerm || 
                              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.key.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            
                            if (filteredModulePerms.length === 0) return null;
                            
                            const moduleSelectedCount = filteredModulePerms.filter(p => selectedPermissions.includes(p.id)).length;
                            
                            return (
                              <Accordion key={module} defaultExpanded={selectedModule !== 'all'}>
                                <AccordionSummary expandIcon={<ArrowDown2 size={20} />}>
                                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {module} ({moduleSelectedCount}/{filteredModulePerms.length})
                                    </Typography>
                                  </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                                    {filteredModulePerms.map((permission) => {
                                      const isSelected = selectedPermissions.includes(permission.id);
                                      return (
                                        <Chip
                                          key={permission.id}
                                          icon={<PermissionTypeIcon type={permission.type} />}
                                          label={permission.name}
                                          variant={isSelected ? 'filled' : 'outlined'}
                                          color={isSelected ? 'primary' : 'default'}
                                          onClick={() => togglePermission(permission.id)}
                                          size="small"
                                          sx={{ mb: 0.5 }}
                                        />
                                      );
                                    })}
                                  </Stack>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => toggleModulePermissions(module)}
                                    sx={{ mt: 2 }}
                                  >
                                    {moduleSelectedCount === filteredModulePerms.length ? 'Deseleccionar' : 'Seleccionar'} módulo
                                  </Button>
                                </AccordionDetails>
                              </Accordion>
                            );
                          })
                      )}
                    </Stack>
                    
                    {/* Resumen de permisos seleccionados */}
                    {selectedPermissions.length > 0 && (
                      <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Resumen de permisos seleccionados:
                        </Typography>
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedPermissions.slice(0, 10).map(permId => {
                            const permission = advancedPerms.find(p => p.id === permId);
                            return permission ? (
                              <Chip
                                key={permId}
                                label={permission.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : null;
                          })}
                          {selectedPermissions.length > 10 && (
                            <Chip 
                              label={`+${selectedPermissions.length - 10} más`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Stack>
                
                {/* Botones de acción */}
                <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', pt: 3, mt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end' }}>
                    <Button color="secondary" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={initial?.id ? !canUpdate('role') : !canCreate('role')}
                    >
                      {initial?.id ? 'Actualizar Rol' : 'Crear Rol'}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
