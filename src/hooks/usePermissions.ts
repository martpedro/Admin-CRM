import useAuth from './useAuth';
import { useMemo } from 'react';

// Hook de permisos integrado (rol + advanced metadata)
// - Usa auth.permissions si existen
// - Si no, deriva de advancedPermissions (keys)
// - Provee helpers de verificación y helpers CRUD convencionales
// - Normaliza keys a lowercase
export default function usePermissions() {
  const auth: any = useAuth();
  const baseKeys: string[] | undefined = auth?.permissions;
  const advKeys: string[] = (auth?.advancedPermissions || []).map((p: any) => p.key).filter(Boolean);

  const effectiveList: string[] | undefined = baseKeys && baseKeys.length > 0 ? baseKeys : (advKeys.length > 0 ? advKeys : undefined);

  const normalizedSet = useMemo(() => {
    if (!effectiveList) return undefined;
    return new Set(effectiveList.map((k) => (k || '').toLowerCase().trim()));
  }, [effectiveList]);

  const norm = (s?: string) => (s || '').toLowerCase().trim();

  const has = (key: string) => {
    if (!normalizedSet) return true; // sin datos => permitir (modo permisivo durante transición)
    return normalizedSet.has(norm(key));
  };

  const hasAny = (keys: string[]) => {
    if (!normalizedSet) return true;
    return keys.some((k) => has(k));
  };

  const hasAll = (keys: string[]) => {
    if (!normalizedSet) return true;
    return keys.every((k) => has(k));
  };

  const keyFor = (resource: string, action: 'create' | 'read' | 'update' | 'delete') => `${norm(resource)}_${action}`;

  const canCreate = (resource: string) => has(keyFor(resource, 'create'));
  const canRead = (resource: string) => has(keyFor(resource, 'read'));
  const canUpdate = (resource: string) => has(keyFor(resource, 'update'));
  const canDelete = (resource: string) => has(keyFor(resource, 'delete'));

  return {
    permissions: effectiveList,
    advancedPermissions: auth?.advancedPermissions || [],
    has,
    hasAny,
    hasAll,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    keyFor
  };
}
