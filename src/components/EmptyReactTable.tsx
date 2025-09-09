import React from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyReactTableProps {
  message?: string;
}

const EmptyReactTable: React.FC<EmptyReactTableProps> = ({ message = 'No hay datos disponibles' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyReactTable;
