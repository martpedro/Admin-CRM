import React from 'react';
import usePermissions from 'hooks/usePermissions';
import { Box, Tooltip } from '@mui/material';

export interface PermissionGuardProps {
  all?: string[]; // Debe tener todos
  any?: string[]; // Debe tener al menos uno
  not?: string[]; // No debe tener ninguno
  fallback?: React.ReactNode; // Render si no cumple
  hide?: boolean; // Si true, no renderiza nada al fallar (ignora fallback)
  reasonTooltip?: string; // Mensaje explicando restricción
  children: React.ReactNode;
}

/**
 * Componente de protección por permisos.
 * Ejemplos:
 *  <PermissionGuard any={['customer_read','customer_update']}>...</PermissionGuard>
 *  <PermissionGuard all={['admin_panel_access']} not={['user_suspended']}>...</PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  all,
  any,
  not,
  fallback = null,
  hide = false,
  reasonTooltip,
  children
}) => {
  const { has, hasAny, hasAll } = usePermissions();

  let allowed = true;

  if (all && all.length > 0) {
    allowed = allowed && hasAll(all);
  }
  if (any && any.length > 0) {
    allowed = allowed && hasAny(any);
  }
  if (not && not.length > 0) {
    const hasExcluded = not.some((k) => has(k));
    if (hasExcluded) allowed = false;
  }

  if (allowed) return <>{children}</>;
  if (hide) return null;

  const renderedFallback = fallback !== null ? fallback : <Box component="span" sx={{ opacity: 0.5 }}>{children}</Box>;
  const wrapped = <>{renderedFallback}</>;
  return reasonTooltip ? <Tooltip title={reasonTooltip}>{wrapped}</Tooltip> : wrapped;
};

export default PermissionGuard;
