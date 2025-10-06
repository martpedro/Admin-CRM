import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import { 
  generateAllPermissions, 
  createAllPermissions 
} from '../utils/permissions-generator';

// Componente para gestionar permisos del sistema
const PermissionsManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);

  // Token de autorización (debería venir del contexto de auth)
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5Njg5MTQ2LCJleHAiOjE3NTk3NzU1NDZ9.ho8yRN4C3wau6e5rvscxkkIxcIAA4d5BM63sETkgDZQ';

  // Generar vista previa de permisos
  const handlePreview = () => {
    const generatedPermissions = generateAllPermissions();
    setPermissions(generatedPermissions);
    setShowDialog(true);
  };

  // Crear todos los permisos
  const handleCreatePermissions = async () => {
    setLoading(true);
    setShowDialog(false);
    
    try {
      const creationResults = await createAllPermissions(AUTH_TOKEN);
      setResults(creationResults);
    } catch (error) {
      console.error('Error creando permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar permisos por módulo
  const groupedPermissions = permissions.reduce((groups: Record<string, any[]>, permission) => {
    const module = permission.module || 'general';
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {});

  // Obtener color del chip según el tipo
  const getChipColor = (type: string) => {
    switch (type) {
      case 'basic_crud': return 'primary';
      case 'menu_access': return 'secondary';
      case 'data_scope': return 'success';
      case 'action_permission': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gestor de Permisos del Sistema
      </Typography>
      
      <Typography variant="body1" paragraph>
        Esta herramienta permite generar automáticamente todos los permisos necesarios
        para los módulos del sistema, incluyendo permisos CRUD, de menús, de scope de datos
        y acciones especiales.
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <Button
          variant="outlined"
          onClick={handlePreview}
          disabled={loading}
        >
          Vista Previa de Permisos
        </Button>
        
        <Button
          variant="contained"
          onClick={handleCreatePermissions}
          disabled={loading || permissions.length === 0}
          color="primary"
        >
          Crear Todos los Permisos
        </Button>
      </Stack>

      {loading && (
        <Box mb={3}>
          <Typography variant="body2" gutterBottom>
            Creando permisos en el sistema...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {results.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultados de Creación
            </Typography>
            
            <Box mb={2}>
              <Alert severity="success">
                Permisos creados exitosamente: {results.filter(r => r.result !== null).length}
              </Alert>
              
              {results.filter(r => r.result === null).length > 0 && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Permisos que fallaron: {results.filter(r => r.result === null).length}
                </Alert>
              )}
            </Box>

            <Accordion>
              <AccordionSummary expandIcon={<ArrowDown2 />}>
                <Typography>Ver detalles de resultados</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {results.map((result, index) => (
                  <Box key={index} mb={1}>
                    <Chip
                      label={result.permission.key}
                      color={result.result ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption">
                      {result.permission.name}
                    </Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Dialog de vista previa */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Vista Previa de Permisos ({permissions.length} total)
        </DialogTitle>
        
        <DialogContent>
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <Accordion key={module}>
              <AccordionSummary expandIcon={<ArrowDown2 />}>
                <Typography variant="h6">
                  {module} ({modulePermissions.length} permisos)
                </Typography>
              </AccordionSummary>
              
              <AccordionDetails>
                <Stack spacing={1}>
                  {modulePermissions.map((permission, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={permission.type}
                        color={getChipColor(permission.type)}
                        size="small"
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {permission.key}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        - {permission.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreatePermissions}
            variant="contained"
            color="primary"
          >
            Crear Permisos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionsManager;