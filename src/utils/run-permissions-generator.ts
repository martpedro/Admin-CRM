import { 
  generateAllPermissions, 
  createAllPermissions 
} from './permissions-generator';

// Token de autorización
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5Njg5MTQ2LCJleHAiOjE3NTk3NzU1NDZ9.ho8yRN4C3wau6e5rvscxkkIxcIAA4d5BM63sETkgDZQ';

// Función principal
async function main() {
  console.log('🚀 Iniciando generación de permisos del sistema...\n');

  try {
    // Mostrar permisos que se van a generar
    const permissions = generateAllPermissions();
    
    console.log('📋 Resumen de permisos a crear:');
    console.log(`Total: ${permissions.length} permisos\n`);
    
    // Agrupar por módulo para mostrar resumen
    const moduleGroups: Record<string, any[]> = {};
    permissions.forEach(p => {
      const moduleName = p.module || 'general';
      if (!moduleGroups[moduleName]) {
        moduleGroups[moduleName] = [];
      }
      moduleGroups[moduleName].push(p);
    });

    Object.entries(moduleGroups).forEach(([module, perms]) => {
      console.log(`📁 ${module}: ${perms.length} permisos`);
      perms.forEach(p => {
        console.log(`   - ${p.key} (${p.type})`);
      });
      console.log('');
    });

    // Confirmar antes de crear
    console.log('¿Continuar con la creación de permisos? (Esta operación creará permisos en el sistema)');
    console.log('Para continuar, ejecutar: createAllPermissions(AUTH_TOKEN) en consola del navegador\n');

    // Crear permisos
    console.log('🔧 Creando permisos en el sistema...');
    const results = await createAllPermissions(AUTH_TOKEN);
    
    // Mostrar resultados
    const successful = results.filter(r => r.result !== null).length;
    const failed = results.length - successful;
    
    console.log('\n📊 Resultados:');
    console.log(`✅ Creados exitosamente: ${successful}`);
    console.log(`❌ Fallaron: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Permisos que fallaron:');
      results.filter(r => r.result === null).forEach(r => {
        console.log(`   - ${r.permission.key}: ${r.permission.name}`);
      });
    }

    console.log('\n🎉 Proceso completado!');
    
  } catch (error) {
    console.error('💥 Error durante la ejecución:', error);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

export { main as generateSystemPermissions };