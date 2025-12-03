import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// project imports
import { quotationsApi, Quotation, refreshQuotationsCache } from 'api/quotations';
import QuotationStatusChip from './QuotationStatusChip';
import QuotationPdfViewer from './QuotationPdfViewer';
import { useQuotationOperations } from 'hooks/useQuotations';
import { useNotifications } from 'utils/notifications';

// assets
import { Edit, Copy, DocumentDownload, Eye, TickCircle } from 'iconsax-react';

interface VersionsHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  quotationId: number;
}

const VersionsHistoryDialog = ({ open, onClose, quotationId }: VersionsHistoryDialogProps) => {
  const [versions, setVersions] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorizingId, setAuthorizingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { updateQuotationStatus } = useQuotationOperations();
  const notifications = useNotifications();

  useEffect(() => {
    if (open && quotationId) {
      loadVersions();
    }
  }, [open, quotationId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationsApi.getVersions(quotationId);
      // Ordenar por versión descendente (más reciente primero)
      const sortedVersions = data.sort((a, b) => (b.Version || 1) - (a.Version || 1));
      setVersions(sortedVersions);
    } catch (err) {
      console.error('Error loading versions:', err);
      setError('Error al cargar el historial de versiones');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuotation = async (versionId: number) => {
    try {
      const copyData = await quotationsApi.getQuotationForCopy(versionId);
      localStorage.setItem('quotationCopyData', JSON.stringify(copyData));
      navigate('/quotations/create?mode=copy');
      onClose();
    } catch (error) {
      console.error('Error copying quotation:', error);
    }
  };

  const handleEdit = (versionId: number) => {
    navigate(`/quotations/edit/${versionId}`);
    onClose();
  };

  const handleAuthorize = async (versionId: number) => {
    setAuthorizingId(versionId);
    try {
      const result = await updateQuotationStatus(versionId, 'En proceso');
      if (result.success) {
        notifications.success('Cotización autorizada exitosamente');
        await refreshQuotationsCache(versionId);
        // Recargar versiones para actualizar el estado
        await loadVersions();
      }
    } catch (error) {
      notifications.error('Error al autorizar la cotización');
    } finally {
      setAuthorizingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h4">Historial de Versiones</Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : versions.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography>No se encontraron versiones</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Versión</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.Id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          v{version.Version}
                        </Typography>
                        {version.IsLatestVersion && (
                          <Chip label="Actual" color="primary" size="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{version.NumberQuotation}</Typography>
                    </TableCell>
                    <TableCell>
                      <QuotationStatusChip status={version.Status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(version.CreatedAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(version.Total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${version.products?.length || 0} ${version.products?.length === 1 ? 'producto' : 'productos'}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {version.VersionNotes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <QuotationPdfViewer
                          quotationId={version.Id}
                          quotationNumber={version.NumberQuotation}
                          variant="icon"
                          label="Ver PDF"
                        />
                        {version.Status === 'En proceso' && (
                          <Tooltip title="Autorizar cotización">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleAuthorize(version.Id)}
                              disabled={authorizingId === version.Id}
                            >
                              {authorizingId === version.Id ? (
                                <CircularProgress size={18} />
                              ) : (
                                <TickCircle size={18} />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar esta versión">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleEdit(version.Id)}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copiar esta versión">
                          <IconButton 
                            color="secondary" 
                            size="small"
                            onClick={() => handleCopyQuotation(version.Id)}
                          >
                            <Copy size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionsHistoryDialog;
