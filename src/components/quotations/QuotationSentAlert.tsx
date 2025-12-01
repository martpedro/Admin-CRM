import { Alert, AlertTitle, Button, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useState } from 'react';
import { InfoCircle, DocumentForward } from 'iconsax-react';

interface QuotationSentAlertProps {
  quotation: {
    Id: number;
    NumberQuotation: string;
    Status: string;
    Version: number;
  };
  onCreateVersion: (versionNotes: string) => void;
  loading?: boolean;
}

const QuotationSentAlert = ({ quotation, onCreateVersion, loading }: QuotationSentAlertProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');

  const handleCreateVersion = () => {
    onCreateVersion(versionNotes);
    setOpenDialog(false);
    setVersionNotes('');
  };

  // Solo mostrar si está en proceso (enviada)
  if (quotation.Status !== 'En proceso') {
    return null;
  }

  return (
    <>
      <Alert 
        severity="warning" 
        icon={<InfoCircle size={24} />}
        sx={{ mb: 3 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>Cotización Enviada al Cliente</AlertTitle>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Esta cotización ya ha sido enviada y no puede ser modificada directamente. 
          Si necesitas realizar cambios, debes crear una nueva versión.
        </Typography>
        
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button 
            variant="contained" 
            color="warning"
            size="small"
            startIcon={<DocumentForward />}
            onClick={() => setOpenDialog(true)}
            disabled={loading}
          >
            Crear Nueva Versión
          </Button>
          <Button 
            variant="outlined" 
            color="inherit"
            size="small"
            disabled
          >
            Modo Solo Lectura
          </Button>
        </Stack>
      </Alert>

      {/* Dialog para ingresar notas de versión */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Versión</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se creará una nueva versión de la cotización <strong>{quotation.NumberQuotation}</strong>.
            Todos los datos y productos serán copiados a la nueva versión.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notas de la versión (opcional)"
            placeholder="Ej: Cliente solicitó cambio en precio del producto X"
            value={versionNotes}
            onChange={(e) => setVersionNotes(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Nueva numeración: <strong>{quotation.NumberQuotation}-{quotation.Version + 1}</strong>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateVersion}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Versión'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuotationSentAlert;
