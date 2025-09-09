import { useEffect } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { CompanyInfo } from 'types/company';

const Schema = Yup.object().shape({
  razonSocial: Yup.string().required('Razón Social requerida'),
  rfc: Yup.string(),
  direccion: Yup.string(),
  telefonos: Yup.string(),
  whatsapp: Yup.string(),
  pagina: Yup.string()
});

export default function FormCompany({ initial, onSubmit }: { initial?: Partial<CompanyInfo>; onSubmit: (data: Partial<CompanyInfo>) => void }) {
  const formik = useFormik({
    initialValues: {
      razonSocial: initial?.razonSocial || '',
      rfc: initial?.rfc || '',
      direccion: initial?.direccion || '',
      telefonos: initial?.telefonos || '',
      whatsapp: initial?.whatsapp || '',
      pagina: initial?.pagina || ''
    },
    validationSchema: Schema,
    enableReinitialize: true,
    onSubmit
  });

  const { getFieldProps, handleSubmit, touched, errors, isSubmitting } = formik;

  return (
    <FormikProvider value={formik}>
      <Form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Razón Social</InputLabel>
              <TextField fullWidth {...getFieldProps('razonSocial')} error={Boolean(touched.razonSocial && errors.razonSocial)} helperText={touched.razonSocial && errors.razonSocial} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>RFC</InputLabel>
              <TextField fullWidth {...getFieldProps('rfc')} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Teléfonos</InputLabel>
              <TextField fullWidth {...getFieldProps('telefonos')} />
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Dirección</InputLabel>
              <TextField fullWidth {...getFieldProps('direccion')} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>WhatsApp</InputLabel>
              <TextField fullWidth {...getFieldProps('whatsapp')} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Página</InputLabel>
              <TextField fullWidth {...getFieldProps('pagina')} />
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 2 }}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>Guardar</Button>
            </Stack>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
