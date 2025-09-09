// Simple test component
import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface Props {
  permission?: any;
  closeModal: () => void;
}

const FormPermissionAdd: React.FC<Props> = ({ permission, closeModal }) => {
  return (
    <div>
      <DialogTitle>
        {permission ? 'Editar Permiso' : 'Crear Permiso'}
      </DialogTitle>
      <DialogContent>
        <Typography>Formulario de permisos temporalmente deshabilitado</Typography>
      </DialogContent>
    </div>
  );
};

export default FormPermissionAdd;
