import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { CloseCircle, Eye, Code } from 'iconsax-react';
import { generateQuotationEmailHTML, generateQuotationEmailText } from 'templates/QuotationEmailTemplate';
import { Quotation } from 'api/quotations';

interface EmailPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  quotation: Quotation;
  customMessage?: string;
}

const EmailPreviewDialog: React.FC<EmailPreviewDialogProps> = ({
  open,
  onClose,
  quotation,
  customMessage = ''
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const htmlContent = generateQuotationEmailHTML({ 
    quotation, 
    customMessage 
  });
  
  const textContent = generateQuotationEmailText({ 
    quotation, 
    customMessage 
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Eye size={24} />
          <Typography variant="h6">
            Previsualización del Correo - {quotation.NumberQuotation}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseCircle size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab 
              label="Vista Previa HTML" 
              icon={<Eye size={18} />}
              iconPosition="start"
            />
            <Tab 
              label="Código HTML" 
              icon={<Code size={18} />}
              iconPosition="start"
            />
            <Tab label="Texto Plano" />
          </Tabs>
        </Box>

        <Box sx={{ height: 'calc(90vh - 180px)', overflow: 'auto' }}>
          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Esta es una previsualización de cómo se verá el correo en el cliente de email del destinatario:
              </Typography>
              <Box 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: '#f4f4f4',
                  p: 2
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Código HTML que será enviado al backend:
              </Typography>
              <Box 
                component="pre"
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {htmlContent}
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Versión de texto plano (fallback para clientes que no soportan HTML):
              </Typography>
              <Box 
                component="pre"
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}
              >
                {textContent}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          💡 Esta previsualización muestra cómo se verá el correo. El PDF se adjuntará automáticamente.
        </Typography>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailPreviewDialog;