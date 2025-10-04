# Ocultación de Breadcrumbs en la Página de Inicio

## Objetivo

Ocultar el componente de breadcrumbs en la página de inicio para una presentación más limpia y enfocada del dashboard principal.

## Implementación

### Cambios en el Layout Principal (`src/layout/Dashboard/index.tsx`)

#### 1. **Importación de useLocation**
```typescript
// ANTES
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// DESPUÉS
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
```

#### 2. **Detección de Página de Inicio**
```typescript
export default function MainLayout() {
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const location = useLocation(); // ✅ NUEVO

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;
  const isHomePage = location.pathname === '/' || location.pathname === '/inicio'; // ✅ NUEVO
```

#### 3. **Renderización Condicional**
```typescript
// ANTES
<Breadcrumbs />
<Outlet />

// DESPUÉS
{!isHomePage && <Breadcrumbs />}
<Outlet />
```

## Comportamiento Resultante

### ✅ **Página de Inicio**
- **URL**: `http://localhost:3001/` o `http://localhost:3001/inicio`
- **Breadcrumbs**: **Ocultos** - Se muestra directamente el contenido del dashboard
- **Experiencia**: Interfaz más limpia y enfocada

### ✅ **Otras Páginas**
- **URLs**: `/quotations`, `/customers`, `/users`, etc.
- **Breadcrumbs**: **Visibles** - Navegación contextual completa
- **Experiencia**: Navegación clara con contexto de ubicación

## Ventajas de la Implementación

### 🎯 **UX Mejorada**
- **Home limpio**: Sin breadcrumbs innecesarios en la página principal
- **Navegación intuitiva**: Breadcrumbs disponibles donde son útiles
- **Enfoque claro**: El dashboard se presenta sin distracciones

### 🔧 **Implementación Eficiente**
- **Condición simple**: Basada en la ruta actual
- **Performance**: No impacto en rendimiento
- **Mantenible**: Lógica clara y centralizada

### ✅ **Compatibilidad**
- **Rutas múltiples**: Funciona tanto con `/` como `/inicio`
- **Responsive**: Mantiene comportamiento en todos los dispositivos
- **Sin efectos secundarios**: No afecta otras funcionalidades

## Rutas Afectadas

| Ruta | Breadcrumbs | Estado |
|------|-------------|---------|
| `/` | ❌ Ocultos | ✅ Implementado |
| `/inicio` | ❌ Ocultos | ✅ Implementado |
| `/quotations` | ✅ Visibles | ✅ Funcional |
| `/customers` | ✅ Visibles | ✅ Funcional |
| `/users` | ✅ Visibles | ✅ Funcional |
| `/permissions/*` | ✅ Visibles | ✅ Funcional |
| Todas las demás | ✅ Visibles | ✅ Funcional |

## Verificación

✅ **Compilación exitosa**: Sin errores de TypeScript  
✅ **Lógica aplicada**: Breadcrumbs ocultos solo en home  
✅ **Funcionalidad preservada**: Todas las demás páginas intactas  
✅ **URLs múltiples**: Funciona con `/` y `/inicio`  

## Notas Técnicas

- Utiliza `useLocation()` de React Router para detectar la ruta actual
- Condición `isHomePage` evalúa tanto `/` como `/inicio`
- Renderización condicional con `{!isHomePage && <Breadcrumbs />}`
- No requiere cambios en el componente Breadcrumbs existente
- Mantiene toda la funcionalidad de navegación en otras páginas