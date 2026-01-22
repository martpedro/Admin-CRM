import { useState, useCallback, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, CircularProgress, Typography, IconButton, Tooltip } from '@mui/material';
import { DocumentDownload, Book } from 'iconsax-react';
import quotationsApi from 'api/quotations';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

export interface QuotationCatalogViewerProps {
  quotationId: number;
  quotationNumber?: string | number;
  variant?: 'button' | 'icon';
  label?: string;
  size?: 'small' | 'medium' | 'large';
  onOpen?: () => void;
  onClose?: () => void;
  auto?: boolean;
  buttonProps?: any;
}

/**
 * Componente reutilizable para visualizar el PDF del catálogo de productos de una cotización.
 */
const QuotationCatalogViewer = ({ quotationId, quotationNumber, variant = 'button', label = 'Ver Catálogo', size = 'small', onOpen, onClose, auto = false, buttonProps }: QuotationCatalogViewerProps) => {
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
      const blob = await quotationsApi.getCatalogPdf(quotationId);
      
      // Si el blob está vacío (204 No Content), significa que no hay productos con imagen
      if (blob.size === 0) {
        openSnackbar({ 
          open: true, 
          message: 'Esta cotización no tiene productos con imagen para mostrar en el catálogo', 
          variant: 'alert', 
          alert: { color: 'warning' } 
        } as SnackbarProps);
        setOpen(false);
        return;
      }
      
      const url = URL.createObjectURL(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (e: any) {
      openSnackbar({ open: true, message: e?.message || 'No se pudo generar el catálogo', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
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
    a.download = `catalogo-${quotationNumber || quotationId}.pdf`;
    a.click();
  };

  useEffect(() => {
    if (auto) handleOpen();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trigger = variant === 'icon' ? (
    <Tooltip title={label}>
      <IconButton color="info" size={size === 'large' ? 'large' : 'medium'} onClick={handleOpen} {...buttonProps}>
        <Book />
      </IconButton>
    </Tooltip>
  ) : (
    <Button variant="outlined" color="info" size={size} onClick={handleOpen} {...buttonProps}>
      {label}
    </Button>
  );

  return (
    <>
      {trigger}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Catálogo de Productos</DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '80vh' }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && pdfUrl && (
            <iframe src={pdfUrl} title="Catálogo PDF" width="100%" height="100%" style={{ border: 'none' }} />
          )}
          {!loading && !pdfUrl && (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary" variant="body2">No se pudo cargar el catálogo.</Typography>
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

export default QuotationCatalogViewer;
