import { useState, useCallback, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { DocumentDownload, DocumentText } from 'iconsax-react';
import quotationsApi from 'api/quotations';
import { enqueueSnackbar } from 'notistack';

export interface QuotationPdfViewerProps {
  quotationId: number;
  quotationNumber?: string | number;
  variant?: 'button' | 'icon';
  label?: string;
  size?: 'small' | 'medium' | 'large';
  onOpen?: () => void;
  onClose?: () => void;
  auto?: boolean; // si true abre al montar
  buttonProps?: any;
}

/**
 * Componente reutilizable para visualizar el PDF de una cotización dentro de un Dialog.
 * - Usa axiosServices (token automático)
 * - Genera y embebe el PDF
 * - Permite descargarlo
 */
const QuotationPdfViewer = ({ quotationId, quotationNumber, variant = 'button', label = 'Ver PDF', size = 'small', onOpen, onClose, auto = false, buttonProps }: QuotationPdfViewerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const cleanup = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const fetchPdf = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await quotationsApi.getPdf(quotationId);
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (e: any) {
      enqueueSnackbar(e?.message || 'No se pudo generar el PDF', { variant: 'error' });
      // Cerrar si falla
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [quotationId, pdfUrl]);

  const handleOpen = async () => {
    setOpen(true);
    onOpen?.();
    await fetchPdf();
  };

  const handleClose = () => {
    setOpen(false);
    cleanup();
    onClose?.();
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `cotizacion-${quotationNumber || quotationId}.pdf`;
    a.click();
  };

  useEffect(() => {
    if (auto) handleOpen();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trigger = variant === 'icon' ? (
    <Tooltip title={label}>
      <IconButton color="secondary" size={size === 'large' ? 'large' : 'medium'} onClick={handleOpen} {...buttonProps}>
        <DocumentText />
      </IconButton>
    </Tooltip>
  ) : (
    <Button variant="outlined" color="secondary" size={size} onClick={handleOpen} {...buttonProps}>
      {label}
    </Button>
  );

  return (
    <>
      {trigger}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Vista previa PDF</DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '80vh' }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && pdfUrl && (
            <iframe src={pdfUrl} title="PDF Cotización" width="100%" height="100%" style={{ border: 'none' }} />
          )}
          {!loading && !pdfUrl && (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary" variant="body2">No se pudo cargar el PDF.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {pdfUrl && !loading && (
            <Button startIcon={<DocumentDownload />} onClick={handleDownload}>Descargar</Button>
          )}
          <Button color="secondary" onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuotationPdfViewer;
