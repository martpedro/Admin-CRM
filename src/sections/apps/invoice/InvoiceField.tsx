// material-ui
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Grid } from '@mui/material';

// ==============================|| INVOICE - TEXT FIELD ||============================== //

export default function InvoiceField({ onEditItem, cellData }: any) {
  let Field = null;

  // console.log('cellData', cellData);
  if ( cellData.type == 'file') {
  // console.log('entro a dropzone', cellData);

    Field = ImageDropzone({ onEditItem, cellData });
  } else {
    Field = (
      <TableCell sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -24, ml: 0 } }}>
        <TextField
          type={cellData.type}
          fullWidth
          placeholder={cellData.placeholder}
          name={cellData.name}
          id={cellData.id}
          value={cellData.type === 'number' ? (cellData.value > 0 ? cellData.value : '') : cellData.value}
          onChange={onEditItem}
          label={cellData.label}
          error={Boolean(cellData.errors && cellData.touched)}
          slotProps={{
            htmlInput: {
              ...(cellData.align === 'right' && { style: { textAlign: 'right' } }),
              ...(cellData.type === 'number' && { step: 'any', min: 0 })
            }
          }}
        />
      </TableCell>
    );
  }
  return Field;
}

function ImageDropzone({ onEditItem, cellData }: any) {
  interface ImagePreview {
    file: File;
    preview: string;
  }
  const [preview, setPreview] = useState<string | null>(null);

  const [previews, setPreviews] = useState<ImagePreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop,
  });

return (
    <Paper
      {...getRootProps()}
      sx={{
        width: 100,
        height: 100,
        border: '2px dashed #ccc',
        backgroundColor: '#fafafa',
        display: 'contents',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <input 
       name={cellData.name}
          id={cellData.id}
          value={cellData.type === 'number' ? (cellData.value > 0 ? cellData.value : '') : cellData.value}
          onChange={onEditItem}
        {...getInputProps()} 
      />
      {preview ? (
        <img
          src={preview}
          alt="Vista previa"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Typography variant="body1" color="textSecondary">
          Haz clic o arrastra una imagen aquí
        </Typography>
      )}
    </Paper>
  );
}
