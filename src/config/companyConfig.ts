// Configuración de la empresa para plantillas de correo
// Esta información debe ser configurada desde el backend usando variables de entorno
//
// Variables de entorno requeridas en el backend:
// - COMPANY_NAME: Nombre de la empresa
// - COMPANY_LOGO: URL del logo de la empresa
// - COMPANY_ADDRESS: Dirección física de la empresa
// - COMPANY_PHONE: Teléfono de contacto
// - COMPANY_EMAIL: Email de contacto
// - COMPANY_WEBSITE: Sitio web de la empresa
//
// Ejemplo de uso en el backend (Node.js):
// const companyConfig = {
//   name: process.env.COMPANY_NAME || 'Regalos Corporativos y Promocionales',
//   logo: process.env.COMPANY_LOGO || 'https://regaloscorporativosypromocionales.com.mx/images/logo/Logo-12.png',
//   // ... resto de la configuración
// };

export interface CompanyConfig {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

// Configuración por defecto que debe ser sobrescrita desde el backend
export const defaultCompanyConfig: CompanyConfig = {
  name: 'Regalos Corporativos y Promocionales',
  logo: 'https://regaloscorporativosypromocionales.com.mx/images/logo/Logo-12.png',
  address: 'Ciudad de México, México',
  phone: '+52 55 1234 5678',
  email: 'contacto@regaloscorporativosypromocionales.com.mx',
  website: 'https://regaloscorporativosypromocionales.com.mx'
};

// Esta función debe ser llamada desde el backend para obtener la configuración
// usando las variables de entorno
export const getCompanyConfigFromEnv = () => {
  return {
    name: process.env.COMPANY_NAME || defaultCompanyConfig.name,
    logo: process.env.COMPANY_LOGO || defaultCompanyConfig.logo,
    address: process.env.COMPANY_ADDRESS || defaultCompanyConfig.address,
    phone: process.env.COMPANY_PHONE || defaultCompanyConfig.phone,
    email: process.env.COMPANY_EMAIL || defaultCompanyConfig.email,
    website: process.env.COMPANY_WEBSITE || defaultCompanyConfig.website
  };
};

export default defaultCompanyConfig;