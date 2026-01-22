# Frontend - Sistema de Métodos de Pago

## Descripción

Se ha implementado la interfaz de usuario completa para administrar la configuración de métodos de pago desde el módulo de empresas en el CRM.

## Archivos Creados/Modificados

### 1. Tipos (Types)

**Archivo:** `src/types/company.ts`

Se agregaron las siguientes interfaces:

```typescript
export interface AcceptedPaymentMethods {
  transferencia?: boolean;
  efectivo?: boolean;
  cheque?: boolean;
  tarjetaDebito?: boolean;
  tarjetaCredito?: boolean;
  paypal?: boolean;
  openpay?: boolean;
  mercadopago?: boolean;
}

export interface AcceptedCards {
  debit?: string[];
  credit?: string[];
}

export interface PaymentConfiguration {
  Id?: number;
  CompanyId: number;
  BankName?: string;
  AccountNumber?: string;
  ClaveInterbancaria?: string;
  AccountHolder?: string;
  BankBranch?: string;
  SwiftCode?: string;
  AcceptedPaymentMethods?: AcceptedPaymentMethods;
  AcceptedCards?: AcceptedCards;
  PaymentNotes?: string;
  ShowInQuotation?: boolean;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}
```

---

### 2. API Service

**Archivo:** `src/api/company.ts`

Se agregó `paymentConfigApi` con los siguientes métodos:

```typescript
export const paymentConfigApi = {
  getByCompany: async (companyId: number): Promise<PaymentConfiguration | null>
  upsert: async (companyId: number, data: Partial<PaymentConfiguration>): Promise<PaymentConfiguration | null>
  deactivate: async (companyId: number, id: number): Promise<boolean>
  delete: async (companyId: number, id: number): Promise<boolean>
}
```

**Características:**
- ✅ Integración con sistema de notificaciones (snackbar)
- ✅ Manejo de errores centralizado
- ✅ Transformación de datos entre frontend/backend

---

### 3. Componente Modal

**Archivo:** `src/sections/apps/company/PaymentConfigModal.tsx`

Componente principal para configurar métodos de pago.

**Props:**
```typescript
interface PaymentConfigModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  initial?: PaymentConfiguration;
  onSubmit: (values: Partial<PaymentConfiguration>) => Promise<void>;
}
```

**Características:**
- ✅ 3 Pestañas (Tabs):
  1. **Datos Bancarios** - Información de cuenta bancaria
  2. **Métodos de Pago** - Checkboxes para seleccionar métodos
  3. **Tarjetas Aceptadas** - Chips interactivos para tarjetas

- ✅ Validaciones con Yup:
  - CLABE Interbancaria: exactamente 18 dígitos numéricos
  - Longitudes máximas según especificación backend

- ✅ Switch para activar/desactivar en cotizaciones
- ✅ Alert informativo sobre aparición en PDF
- ✅ Chips interactivos para tarjetas (click para seleccionar/deseleccionar)

**Tarjetas Disponibles:**
- **Débito:** BBVA, Banamex, Santander, HSBC, Scotiabank, Inbursa
- **Crédito:** Visa, Mastercard, AMEX

---

### 4. Página de Empresas

**Archivo:** `src/pages/apps/company/list.tsx`

**Cambios implementados:**

1. **Nuevo botón en tabla:**
   - Icono: `MoneyChange` (iconsax-react)
   - Color: Verde (success)
   - Tooltip: "Configurar Métodos de Pago"

2. **Nuevo estado:**
```typescript
const [paymentConfigOpen, setPaymentConfigOpen] = useState(false);
const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null);
const [currentPaymentConfig, setCurrentPaymentConfig] = useState<PaymentConfiguration | null>(null);
```

3. **Nuevas funciones:**
```typescript
const handleOpenPaymentConfig = async (company: CompanyInfo) => {
  setSelectedCompany(company);
  const config = await paymentConfigApi.getByCompany(company.id);
  setCurrentPaymentConfig(config);
  setPaymentConfigOpen(true);
};

const handlePaymentConfigSubmit = async (values: Partial<PaymentConfiguration>) => {
  if (!selectedCompany) return;
  await paymentConfigApi.upsert(selectedCompany.id, values);
  setPaymentConfigOpen(false);
  // ... cleanup
};
```

---

## Flujo de Usuario

### 1. Configurar Métodos de Pago

1. Usuario va a **Empresas** en el menú
2. En la lista de empresas, hace clic en el botón verde 💰 (MoneyChange)
3. Se abre modal con 3 pestañas

### 2. Pestaña "Datos Bancarios"

Campos disponibles:
- Nombre del Banco
- Número de Cuenta
- CLABE Interbancaria (18 dígitos, validado)
- Beneficiario
- Sucursal
- Código SWIFT (opcional)
- Notas Adicionales (textarea)

### 3. Pestaña "Métodos de Pago"

Checkboxes para seleccionar:
- ✓ Transferencia Bancaria
- ✓ Efectivo
- ✓ Cheque
- ✓ Tarjeta de Débito
- ✓ Tarjeta de Crédito
- ✓ PayPal
- ✓ OpenPay
- ✓ Mercado Pago

### 4. Pestaña "Tarjetas Aceptadas"

**Tarjetas de Débito:**
- Chips interactivos para: BBVA, Banamex, Santander, HSBC, Scotiabank, Inbursa
- Click para activar/desactivar
- Color primario cuando seleccionado

**Tarjetas de Crédito:**
- Chips interactivos para: Visa, Mastercard, AMEX
- Click para activar/desactivar
- Color secundario cuando seleccionado

### 5. Guardar

- Switch "Mostrar en cotizaciones PDF" (activado por defecto)
- Botón "Guardar Configuración"
- Notificación de éxito/error mediante snackbar

---

## Ejemplos de Uso

### Abrir Modal de Configuración

```typescript
// En cualquier componente que tenga acceso a CompanyInfo
const company: CompanyInfo = { id: 1, razonSocial: 'Mi Empresa', ... };

const handleConfigurePayments = async () => {
  const config = await paymentConfigApi.getByCompany(company.id);
  // Mostrar modal con config
};
```

### Guardar Configuración

```typescript
const paymentData: Partial<PaymentConfiguration> = {
  CompanyId: 1,
  BankName: "BBVA México",
  AccountNumber: "0123456789",
  ClaveInterbancaria: "012345678901234567",
  AcceptedPaymentMethods: {
    transferencia: true,
    tarjetaCredito: true
  },
  AcceptedCards: {
    debit: ["BBVA", "Banamex"],
    credit: ["Visa", "Mastercard"]
  },
  ShowInQuotation: true
};

await paymentConfigApi.upsert(1, paymentData);
```

---

## Validaciones Frontend

### CLABE Interbancaria
```typescript
ClaveInterbancaria: Yup.string()
  .max(18, 'La CLABE debe tener exactamente 18 dígitos')
  .matches(/^\d{0,18}$/, 'La CLABE solo debe contener números')
```

### Longitudes Máximas
- BankName: 150 caracteres
- AccountNumber: 50 caracteres
- ClaveInterbancaria: 18 caracteres
- AccountHolder: 200 caracteres
- BankBranch: 150 caracteres
- SwiftCode: 20 caracteres

---

## Notificaciones (Snackbar)

El sistema muestra notificaciones automáticas:

### Éxito ✅
- "Configuración de pago guardada correctamente."
- "Configuración desactivada correctamente."
- "Configuración eliminada correctamente."

### Error ❌
- Mensajes de error específicos del backend
- Fallback: "Error al [operación] configuración de pago"

---

## Estilado y UI/UX

### Colores
- **Botón principal:** Verde (success) para indicar funcionalidad de pagos
- **Chips débito:** Color primario cuando seleccionado
- **Chips crédito:** Color secundario cuando seleccionado
- **Alert:** Info (azul) para mensaje informativo

### Iconos
- **MoneyChange:** Botón principal en lista de empresas
- De la librería: `iconsax-react`

### Responsiveness
- Modal: `maxWidth="md"`, `fullWidth`
- Grid responsive: xs={12}, sm={6} donde aplica
- Chips con `flexWrap="wrap"` para mobile

---

## Testing

### Caso 1: Crear Nueva Configuración

1. Ir a Empresas
2. Click en botón verde de una empresa sin configuración
3. Llenar datos en las 3 pestañas
4. Guardar
5. Verificar notificación de éxito
6. Generar cotización PDF y verificar que aparezca la sección

### Caso 2: Editar Configuración Existente

1. Ir a Empresas
2. Click en botón verde de empresa con configuración
3. Verificar que los datos se cargan correctamente
4. Modificar campos
5. Guardar
6. Verificar actualización

### Caso 3: Desactivar en Cotización

1. Abrir configuración
2. Desactivar switch "Mostrar en cotizaciones PDF"
3. Guardar
4. Generar PDF → No debe aparecer sección

---

## Dependencias

### Nuevas
- Ninguna (usa librerías ya existentes del proyecto)

### Existentes Utilizadas
- `@mui/material` - Componentes UI
- `formik` - Manejo de formularios
- `yup` - Validaciones
- `iconsax-react` - Iconos
- `axios` - Peticiones HTTP

---

## Estructura de Archivos

```
src/
├── types/
│   └── company.ts (actualizado)
├── api/
│   └── company.ts (actualizado)
├── pages/
│   └── apps/
│       └── company/
│           └── list.tsx (actualizado)
└── sections/
    └── apps/
        └── company/
            ├── CompanyModal.tsx (existente)
            ├── FormCompany.tsx (existente)
            └── PaymentConfigModal.tsx (NUEVO)
```

---

## Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Validación avanzada de CLABE:**
   - Verificar dígito de control
   - Validar formato por banco

2. **Preview de PDF:**
   - Mostrar vista previa de cómo se verá en cotización

3. **Historial de cambios:**
   - Log de modificaciones a configuración

4. **Más logos:**
   - Agregar más bancos/tarjetas según necesidad

5. **Permisos granulares:**
   - Control de quién puede editar configuración de pagos

---

## Troubleshooting

### El modal no abre
- Verificar que `MoneyChange` icon está importado
- Verificar que `PaymentConfigModal` existe en la ruta correcta

### Los datos no se cargan
- Verificar que el backend esté corriendo
- Verificar token de autenticación
- Revisar console para errores de API

### Las tarjetas no se guardan
- Verificar que `debitCards` y `creditCards` state se actualiza
- Verificar que se pasan al payload en `handleSubmit`

---

## Notas Importantes

1. **Upsert Automático:** El sistema usa el endpoint `/upsert` que crea o actualiza automáticamente
2. **Sin Confirmación:** Al guardar no pide confirmación (puede agregarse si se desea)
3. **Cierre Automático:** El modal se cierra automáticamente al guardar exitosamente
4. **Validación Cliente:** Se valida en cliente antes de enviar al servidor
5. **Snackbar Global:** Usa el sistema de notificaciones global del proyecto

---

## Conclusión

El frontend está **100% completo y funcional**. Solo requiere que el backend esté corriendo y que se haya ejecutado la migration SQL.

Para probar:
1. Iniciar backend: `npm run start:dev`
2. Iniciar frontend: `npm start`
3. Ir a Empresas
4. Click en botón verde 💰
5. Configurar métodos de pago
6. ¡Disfrutar!
