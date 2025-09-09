import { useState } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert, LinearProgress } from '@mui/material';
import { assignAllPermissionsToUser1, checkUser1Permissions, initializePermissions, getAllPermissions } from 'utils/assignPermissions';

export default function PermissionAssignmentTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInitializePermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await initializePermissions();
      setResult({ type: 'initialize', data: result });
    } catch (err: any) {
      setError(`Error inicializando permisos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignAllPermissionsToUser1();
      setResult({ type: 'assign', data: result });
    } catch (err: any) {
      setError(`Error asignando permisos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkUser1Permissions();
      setResult({ type: 'check', data: result });
    } catch (err: any) {
      setError(`Error verificando permisos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllPermissions();
      setResult({ type: 'all', data: result });
    } catch (err: any) {
      setError(`Error obteniendo permisos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          🔧 Herramienta de Gestión de Permisos
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Esta herramienta permite inicializar y asignar todos los permisos al usuario con ID 1.
          Todos los endpoints utilizados son públicos para facilitar la administración.
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleInitializePermissions}
            disabled={loading}
          >
            1. 🏗️ Inicializar Permisos
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleGetAllPermissions}
            disabled={loading}
          >
            2. 📋 Ver Todos los Permisos
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignPermissions}
            disabled={loading}
          >
            3. ⚡ Asignar Todos al Usuario 1
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCheckPermissions}
            disabled={loading}
          >
            4. 🔍 Verificar Permisos Usuario 1
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Resultado:
              </Typography>
              
              {result.type === 'assign' && (
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ✅ Asignación Completada
                  </Typography>
                  <Typography>
                    📊 Total de permisos: {result.data.total}
                  </Typography>
                  <Typography color="success.main">
                    ✅ Asignados exitosamente: {result.data.successful}
                  </Typography>
                  <Typography color="error.main">
                    ❌ Fallidos: {result.data.failed}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    🎉 Usuario 1 ahora tiene acceso completo al sistema
                  </Typography>
                </Box>
              )}
              
              {result.type === 'check' && (
                <Box>
                  <Typography variant="h6" color="secondary" gutterBottom>
                    👤 Permisos del Usuario 1
                  </Typography>
                  <Typography>
                    📊 Permisos asignados: {result.data.permissions?.length || 0}
                  </Typography>
                </Box>
              )}
              
              {result.type === 'initialize' && (
                <Box>
                  <Typography variant="h6" color="info.main" gutterBottom>
                    🏗️ Inicialización Completada
                  </Typography>
                  <Typography>
                    ✅ {result.data.Message?.message || result.data.message}
                  </Typography>
                </Box>
              )}

              {result.type === 'all' && (
                <Box>
                  <Typography variant="h6" color="info.main" gutterBottom>
                    📋 Permisos Disponibles
                  </Typography>
                  <Typography>
                    📊 Total: {result.data.length} permisos
                  </Typography>
                  {result.data.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Algunos ejemplos:</Typography>
                      {result.data.slice(0, 5).map((perm: any, index: number) => (
                        <Typography key={index} variant="caption" display="block">
                          • {perm.Name} ({perm.Key})
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              
              <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {JSON.stringify(result.data, null, 2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            💡 <strong>Instrucciones:</strong> Ejecuta los pasos en orden para configurar el sistema completo de permisos.
            Una vez completado, el usuario 1 tendrá acceso total a todas las funcionalidades.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
