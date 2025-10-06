/**
 * Utilidad para generar avatars con iniciales del usuario
 */
import { useState, useEffect } from 'react';

// Colores predefinidos para los avatars
const AVATAR_COLORS = [
  { bg: '#FF6B6B', text: '#FFFFFF' }, // Rojo
  { bg: '#4ECDC4', text: '#FFFFFF' }, // Turquesa
  { bg: '#45B7D1', text: '#FFFFFF' }, // Azul
  { bg: '#96CEB4', text: '#FFFFFF' }, // Verde
  { bg: '#FECA57', text: '#FFFFFF' }, // Amarillo
  { bg: '#FF9FF3', text: '#FFFFFF' }, // Rosa
  { bg: '#54A0FF', text: '#FFFFFF' }, // Azul claro
  { bg: '#5F27CD', text: '#FFFFFF' }, // Morado
  { bg: '#00D2D3', text: '#FFFFFF' }, // Cian
  { bg: '#FF6348', text: '#FFFFFF' }, // Naranja
  { bg: '#2ED573', text: '#FFFFFF' }, // Verde claro
  { bg: '#A55EEA', text: '#FFFFFF' }  // Violeta
];

/**
 * Obtiene las iniciales de un nombre completo
 */
export const getInitials = (name: string, lastName?: string): string => {
  if (!name && !lastName) return 'U';
  
  const firstName = (name || '').trim();
  const lastNameStr = (lastName || '').trim();
  
  if (firstName && lastNameStr) {
    return `${firstName.charAt(0)}${lastNameStr.charAt(0)}`.toUpperCase();
  }
  
  if (firstName) {
    const nameParts = firstName.split(' ').filter(part => part.length > 0);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return firstName.charAt(0).toUpperCase();
  }
  
  return 'U';
};

/**
 * Genera un color basado en el nombre del usuario (consistente)
 */
export const getAvatarColor = (name: string, lastName?: string): { bg: string; text: string } => {
  const fullName = `${name || ''}${lastName || ''}`.toLowerCase();
  let hash = 0;
  
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash % AVATAR_COLORS.length);
  return AVATAR_COLORS[index];
};

/**
 * Genera un avatar con iniciales como imagen base64
 */
export const generateInitialsAvatar = (
  name: string, 
  lastName?: string, 
  size: number = 120
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      resolve('');
      return;
    }
    
    canvas.width = size;
    canvas.height = size;
    
    const initials = getInitials(name, lastName);
    const colors = getAvatarColor(name, lastName);
    
    // Fondo circular
    context.fillStyle = colors.bg;
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    context.fill();
    
    // Texto de iniciales
    context.fillStyle = colors.text;
    context.font = `bold ${Math.floor(size * 0.4)}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials, size / 2, size / 2);
    
    // Convertir a base64
    const dataURL = canvas.toDataURL('image/png');
    resolve(dataURL);
  });
};

/**
 * Crea y descarga un avatar generado
 */
export const downloadGeneratedAvatar = (name: string, lastName?: string, size: number = 120): void => {
  generateInitialsAvatar(name, lastName, size).then((dataURL) => {
    const link = document.createElement('a');
    link.download = `avatar-${getInitials(name, lastName)}.png`;
    link.href = dataURL;
    link.click();
  });
};

/**
 * Hook personalizado para manejar avatars con iniciales
 */
export const useAvatarWithInitials = (
  name?: string, 
  lastName?: string, 
  existingAvatar?: string,
  size: number = 120
) => {
  const [avatarSrc, setAvatarSrc] = useState<string>(existingAvatar || '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (existingAvatar) {
      setAvatarSrc(existingAvatar);
    } else if (name) {
      setIsGenerating(true);
      generateInitialsAvatar(name, lastName, size).then((dataURL) => {
        setAvatarSrc(dataURL);
        setIsGenerating(false);
      });
    }
  }, [name, lastName, existingAvatar, size]);
  
  return {
    avatarSrc,
    isGenerating,
    regenerateAvatar: () => {
      if (name) {
        setIsGenerating(true);
        generateInitialsAvatar(name, lastName, size).then((dataURL) => {
          setAvatarSrc(dataURL);
          setIsGenerating(false);
        });
      }
    }
  };
};