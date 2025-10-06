import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import { Warning2, Profile, Sms, Buildings } from 'iconsax-react';

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
}

const CustomerDuplicationAlert: React.FC<DuplicationValidationProps> = ({
  hasEmailDuplication,
  hasDomainDuplication,
  canProceed,
  message,
  details,
  onClose,
  onProceed,
  showActions = true
}) => {
  if (!hasEmailDuplication && !hasDomainDuplication) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      {/* Email Duplication Alert (Error - Blocks creation) */}
      {hasEmailDuplication && details?.emailDuplication && (
        <Alert 
          severity="error" 
          icon={<Sms variant="Bold" />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            <strong>Email Duplicado - Cliente Existente</strong>
          </AlertTitle>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            {message}
          </Typography>

          <Card variant="outlined" sx={{ mt: 1 }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Profile size={20} variant="Bold" style={{ color: '#9e9e9e' }} />
                <Box>
                  <Typography variant="subtitle2" color="error">
                    {details.emailDuplication.customer.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {details.emailDuplication.customer.email}
                  </Typography>
                  {details.emailDuplication.customer.assignedTo && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={`Asignado a: ${details.emailDuplication.customer.assignedTo.name}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {showActions && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" onClick={onClose}>
                Cancelar
              </Button>
            </Stack>
          )}
        </Alert>
      )}

      {/* Domain Duplication Alert (Warning - Allows creation) */}
      {hasDomainDuplication && details?.domainDuplication && !hasEmailDuplication && (
        <Alert 
          severity="warning" 
          icon={<Warning2 variant="Bold" />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            <strong>Advertencia: Dominio Duplicado</strong>
          </AlertTitle>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ya existen <strong>{details.domainDuplication.count}</strong> cliente(s) 
            con el dominio <strong>@{details.domainDuplication.domain}</strong>
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <Buildings size={20} variant="Bold" style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Clientes existentes con este dominio:
            </Typography>
            
            <List dense sx={{ py: 0 }}>
              {details.domainDuplication.examples.map((customer, index) => (
                <ListItem key={customer.id} sx={{ py: 0.5, px: 0 }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({customer.email})
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      customer.assignedTo ? (
                        <Chip 
                          size="small" 
                          label={`Asignado a: ${customer.assignedTo.name}`}
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip 
                          size="small" 
                          label="Sin asignar"
                          color="default"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>

            {details.domainDuplication.count > details.domainDuplication.examples.length && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Y {details.domainDuplication.count - details.domainDuplication.examples.length} cliente(s) más...
              </Typography>
            )}
          </Box>

          {showActions && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button 
                size="small" 
                variant="contained" 
                color="warning"
                onClick={onProceed}
                disabled={!canProceed}
              >
                Crear Cliente de Todas Formas
              </Button>
              <Button size="small" onClick={onClose}>
                Cancelar
              </Button>
            </Stack>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default CustomerDuplicationAlert;