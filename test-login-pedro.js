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

// Test del login con las credenciales de Pedro Martinez
async function testLogin() {
  console.log('🔐 Probando login con credenciales de Pedro Martinez...\n');

  const credentials = {
    email: 'pedro.martinez@admin.com',
    password: '$55cujgu4&%33'
  };

  try {
    const response = await makeRequest(
      'http://localhost:3003/api/Auth/signIn',
      'POST',
      credentials
    );

    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      const data = response.data.Message || response.data;
      
      console.log('\n✅ Login exitoso\n');
      
      console.log('🎟️ Token de autenticación:');
      if (data.serviceToken) {
        console.log(`   ${data.serviceToken.substring(0, 50)}...`);
      }
      
      console.log('\n👤 Información del usuario:');
      if (data.user) {
        console.log(`   - ID: ${data.user.id}`);
        console.log(`   - Nombre: ${data.user.name}`);
        console.log(`   - Email: ${data.user.email}`);
      }
      
      console.log('\n🔑 Permisos asignados:');
      if (data.permissions && data.permissions.length > 0) {
        console.log(`   - Total: ${data.permissions.length} permisos`);
        console.log('   - Lista de permisos:');
        data.permissions.forEach((permission, index) => {
          console.log(`     ${index + 1}. ${permission}`);
        });
      } else {
        console.log('   - ⚠️ No se encontraron permisos');
      }
      
      console.log('\n📋 Menús disponibles:');
      if (data.menus && data.menus.length > 0) {
        console.log(`   - Total: ${data.menus.length} menús`);
        console.log('   - Lista de menús:');
        data.menus.forEach((menu, index) => {
          console.log(`     ${index + 1}. ${menu}`);
        });
      } else {
        console.log('   - ⚠️ No se encontraron menús');
      }
      
    } else {
      console.log('❌ Error en login:');
      console.log(`   Respuesta: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
}

// Ejecutar prueba
async function main() {
  await testLogin();
  console.log('\n✅ Prueba de login completada');
}

main().catch(console.error);