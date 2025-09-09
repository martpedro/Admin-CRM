// Simple test component
import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface Props {
  team?: any;
  closeModal: () => void;
}

const FormTeamAdd: React.FC<Props> = ({ team, closeModal }) => {
  return (
    <div>
      <DialogTitle>
        {team ? 'Editar Equipo' : 'Crear Equipo'}
      </DialogTitle>
      <DialogContent>
        <Typography>Formulario de equipos temporalmente deshabilitado</Typography>
      </DialogContent>
    </div>
  );
};

export default FormTeamAdd;
