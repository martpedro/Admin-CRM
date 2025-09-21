import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box
} from '@mui/material';
import { Eye } from 'iconsax-react';
import Loader from 'components/Loader';
import EmailPreviewDialog from './EmailPreviewDialog';
import { Quotation } from 'api/quotations';

interface SendQuotationEmailDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (data: {
    to: string;
    cc: string;
    message: string;
  }) => void;
  loading?: boolean;
  defaultTo?: string;
  quotation?: Quotation;
}

const SendQuotationEmailDialog: React.FC<SendQuotationEmailDialogProps> = ({ 
  open, 
  onClose, 
  onSend, 
  loading, 
  defaultTo,
  quotation 
}) => {
  const [to, setTo] = useState(defaultTo || '');
  const [cc, setCc] = useState('');
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (open && defaultTo) {
      setTo(defaultTo);
    }
  }, [open, defaultTo]);

  const handleSend = () => {
    setConfirm(true);
  };

  const handleConfirm = () => {
    onSend({ to, cc, message });
    setConfirm(false);
  };

  const handleCancelConfirm = () => {
    setConfirm(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enviar cotización por correo</DialogTitle>
      <DialogContent>
        {loading ? (
          <Loader message="Enviando correo..." />
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Correo destinatario"
              value={to}
              onChange={e => setTo(e.target.value)}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Correos en copia (separados por coma)"
              value={cc}
              onChange={e => setCc(e.target.value)}
              fullWidth
              placeholder="ejemplo1@mail.com, ejemplo2@mail.com"
            />
            <TextField
              label="Mensaje adicional"
              value={message}
              onChange={e => setMessage(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Escriba aquí cualquier mensaje personalizado que desee incluir en el correo..."
            />
            
            {quotation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  💡 Se enviará un correo profesional con la información de la cotización y el PDF adjunto.
                </Typography>
                <Button
                  startIcon={<Eye />}
                  onClick={() => setPreviewOpen(true)}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Previsualizar correo
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSend} disabled={loading}>Enviar</Button>
      </DialogActions>
      {confirm && (
        <Dialog open={confirm} onClose={handleCancelConfirm}>
          <DialogTitle>Confirmar envío</DialogTitle>
          <DialogContent>
            <Typography>¿Está seguro que desea enviar la cotización a <b>{to}</b>?</Typography>
            {cc && <Typography variant="body2">Se copiará a: {cc}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelConfirm}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleConfirm}>Confirmar y enviar</Button>
          </DialogActions>
        </Dialog>
      )}
      
      {quotation && (
        <EmailPreviewDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          quotation={quotation}
          customMessage={message}
        />
      )}
    </Dialog>
  );
};

export default SendQuotationEmailDialog;
