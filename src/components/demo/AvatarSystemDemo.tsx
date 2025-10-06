import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AvatarWithInitials from 'components/AvatarWithInitials';
import { generateInitialsAvatar, downloadGeneratedAvatar } from 'utils/avatar-generator';

// Componente de ejemplo para mostrar el sistema de avatars
const AvatarSystemDemo = () => {
  const [generatedAvatar, setGeneratedAvatar] = React.useState<string>('');

  const handleGenerateAvatar = async () => {
    const avatar = await generateInitialsAvatar('Juan', 'Pérez', 120);
    setGeneratedAvatar(avatar);
  };

  const testUsers = [
    { name: 'María', lastName: 'González' },
    { name: 'Carlos', lastName: 'Rodríguez' },
    { name: 'Ana', lastName: 'Martínez' },
    { name: 'Luis', lastName: 'López' },
    { name: 'Elena', lastName: 'Sánchez' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sistema de Avatars con Iniciales
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Este sistema genera automáticamente avatars con iniciales cuando no hay imagen de perfil disponible.
      </Typography>

      {/* Avatars de ejemplo */}
      <Typography variant="h6" gutterBottom>
        Ejemplos de Avatars Generados:
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {testUsers.map((user, index) => (
          <Stack key={index} alignItems="center" spacing={1}>
            <AvatarWithInitials
              name={user.name}
              lastName={user.lastName}
              size={60}
              fallbackToInitials={true}
            />
            <Typography variant="caption">
              {user.name} {user.lastName}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* Avatar generado dinámicamente */}
      <Typography variant="h6" gutterBottom>
        Generar Avatar Personalizado:
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={handleGenerateAvatar}>
          Generar Avatar para "Juan Pérez"
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => downloadGeneratedAvatar('Juan', 'Pérez', 120)}
        >
          Descargar Avatar
        </Button>
      </Stack>

      {generatedAvatar && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Avatar Generado:
          </Typography>
          <img 
            src={generatedAvatar} 
            alt="Avatar generado" 
            style={{ width: 120, height: 120, borderRadius: '50%', border: '2px solid #ccc' }}
          />
        </Box>
      )}

      {/* Características del sistema */}
      <Typography variant="h6" gutterBottom>
        Características del Sistema:
      </Typography>
      
      <ul>
        <li>✅ Genera automáticamente avatars con iniciales del nombre y apellido</li>
        <li>✅ Colores consistentes basados en el nombre del usuario</li>
        <li>✅ Fallback inteligente si no hay apellido</li>
        <li>✅ Tamaños personalizables</li>
        <li>✅ Integración con Material-UI</li>
        <li>✅ Capacidad de descarga de avatars generados</li>
        <li>✅ Compatible con todos los formularios del sistema</li>
      </ul>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Los avatars se generan dinámicamente usando Canvas y se convierten a base64 para 
        compatibilidad total con el sistema existente.
      </Typography>
    </Box>
  );
};

export default AvatarSystemDemo;