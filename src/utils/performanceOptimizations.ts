/**
 * Configuraciones y utilidades para optimización de rendimiento
 */

// Configuración de debounce por componente
export const DEBOUNCE_CONFIG = {
  SEARCH: {
    DELAY: 500,
    MAX_WAIT: 2000
  },
  INPUT: {
    DELAY: 300,
    MAX_WAIT: 1000
  },
  API_CALLS: {
    DELAY: 600,
    MAX_WAIT: 3000
  }
} as const;

// Configuración de límites de archivo
export const FILE_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Configuración de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 100,
  QUOTATIONS_TTL: 10 * 60 * 1000, // 10 minutos
} as const;

/**
 * Utilidad para validar tamaño de archivo
 */
export const validateFileSize = (file: File, maxSize: number = FILE_CONFIG.MAX_IMAGE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * Utilidad para validar tipo de archivo
 */
export const validateFileType = (file: File, allowedTypes: readonly string[] = FILE_CONFIG.SUPPORTED_IMAGE_TYPES): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Función para comprimir imagen si es necesario
 */
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Error al comprimir imagen'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Función para ejecutar operaciones de forma no bloqueante
 */
export const scheduleNonBlockingOperation = <T>(
  operation: () => T | Promise<T>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const executeOperation = async () => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    // Usar requestIdleCallback si está disponible
    if (window.requestIdleCallback) {
      window.requestIdleCallback(executeOperation);
    } else {
      // Fallback a setTimeout con prioridad baja
      setTimeout(executeOperation, 0);
    }
  });
};

/**
 * Función para agrupar operaciones y ejecutarlas en batch
 */
export class BatchProcessor<T> {
  private operations: T[] = [];
  private processor: (batch: T[]) => Promise<void>;
  private batchSize: number;
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;

  constructor(
    processor: (batch: T[]) => Promise<void>,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(operation: T): void {
    this.operations.push(operation);

    // Si alcanzamos el tamaño del batch, procesar inmediatamente
    if (this.operations.length >= this.batchSize) {
      this.processBatch();
      return;
    }

    // Sino, programar procesamiento después del delay
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.processBatch();
    }, this.delay);
  }

  private processBatch(): void {
    if (this.operations.length === 0) return;

    const batch = [...this.operations];
    this.operations = [];

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // Procesar batch de forma no bloqueante
    scheduleNonBlockingOperation(() => this.processor(batch));
  }

  flush(): void {
    this.processBatch();
  }
}

export default {
  DEBOUNCE_CONFIG,
  FILE_CONFIG,
  CACHE_CONFIG,
  validateFileSize,
  validateFileType,
  compressImage,
  scheduleNonBlockingOperation,
  BatchProcessor
};