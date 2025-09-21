// utils/saveProductImageLocally.ts
// Guarda la imagen en public/imagenesCot/DDMMYY y retorna la URL accesible

export async function saveProductImageLocally(file: File, folder: string): Promise<string> {
  // Solo funciona en Electron o entorno Node, no en navegador puro
  // En navegador puro, se debe subir a un backend o usar FileReader y guardar en localStorage/base64
  // Aquí se simula guardado en public/imagenesCot/DDMMYY y retorna la URL
  const basePath = '/imagenesCot/' + folder;
  const fileName = Date.now() + '_' + file.name.replace(/\s+/g, '_');
  // Simulación: en navegador puro no se puede escribir en disco, así que se retorna una URL temporal
  // En Electron/Node, aquí iría la lógica de fs.writeFile
  // Se recomienda implementar subida al backend si se requiere persistencia real
  return basePath + '/' + fileName;
}
