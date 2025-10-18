import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { Clock, TickCircle, ArrowDown2 } from 'iconsax-react';
import { useQuotationOperations } from 'hooks/useQuotations';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';

interface QuotationStatusChangeProps {
  quotationId: number;
  currentStatus: 'Nueva' | 'En proceso' | 'Cerrada';
  onStatusChanged?: (newStatus: 'Nueva' | 'En proceso' | 'Cerrada') => void;
}

const QuotationStatusChange = ({ quotationId, currentStatus, onStatusChanged }: QuotationStatusChangeProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const { updateQuotationStatus } = useQuotationOperations();

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: 'Nueva' | 'En proceso' | 'Cerrada') => {
    if (newStatus === currentStatus) {
      handleClose();
      return;
    }

    setLoading(true);
    try {
      // Actualizar inmediatamente en la UI
      onStatusChanged?.(newStatus);
      
      const result = await updateQuotationStatus(quotationId, newStatus);
      if (result.success) {
        openSnackbar({ open: true, message: `Estado cambiado a: ${newStatus}`, variant: 'alert', alert: { color: 'success' } } as SnackbarProps);
      } else {
        // Si falla, revertir el estado
        openSnackbar({ open: true, message: 'Error al cambiar el estado', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
        onStatusChanged?.(currentStatus); // Revertir
      }
    } catch (error) {
      openSnackbar({ open: true, message: 'Error al cambiar el estado', variant: 'alert', alert: { color: 'error' } } as SnackbarProps);
      // Si falla, revertir el estado
      onStatusChanged?.(currentStatus); // Revertir
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const statusOptions = [
    { key: 'Nueva', label: 'Nueva', icon: <Clock size="16" />, color: 'info' },
    { key: 'En proceso', label: 'En proceso', icon: <Clock size="16" />, color: 'warning' },
    { key: 'Cerrada', label: 'Cerrada', icon: <TickCircle size="16" />, color: 'success' }
  ] as const;

  if (loading) {
    return <CircularProgress size={20} />;
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<ArrowDown2 size="14" />}
        onClick={handleClick}
        sx={{ minWidth: 120, textTransform: 'none' }}
      >
        {currentStatus}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.key}
            onClick={() => handleStatusChange(option.key)}
            selected={option.key === currentStatus}
            disabled={option.key === currentStatus}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default QuotationStatusChange;