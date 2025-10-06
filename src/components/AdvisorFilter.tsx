import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box } from '@mui/material';
import { useDataScope } from 'hooks/useDataScope';
import { getSalesAdvisors } from 'api/user'; 
import { useEffect, useState } from 'react';

interface AdvisorFilterProps {
  module: 'customer' | 'quotation';
  selectedAdvisor: string | number | 'all';
  onAdvisorChange: (advisorId: string | number | 'all') => void;
  disabled?: boolean;
}

interface AdvisorOption {
  value: number;
  label: string;
  profile: number | string;
  email: string;
}

const AdvisorFilter: React.FC<AdvisorFilterProps> = ({
  module,
  selectedAdvisor,
  onAdvisorChange,
  disabled = false
}) => {
  const { showAdvisorFilter, canViewAll, dataScope } = useDataScope(module);
  const [advisors, setAdvisors] = useState<AdvisorOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showAdvisorFilter) {
      loadAdvisors();
    }
  }, [showAdvisorFilter]);

  const loadAdvisors = async () => {
    setLoading(true);
    try {
      const result = await getSalesAdvisors();
      if (result.success && result.data) {
        setAdvisors(result.data);
      } else {
        console.error('Error cargando asesores:', result.error);
        setAdvisors([]);
      }
    } catch (error) {
      console.error('Error cargando asesores:', error);
      setAdvisors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value === 'all' ? 'all' : Number(event.target.value);
    onAdvisorChange(value);
  };

  // Si no tiene permiso para ver el filtro, no mostrar nada
  if (!showAdvisorFilter) {
    return null;
  }

  const moduleLabel = module === 'customer' ? 'clientes' : 'cotizaciones';
  const placeholder = canViewAll 
    ? `Filtrar ${moduleLabel} por asesor`
    : `Filtrar ${moduleLabel} asignados`;

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small" disabled={disabled || loading}>
        <InputLabel id={`advisor-filter-${module}-label`}>
          {placeholder}
        </InputLabel>
        <Select
          labelId={`advisor-filter-${module}-label`}
          id={`advisor-filter-${module}`}
          value={String(selectedAdvisor)}
          label={placeholder}
          onChange={handleChange}
        >
          <MenuItem value="all">
            <em>
              {canViewAll ? `Todos los ${moduleLabel}` : `Todos mis ${moduleLabel}`}
            </em>
          </MenuItem>
          {advisors.map((advisor) => (
            <MenuItem key={advisor.value} value={advisor.value}>
              {advisor.label}
              {advisor.email && (
                <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                  ({advisor.email})
                </Box>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Indicador visual del alcance de datos */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          Scope: {dataScope} | Filter: {showAdvisorFilter ? 'SÍ' : 'NO'} | ViewAll: {canViewAll ? 'SÍ' : 'NO'}
        </Box>
      )}
    </Box>
  );
};

export default AdvisorFilter;