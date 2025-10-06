const https = require('https');
const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5Njg5MTQ2LCJleHAiOjE3NTk3NzU1NDZ9.ho8yRN4C3wau6e5rvscxkkIxcIAA4d5BM63sETkgDZQ';

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
        'Authorization': `Bearer ${token}`,
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

// Test de validación de duplicación
async function testValidation() {
  console.log('🧪 Probando validación de duplicación de clientes...\n');

  const testCases = [
    {
      name: 'Email con dominio público (gmail)',
      email: 'test.user@gmail.com'
    },
    {
      name: 'Email con dominio empresarial',
      email: 'contacto@empresa123.com'
    },
    {
      name: 'Email duplicado exacto',
      email: 'existing@testcompany.com'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📧 Probando: ${testCase.name}`);
    console.log(`   Email: ${testCase.email}`);
    
    try {
      const response = await makeRequest(
        'http://localhost:3003/api/Customer/validate-duplication',
        'POST',
        { email: testCase.email }
      );

      if (response.status === 200 || response.status === 201) {
        const data = response.data.Message || response.data;

        console.log(`   ✅ Respuesta exitosa:`);
        console.log(`      - Email duplicado: ${data.hasEmailDuplication ? '❌ SÍ' : '✅ NO'}`);
        console.log(`      - Dominio duplicado: ${data.hasDomainDuplication ? '⚠️ SÍ' : '✅ NO'}`);
        console.log(`      - Puede proceder: ${data.canProceed ? '✅ SÍ' : '❌ NO'}`);
        
        if (data.message) {
          console.log(`      - Mensaje: ${data.message}`);
        }

        if (data.details?.emailDuplication) {
          const customer = data.details.emailDuplication.customer;
          console.log(`      - Cliente existente: ${customer.name} (${customer.email})`);
          if (customer.assignedTo) {
            console.log(`      - Asignado a: ${customer.assignedTo.name}`);
          }
        }

        if (data.details?.domainDuplication) {
          const domain = data.details.domainDuplication;
          console.log(`      - Dominio: @${domain.domain}`);
          console.log(`      - Cantidad existente: ${domain.count}`);
          console.log(`      - Ejemplos: ${domain.examples.map(c => c.name).join(', ')}`);
        }
      } else {
        console.log(`   ❌ Error HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
    }
  }
}

// Test de creación con duplicación
async function testCreationWithDuplication() {
  console.log('\n\n🔨 Probando creación de cliente con duplicación...\n');

  const testCustomer = {
    firstName: 'Juan',
    lastName: 'Pérez',
    name: 'Juan Pérez Test',
    email: 'test@duplicatedomain.com',
    phone: '+1234567890',
    supportSales: 1,
    classCustomer: 'Premium',
    role: 'Manager',
    companyName: 'Test Company',
    status: 1,
    contact: 'Contacto de prueba',
    about: 'Cliente de prueba para validar duplicación'
  };

  try {
    const response = await makeRequest(
      'http://localhost:3003/api/Customer/Create',
      'POST',
      testCustomer
    );

    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Cliente creado exitosamente');
      
      if (response.data.Message?.warning) {
        console.log('⚠️ Advertencia recibida:');
        console.log(`   Tipo: ${response.data.Message.warning.type}`);
        console.log(`   Mensaje: ${response.data.Message.warning.message}`);
      }
    } else {
      console.log('❌ Error al crear cliente:');
      console.log(`   Respuesta: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
}

// Ejecutar pruebas
async function main() {
  await testValidation();
  await testCreationWithDuplication();
  
  console.log('\n✅ Pruebas completadas');
}

main().catch(console.error);