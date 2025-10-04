import { openSnackbar } from 'api/snackbar';

/**
 * Tipos de notificación disponibles
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Configuraciones por defecto para las notificaciones
 */
const DEFAULT_NOTIFICATION_CONFIG = {
  variant: 'alert' as const,
  anchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'right' as const
  },
  transition: 'Fade' as const,
  close: true,
  action: false,
  actionButton: false,
  dense: false,
  maxStack: 3,
  iconVariant: 'usedefault' as const
};

/**
 * Opciones adicionales para personalizar la notificación
 */
export interface NotificationOptions {
  /** Duración en ms. Si no se especifica, usa el valor por defecto del sistema */
  autoHideDuration?: number;
  /** Posición de la notificación */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  /** Tipo de transición */
  transition?: 'Fade' | 'Grow' | 'SlideLeft' | 'SlideRight' | 'SlideUp' | 'SlideDown';
  /** Si mostrar botón de cerrar */
  showCloseButton?: boolean;
  /** Si mostrar botón de acción */
  showActionButton?: boolean;
  /** Texto del botón de acción */
  actionText?: string;
  /** Callback del botón de acción */
  onAction?: () => void;
}

/**
 * Función utilitaria para mostrar notificaciones usando el sistema de snackbar del proyecto
 * 
 * @param message - Mensaje a mostrar
 * @param type - Tipo de notificación (success, error, warning, info)
 * @param options - Opciones adicionales para personalizar la notificación
 * 
 * @example
 * ```tsx
 * // Notificación básica
 * showNotification('Operación exitosa', 'success');
 * 
 * // Con opciones personalizadas
 * showNotification('Error al procesar', 'error', {
 *   anchorOrigin: { vertical: 'top', horizontal: 'center' },
 *   transition: 'SlideDown'
 * });
 * 
 * // Con botón de acción
 * showNotification('Archivo guardado', 'info', {
 *   showActionButton: true,
 *   actionText: 'Ver archivo',
 *   onAction: () => window.open('/file-url')
 * });
 * ```
 */
export const showNotification = (
  message: string, 
  type: NotificationType = 'info',
  options: NotificationOptions = {}
): void => {
  const {
    anchorOrigin = DEFAULT_NOTIFICATION_CONFIG.anchorOrigin,
    transition = DEFAULT_NOTIFICATION_CONFIG.transition,
    showCloseButton = DEFAULT_NOTIFICATION_CONFIG.close,
    showActionButton = DEFAULT_NOTIFICATION_CONFIG.actionButton,
    actionText = 'UNDO',
    onAction
  } = options;

  openSnackbar({
    open: true,
    message,
    variant: DEFAULT_NOTIFICATION_CONFIG.variant,
    alert: {
      color: type,
      variant: 'filled'
    },
    anchorOrigin,
    transition,
    close: showCloseButton,
    action: showActionButton,
    actionButton: showActionButton,
    dense: DEFAULT_NOTIFICATION_CONFIG.dense,
    maxStack: DEFAULT_NOTIFICATION_CONFIG.maxStack,
    iconVariant: DEFAULT_NOTIFICATION_CONFIG.iconVariant
  });
};

/**
 * Funciones de conveniencia para tipos específicos de notificación
 */
export const notificationHelpers = {
  /**
   * Muestra una notificación de éxito
   * @param message - Mensaje a mostrar
   * @param options - Opciones adicionales
   */
  success: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'success', options),

  /**
   * Muestra una notificación de error
   * @param message - Mensaje a mostrar
   * @param options - Opciones adicionales
   */
  error: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'error', options),

  /**
   * Muestra una notificación de advertencia
   * @param message - Mensaje a mostrar
   * @param options - Opciones adicionales
   */
  warning: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'warning', options),

  /**
   * Muestra una notificación informativa
   * @param message - Mensaje a mostrar
   * @param options - Opciones adicionales
   */
  info: (message: string, options?: NotificationOptions) => 
    showNotification(message, 'info', options)
};

/**
 * Hook personalizado para usar notificaciones en componentes React
 * 
 * @returns Objeto con funciones para mostrar notificaciones
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const notifications = useNotifications();
 * 
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       notifications.success('Datos guardados correctamente');
 *     } catch (error) {
 *       notifications.error('Error al guardar los datos');
 *     }
 *   };
 * 
 *   return <button onClick={handleSave}>Guardar</button>;
 * };
 * ```
 */
export const useNotifications = () => {
  return {
    show: showNotification,
    success: notificationHelpers.success,
    error: notificationHelpers.error,
    warning: notificationHelpers.warning,
    info: notificationHelpers.info
  };
};

// Exportar por defecto la función principal
export default showNotification;