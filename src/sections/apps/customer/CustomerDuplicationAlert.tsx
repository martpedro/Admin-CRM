import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import { Buildings, Profile, Sms, Warning2 } from 'iconsax-react';

// Types
interface ExistingCustomer {
  id: number;
  name: string;
  email: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface DuplicationValidationProps {
  hasEmailDuplication: boolean;
  hasDomainDuplication: boolean;
  canProceed: boolean;
  message?: string;
  requiresDuplicatePermission?: boolean;
  details?: {
    emailDuplication?: {
      customer: ExistingCustomer;
    } | null;
    domainDuplication?: {
      domain: string;
      count: number;
      examples: ExistingCustomer[];
    } | null;
  };
  onClose?: () => void;
  onProceed?: () => void;
  showActions?: boolean;
  isProcessing?: boolean;
}

const CustomerDuplicationAlert: React.FC<DuplicationValidationProps> = ({
  hasEmailDuplication,
  hasDomainDuplication,
  canProceed,
  message,
  requiresDuplicatePermission = false,
  details,
  onClose,
  onProceed,
  showActions = true,
  isProcessing = false
}) => {
  if (!hasEmailDuplication && !hasDomainDuplication) {
    return null;
  }

  const isEmailDuplicate = hasEmailDuplication && !!details?.emailDuplication;
  const isDomainDuplicate = hasDomainDuplication && !!details?.domainDuplication && !hasEmailDuplication;
  const domainDuplication = details?.domainDuplication ?? null;

  return (
    <Dialog open onClose={isProcessing ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: isEmailDuplicate ? 'error.lighter' : 'warning.lighter',
              color: isEmailDuplicate ? 'error.main' : 'warning.main',
              width: 52,
              height: 52
            }}
          >
            {isEmailDuplicate ? <Sms variant="Bold" /> : <Warning2 variant="Bold" />}
          </Avatar>
          <Box>
            <Typography variant="h4">
              {isEmailDuplicate ? 'Cliente duplicado detectado' : 'Ya existe este dominio'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEmailDuplicate ? 'No se puede continuar con este correo.' : 'Revisa los clientes relacionados antes de continuar.'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isEmailDuplicate && details?.emailDuplication && (
          <Stack spacing={2}>
            <Typography variant="body1">{message}</Typography>

            <Card
              variant="outlined"
              sx={{
                borderColor: 'error.light',
                bgcolor: 'error.lighter'
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: 'error.main', color: 'error.contrastText', width: 40, height: 40 }}>
                    <Profile variant="Bold" size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="error.main">
                      {details.emailDuplication.customer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {details.emailDuplication.customer.email}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        details.emailDuplication.customer.assignedTo
                          ? `Asignado a: ${details.emailDuplication.customer.assignedTo.name}`
                          : 'Sin asignar'
                      }
                      color={details.emailDuplication.customer.assignedTo ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}

        {isDomainDuplicate && domainDuplication && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Ya existen <strong>{domainDuplication.count}</strong> cliente(s) con el dominio <strong>@{domainDuplication.domain}</strong>.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verifica si realmente necesitas crear otro registro o si conviene reutilizar uno existente.
              </Typography>
            </Box>

            {message && (
              <Card
                variant="outlined"
                sx={{
                  borderColor: requiresDuplicatePermission ? 'error.light' : 'warning.light',
                  bgcolor: requiresDuplicatePermission ? 'error.lighter' : 'warning.lighter'
                }}
              >
                <CardContent>
                  <Typography variant="body2" color={requiresDuplicatePermission ? 'error.main' : 'text.primary'}>
                    {message}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Buildings variant="Bold" size={18} />
                <Typography variant="subtitle1">Clientes encontrados</Typography>
              </Stack>

              <List sx={{ py: 0 }}>
                {domainDuplication.examples.map((customer, index) => (
                  <React.Fragment key={customer.id}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemText
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Stack spacing={0.75}>
                            <Typography variant="subtitle2">{customer.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {customer.email}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={customer.assignedTo ? `Asignado a: ${customer.assignedTo.name}` : 'Sin asignar'}
                              color={customer.assignedTo ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < domainDuplication.examples.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {domainDuplication.count > domainDuplication.examples.length && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                  Y {domainDuplication.count - domainDuplication.examples.length} cliente(s) más.
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      {showActions && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isProcessing} color="inherit">
            {isEmailDuplicate ? 'Cerrar' : 'Cancelar'}
          </Button>
          {isDomainDuplicate && (
            <Button
              variant="contained"
              color="warning"
              onClick={onProceed}
              disabled={!canProceed || isProcessing}
              startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isProcessing ? 'Creando...' : requiresDuplicatePermission ? 'Permiso requerido' : 'Crear de todas formas'}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomerDuplicationAlert;