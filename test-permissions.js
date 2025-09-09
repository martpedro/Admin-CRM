const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testPermissionSystem() {
  try {
    console.log('🚀 Probando sistema de permisos...\n');
    
    // 1. Inicializar permisos
    console.log('📋 Paso 1: Inicializando permisos...');
    const initResponse = await axios.post(`${BASE_URL}/api/permissions-advanced/initialize`);
    console.log('✅', initResponse.data.Message);
    
    // 2. Obtener todos los permisos
    console.log('\n📋 Paso 2: Obteniendo permisos disponibles...');
    const permissionsResponse = await axios.get(`${BASE_URL}/api/permissions-advanced/all-public`);
    const permissions = permissionsResponse.data.permissions || [];
    console.log(`📊 Permisos disponibles: ${permissions.length}`);
    
    // 3. Asignar todos los permisos al usuario 1
    console.log('\n📋 Paso 3: Asignando todos los permisos al usuario 1...');
    const assignResponse = await axios.post(`${BASE_URL}/api/permissions-advanced/assign-all-to-user/1`);
    console.log('✅ Resultado:', assignResponse.data);
    
    // 4. Verificar permisos del usuario
    console.log('\n📋 Paso 4: Verificando permisos del usuario 1...');
    const userPermissionsResponse = await axios.get(`${BASE_URL}/api/permissions-advanced/user-public/1`);
    const userPermissions = userPermissionsResponse.data.permissions || [];
    console.log(`👤 Permisos asignados al usuario 1: ${userPermissions.length}`);
    
    // 5. Mostrar algunos permisos como ejemplo
    console.log('\n📋 Algunos permisos asignados:');
    userPermissions.slice(0, 5).forEach((up, index) => {
      console.log(`${index + 1}. ${up.Permission?.Name || 'N/A'} (${up.Permission?.Key || 'N/A'})`);
    });
    
    console.log('\n🎉 ¡Sistema de permisos configurado exitosamente!');
    console.log('💻 Ahora puedes acceder a la interfaz web en: http://localhost:3000/permissions/assign');
    
  } catch (error) {
    console.error('💥 Error:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Solución: Inicia el servidor backend:');
      console.log('   cd C:\\Proyectos\\AdminPlatform\\API && npm run start:dev');
    }
  }
}

testPermissionSystem();
