import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Warning2, CloseCircle } from 'iconsax-react';

interface DeleteQuotationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quotationNumber?: string;
  loading?: boolean;
}

const DeleteQuotationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  quotationNumber,
  loading = false 
}: DeleteQuotationDialogProps) => {
  const intl = useIntl();

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <Warning2 size={24} color="#f44336" />
        <Typography variant="h6" component="span">
          <FormattedMessage 
            id="confirm-delete-quotation-title" 
            defaultMessage="Confirmar eliminación" 
          />
        </Typography>
        {!loading && (
          <IconButton
            onClick={onClose}
            sx={{ ml: 'auto' }}
            size="small"
          >
            <CloseCircle size={20} />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="body1" gutterBottom>
            <FormattedMessage 
              id="confirm-delete-quotation-message" 
              defaultMessage="¿Está seguro que desea eliminar esta cotización?" 
            />
          </Typography>
          
          {quotationNumber && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <strong>
                <FormattedMessage id="quotation-number" defaultMessage="Número de cotización" />:
              </strong> {quotationNumber}
            </Typography>
          )}
          
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'medium' }}>
            <FormattedMessage 
              id="delete-action-irreversible" 
              defaultMessage="Esta acción no se puede deshacer." 
            />
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          color="inherit"
        >
          <FormattedMessage id="cancel" defaultMessage="Cancelar" />
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={loading}
          variant="contained"
          color="error"
          autoFocus
        >
          {loading ? (
            <FormattedMessage id="deleting" defaultMessage="Eliminando..." />
          ) : (
            <FormattedMessage id="delete" defaultMessage="Eliminar" />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteQuotationDialog;