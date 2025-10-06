import usePermissions from './usePermissions';

export interface DataScopeConfig {
  showAdvisorFilter: boolean;
  canViewAll: boolean;
  dataScope: 'own' | 'assigned' | 'all';
}

/**
 * Hook personalizado para manejar el alcance de datos basado en permisos
 * @param module - El módulo para el cual verificar permisos (ej: 'customer', 'quotation')
 * @returns Configuración del alcance de datos
 */
export function useDataScope(module: string): DataScopeConfig {
  const { has } = usePermissions();
  
  const showAdvisorFilter = has(`${module}_filter_by_advisor`);
  const canViewAll = has(`${module}_view_all`);
  
  const getDataScope = (): 'own' | 'assigned' | 'all' => {
    if (!showAdvisorFilter) return 'own';
    if (canViewAll) return 'all';
    return 'assigned';
  };
  
  return {
    showAdvisorFilter,
    canViewAll,
    dataScope: getDataScope()
  };
}

/**
 * Hook específico para clientes
 */
export function useCustomerDataScope() {
  return useDataScope('customer');
}

/**
 * Hook específico para cotizaciones
 */
export function useQuotationDataScope() {
  return useDataScope('quotation');
}