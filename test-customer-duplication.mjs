import fetch from 'node-fetch';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5Njg5MTQ2LCJleHAiOjE3NTk3NzU1NDZ9.ho8yRN4C3wau6e5rvscxkkIxcIAA4d5BM63sETkgDZQ';

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
      email: 'existing@testcompany.com' // Asume que ya existe
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📧 Probando: ${testCase.name}`);
    console.log(`   Email: ${testCase.email}`);
    
    try {
      const response = await fetch('http://localhost:3003/api/Customer/validate-duplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: testCase.email
        })
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.Message || result;

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
        const error = await response.text();
        console.log(`   ❌ Error: ${error}`);
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
    email: 'test@duplicatedomain.com', // Cambiar por un dominio que ya exista
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
    const response = await fetch('http://localhost:3003/api/Customer/Create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testCustomer)
    });

    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cliente creado exitosamente');
      
      if (result.Message?.warning) {
        console.log('⚠️ Advertencia recibida:');
        console.log(`   Tipo: ${result.Message.warning.type}`);
        console.log(`   Mensaje: ${result.Message.warning.message}`);
      }
    } else {
      const error = await response.json();
      console.log('❌ Error al crear cliente:');
      console.log(`   Tipo: ${error.type || 'N/A'}`);
      console.log(`   Mensaje: ${error.message}`);
      
      if (error.existingCustomer) {
        console.log(`   Cliente existente: ${error.existingCustomer.name}`);
        if (error.existingCustomer.assignedTo) {
          console.log(`   Asignado a: ${error.existingCustomer.assignedTo.name}`);
        }
      }
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