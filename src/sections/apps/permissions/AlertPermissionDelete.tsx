import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

import { openSnackbar } from 'api/snackbar';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import { Trash } from 'iconsax-react';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| PERMISSION - DELETE ||============================== //

export default function AlertPermissionDelete({ id, title, open, handleClose }: Props) {
  const [loading, setLoading] = useState(false);

  const deleteHandler = async () => {
    setLoading(true);
    
    try {
      // TODO: Implementar API call para eliminar permiso cuando esté disponible
      console.log('Deleting permission with ID:', id);
      
      openSnackbar({
        open: true,
        message: 'Permiso eliminado exitosamente',
        variant: 'success'
      } as SnackbarProps);
      
      handleClose();
    } catch (error: any) {
      console.error(error);
      openSnackbar({
        open: true,
        message: error.message || 'Error al eliminar el permiso',
        variant: 'error'
      } as SnackbarProps);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="permission-delete-title"
      aria-describedby="permission-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              ¿Estás seguro de que quieres eliminar este permiso?
            </Typography>
            <Typography align="center">
              Al eliminar el permiso <strong>"{title}"</strong>, se perderán todos los datos asociados y no se podrá deshacer esta acción.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button 
              fullWidth 
              onClick={handleClose} 
              color="secondary" 
              variant="outlined"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              fullWidth 
              color="error" 
              variant="contained" 
              onClick={deleteHandler}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
