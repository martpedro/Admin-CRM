import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  IconButton,
  Collapse,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import { ArrowDown2, ArrowUp2, Eye, Calendar, DocumentText } from 'iconsax-react';
import { Quotation } from 'api/quotations';
import quotationsApi from 'api/quotations';
import { useNavigate } from 'react-router-dom';
import { formatCurrencyMXN } from 'utils/quotation';

interface QuotationVersionsTimelineProps {
  quotationId: number;
  currentVersion?: number;
}

const QuotationVersionsTimeline = ({ quotationId, currentVersion }: QuotationVersionsTimelineProps) => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [quotationId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotationsApi.getVersions(quotationId);
      console.log('Versiones cargadas:', data);
      // Validar que data sea un array antes de asignarlo
      if (Array.isArray(data)) {
        setVersions(data);
      } else {
        console.warn('getVersions no retornó un array:', data);
        setVersions([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar versiones');
      console.error('Error cargando versiones:', err);
      setVersions([]); // Asegurar array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nueva':
        return 'info';
      case 'En proceso':
        return 'warning';
      case 'Cerrada':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <CircularProgress size={24} />
            <Typography>Cargando versiones...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  // Validación adicional: asegurar que versions sea un array
  if (!Array.isArray(versions) || versions.length <= 1) {
    return null; // No mostrar si solo hay una versión o no hay datos válidos
  }

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <DocumentText size={20} />
            <Typography variant="h6">Historial de Versiones</Typography>
            <Chip label={versions.length} size="small" color="primary" />
          </Stack>
        }
        action={
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ArrowUp2 size={20} /> : <ArrowDown2 size={20} />}
          </IconButton>
        }
      />
      
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            {versions.map((version, index) => {
              const isLatest = version.IsLatestVersion;
              const isCurrent = version.Id === quotationId;

              return (
                <Box
                  key={version.Id}
                  sx={{
                    position: 'relative',
                    pl: 3,
                    borderLeft: `2px solid ${isLatest ? 'primary.main' : 'divider'}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -6,
                      top: 8,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: isLatest ? 'primary.main' : 'divider'
                    }
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {version.NumberQuotation}
                      </Typography>
                      
                      {isLatest && (
                        <Chip label="Actual" size="small" color="primary" />
                      )}
                      
                      {isCurrent && (
                        <Chip label="Viendo" size="small" variant="outlined" />
                      )}
                      
                      <Chip 
                        label={version.Status} 
                        size="small" 
                        color={getStatusColor(version.Status)} 
                      />
                    </Stack>

                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Calendar size={14} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(version.CreatedAt)}
                        </Typography>
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        {formatCurrencyMXN(version.Total)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {version.products?.length || 0} productos
                      </Typography>
                    </Stack>

                    {version.VersionNotes && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        📝 {version.VersionNotes}
                      </Typography>
                    )}

                    {!isCurrent && (
                      <Box>
                        <Button
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => navigate(`/apps/quotations/edit/${version.Id}`)}
                        >
                          Ver esta versión
                        </Button>
                      </Box>
                    )}
                  </Stack>

                  {index < versions.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default QuotationVersionsTimeline;
