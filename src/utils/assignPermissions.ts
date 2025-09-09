import { assignPermission, useGetPermissions } from 'api/permissions';

// Función para asignar todos los permisos al usuario con ID 1
export const assignAllPermissionsToUser1 = async () => {
  try {
    console.log('Iniciando asignación de permisos al usuario 1...');
    
    // Usar el nuevo endpoint público para asignar todos los permisos
    const response = await fetch('http://localhost:3002/api/permissions-advanced/assign-all-to-user/1', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign permissions');
    }
    
    const data = await response.json();
    console.log('✅ Permisos asignados exitosamente:', data);
    
    return {
      total: data.Message.total,
      successful: data.Message.assigned,
      failed: data.Message.failed
    };
    
  } catch (error) {
    console.error('Error general en la asignación de permisos:', error);
    throw error;
  }
};

// Función para verificar los permisos del usuario 1
export const checkUser1Permissions = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/permissions-advanced/user-public/1');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }
    
    const data = await response.json();
    console.log('Permisos del usuario 1:', data);
    return data;
    
  } catch (error) {
    console.error('Error verificando permisos del usuario 1:', error);
    throw error;
  }
};

// Función para inicializar permisos básicos si no existen
export const initializePermissions = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/permissions-advanced/initialize', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to initialize permissions');
    }
    
    const data = await response.json();
    console.log('Permisos inicializados:', data);
    return data;
    
  } catch (error) {
    console.error('Error inicializando permisos:', error);
    throw error;
  }
};

// Función para obtener todos los permisos disponibles
export const getAllPermissions = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/permissions-advanced/all-public');
    
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }
    
    const data = await response.json();
    return data.permissions || [];
    
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    throw error;
  }
};
