import { Chip, ChipProps } from '@mui/material';
import { TickCircle, Clock, CloseCircle } from 'iconsax-react';

interface QuotationStatusChipProps extends Omit<ChipProps, 'color' | 'variant'> {
  status: 'Nueva' | 'En proceso' | 'Cerrada';
}

const QuotationStatusChip = ({ status, ...props }: QuotationStatusChipProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Nueva':
        return {
          color: 'info' as const,
          icon: <Clock size="16" />,
          label: 'Nueva'
        };
      case 'En proceso':
        return {
          color: 'warning' as const,
          icon: <Clock size="16" />,
          label: 'En proceso'
        };
      case 'Cerrada':
        return {
          color: 'success' as const,
          icon: <TickCircle size="16" />,
          label: 'Cerrada'
        };
      default:
        return {
          color: 'default' as const,
          icon: <CloseCircle size="16" />,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      {...props}
      color={config.color}
      variant="filled"
      size="small"
      icon={config.icon}
      label={config.label}
      sx={{
        fontWeight: 600,
        ...props.sx
      }}
    />
  );
};

export default QuotationStatusChip;