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

import { RoleItem } from 'api/role';
import { useGetPermissions } from 'api/permissions';
import { permissionApi, SimplePermission } from 'api/permission';
import PermissionModal from 'sections/apps/permissions/PermissionModal';
import { PermissionAdvanced } from 'types/permission';
import { Edit } from 'iconsax-react';
import { useGetMenuPermissions } from 'api/menu-permissions';

type SubmitPayload = { name: string; isActive: boolean; permissions: number[] };

export default function RoleModal({ open, onClose, initial, onSubmit }: { open: boolean; onClose: () => void; initial?: Partial<RoleItem>; onSubmit: (data: SubmitPayload) => void; }) {
  const { canCreate, canUpdate } = usePermissions();
  const [name, setName] = useState<string>(initial?.name || '');
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [permissions, setPermissions] = useState<number[]>(initial?.permissions?.map((p: any) => p.id) || []);

  const { permissions: advancedPerms = [], permissionsLoading } = useGetPermissions();
  const [simplePerms, setSimplePerms] = useState<SimplePermission[]>([]);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionAdvanced | null>(null);
  const { menus = [], menusLoading } = useGetMenuPermissions();
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  useEffect(() => {
    setName(initial?.name || '');
    setIsActive(initial?.isActive ?? true);
    setPermissions(initial?.permissions?.map((p: any) => p.id) || []);
  }, [initial]);

  useEffect(() => {
    if (!open) return;
    permissionApi.getAll().then(setSimplePerms).catch(() => setSimplePerms([]));
  }, [open]);

  // Prefill de menús seleccionados basado en permisos base actuales del rol
  useEffect(() => {
    if (!open) return;
    if (!menus || menus.length === 0) return;
    if (!simplePerms || simplePerms.length === 0) return;
    // Solo preseleccionar si aún no hay selección manual
    if (selectedMenus.length > 0) return;
    const pre: string[] = [];
    for (const m of menus as any[]) {
      const id = baseIdForKey(`menu_${m.menuKey}`);
      if (id && permissions.includes(id)) pre.push(m.menuKey);
    }
    if (pre.length) setSelectedMenus(Array.from(new Set(pre)));
  }, [open, menus, simplePerms]);

  const baseIdForKey = (key?: string) => {
    if (!key) return undefined;
    const found = simplePerms.find((sp) => (sp.key || '').toLowerCase() === key.toLowerCase());
    return found?.id;
  };

  const allBaseIdsFromAdvanced = useMemo(
    () => (advancedPerms || [])
      .map((p: any) => baseIdForKey(p.permissionKey))
      .filter((id): id is number => typeof id === 'number'),
    [advancedPerms, simplePerms]
  );

  const allSelected = useMemo(
    () => allBaseIdsFromAdvanced.length > 0 && allBaseIdsFromAdvanced.every((id) => permissions.includes(id)),
    [allBaseIdsFromAdvanced, permissions]
  );
  const canToggleAll = !permissionsLoading && allBaseIdsFromAdvanced.length > 0;
  console.log(canToggleAll, permissionsLoading, allBaseIdsFromAdvanced.length);
  const togglePermByKey = (key?: string) => {
    const id = baseIdForKey(key);
    if (!id) return;
    setPermissions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Base permissions helpers
  const baseAllIds = useMemo(() => simplePerms.map((sp) => sp.id), [simplePerms]);
  const baseAllSelected = useMemo(
    () => baseAllIds.length > 0 && baseAllIds.every((id) => permissions.includes(id)),
    [baseAllIds, permissions]
  );
  const toggleBaseById = (id: number) => {
    setPermissions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1) asegurar que existan permisos base para todos los avanzados (incluye menús)
    try { await permissionApi.syncBaseWithAdvanced(); } catch {}

    // 2) convertir selectedMenus -> ids de permisos base (clave: menu_{menuKey})
    const menuBaseIds = selectedMenus
      .map((k) => baseIdForKey(`menu_${k}`))
      .filter((id): id is number => typeof id === 'number');

    // 3) unificar con los permisos ya seleccionados, evitando duplicados
    const next = new Set<number>(permissions);
    menuBaseIds.forEach((id) => next.add(id));

    onSubmit({ name, isActive, permissions: Array.from(next) });
  };

  // Menús helpers
  const menuAllKeys = useMemo(() => (menus as any[]).map((m: any) => m.menuKey), [menus]);
  const menuAllSelected = useMemo(
    () => menuAllKeys.length > 0 && menuAllKeys.every((k) => selectedMenus.includes(k)),
    [menuAllKeys, selectedMenus]
  );

  // (removido) Vista previa de menús visibles

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
              <Box component="form" onSubmit={submit} sx={{ p: 3, display: 'grid', gap: 2 }}>
                <TextField label="Nombre del Rol" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
                <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Activo" />
                <Divider />
                {/* Menús (desde API) */}
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Menús</Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      setSelectedMenus((prev) => {
                        if (menuAllSelected) {
                          const toRemove = new Set(menuAllKeys);
                          return prev.filter((k) => !toRemove.has(k));
                        }
                        const current = new Set(prev);
                        menuAllKeys.forEach((k) => current.add(k));
                        return Array.from(current);
                      })
                    }
                    disabled={menuAllKeys.length === 0}
                  >
                    {menuAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </Button>
                </Stack>
                <FormControl fullWidth size="small">
                  <InputLabel id="menus-label">Seleccionar menús</InputLabel>
                  <Select
                    labelId="menus-label"
                    multiple
                    value={selectedMenus}
                    label="Seleccionar menús"
                    onChange={(e) => setSelectedMenus(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
                    renderValue={(selected) => (selected as string[]).map((k) => menus.find((m: any) => m.menuKey === k)?.menuName || k).join(', ')}
                  >
                    {menus.map((m: any) => (
                      <MenuItem key={m.id} value={m.menuKey}>{m.menuName} ({m.menuPath})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Divider />
                {/* Permisos base */}
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Permisos</Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      setPermissions((prev) => {
                        if (baseAllSelected) {
                          const toRemove = new Set(baseAllIds);
                          return prev.filter((id) => !toRemove.has(id));
                        }
                        const current = new Set(prev);
                        baseAllIds.forEach((id) => current.add(id));
                        return Array.from(current);
                      })
                    }
                    disabled={baseAllIds.length === 0}
                  >
                    {baseAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </Button>
                </Stack>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {simplePerms.map((p) => {
                    const selected = permissions.includes(p.id);
                    return (
                      <Chip
                        key={p.id}
                        label={p.name}
                        variant={selected ? 'filled' : 'outlined'}
                        color={selected ? 'primary' : 'default'}
                        onClick={() => toggleBaseById(p.id)}
                        size="small"
                      />
                    );
                  })}
                </Stack>
                <Divider />
                {/* Permisos avanzados */}
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Permisos avanzados</Typography>
                  <Button
                    size="small"
                    onClick={() =>
                      setPermissions((prev) => {
                        if (allSelected) {
                          // quitar solo los permisos avanzados mapeados
                          const toRemove = new Set(allBaseIdsFromAdvanced);
                          return prev.filter((id) => !toRemove.has(id));
                        }
                        // agregar faltantes de permisos avanzados mapeados
                        const current = new Set(prev);
                        allBaseIdsFromAdvanced.forEach((id) => current.add(id));
                        return Array.from(current);
                      })
                    }
                    disabled={!canToggleAll}
                  >
                    {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </Button>
                </Stack>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {(advancedPerms as any[]).map((p: any) => {
                    const baseId = baseIdForKey(p.permissionKey);
                    const selected = baseId ? permissions.includes(baseId) : false;
                    return (
                      <Stack key={p.id} direction="row" alignItems="center" sx={{ gap: 0.5 }}>
                        <Chip
                          label={`${p.name}`}
                          variant={selected ? 'filled' : 'outlined'}
                          color={selected ? 'primary' : 'default'}
                          onClick={() => togglePermByKey(p.permissionKey)}
                          size="small"
                        />
                        <Tooltip title="Editar permiso">
                          <IconButton size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedPermission(p as PermissionAdvanced); setPermModalOpen(true); }}>
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    );
                  })}
                </Stack>
                {/* (removido) Menús visibles derivados */}
                <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', pt: 2, mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
                    <Button color="secondary" onClick={onClose}>Cancelar</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={initial?.id ? !canUpdate('role') : !canCreate('role')}
                    >
                      Guardar
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
      <PermissionModal open={permModalOpen} modalToggler={() => setPermModalOpen(false)} permission={selectedPermission} />
    </>
  );
}
