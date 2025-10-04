# Guía de Uso: Sistema de Notificaciones

## 📁 Ubicación
`src/utils/notifications.ts`

## 🎯 Propósito
Utilidad centralizada para mostrar notificaciones en toda la aplicación utilizando el sistema de snackbar propio del proyecto.

## 🚀 Formas de Uso

### 1. Usando el Hook `useNotifications` (Recomendado)

```tsx
import React from 'react';
import { useNotifications } from 'utils/notifications';

const MyComponent = () => {
  const notifications = useNotifications();

  const handleSave = async () => {
    try {
      await saveData();
      notifications.success('Datos guardados correctamente');
    } catch (error) {
      notifications.error('Error al guardar los datos');
    }
  };

  const handleWarning = () => {
    notifications.warning('Asegúrate de completar todos los campos');
  };

  const handleInfo = () => {
    notifications.info('Recuerda revisar la información antes de continuar');
  };

  return (
    <div>
      <button onClick={handleSave}>Guardar</button>
      <button onClick={handleWarning}>Mostrar Advertencia</button>
      <button onClick={handleInfo}>Mostrar Info</button>
    </div>
  );
};
```

### 2. Importación Directa de Funciones

```tsx
import { showNotification, notificationHelpers } from 'utils/notifications';

// Función principal
showNotification('Mensaje personalizado', 'success');

// Funciones de conveniencia
notificationHelpers.success('Operación exitosa');
notificationHelpers.error('Algo salió mal');
notificationHelpers.warning('Ten cuidado');
notificationHelpers.info('Información adicional');
```

### 3. Importación por Defecto

```tsx
import showNotification from 'utils/notifications';

showNotification('Mi mensaje', 'error');
```

## 🎨 Tipos de Notificación

| Tipo | Color | Uso Recomendado |
|------|-------|-----------------|
| `success` | Verde | Operaciones exitosas, confirmaciones |
| `error` | Rojo | Errores, fallos en operaciones |
| `warning` | Naranja | Advertencias, campos requeridos |
| `info` | Azul | Información general, tips |

## ⚙️ Opciones Avanzadas

```tsx
import { useNotifications } from 'utils/notifications';

const MyComponent = () => {
  const notifications = useNotifications();

  const showCustomNotification = () => {
    notifications.show('Mensaje personalizado', 'success', {
      // Posición personalizada
      anchorOrigin: { 
        vertical: 'top', 
        horizontal: 'center' 
      },
      // Animación diferente
      transition: 'SlideDown',
      // Con botón de acción
      showActionButton: true,
      actionText: 'Ver detalles',
      onAction: () => {
        console.log('Botón de acción presionado');
      }
    });
  };

  return <button onClick={showCustomNotification}>Notificación Personalizada</button>;
};
```

## 📚 Ejemplos por Módulo

### En Cotizaciones (`quotations`)
```tsx
// edit.tsx, create.tsx, list.tsx
import { useNotifications } from 'utils/notifications';

const QuotationComponent = () => {
  const notifications = useNotifications();

  const handleSave = async (data) => {
    try {
      await updateQuotation(data);
      notifications.success('Cotización actualizada');
    } catch (error) {
      notifications.error('Error al actualizar la cotización');
    }
  };

  const handleSendEmail = async () => {
    if (!customer.email) {
      notifications.warning('El cliente no tiene email registrado');
      return;
    }
    // ... lógica de envío
    notifications.success('Correo enviado correctamente');
  };
};
```

### En Usuarios (`users`)
```tsx
import { useNotifications } from 'utils/notifications';

const UserManagement = () => {
  const notifications = useNotifications();

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      notifications.success('Usuario creado exitosamente');
    } catch (error) {
      notifications.error('Error al crear el usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      notifications.success('Usuario eliminado');
    } catch (error) {
      notifications.error('No se pudo eliminar el usuario');
    }
  };
};
```

### En Productos (`products`)
```tsx
import { useNotifications } from 'utils/notifications';

const ProductDialog = () => {
  const notifications = useNotifications();

  const handleImageUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      notifications.warning('La imagen es muy grande. Máximo 5MB.');
      return;
    }
    
    notifications.info('Procesando imagen...');
    // ... lógica de subida
  };

  const handleSaveProduct = async () => {
    try {
      await saveProduct();
      notifications.success('Producto guardado');
    } catch (error) {
      notifications.error('Error al guardar el producto');
    }
  };
};
```

## 🔧 Configuración Avanzada

### Posiciones Disponibles
```tsx
anchorOrigin: {
  vertical: 'top' | 'bottom',
  horizontal: 'left' | 'center' | 'right'
}
```

### Animaciones Disponibles
- `'Fade'` - Desvanecimiento (por defecto)
- `'Grow'` - Crecimiento
- `'SlideLeft'` - Deslizar desde la derecha
- `'SlideRight'` - Deslizar desde la izquierda  
- `'SlideUp'` - Deslizar desde abajo
- `'SlideDown'` - Deslizar desde arriba

## 📋 Mejores Prácticas

### ✅ Hacer
```tsx
// Usar mensajes claros y específicos
notifications.success('Cotización #001 guardada correctamente');
notifications.error('Error al conectar con el servidor');

// Usar el tipo correcto de notificación
notifications.warning('Algunos campos están vacíos');
notifications.info('Los cambios se guardan automáticamente');

// Manejar errores apropiadamente
try {
  await apiCall();
  notifications.success('Operación completada');
} catch (error) {
  notifications.error(error.message || 'Error inesperado');
}
```

### ❌ Evitar
```tsx
// Mensajes genéricos
notifications.success('OK');
notifications.error('Error');

// Usar el tipo incorrecto
notifications.success('¡Cuidado! Revisa los datos'); // Debería ser warning
notifications.error('Información guardada'); // Debería ser success

// No manejar errores
apiCall(); // Sin try/catch ni notificación
```

## 🔄 Migración desde Notistack

Si tienes código existente usando notistack, puedes migrar fácilmente:

```tsx
// ANTES (notistack)
import { useSnackbar } from 'notistack';
const { enqueueSnackbar } = useSnackbar();
enqueueSnackbar('Mensaje', { variant: 'success' });

// DESPUÉS (sistema propio)
import { useNotifications } from 'utils/notifications';
const notifications = useNotifications();
notifications.success('Mensaje');
```

## 🎯 Beneficios

- ✅ **Consistencia**: Mismo estilo en toda la aplicación
- ✅ **Simplicidad**: API fácil de usar
- ✅ **Flexibilidad**: Opciones avanzadas cuando las necesites
- ✅ **Tipado**: TypeScript completamente tipado
- ✅ **Mantenibilidad**: Centralizado y fácil de modificar
- ✅ **Compatibilidad**: Usa el sistema de notificaciones ya configurado

## 🐛 Solución de Problemas

### Notificación no aparece
- Verifica que el componente `<Snackbar />` esté en `App.tsx`
- Asegúrate de estar usando `useNotifications()` dentro de un componente React
- Revisa la consola por errores de JavaScript

### Estilo incorrecto
- El sistema usa el tema configurado en Material-UI
- Los colores se definen en la configuración del tema del proyecto

### Performance
- Las notificaciones son optimizadas automáticamente
- No requiere configuración adicional de rendimiento