const https = require('https');
const http = require('http');

// Función para hacer peticiones HTTP
function makeRequest(url, method, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test del endpoint de configuración inicial
async function testInitialSetup() {
  console.log('🚀 Probando endpoint de configuración inicial del sistema...\n');

  try {
    const response = await makeRequest(
      'http://localhost:3003/api/Auth/initial-setup',
      'POST'
    );

    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      const data = response.data.Message || response.data;
      
      console.log('\n✅ Configuración inicial completada exitosamente\n');
      
      console.log('📝 Resumen:');
      console.log(`   - Éxito: ${data.success ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   - Mensaje: ${data.message || 'N/A'}`);
      
      if (data.summary && data.summary.length > 0) {
        console.log('\n📋 Mensajes del proceso:');
        data.summary.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg}`);
        });
      }
      
      if (data.data) {
        const setupData = data.data;
        
        console.log('\n🔐 Rol Administrador:');
        if (setupData.role) {
          console.log(`   - ID: ${setupData.role.id}`);
          console.log(`   - Nombre: ${setupData.role.name}`);
          console.log(`   - Activo: ${setupData.role.isActive ? '✅ SÍ' : '❌ NO'}`);
          console.log(`   - Creado: ${setupData.role.created ? '✅ Nuevo' : 'ℹ️ Existente'}`);
        }
        
        console.log('\n🏢 Empresa:');
        if (setupData.company) {
          console.log(`   - ID: ${setupData.company.id}`);
          console.log(`   - Nombre: ${setupData.company.name}`);
          console.log(`   - Nombre Legal: ${setupData.company.legalName || 'N/A'}`);  
          console.log(`   - RFC: ${setupData.company.taxId || 'N/A'}`);
          console.log(`   - Dirección: ${setupData.company.address || 'N/A'}`);
          console.log(`   - Teléfonos: ${setupData.company.phones || 'N/A'}`);
          console.log(`   - Sitio Web: ${setupData.company.webPage || 'N/A'}`);
        } else {
          console.log('   - ⚠️ No se encontró información de empresa');
        }
        
        console.log('\n👤 Usuario Pedro Martinez:');
        if (setupData.user) {
          console.log(`   - ID: ${setupData.user.id}`);
          console.log(`   - Nombre: ${setupData.user.name} ${setupData.user.lastName}`);
          console.log(`   - Email: ${setupData.user.email}`);
          console.log(`   - Usuario: ${setupData.user.userName}`);
          console.log(`   - Teléfono: ${setupData.user.phone}`);
          console.log(`   - Letras Asignadas: ${setupData.user.letterAsign}`);
          console.log(`   - Rol ID: ${setupData.user.roleId} (${setupData.user.roleName})`);
          console.log(`   - Activo: ${setupData.user.isActive ? '✅ SÍ' : '❌ NO'}`);
          console.log(`   - Creado: ${setupData.user.created ? '✅ Nuevo' : 'ℹ️ Existente'}`);
        }
        
        console.log('\n🔑 Permisos:');
        if (setupData.permissions) {
          console.log(`   - Total de permisos: ${setupData.permissions.total}`);
          console.log(`   - Asignados: ${setupData.permissions.assigned ? '✅ SÍ' : '❌ NO'}`);
          console.log(`   - Rol ID: ${setupData.permissions.roleId}`);
          
          if (setupData.permissions.details) {
            const details = setupData.permissions.details;
            console.log(`   - Permisos creados: ${details.createdPermissions}`);
            console.log(`   - Menús sembrados: ${details.menusSeeded}`);
            console.log(`   - Permisos de menú asegurados: ${details.ensuredMenuAdvanced}`);
            console.log(`   - Usuarios con permisos: ${details.assignedUsers}`);
            console.log(`   - Grants creados: ${details.grantsCreated}`);
          }
        }
      }
      
    } else {
      console.log('❌ Error en configuración inicial:');
      console.log(`   Respuesta: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
}

// Ejecutar prueba
async function main() {
  await testInitialSetup();
  console.log('\n✅ Prueba completada');
  console.log('\n🎯 Credenciales del usuario administrador:');
  console.log('   📧 Email: pedro.martinez@admin.com');
  console.log('   🔒 Contraseña: $55cujgu4&%33'); 
  console.log('   👤 Rol: Administrador (con todos los permisos)');
}

main().catch(console.error);