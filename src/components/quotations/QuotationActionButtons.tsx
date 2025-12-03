import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowLeft,
  Copy,
  DocumentDownload,
  Save2,
  Send,
  TickCircle,
  CloseCircle
} from 'iconsax-react';

interface QuotationActionButtonsProps {
  mode: 'create' | 'edit';
  // Propiedades comunes
  onCancel: () => void;
  onSave: () => void;
  onSaveAndSend?: () => void;
  
  // Props específicas de edit
  quotationStatus?: 'Nueva' | 'En proceso' | 'Cerrada';
  onCopy?: () => void;
  onAuthorize?: () => void;
  onViewPdf?: () => void;
  
  // Estados de loading
  isSaving?: boolean;
  isCopying?: boolean;
  isAuthorizing?: boolean;
  isSavingAndSending?: boolean;
  
  // Condiciones de deshabilitado
  disableSaveAndSend?: boolean;
  disableSaveAndSendReason?: string;
}

const QuotationActionButtons = ({
  mode,
  onCancel,
  onSave,
  onSaveAndSend,
  quotationStatus,
  onCopy,
  onAuthorize,
  onViewPdf,
  isSaving = false,
  isCopying = false,
  isAuthorizing = false,
  isSavingAndSending = false,
  disableSaveAndSend = false,
  disableSaveAndSendReason
}: QuotationActionButtonsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const handleSpeedDialOpen = () => setSpeedDialOpen(true);
  const handleSpeedDialClose = () => setSpeedDialOpen(false);

  // Definir las acciones según el modo
  const actions = [];

  // Acciones comunes
  actions.push({
    icon: <ArrowLeft />,
    name: mode === 'create' ? 'Cancelar' : 'Volver',
    onClick: onCancel,
    color: 'default' as const
  });

  // Acciones de edit
  if (mode === 'edit') {
    if (onViewPdf) {
      actions.push({
        icon: <DocumentDownload />,
        name: 'Ver PDF',
        onClick: onViewPdf,
        color: 'info' as const
      });
    }

    if (onCopy) {
      actions.push({
        icon: isCopying ? <CircularProgress size={20} /> : <Copy />,
        name: 'Copiar Cotización',
        onClick: onCopy,
        color: 'secondary' as const,
        disabled: isCopying
      });
    }

    if (onAuthorize && quotationStatus === 'En proceso') {
      actions.push({
        icon: isAuthorizing ? <CircularProgress size={20} /> : <TickCircle />,
        name: 'Autorizar',
        onClick: onAuthorize,
        color: 'success' as const,
        disabled: isAuthorizing
      });
    }
  }

  // Acción de guardar
  actions.push({
    icon: isSaving ? <CircularProgress size={20} /> : <Save2 />,
    name: mode === 'create' ? 'Crear Cotización' : 'Guardar Cambios',
    onClick: onSave,
    color: 'primary' as const,
    disabled: isSaving
  });

  // Acción de guardar y enviar
  if (onSaveAndSend) {
    actions.push({
      icon: isSavingAndSending ? <CircularProgress size={20} /> : <Send />,
      name: mode === 'create' ? 'Crear y Enviar' : 'Guardar y Enviar',
      onClick: onSaveAndSend,
      color: 'secondary' as const,
      disabled: disableSaveAndSend || isSavingAndSending,
      tooltip: disableSaveAndSendReason
    });
  }

  // Renderizado móvil (SpeedDial)
  if (isMobile) {
    return (
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <SpeedDial
          ariaLabel="Acciones de cotización"
          icon={<SpeedDialIcon openIcon={<CloseCircle />} />}
          onClose={handleSpeedDialClose}
          onOpen={handleSpeedDialOpen}
          open={speedDialOpen}
          direction="up"
          sx={{
            '& .MuiSpeedDial-fab': {
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }
          }}
        >
          {actions.reverse().map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.tooltip || action.name}
              tooltipOpen
              onClick={() => {
                if (!action.disabled) {
                  action.onClick();
                  handleSpeedDialClose();
                }
              }}
              sx={{
                bgcolor: action.disabled ? theme.palette.action.disabledBackground : undefined,
                '& .MuiSpeedDialAction-staticTooltipLabel': {
                  whiteSpace: 'nowrap',
                  bgcolor: action.color === 'default' 
                    ? theme.palette.grey[700]
                    : action.color === 'success'
                      ? theme.palette.success.main
                      : action.color === 'info'
                        ? theme.palette.info.main
                        : action.color === 'secondary'
                          ? theme.palette.secondary.main
                          : theme.palette.primary.main,
                  color: theme.palette.common.white,
                  fontWeight: 600
                }
              }}
              FabProps={{
                disabled: action.disabled,
                color: action.color,
                size: 'small'
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    );
  }

  // Renderizado desktop (botones normales)
  return (
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      {mode === 'edit' && onViewPdf && (
        <Button variant="outlined" onClick={onViewPdf} color="info">
          Ver PDF
        </Button>
      )}
      
      <Button variant="outlined" onClick={onCancel}>
        {mode === 'create' ? 'Cancelar' : 'Volver'}
      </Button>

      {mode === 'edit' && onCopy && (
        <Button
          variant="outlined"
          color="secondary"
          disabled={isCopying}
          onClick={onCopy}
          startIcon={isCopying ? <CircularProgress size={20} /> : <Copy />}
        >
          {isCopying ? 'Copiando...' : 'Copiar Cotización'}
        </Button>
      )}

      {mode === 'edit' && onAuthorize && quotationStatus === 'En proceso' && (
        <Button
          variant="contained"
          color="success"
          disabled={isAuthorizing}
          onClick={onAuthorize}
          startIcon={isAuthorizing ? <CircularProgress size={20} /> : <TickCircle />}
        >
          {isAuthorizing ? 'Autorizando...' : 'Autorizar Cotización'}
        </Button>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={isSaving}
        startIcon={isSaving ? <CircularProgress size={20} /> : undefined}
      >
        {mode === 'create' ? 'Crear Cotización' : 'Guardar Cambios'}
      </Button>

      {onSaveAndSend && (
        <Button
          variant="contained"
          color="secondary"
          disabled={disableSaveAndSend || isSavingAndSending}
          onClick={onSaveAndSend}
          startIcon={isSavingAndSending ? <CircularProgress size={20} /> : undefined}
          title={disableSaveAndSendReason}
        >
          {isSavingAndSending
            ? mode === 'create'
              ? 'Creando y Enviando...'
              : 'Guardando y Enviando...'
            : mode === 'create'
              ? 'Crear y Enviar por Correo'
              : 'Guardar y Enviar por Correo'}
        </Button>
      )}
    </Stack>
  );
};

export default QuotationActionButtons;
