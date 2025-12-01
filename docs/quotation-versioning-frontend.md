# Sistema de Versionado de Cotizaciones - Frontend

## 📦 Archivos Creados/Modificados

### **Archivos Nuevos:**

1. ✅ **`components/quotations/QuotationSentAlert.tsx`**
   - Alerta de advertencia cuando se intenta editar cotización enviada
   - Dialog para ingresar notas de versión
   - Botón para crear nueva versión
   - Vista previa del nuevo número de cotización

2. ✅ **`components/quotations/QuotationVersionsTimeline.tsx`**
   - Timeline con todas las versiones de una cotización
   - Chips de estado (Nueva, En proceso, Cerrada)
   - Badge "Actual" para última versión
   - Badge "Viendo" para versión actual
   - Navegación entre versiones
   - Muestra fecha, total y número de productos

### **Archivos Modificados:**

1. ✅ **`api/quotations.ts`**
   - Tipos actualizados con campos de versionado
   - Nuevos tipos: `QuotationVersion`, `QuotationComparison`
   - Funciones API: `createVersion()`, `getVersions()`, `compareVersions()`

2. ✅ **`pages/apps/quotations/edit.tsx`**
   - Importación de componentes de versionado
   - Estado `creatingVersion`
   - Función `handleCreateVersion()`
   - Manejo de error `QuotationAlreadySent`
   - Renderizado de `QuotationSentAlert`
   - Renderizado de `QuotationVersionsTimeline`
   - Título actualizado con número de versión

3. ✅ **`pages/apps/quotations/list.tsx`**
   - Badge con número de versión (v2, v3, etc.)
   - Badge "Anterior" para versiones no actuales
   - Display mejorado en columna de número de cotización

---

## 🎯 Funcionalidades Implementadas

### **1. Alerta de Cotización Enviada**

Cuando una cotización tiene status "En proceso" (enviada):

```tsx
<QuotationSentAlert
  quotation={{
    Id: 123,
    NumberQuotation: "RCP2026-AR0123",
    Status: "En proceso",
    Version: 1
  }}
  onCreateVersion={(notes) => handleCreateVersion(notes)}
  loading={creatingVersion}
/>
```

**Características:**
- ⚠️ Alerta amarilla con ícono de información
- 📝 Explica que no se puede editar directamente
- 🔘 Botón "Crear Nueva Versión" (abre dialog)
- 🔘 Botón "Modo Solo Lectura" (disabled por ahora)

### **2. Dialog de Crear Versión**

Dialog modal que aparece al hacer clic en "Crear Nueva Versión":

**Contenido:**
- Texto explicativo
- Campo de texto multilinea para notas (opcional)
- Preview del nuevo número: `RCP2026-AR0123-2`
- Botones Cancelar/Crear

**Flujo:**
1. Usuario ingresa notas (opcional)
2. Click en "Crear Versión"
3. Loading state activo
4. Cotización nueva creada
5. Cache refrescado
6. Navegación automática a nueva versión

### **3. Timeline de Versiones**

Componente colapsable que muestra historial:

```tsx
<QuotationVersionsTimeline 
  quotationId={123}
  currentVersion={2}
/>
```

**Características:**
- 📜 Lista ordenada ascendente (v1 → v2 → v3)
- 🎨 Línea visual conectando versiones
- 🔵 Punto azul en versión actual
- ⚪ Punto gris en versiones anteriores
- 🏷️ Chips de estado y badges
- 📅 Fecha formateada en español
- 💰 Total de cada versión
- 📦 Cantidad de productos
- 📝 Notas de versión (si existen)
- 👁️ Botón "Ver esta versión" (navega)

**Ejemplo Visual:**
```
┌─────────────────────────────────────┐
│ 📄 Historial de Versiones     [3]  │
│                                ▲    │
├─────────────────────────────────────┤
│ ● RCP2026-AR0123                    │
│   [Cerrada]                         │
│   20 nov 2025, 10:00 - $10,000     │
│   5 productos                       │
│   [Ver esta versión]                │
│                                     │
│ ● RCP2026-AR0123-2                  │
│   [En proceso] [Viendo]             │
│   21 nov 2025, 09:00 - $12,000     │
│   6 productos                       │
│   📝 Cliente solicitó cambio...     │
│                                     │
│ ● RCP2026-AR0123-3                  │
│   [Nueva] [Actual]                  │
│   21 nov 2025, 14:30 - $12,500     │
│   6 productos                       │
│   [Ver esta versión]                │
└─────────────────────────────────────┘
```

### **4. Badges en Listado**

En `list.tsx`, la columna de número muestra:

```
RCP2026-AR0123  [v2] [Anterior]
RCP2026-AR0123-2  [v2]
RCP2026-AR0123-3  [v3]
```

**Lógica:**
- Badge `v#` se muestra si `Version > 1`
- Badge "Anterior" se muestra si `IsLatestVersion === false`
- Color secondary para versión
- Color default outlined para "Anterior"

### **5. Manejo de Errores**

En `handleSubmit()`:

```typescript
try {
  await updateQuotation(values);
} catch (e: any) {
  if (e?.response?.data?.error === 'QuotationAlreadySent') {
    notifications.error(
      'Esta cotización ya ha sido enviada y no puede modificarse. Crea una nueva versión.'
    );
  } else {
    notifications.error(e?.message || 'Error al actualizar');
  }
}
```

**Validación Backend:**
- Backend retorna error con código `QuotationAlreadySent`
- Frontend lo captura y muestra mensaje específico
- Usuario sabe exactamente qué hacer

---

## 🚀 Flujo de Usuario Completo

### **Escenario 1: Crear Primera Versión**

1. Usuario abre cotización enviada
2. Ve alerta amarilla "Cotización Enviada"
3. Click en "Crear Nueva Versión"
4. Dialog se abre
5. Ingresa notas: "Cliente solicitó descuento"
6. Click en "Crear Versión"
7. Loading spinner aparece
8. Nueva versión se crea
9. Navegación automática a nueva versión
10. Timeline muestra ambas versiones

### **Escenario 2: Ver Versiones Anteriores**

1. Usuario está en v3 de cotización
2. Ve Timeline con 3 versiones
3. Click en "Ver esta versión" de v1
4. Navega a `/apps/quotations/edit/123`
5. Ve datos de v1
6. Timeline muestra badge "Viendo" en v1
7. Puede navegar de vuelta a v3

### **Escenario 3: Intentar Editar Enviada**

1. Usuario intenta cambiar producto en cotización enviada
2. Click en "Guardar"
3. Backend rechaza con error
4. Notification roja aparece
5. Mensaje: "...ya ha sido enviada..."
6. Usuario ve alerta en top sugiriendo crear versión

---

## 🎨 Componentes UI Utilizados

### **Material-UI:**
- `Alert` + `AlertTitle` - Advertencias
- `Dialog` + `DialogTitle` + `DialogContent` + `DialogActions` - Modales
- `TextField` - Input de notas
- `Button` - Acciones
- `Chip` - Badges de versión y estado
- `Stack` - Layouts
- `Typography` - Textos
- `Box` - Contenedores
- `CircularProgress` - Loading

### **Iconsax Icons:**
- `InfoCircle` - Alerta
- `DocumentForward` - Crear versión
- `ArrowDown2` / `ArrowUp2` - Colapsar timeline
- `Eye` - Ver versión
- `Calendar` - Fecha
- `DocumentText` - Historial

---

## 📊 Tipos TypeScript

### **Quotation (Actualizado)**

```typescript
interface Quotation {
  // ... campos existentes ...
  Version: number;
  BaseQuotationId: number | null;
  VersionNotes: string | null;
  IsLatestVersion: boolean;
}
```

### **QuotationVersion**

```typescript
interface QuotationVersion {
  id: number;
  number: string;
  version: number;
  status: string;
  total: number;
  subTotal: number;
  tax: number;
  productsCount: number;
  createdAt: string;
  versionNotes?: string;
}
```

### **QuotationComparison**

```typescript
interface QuotationComparison {
  version1: QuotationVersion;
  version2: QuotationVersion;
  differences: {
    totalDiff: number;
    subTotalDiff: number;
    taxDiff: number;
    productsCountDiff: number;
  };
}
```

---

## 🔌 API Functions

### **createVersion**

```typescript
const newVersion = await quotationsApi.createVersion(
  quotationId,
  "Notas opcionales"
);

// Response
{
  success: true,
  message: "Nueva versión RCP2026-AR0123-2 creada exitosamente",
  data: { /* Quotation completa */ }
}
```

### **getVersions**

```typescript
const versions = await quotationsApi.getVersions(quotationId);

// Response
[
  { Id: 123, NumberQuotation: "RCP2026-AR0123", Version: 1, ... },
  { Id: 456, NumberQuotation: "RCP2026-AR0123-2", Version: 2, ... },
  { Id: 789, NumberQuotation: "RCP2026-AR0123-3", Version: 3, ... }
]
```

### **compareVersions**

```typescript
const comparison = await quotationsApi.compareVersions(123, 456);

// Response
{
  version1: { id: 123, total: 10000, ... },
  version2: { id: 456, total: 12000, ... },
  differences: { totalDiff: 2000, ... }
}
```

---

## ✅ Testing Manual

### **Test 1: Crear Versión**

1. Ir a cotización con Status "En proceso"
2. Verificar que aparece alerta amarilla
3. Click en "Crear Nueva Versión"
4. Ingresar notas
5. Click en "Crear Versión"
6. Verificar redirección a nueva versión
7. Verificar número correcto (ej: RCP2026-AR0123-2)

### **Test 2: Timeline**

1. Estar en cotización con múltiples versiones
2. Verificar que Timeline aparece
3. Verificar badges correctos
4. Click en "Ver esta versión" de v1
5. Verificar navegación correcta
6. Verificar badge "Viendo" en v1

### **Test 3: Listado**

1. Ir a `/apps/quotations/list`
2. Filtrar por "En proceso"
3. Buscar cotización con versiones
4. Verificar badge v2, v3, etc.
5. Verificar badge "Anterior" en versiones viejas

### **Test 4: Error Handling**

1. Abrir cotización enviada
2. Cambiar algún producto
3. Click en "Guardar"
4. Verificar mensaje de error
5. Verificar que sugiere crear versión

---

## 🐛 Troubleshooting

### **Timeline no aparece**

**Causa:** Solo 1 versión o `Version === 1` y `BaseQuotationId === null`

**Solución:** Crear al menos una versión de la cotización

### **Badge no se muestra**

**Causa:** `Version` no viene del backend o es 1

**Solución:** Verificar que migración SQL se ejecutó correctamente

### **Error al crear versión**

**Causa:** Cotización con Status "Nueva" o "Cerrada"

**Solución:** Solo cotizaciones "En proceso" pueden versionarse

### **Navegación no funciona**

**Causa:** Rutas incorrectas

**Solución:** Verificar que rutas sean `/apps/quotations/edit/:id`

---

## 🎯 Próximos Pasos Opcionales

### **Mejoras Futuras:**

1. **Comparación Visual de Versiones**
   - Vista lado a lado de dos versiones
   - Highlight de diferencias en productos
   - Diff de precios y cantidades

2. **Modo Solo Lectura**
   - Deshabilitar edición de campos
   - Mostrar banner informativo
   - Permitir solo visualización

3. **Notificaciones al Cliente**
   - Email automático cuando se crea versión
   - Incluir link a portal de cliente
   - Historial de cambios visible

4. **Exportar Historial**
   - PDF con todas las versiones
   - Excel comparativo
   - Reporte de cambios

5. **Búsqueda por Versión**
   - Filtro en listado
   - Agrupar por familia de versiones
   - Vista expandible con todas las versiones

---

## 📝 Notas de Implementación

### **Performance:**
- Timeline solo se muestra si hay múltiples versiones
- Cache invalidation optimizada con `refreshQuotationsCache()`
- Lazy loading de componentes

### **UX:**
- Navegación automática a nueva versión
- Mensajes claros y descriptivos
- Loading states en todas las acciones
- Confirmación visual de acciones exitosas

### **Accesibilidad:**
- Tooltips en iconos
- Labels descriptivos
- Keyboard navigation en dialogs
- ARIA labels donde necesario

---

**Versión:** 1.0.0  
**Fecha:** 21 de Noviembre, 2025  
**Autor:** GitHub Copilot

---

## ✅ Checklist de Implementación Frontend

- [x] Tipos TypeScript actualizados
- [x] Funciones API creadas
- [x] Componente QuotationSentAlert
- [x] Componente QuotationVersionsTimeline
- [x] Integración en edit.tsx
- [x] Badges en list.tsx
- [x] Manejo de errores
- [x] Loading states
- [x] Cache invalidation
- [x] Navegación entre versiones
- [ ] Testing manual completo
- [ ] Testing con datos reales
- [ ] Deploy a producción
