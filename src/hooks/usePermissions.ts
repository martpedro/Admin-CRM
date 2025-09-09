import useAuth from './useAuth';

// Utilidad de permisos basada en las claves devueltas por el login
// Convención de claves: `${recurso}_${accion}` en minúsculas, p. ej.:
//  - customer_create, customer_read, customer_update, customer_delete
//  - quotation_create, quotation_read, quotation_update, quotation_delete
// Si no hay permisos en el contexto (undefined), no se aplica restricción (retorna true).
export default function usePermissions() {
  const auth = useAuth();
  const list = (auth?.permissions || []) as string[] | undefined;

  const norm = (s?: string) => (s || '').toLowerCase().trim();

  const has = (key: string) => {
    if (!Array.isArray(list)) return true; // sin datos => permitir
    const target = norm(key);
    return list.some((k) => norm(k) === target);
  };

  const hasAny = (keys: string[]) => {
    if (!Array.isArray(list)) return true;
    return keys.some((k) => has(k));
  };

  const hasAll = (keys: string[]) => {
    if (!Array.isArray(list)) return true;
    return keys.every((k) => has(k));
  };

  const keyFor = (resource: string, action: 'create'|'read'|'update'|'delete') => `${norm(resource)}_${action}`;

  const canCreate = (resource: string) => has(keyFor(resource, 'create'));
  const canRead   = (resource: string) => has(keyFor(resource, 'read'));
  const canUpdate = (resource: string) => has(keyFor(resource, 'update'));
  const canDelete = (resource: string) => has(keyFor(resource, 'delete'));

  return { permissions: list, has, hasAny, hasAll, canCreate, canRead, canUpdate, canDelete };
}
