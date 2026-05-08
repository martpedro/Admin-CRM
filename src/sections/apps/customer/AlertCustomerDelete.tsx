import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { deleteCustomer } from 'api/customer';
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { Trash } from 'iconsax-react';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function AlertCustomerDelete({ id, title, open, handleClose }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [blockingError, setBlockingError] = useState<string | null>(null);

  const onClose = () => {
    if (!isDeleting) {
      setBlockingError(null);
      handleClose();
    }
  };

  const deletehandler = async () => {
    if (isDeleting) return;
    setBlockingError(null);
    setIsDeleting(true);

    const result = await deleteCustomer(id);

    setIsDeleting(false);

    if (result.success) {
      handleClose();
    } else if (result.hasQuotations) {
      setBlockingError(result.error ?? 'El cliente tiene cotizaciones asociadas y no puede eliminarse.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h4" align="center">
              ¿Seguro que deseas eliminar?
            </Typography>
            <Typography align="center">
              Al eliminar
              <Typography variant="subtitle1" component="span">
                {' '}
                &quot;{title || 'este cliente'}&quot;{' '}
              </Typography>
              el cliente será eliminado de forma permanente.
            </Typography>
          </Stack>

          {blockingError && (
            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
              {blockingError}
            </Alert>
          )}

          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button fullWidth onClick={onClose} color="secondary" variant="outlined" disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              fullWidth
              color="error"
              variant="contained"
              onClick={deletehandler}
              autoFocus
              disabled={isDeleting || !!blockingError}
              startIcon={isDeleting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
