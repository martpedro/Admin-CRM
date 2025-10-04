# Corrección de Navegación del Logo

## Problema Identificado

El logo de la aplicación estaba configurado para redirigir a `/quotations` en lugar de a la página de inicio cuando se hacía clic en él.

## Solución Implementada

### Cambio en Configuración (`src/config.ts`)

```typescript
// ANTES
export const APP_DEFAULT_PATH = '/quotations';

// DESPUÉS
export const APP_DEFAULT_PATH = '/';
```

## Impacto de la Corrección

Este cambio afecta múltiples componentes de la aplicación que dependen de `APP_DEFAULT_PATH`:

### 1. **Logo Navigation** (`src/components/logo/index.tsx`)
- ✅ El logo ahora redirige correctamente a la página de inicio

### 2. **Guest Guard** (`src/utils/route-guard/GuestGuard.tsx`)
- ✅ Redirección automática después del login a la página de inicio

### 3. **Error Pages**
- ✅ `404.tsx`: Botón "Volver al inicio" lleva al dashboard
- ✅ `500.tsx`: Botón "Volver al inicio" lleva al dashboard
- ✅ `under-construction.tsx`: Botón de navegación corregido
- ✅ `under-construction2.tsx`: Botón de navegación corregido

### 4. **Profile Breadcrumbs** (`src/pages/apps/profiles/account.tsx`)
- ✅ Enlaces de breadcrumb "home" apuntan al dashboard

## Comportamiento Actual

### ✅ **Logo Navigation**
- **Clic en logo** → Navega a `http://localhost:3001/` (Dashboard)
- **Consistente** con la página de inicio configurada

### ✅ **User Experience**
- **Intuitivo**: El logo lleva al "home" como es estándar en aplicaciones web
- **Coherente**: Todas las referencias a "inicio" apuntan al mismo lugar
- **Funcional**: Error pages y navegación general funcionan correctamente

## Verificación

✅ **Compilación exitosa**: Sin errores de TypeScript
✅ **Rutas consistentes**: Todas las referencias actualizadas automáticamente
✅ **UX mejorada**: Navegación intuitiva desde el logo
✅ **Funcionalidad completa**: Sistema de navegación coherente

## Notas Técnicas

- `APP_DEFAULT_PATH` es una constante central utilizada en toda la aplicación
- El cambio es automáticamente propagado a todos los componentes que la importan
- No se requieren cambios adicionales en otros archivos
- Mantiene compatibilidad total con la estructura existente