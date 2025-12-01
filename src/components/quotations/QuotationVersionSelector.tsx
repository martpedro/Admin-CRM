import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Quotation } from 'api/quotations';
import quotationsApi from 'api/quotations';
import { formatCurrencyMXN } from 'utils/quotation';

interface QuotationVersionSelectorProps {
  currentQuotationId: number;
  currentVersion?: number;
}

const QuotationVersionSelector = ({ currentQuotationId, currentVersion }: QuotationVersionSelectorProps) => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(currentQuotationId);

  useEffect(() => {
    loadVersions();
    setSelectedId(currentQuotationId);
  }, [currentQuotationId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await quotationsApi.getVersions(currentQuotationId);
      
      if (Array.isArray(data) && data.length > 0) {
        // Ordenar por versión ascendente
        const sorted = data.sort((a, b) => a.Version - b.Version);
        setVersions(sorted);
      } else {
        setVersions([]);
      }
    } catch (err: any) {
      console.error('Error cargando versiones:', err);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (quotationId: number) => {
    setSelectedId(quotationId);
    navigate(`/quotations/edit/${quotationId}`);
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

  // No mostrar si solo hay una versión o aún está cargando
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 300 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Cargando versiones...
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(versions) || versions.length <= 1) {
    return null;
  }

  return (
    <FormControl size="small" sx={{ minWidth: 350 }}>
      <InputLabel>Versiones de esta Cotización</InputLabel>
      <Select
        value={selectedId}
        onChange={(e) => handleVersionChange(e.target.value as number)}
        label="Versiones de esta Cotización"
        renderValue={(selected) => {
          const version = versions.find((v) => v.Id === selected);
          if (!version) return 'Seleccionar versión';
          
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                {version.NumberQuotation}
              </Typography>
              <Chip 
                label={`v${version.Version}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              {version.IsLatestVersion && (
                <Chip label="Actual" size="small" color="primary" />
              )}
              <Chip 
                label={version.Status} 
                size="small" 
                color={getStatusColor(version.Status)}
              />
            </Stack>
          );
        }}
      >
        {versions.map((version) => (
          <MenuItem key={version.Id} value={version.Id}>
            <Box sx={{ width: '100%', py: 0.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    {version.NumberQuotation}
                  </Typography>
                  <Chip 
                    label={`v${version.Version}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  {version.IsLatestVersion && (
                    <Chip label="Actual" size="small" color="primary" />
                  )}
                  {version.Id === currentQuotationId && (
                    <Chip label="Viendo" size="small" variant="outlined" />
                  )}
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={version.Status} 
                    size="small" 
                    color={getStatusColor(version.Status)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrencyMXN(version.Total)}
                  </Typography>
                </Stack>
              </Stack>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {new Date(version.CreatedAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {' • '}
                {version.products?.length || 0} productos
              </Typography>
              
              {version.VersionNotes && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5, 
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  📝 {version.VersionNotes}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default QuotationVersionSelector;
