import { useEffect } from 'react';
import usePermissions from 'hooks/usePermissions';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { CompanyInfo } from 'types/company';

const Schema = Yup.object().shape({
  razonSocial: Yup.string().required('Razón Social requerida'),
  nombreLegal: Yup.string(),
  rfc: Yup.string(),
  direccion: Yup.string(),
  telefonos: Yup.string(),
  whatsapp: Yup.string(),
  pagina: Yup.string(),
  isActive: Yup.boolean()
});

export default function FormCompany({ initial, onSubmit }: { initial?: Partial<CompanyInfo>; onSubmit: (data: Partial<CompanyInfo>) => void }) {
  const { canCreate, canUpdate } = usePermissions();
  const formik = useFormik({
    initialValues: {
      razonSocial: initial?.razonSocial || '',
      nombreLegal: initial?.nombreLegal || '',
      rfc: initial?.rfc || '',
      direccion: initial?.direccion || '',
      telefonos: initial?.telefonos || '',
      whatsapp: initial?.whatsapp || '',
      pagina: initial?.pagina || '',
      isActive: initial?.isActive ?? true
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
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Nombre Legal</InputLabel>
              <TextField fullWidth {...getFieldProps('nombreLegal')} error={Boolean(touched.nombreLegal && errors.nombreLegal)} helperText={touched.nombreLegal && errors.nombreLegal} />
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
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                  name="isActive"
                />
              }
              label="Activo"
            />
          </Grid>
          <Grid size={12}>
            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  isSubmitting || (initial?.id ? !canUpdate('company') : !canCreate('company'))
                }
              >
                Guardar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
