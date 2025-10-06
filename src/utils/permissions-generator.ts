/**
 * Script para generar permisos completos para todos los módulos del sistema
 * Incluye permisos CRUD, de menús, de scope de datos y acciones especiales
 */

// Módulos identificados en el proyecto
const modules = [
  {
    name: 'user',
    displayName: 'Usuario',
    menuPath: '/apps/user/list',
    hasDataScopes: true,
    specialActions: ['export', 'import', 'reset_password', 'activate', 'deactivate']
  },
  {
    name: 'customer',
    displayName: 'Cliente',
    menuPath: '/apps/customer/list',
    hasDataScopes: true,
    specialActions: ['download', 'export', 'import']
  },
  {
    name: 'company',
    displayName: 'Empresa',
    menuPath: '/apps/company/list',
    hasDataScopes: false,
    specialActions: ['export', 'import', 'activate', 'deactivate']
  },
  {
    name: 'quotation',
    displayName: 'Cotización',
    menuPath: '/apps/quotations/list',
    hasDataScopes: true,
    specialActions: ['download', 'export', 'send_email', 'clone', 'convert_to_invoice', 'approve', 'reject']
  },
  {
    name: 'role',
    displayName: 'Rol',
    menuPath: '/apps/roles/list',
    hasDataScopes: false,
    specialActions: ['export', 'assign_permissions']
  },
  {
    name: 'permission',
    displayName: 'Permiso',
    menuPath: '/apps/permissions/list',
    hasDataScopes: false,
    specialActions: ['export', 'bulk_assign', 'reset_defaults']
  },
  {
    name: 'team',
    displayName: 'Equipo',
    menuPath: '/apps/permissions/teams',
    hasDataScopes: false,
    specialActions: ['export', 'add_members', 'remove_members']
  },
  {
    name: 'profile',
    displayName: 'Perfil',
    menuPath: '/apps/profiles/user',
    hasDataScopes: false,
    specialActions: ['update_avatar', 'change_password', 'update_preferences']
  },
  {
    name: 'dashboard',
    displayName: 'Dashboard',
    menuPath: '/dashboard/default',
    hasDataScopes: false,
    specialActions: ['view_analytics', 'export_reports', 'refresh_data']
  }
];

// Tipos de permisos
const permissionTypes = {
  CRUD: 'basic_crud',
  MENU: 'menu_access',
  DATA_SCOPE: 'data_scope',
  ACTION: 'action_permission'
};

// Acciones CRUD básicas
const crudActions = ['create', 'read', 'update', 'delete'];

// Scopes de datos
const dataScopes = [
  { scope: 'all', displayName: 'Ver Todos' },
  { scope: 'team_only', displayName: 'Ver del Equipo' },
  { scope: 'own_only', displayName: 'Ver Propios' }
];

// Función para generar permisos
export function generatePermissionsForModule(module: any) {
  const permissions = [];

  // 1. Permisos CRUD
  crudActions.forEach(action => {
    permissions.push({
      name: `${getActionDisplayName(action)} ${module.displayName}`,
      key: `${module.name}_${action}`,
      type: permissionTypes.CRUD,
      module: `${module.name}s`,
      action: action,
      dataScope: null,
      menuPath: module.menuPath,
      description: `Permite ${getActionDisplayName(action).toLowerCase()} registros de ${module.displayName.toLowerCase()}`
    });
  });

  // 2. Permiso de acceso al menú
  permissions.push({
    name: `Acceso a ${module.displayName}s`,
    key: `menu_${module.name}s`,
    type: permissionTypes.MENU,
    module: null,
    action: null,
    dataScope: null,
    menuPath: module.menuPath,
    description: `Permite acceder al menú de ${module.displayName.toLowerCase()}s`
  });

  // 3. Permisos de scope de datos (si aplica)
  if (module.hasDataScopes) {
    dataScopes.forEach(scope => {
      permissions.push({
        name: `${scope.displayName} los ${module.displayName}s`,
        key: `${module.name}_view_${scope.scope}`,
        type: permissionTypes.DATA_SCOPE,
        module: `${module.name}s`,
        action: null,
        dataScope: scope.scope,
        menuPath: module.menuPath,
        description: `Permite ver ${scope.displayName.toLowerCase()} los registros de ${module.displayName.toLowerCase()}`
      });
    });
  }

  // 4. Acciones especiales
  if (module.specialActions) {
    module.specialActions.forEach((action: string) => {
      permissions.push({
        name: `${getSpecialActionDisplayName(action)} ${module.displayName}`,
        key: `${module.name}_${action}`,
        type: permissionTypes.ACTION,
        module: `${module.name}s`,
        action: action,
        dataScope: null,
        menuPath: module.menuPath,
        description: `Permite ${getSpecialActionDisplayName(action).toLowerCase()} en ${module.displayName.toLowerCase()}s`
      });
    });
  }

  return permissions;
}

// Función para obtener el nombre de la acción CRUD
function getActionDisplayName(action: string): string {
  const actionNames: Record<string, string> = {
    'create': 'Crear',
    'read': 'Leer',
    'update': 'Actualizar',
    'delete': 'Eliminar'
  };
  return actionNames[action] || action;
}

// Función para obtener el nombre de acciones especiales
function getSpecialActionDisplayName(action: string): string {
  const specialActionNames: Record<string, string> = {
    'export': 'Exportar',
    'import': 'Importar',
    'download': 'Descargar',
    'send_email': 'Enviar Email',
    'clone': 'Clonar',
    'convert_to_invoice': 'Convertir a Factura',
    'approve': 'Aprobar',
    'reject': 'Rechazar',
    'reset_password': 'Resetear Contraseña',
    'activate': 'Activar',
    'deactivate': 'Desactivar',
    'assign_permissions': 'Asignar Permisos',
    'bulk_assign': 'Asignación Masiva',
    'reset_defaults': 'Resetear Predeterminados',
    'add_members': 'Agregar Miembros',
    'remove_members': 'Remover Miembros',
    'update_avatar': 'Actualizar Avatar',
    'change_password': 'Cambiar Contraseña',
    'update_preferences': 'Actualizar Preferencias',
    'view_analytics': 'Ver Analíticas',
    'export_reports': 'Exportar Reportes',
    'refresh_data': 'Refrescar Datos'
  };
  return specialActionNames[action] || action;
}

// Generar todos los permisos
export function generateAllPermissions() {
  const allPermissions: any[] = [];
  
  modules.forEach(module => {
    const modulePermissions = generatePermissionsForModule(module);
    allPermissions.push(...modulePermissions);
  });

  return allPermissions;
}

// Función para crear permisos en el API
export async function createPermissionInAPI(permission: any, token: string) {
  const url = 'http://localhost:3003/api/permissions-advanced';
  
  const payload = {
    Name: permission.name,
    Key: permission.key,
    Type: permission.type,
    Module: permission.module,
    Action: permission.action,
    DataScope: permission.dataScope,
    MenuPath: permission.menuPath,
    Description: permission.description || ''
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Permiso creado: ${permission.key}`);
      return result;
    } else {
      const error = await response.text();
      console.log(`❌ Error creando ${permission.key}: ${error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error de red creando ${permission.key}:`, error);
    return null;
  }
}

// Función principal para crear todos los permisos
export async function createAllPermissions(token: string) {
  const permissions = generateAllPermissions();
  console.log(`🚀 Generando ${permissions.length} permisos...`);

  const results = [];
  for (const permission of permissions) {
    const result = await createPermissionInAPI(permission, token);
    results.push({ permission, result });
    
    // Pequeña pausa para no sobrecargar el API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// Log de resumen
console.log('📋 Módulos identificados:', modules.map(m => m.name).join(', '));
console.log('📊 Total de permisos a generar:', generateAllPermissions().length);