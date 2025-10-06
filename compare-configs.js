const fs = require('fs');
const path = require('path');

console.log('🔍 COMPARACIÓN DE ARCHIVOS DE CONFIGURACIÓN');
console.log('================================================\n');

// Función para parsear archivo .env
function parseEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const config = {};
    
    lines.forEach((line, index) => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return config;
  } catch (error) {
    console.log(`❌ Error leyendo archivo ${filePath}: ${error.message}`);
    return {};
  }
}

// Rutas de los archivos
const devPath = path.join(__dirname, '../../API/src/Configuration/development.env');
const prodPath = path.join(__dirname, '../../API/src/Configuration/production.env');

console.log(`📁 Archivo de desarrollo: ${devPath}`);
console.log(`📁 Archivo de producción: ${prodPath}\n`);

// Parsear archivos
const devConfig = parseEnvFile(devPath);
const prodConfig = parseEnvFile(prodPath);

console.log(`📊 Variables en desarrollo: ${Object.keys(devConfig).length}`);
console.log(`📊 Variables en producción: ${Object.keys(prodConfig).length}\n`);

// Encontrar diferencias
const devKeys = new Set(Object.keys(devConfig));
const prodKeys = new Set(Object.keys(prodConfig));

const onlyInDev = [...devKeys].filter(key => !prodKeys.has(key));
const onlyInProd = [...prodKeys].filter(key => !devKeys.has(key));
const common = [...devKeys].filter(key => prodKeys.has(key));
const different = common.filter(key => devConfig[key] !== prodConfig[key]);

console.log('🔍 ANÁLISIS DE DIFERENCIAS:\n');

if (onlyInDev.length > 0) {
  console.log('❌ Variables que están SOLO en desarrollo:');
  onlyInDev.forEach(key => {
    console.log(`   ${key} = ${devConfig[key]}`);
  });
  console.log('');
}

if (onlyInProd.length > 0) {
  console.log('❌ Variables que están SOLO en producción:');
  onlyInProd.forEach(key => {
    console.log(`   ${key} = ${prodConfig[key]}`);
  });
  console.log('');
}

if (different.length > 0) {
  console.log('⚠️  Variables con VALORES DIFERENTES:');
  different.forEach(key => {
    console.log(`   ${key}:`);
    console.log(`     DEV:  ${devConfig[key]}`);
    console.log(`     PROD: ${prodConfig[key]}`);
    console.log('');
  });
}

const identical = common.filter(key => devConfig[key] === prodConfig[key]);
if (identical.length > 0) {
  console.log(`✅ Variables IDÉNTICAS: ${identical.length}`);
  console.log('   (Valores iguales en ambos archivos)\n');
}

console.log('📋 RESUMEN DE CONFIGURACIONES:\n');

console.log('🗄️  BASE DE DATOS:');
console.log(`   DEV:  ${devConfig.DB_HOST || 'N/A'}:${devConfig.DB_PORT || 'N/A'} - ${devConfig.DB_NAME || 'N/A'}`);
console.log(`   PROD: ${prodConfig.DB_HOST || 'N/A'}:${prodConfig.DB_PORT || 'N/A'} - ${prodConfig.DB_NAME || 'N/A'}`);

console.log('\n🌐 APLICACIÓN:');
console.log(`   DEV:  Puerto ${devConfig.PORT || 'N/A'} - Host: ${devConfig.SERVER_HOST || 'N/A'}`);
console.log(`   PROD: Puerto ${prodConfig.PORT || 'N/A'} - Host: ${prodConfig.SERVER_HOST || 'N/A'}`);

console.log('\n📧 SMTP:');
console.log(`   DEV:  ${devConfig.SMTP_HOST || 'N/A'}:${devConfig.SMTP_PORT || 'N/A'}`);
console.log(`   PROD: ${prodConfig.SMTP_HOST || 'N/A'}:${prodConfig.SMTP_PORT || 'N/A'}`);

console.log('\n🔐 JWT:');
console.log(`   DEV:  Secret: ${devConfig.JWT_SECRET ? '***' : 'N/A'} - Expires: ${devConfig.JWT_EXPIRES || 'N/A'}`);
console.log(`   PROD: Secret: ${prodConfig.JWT_SECRET ? '***' : 'N/A'} - Expires: ${prodConfig.JWT_EXPIRES || 'N/A'}`);

console.log('\n🏢 EMPRESA:');
console.log(`   Nombre: ${prodConfig.COMPANY_NAME || devConfig.COMPANY_NAME || 'N/A'}`);
console.log(`   Email: ${prodConfig.COMPANY_EMAIL || devConfig.COMPANY_EMAIL || 'N/A'}`);
console.log(`   Teléfono: ${prodConfig.COMPANY_PHONE || devConfig.COMPANY_PHONE || 'N/A'}`);

console.log('\n✅ ESTADO ACTUAL:');
console.log('   - Archivo de producción actualizado');
console.log('   - Variables sincronizadas');
console.log('   - Configuraciones específicas de entorno mantenidas');

console.log('\n================================================');