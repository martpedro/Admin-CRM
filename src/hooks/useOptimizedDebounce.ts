import { useCallback, useRef } from 'react';

interface UseOptimizedDebounceOptions {
  delay?: number;
  immediate?: boolean;
  maxWait?: number;
}

/**
 * Hook optimizado para debounce que usa requestIdleCallback cuando está disponible
 * para evitar bloqueos del hilo principal
 */
export const useOptimizedDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  options: UseOptimizedDebounceOptions = {}
) => {
  const { delay = 300, immediate = false, maxWait } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef<number>(0);

  // Mantener la referencia del callback actualizada
  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      // Limpiar timeouts existentes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }

      // Ejecutar inmediatamente si está configurado y es la primera llamada
      if (immediate && !lastCallTimeRef.current) {
        callbackRef.current(...args);
        lastCallTimeRef.current = now;
        return;
      }

      // Función para ejecutar el callback
      const executeCallback = () => {
        // Usar requestIdleCallback si está disponible para mejor rendimiento
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            callbackRef.current(...args);
            lastCallTimeRef.current = Date.now();
          });
        } else {
          // Fallback a setTimeout con prioridad baja
          setTimeout(() => {
            callbackRef.current(...args);
            lastCallTimeRef.current = Date.now();
          }, 0);
        }
      };

      // Configurar el debounce normal
      timeoutRef.current = setTimeout(executeCallback, delay);

      // Configurar maxWait si está especificado
      if (maxWait && now - lastCallTimeRef.current >= maxWait) {
        executeCallback();
      } else if (maxWait) {
        const remainingMaxWait = maxWait - (now - lastCallTimeRef.current);
        maxTimeoutRef.current = setTimeout(executeCallback, remainingMaxWait);
      }
    },
    [delay, immediate, maxWait]
  );

  // Función para cancelar el debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  // Función para ejecutar inmediatamente
  const flush = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      callbackRef.current(...args);
      lastCallTimeRef.current = Date.now();
    },
    [cancel]
  );

  return {
    debouncedCallback,
    cancel,
    flush
  };
};

export default useOptimizedDebounce;